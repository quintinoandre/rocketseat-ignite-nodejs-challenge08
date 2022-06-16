import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { v4 as uuidV4 } from "uuid";
import { app } from "../../../../app";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { ICreateStatementDTO } from "./ICreateStatementDTO";

let connection: Connection;
let user: ICreateUserDTO;

describe("Create statement", () => {
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

  it("Should be able to create a new deposit statement", async () => {
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
      TRANSFER = "transfer",
    }

    const statement: ICreateStatementDTO = {
      user_id: userId,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "Deposit test",
    };

    const response = await request(app)
      .post(`/api/v1/statements/${statement.type}`)
      .send({
        amount: statement.amount,
        description: statement.description,
      })
      .set("Authorization", `Bearer ${token}`)
      .set("content-type", "application/json");

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      id: expect.any(String),
      ...statement,
      created_at: expect.any(String),
      updated_at: expect.any(String),
    });
  });

  it("Should be able to create a new withdraw statement", async () => {
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
      TRANSFER = "transfer",
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
      amount: 100,
      description: "Withdraw test",
    };

    const response = await request(app)
      .post(`/api/v1/statements/${withdrawStatement.type}`)
      .send({
        amount: withdrawStatement.amount,
        description: withdrawStatement.description,
      })
      .set("Authorization", `Bearer ${token}`)
      .set("content-type", "application/json");

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      id: expect.any(String),
      ...withdrawStatement,
      created_at: expect.any(String),
      updated_at: expect.any(String),
    });
  });

  it("Should not be able to create a new withdraw statement with insufficient funds", async () => {
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
      TRANSFER = "transfer",
    }

    const depositStatement: ICreateStatementDTO = {
      user_id: userId,
      type: OperationType.DEPOSIT,
      amount: 50,
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
      amount: 100,
      description: "Withdraw test",
    };

    const response = await request(app)
      .post(`/api/v1/statements/${withdrawStatement.type}`)
      .send({
        amount: withdrawStatement.amount,
        description: withdrawStatement.description,
      })
      .set("Authorization", `Bearer ${token}`)
      .set("content-type", "application/json");

    expect(response.status).toBe(400);
  });

  it("Should be able to create a new transfer statement", async () => {
    const userToSend = {
      name: "User test to send",
      email: `${uuidV4()}@test.com`,
      password: "123456",
    };

    await request(app)
      .post("/api/v1/users")
      .send(userToSend)
      .set("content-type", "application/json");

    const {
      body: {
        user: { id: userToSend_id },
      },
    } = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: userToSend.email,
        password: userToSend.password,
      })
      .set("content-type", "application/json");

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
      TRANSFER = "transfer",
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

    const transferStatement: ICreateStatementDTO = {
      user_id: userToSend_id,
      type: OperationType.TRANSFER,
      amount: 100,
      description: "Transfer test",
      sender_id: userId,
    };

    const response = await request(app)
      .post(`/api/v1/statements/${transferStatement.type}s/${userToSend_id}`)
      .send({
        amount: transferStatement.amount,
        description: transferStatement.description,
      })
      .set("Authorization", `Bearer ${token}`)
      .set("content-type", "application/json");

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      id: expect.any(String),
      ...transferStatement,
      created_at: expect.any(String),
      updated_at: expect.any(String),
    });

    await connection.query(`
    DELETE FROM users
    WHERE email = '${userToSend.email}'
    `);
  });

  it("Should not be able to create a new transfer statement with insufficient funds", async () => {
    const userToSend = {
      name: "User test to send",
      email: `${uuidV4()}@test.com`,
      password: "123456",
    };

    await request(app)
      .post("/api/v1/users")
      .send(userToSend)
      .set("content-type", "application/json");

    const {
      body: {
        user: { id: userToSend_id },
      },
    } = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: userToSend.email,
        password: userToSend.password,
      })
      .set("content-type", "application/json");

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
      TRANSFER = "transfer",
    }

    const depositStatement: ICreateStatementDTO = {
      user_id: userId,
      type: OperationType.DEPOSIT,
      amount: 50,
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

    const transferStatement: ICreateStatementDTO = {
      user_id: userToSend_id,
      type: OperationType.TRANSFER,
      amount: 100,
      description: "Transfer test",
      sender_id: userId,
    };

    const response = await request(app)
      .post(`/api/v1/statements/${transferStatement.type}s/${userToSend_id}`)
      .send({
        amount: transferStatement.amount,
        description: transferStatement.description,
      })
      .set("Authorization", `Bearer ${token}`)
      .set("content-type", "application/json");

    expect(response.status).toBe(400);

    await connection.query(`
    DELETE FROM users
    WHERE email = '${userToSend.email}'
    `);
  });

  it("Should not be able to create a new statement with invalid token", async () => {
    enum OperationType {
      DEPOSIT = "deposit",
      WITHDRAW = "withdraw",
      TRANSFER = "transfer",
    }

    const statement: ICreateStatementDTO = {
      user_id: "userId",
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "Deposit test",
    };

    const response = await request(app)
      .post(`/api/v1/statements/${statement.type}`)
      .send({
        amount: statement.amount,
        description: statement.description,
      })
      .set("Authorization", "invalidtoken")
      .set("content-type", "application/json");

    expect(response.status).toBe(401);
  });
});
