import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe("Authenticate user", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();

    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);

    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    );
  });

  it("Should be able to authenticate a user", async () => {
    const user: ICreateUserDTO = {
      name: "User test",
      email: "user@test.com",
      password: "123456",
    };

    await createUserUseCase.execute(user);

    const { email, password } = user;

    const response = await authenticateUserUseCase.execute({
      email,
      password,
    });

    expect(response).toHaveProperty("token");
  });

  it("Should not be able to authenticate a user with incorrect email", () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        name: "User test",
        email: "user@test.com",
        password: "123456",
      };

      await createUserUseCase.execute(user);

      const { password } = user;

      await authenticateUserUseCase.execute({
        email: "incorrectemail@test.com",
        password,
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it("Should not be able to authenticate a user with incorrect password", () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        name: "User test",
        email: "user@test.com",
        password: "123456",
      };

      await createUserUseCase.execute(user);

      const { email } = user;

      await authenticateUserUseCase.execute({
        email,
        password: "incorrectpassword",
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it("Should not be able to authenticate a user with incorrect email and password", () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        name: "User test",
        email: "user@test.com",
        password: "123456",
      };

      await createUserUseCase.execute(user);

      await authenticateUserUseCase.execute({
        email: "incorrectemail@test.com",
        password: "incorrectpassword",
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
