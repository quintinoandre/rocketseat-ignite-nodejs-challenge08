import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("Show user profile", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();

    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);

    showUserProfileUseCase = new ShowUserProfileUseCase(
      inMemoryUsersRepository
    );
  });

  it("Should be able to show user profile", async () => {
    const user: ICreateUserDTO = {
      name: "User test",
      email: "user@test.com",
      password: "123456",
    };

    const { id } = await createUserUseCase.execute(user);

    const userProfile = await showUserProfileUseCase.execute(id as string);

    expect(userProfile).toMatchObject({
      id,
      ...user,
      password: expect.any(String),
    });
  });

  it("Should not be able to show user profile with invalid id", () => {
    expect(async () => {
      await showUserProfileUseCase.execute("incorrectuserid");
    }).rejects.toBeInstanceOf(AppError);
  });
});
