import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let getBalanceUseCase: GetBalanceUseCase;

describe("Get user balance", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();

    inMemoryStatementsRepository = new InMemoryStatementsRepository();

    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);

    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );

    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );
  });

  it("Should get user balance", async () => {
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
      amount: 50,
      description: "Withdraw test",
    };

    await createStatementUseCase.execute(withdrawStatement);

    const result = await getBalanceUseCase.execute({
      user_id: userId as string,
    });

    const { balance } = result;

    expect(result).toHaveProperty("balance");
    expect(balance).toBe(50);
    expect(result).toHaveProperty("statement");
  });

  it("Should not get user balance with invalid user id", () => {
    expect(async () => {
      await getBalanceUseCase.execute({ user_id: "invaliduserid" });
    }).rejects.toBeInstanceOf(AppError);
  });
});
