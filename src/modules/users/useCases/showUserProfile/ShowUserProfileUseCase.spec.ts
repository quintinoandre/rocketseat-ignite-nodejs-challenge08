import { v4 as uuidV4 } from "uuid";
import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;
let user: ICreateUserDTO;
let user_id: string;

describe("Show user profile", () => {
  beforeEach(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository();

    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);

    showUserProfileUseCase = new ShowUserProfileUseCase(
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

  it("Should be able to show user profile", async () => {
    const userProfile = await showUserProfileUseCase.execute(user_id);

    expect(userProfile).toMatchObject({
      id: user_id,
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
