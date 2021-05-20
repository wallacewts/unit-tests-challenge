import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../repositories/IUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { CreateUserError } from "./CreateUserError";

describe('CreateUserUseCase', () => {
  let createUserUseCase: CreateUserUseCase;
  let inMemoryUsersRepository: IUsersRepository;

  const mockUserDto: ICreateUserDTO = {
    email: 'test-email@hotmail.com',
    password: 'test-password',
    name: 'test-name'
  };

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  })

  it('should throw an error if email is already registered', async () => {
    await inMemoryUsersRepository.create(mockUserDto);

    await createUserUseCase.execute(mockUserDto).catch(error => {
      expect(error).toBeInstanceOf(CreateUserError);
      expect(error.message).toEqual('User already exists');
      expect(error.statusCode).toEqual(400);
    })
  })

  it('should create an user', async () => {
    const result = await createUserUseCase.execute(mockUserDto);

    expect(result).toHaveProperty('id');
  })
})