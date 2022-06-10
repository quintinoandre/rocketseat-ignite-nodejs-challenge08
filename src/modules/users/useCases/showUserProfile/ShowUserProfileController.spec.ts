import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { v4 as uuidV4 } from "uuid";
import { app } from "../../../../app";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";

let connection: Connection;
let user: ICreateUserDTO;

describe("Show user profile", () => {
  beforeAll(async () => {
    connection = await createConnection();
  });

  beforeEach(async () => {
    user = {
      name: "User test",
      email: `${uuidV4()}@test.com`,
      password: "123456",
    };

    await request(app)
      .post("/api/v1/users")
      .send(user)
      .set("content-type", "application/json");
  });

  afterEach(async () => {
    await connection.query(`
    DELETE FROM users
    WHERE email = '${user.email}'
    LIMIT 1
    `);
  });

  afterAll(async () => {
    await connection.close();
  });

  it("Should be able to show user profile", async () => {
    const {
      body: {
        token,
        user: { id: userId },
      },
    } = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: user.email,
        password: user.password,
      })
      .set("content-type", "application/json");

    const response = await request(app)
      .get("/api/v1/profile")
      .set("authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: userId,
      name: user.name,
      email: user.email,
      created_at: expect.any(String),
      updated_at: expect.any(String),
    });
  });

  it("Should not be able to show user profile without token", async () => {
    const response = await request(app).get("/api/v1/profile");

    expect(response.status).toBe(401);
  });

  it("Should not be able to show user profile with invalid token", async () => {
    const response = await request(app)
      .get("/api/v1/profile")
      .set("authorization", "invalidtoken");

    expect(response.status).toBe(401);
  });
});
