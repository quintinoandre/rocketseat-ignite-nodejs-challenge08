import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { v4 as uuidV4 } from "uuid";
import { app } from "../../../../app";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";

let connection: Connection;
let user: ICreateUserDTO;

describe("Get user balance", () => {
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

  it("Should be able to get user balance", async () => {
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

    const depositStatement: ICreateStatementDTO = {
      user_id: userId,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "Deposit test",
    };

    await request(app)
      .post(`/api/v1/statements/${depositStatement.type}`)
      .send({
        amount: depositStatement.amount,
        description: depositStatement.description,
      })
      .set("Authorization", `Bearer ${token}`)
      .set("content-type", "application/json");

    const withdrawStatement: ICreateStatementDTO = {
      user_id: userId,
      type: OperationType.WITHDRAW,
      amount: 50,
      description: "Withdraw test",
    };

    await request(app)
      .post(`/api/v1/statements/${withdrawStatement.type}`)
      .send({
        amount: withdrawStatement.amount,
        description: withdrawStatement.description,
      })
      .set("Authorization", `Bearer ${token}`)
      .set("content-type", "application/json");

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("balance");
    expect(response.body.balance).toBe(50);
    expect(response.body).toHaveProperty("statement");
  });

  it("Should not be able to get user balance with invalid token", async () => {
    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set("Authorization", `invalidtoken`);

    expect(response.status).toBe(401);
  });
});
