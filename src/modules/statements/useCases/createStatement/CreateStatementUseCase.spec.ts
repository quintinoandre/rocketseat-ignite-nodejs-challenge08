import { v4 as uuidV4 } from "uuid";
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
let user: ICreateUserDTO;
let user_id: string;

describe("Create statement", () => {
  beforeEach(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository();

    inMemoryStatementsRepository = new InMemoryStatementsRepository();

    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);

    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );

    user = {
      name: "User test",
      email: `${uuidV4}@test.com`,
      password: "123456",
    };

    const { id } = await createUserUseCase.execute(user);

    user_id = id as string;
  });

  it("Should be able to create a new deposit statement", async () => {
    enum OperationType {
      DEPOSIT = "deposit",
      WITHDRAW = "withdraw",
    }

    const statement: ICreateStatementDTO = {
      user_id,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "Deposit test",
    };

    const createdStatement = await createStatementUseCase.execute(statement);

    expect(createdStatement).toMatchObject({
      id: expect.any(String),
      ...statement,
    });
  });

  it("Should be able to create a new withdraw statement", async () => {
    enum OperationType {
      DEPOSIT = "deposit",
      WITHDRAW = "withdraw",
    }

    const depositStatement: ICreateStatementDTO = {
      user_id,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "Deposit test",
    };

    await createStatementUseCase.execute(depositStatement);

    const withdrawStatement: ICreateStatementDTO = {
      user_id,
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

  it("Should not be able to create a new withdraw statement with insufficient funds", () => {
    expect(async () => {
      enum OperationType {
        DEPOSIT = "deposit",
        WITHDRAW = "withdraw",
      }

      const depositStatement: ICreateStatementDTO = {
        user_id,
        type: "deposit" as OperationType,
        amount: 50,
        description: "Deposit test",
      };

      await createStatementUseCase.execute(depositStatement);

      const withdrawStatement: ICreateStatementDTO = {
        user_id,
        type: "withdraw" as OperationType,
        amount: 100,
        description: "Withdraw test",
      };

      await createStatementUseCase.execute(withdrawStatement);
    }).rejects.toBeInstanceOf(AppError);
  });

  it("Should not be able to create a new statement with an invalid user id", () => {
    expect(async () => {
      enum OperationType {
        DEPOSIT = "deposit",
        WITHDRAW = "withdraw",
      }

      const statement: ICreateStatementDTO = {
        user_id: "invaliduserid",
        type: OperationType.DEPOSIT,
        amount: 100,
        description: "Deposit test",
      };

      await createStatementUseCase.execute(statement);
    }).rejects.toBeInstanceOf(AppError);
  });
});
