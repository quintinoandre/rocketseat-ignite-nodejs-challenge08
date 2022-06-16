import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { v4 as uuidV4 } from "uuid";
import { app } from "../../../../app";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";

let connection: Connection;
let user: ICreateUserDTO;

describe("Authenticate user", () => {
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
    `);
  });

  afterAll(async () => {
    await connection.close();
  });

  it("Should be able to authenticate a user", async () => {
    const response = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: user.email,
        password: user.password,
      })
      .set("content-type", "application/json");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      user: {
        id: expect.any(String),
        name: user.name,
        email: user.email,
      },
      token: expect.any(String),
    });
  });

  it("Should not be able to authenticate a user with incorrect email", async () => {
    const response = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "invalidemail",
        password: user.password,
      })
      .set("content-type", "application/json");

    expect(response.status).toBe(401);
  });

  it("Should not be able to authenticate a user with incorrect password", async () => {
    const response = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: user.email,
        password: "invalidpassword",
      })
      .set("content-type", "application/json");

    expect(response.status).toBe(401);
  });

  it("Should not be able to authenticate a user with incorrect email and password", async () => {
    const response = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "invalidemail",
        password: "invalidpassword",
      })
      .set("content-type", "application/json");

    expect(response.status).toBe(401);
  });
});
