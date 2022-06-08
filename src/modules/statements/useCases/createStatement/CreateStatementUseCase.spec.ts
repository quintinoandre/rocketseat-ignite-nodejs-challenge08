import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { ICreateStatementDTO } from "./ICreateStatementDTO";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;

describe("Create statement", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();

    inMemoryStatementsRepository = new InMemoryStatementsRepository();

    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);

    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("Should create a deposit statement", async () => {
    const user: ICreateUserDTO = {
      name: "User test",
      email: "user@test.com",
      password: "123456",
    };

    const { id: userId } = await createUserUseCase.execute(user);

    enum OperationType {
      DEPOSIT = "deposit",
      WITHDRAW = "withdraw",
    }

    const statement: ICreateStatementDTO = {
      user_id: userId as string,
      type: "deposit" as OperationType,
      amount: 100,
      description: "Deposit test",
    };

    const createdStatement = await createStatementUseCase.execute(statement);

    expect(createdStatement).toMatchObject({
      id: expect.any(String),
      ...statement,
    });
  });

  it("Should create a withdraw statement", async () => {
    const user: ICreateUserDTO = {
      name: "User test",
      email: "user@test.com",
      password: "123456",
    };

    const { id: userId } = await createUserUseCase.execute(user);

    enum OperationType {
      DEPOSIT = "deposit",
      WITHDRAW = "withdraw",
    }

    const depositStatement: ICreateStatementDTO = {
      user_id: userId as string,
      type: "deposit" as OperationType,
      amount: 100,
      description: "Deposit test",
    };

    await createStatementUseCase.execute(depositStatement);

    const withdrawStatement: ICreateStatementDTO = {
      user_id: userId as string,
      type: "withdraw" as OperationType,
      amount: 100,
      description: "Withdraw test",
    };

    const createdWithdrawStatement = await createStatementUseCase.execute(
      withdrawStatement
    );

    expect(createdWithdrawStatement).toMatchObject({
      id: expect.any(String),
      ...withdrawStatement,
    });
  });

  it("Should not create a withdraw statement with insufficient funds", () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        name: "User test",
        email: "user@test.com",
        password: "123456",
      };

      const { id: userId } = await createUserUseCase.execute(user);

      enum OperationType {
        DEPOSIT = "deposit",
        WITHDRAW = "withdraw",
      }

      const depositStatement: ICreateStatementDTO = {
        user_id: userId as string,
        type: "deposit" as OperationType,
        amount: 50,
        description: "Deposit test",
      };

      await createStatementUseCase.execute(depositStatement);

      const withdrawStatement: ICreateStatementDTO = {
        user_id: userId as string,
        type: "withdraw" as OperationType,
        amount: 100,
        description: "Withdraw test",
      };

      await createStatementUseCase.execute(withdrawStatement);
    }).rejects.toBeInstanceOf(AppError);
  });

  it("Should not create a statement with an invalid user id", () => {
    expect(async () => {
      enum OperationType {
        DEPOSIT = "deposit",
        WITHDRAW = "withdraw",
      }

      const statement: ICreateStatementDTO = {
        user_id: "invaliduserid",
        type: "deposit" as OperationType,
        amount: 100,
        description: "Deposit test",
      };

      await createStatementUseCase.execute(statement);
    }).rejects.toBeInstanceOf(AppError);
  });
});
