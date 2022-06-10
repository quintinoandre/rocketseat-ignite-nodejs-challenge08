import { v4 as uuidV4 } from "uuid";
import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let user: ICreateUserDTO;
let user_id: string;

describe("Authenticate user", () => {
  beforeEach(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository();

    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);

    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    );

    user = {
      name: "User test",
      email: `${uuidV4}@test.com`,
      password: "123456",
    };

    const { id } = await createUserUseCase.execute(user);

    user_id = id as string;
  });

  it("Should be able to authenticate a user", async () => {
    const { email, password } = user;

    const response = await authenticateUserUseCase.execute({
      email,
      password,
    });

    expect(response).toMatchObject({
      user: {
        id: expect.any(String),
        name: user.name,
        email: user.email,
      },
      token: expect.any(String),
    });
  });

  it("Should not be able to authenticate a user with incorrect email", () => {
    expect(async () => {
      const { password } = user;

      await authenticateUserUseCase.execute({
        email: "incorrectemail@test.com",
        password,
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it("Should not be able to authenticate a user with incorrect password", () => {
    expect(async () => {
      const { email } = user;

      await authenticateUserUseCase.execute({
        email,
        password: "incorrectpassword",
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it("Should not be able to authenticate a user with incorrect email and password", () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "incorrectemail",
        password: "incorrectpassword",
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
