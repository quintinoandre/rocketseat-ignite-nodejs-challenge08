import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { v4 as uuidV4 } from "uuid";
import { app } from "../../../../app";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";

let connection: Connection;
let user: ICreateUserDTO;

describe("Get statement operation", () => {
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

  it("should be able to get statement operation", async () => {
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

    enum OperationType {
      DEPOSIT = "deposit",
      WITHDRAW = "withdraw",
    }

    const statement: ICreateStatementDTO = {
      user_id: userId,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "Deposit test",
    };

    const {
      body: { id: statementId },
    } = await request(app)
      .post(`/api/v1/statements/${statement.type}`)
      .send({
        amount: statement.amount,
        description: statement.description,
      })
      .set("Authorization", `Bearer ${token}`)
      .set("content-type", "application/json");

    const response = await request(app)
      .get(`/api/v1/statements/${statementId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: statementId,
      ...statement,
      amount: "100.00",
      created_at: expect.any(String),
      updated_at: expect.any(String),
    });
  });

  it("should not be able to get statement operation with invalid token", async () => {
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

    enum OperationType {
      DEPOSIT = "deposit",
      WITHDRAW = "withdraw",
    }

    const statement: ICreateStatementDTO = {
      user_id: userId,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "Deposit test",
    };

    const {
      body: { id: statementId },
    } = await request(app)
      .post(`/api/v1/statements/${statement.type}`)
      .send({
        amount: statement.amount,
        description: statement.description,
      })
      .set("Authorization", `Bearer ${token}`)
      .set("content-type", "application/json");

    const response = await request(app)
      .get(`/api/v1/statements/${statementId}`)
      .set("Authorization", "invalidtoken");

    expect(response.status).toBe(401);
  });

  it("should not be able to get statement operation with invalid statement id", async () => {
    const {
      body: { token },
    } = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: user.email,
        password: user.password,
      })
      .set("content-type", "application/json");

    const response = await request(app)
      .get("/api/v1/statements/invalidstatementid")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
  });

  it("should not be able to get statement operation with invalid token and statement id", async () => {
    const response = await request(app)
      .get("/api/v1/statements/invalidstatementid")
      .set("Authorization", "invalidtoken");

    expect(response.status).toBe(401);
  });
});
