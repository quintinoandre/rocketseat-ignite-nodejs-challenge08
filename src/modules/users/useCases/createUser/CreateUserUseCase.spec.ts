import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "./CreateUserUseCase";
import { ICreateUserDTO } from "./ICreateUserDTO";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create user", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();

    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("Should be able to create a new user", async () => {
    const user: ICreateUserDTO = {
      name: "User test",
      email: "user@test.com",
      password: "123456",
    };

    const createdUser = await createUserUseCase.execute(user);

    expect(createdUser).toMatchObject({
      id: expect.any(String),
      ...user,
      password: expect.any(String),
    });
  });

  it("Should not be able to create a new user with an email already registered", () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        name: "User test",
        email: "user@test.com",
        password: "123456",
      };

      await createUserUseCase.execute(user);

      await createUserUseCase.execute(user);
    }).rejects.toBeInstanceOf(AppError);
  });
});
