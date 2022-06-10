import { v4 as uuidV4 } from "uuid";
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
let user: ICreateUserDTO;
let user_id: string;

describe("Get statement operation", () => {
  beforeEach(async () => {
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

    user = {
      name: "User test",
      email: `${uuidV4}@test.com`,
      password: "123456",
    };

    const { id } = await createUserUseCase.execute(user);

    user_id = id as string;
  });

  it("should be able to get statement operation", async () => {
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

    const { id: statementId } = await createStatementUseCase.execute(statement);

    const statementOperation = await getStatementOperationUseCase.execute({
      user_id,
      statement_id: statementId as string,
    });

    expect(statementOperation).toMatchObject({ id: statementId, ...statement });
  });

  it("should not be able to get statement operation with invalid user id", () => {
    expect(async () => {
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
      await getStatementOperationUseCase.execute({
        user_id,
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
