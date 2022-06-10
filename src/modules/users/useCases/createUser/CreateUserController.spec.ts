import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";
import { ICreateUserDTO } from "./ICreateUserDTO";

let connection: Connection;

describe("Create user", () => {
  beforeAll(async () => {
    connection = await createConnection();
  });

  afterEach(async () => {
    await connection.query(`
    DELETE FROM users
    WHERE email = 'user@test.com'
    LIMIT 1
    `);
  });

  afterAll(async () => {
    await connection.close();
  });

  it("should be able to create a new user", async () => {
    const user: ICreateUserDTO = {
      name: "User test",
      email: "user@test.com",
      password: "123456",
    };

    const response = await request(app)
      .post("/api/v1/users")
      .send(user)
      .set("content-type", "application/json");

    expect(response.status).toBe(201);
  });

  it("Should not be able to create a new user with an email already registered", async () => {
    const user: ICreateUserDTO = {
      name: "User test",
      email: "user@test.com",
      password: "123456",
    };

    await request(app)
      .post("/api/v1/users")
      .send(user)
      .set("content-type", "application/json");

    const response = await request(app)
      .post("/api/v1/users")
      .send(user)
      .set("content-type", "application/json");

    expect(response.status).toBe(400);
  });
});
