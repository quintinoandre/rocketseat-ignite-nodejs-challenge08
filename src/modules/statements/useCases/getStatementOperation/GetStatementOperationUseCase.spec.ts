import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe("Get statement operation", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();

    inMemoryStatementsRepository = new InMemoryStatementsRepository();

    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);

    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );

    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should be able to get statement operation", async () => {
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

    const { id: statementId } = await createStatementUseCase.execute(statement);

    const statementOperation = await getStatementOperationUseCase.execute({
      user_id: userId as string,
      statement_id: statementId as string,
    });

    expect(statementOperation).toMatchObject({ id: statementId, ...statement });
  });

  it("should not be able to get statement operation with invalid user id", () => {
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

      const statement: ICreateStatementDTO = {
        user_id: userId as string,
        type: "deposit" as OperationType,
        amount: 100,
        description: "Deposit test",
      };

      const { id: statementId } = await createStatementUseCase.execute(
        statement
      );

      await getStatementOperationUseCase.execute({
        user_id: "invaliduserid",
        statement_id: statementId as string,
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able to get statement operation with invalid statement id", () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        name: "User test",
        email: "user@test.com",
        password: "123456",
      };

      const { id: userId } = await createUserUseCase.execute(user);

      await getStatementOperationUseCase.execute({
        user_id: userId as string,
        statement_id: "invalidstatementid",
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able to get statement operation with invalid user id and statement id", () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: "invaliduserid",
        statement_id: "invalidstatementid",
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
