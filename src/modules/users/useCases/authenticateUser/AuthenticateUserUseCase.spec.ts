import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../repositories/IUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase"
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

describe('AuthenticateUserUseCase', () => {
  let authenticateUserUseCase: AuthenticateUserUseCase;
  let createUserUseCase: CreateUserUseCase;
  let inMemoryUsersRepository: IUsersRepository;

  const mockUserDto: ICreateUserDTO = {
    email: 'test-email@hotmail.com',
    password: 'test-password',
    name: 'test-name'
  };

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  })

  it('should throw an error if email is not found', async () => {
    await authenticateUserUseCase.execute({
      email: mockUserDto.email,
      password: mockUserDto.password
    }).catch(error => {
      expect(error).toBeInstanceOf(IncorrectEmailOrPasswordError);
      expect(error.message).toEqual("Incorrect email or password");
      expect(error.statusCode).toEqual(401);
    })
  })

  it('should throw an error if password is wrong', async () => {
    await createUserUseCase.execute(mockUserDto)

    await authenticateUserUseCase.execute({
      email: mockUserDto.email,
      password: 'wrong-password'
    }).catch(error => {
      expect(error).toBeInstanceOf(IncorrectEmailOrPasswordError);
      expect(error.message).toEqual("Incorrect email or password");
      expect(error.statusCode).toEqual(401);
    })
  })

  it('should create user token', async () => {
    await createUserUseCase.execute(mockUserDto)

    const result = await authenticateUserUseCase.execute({
      email: mockUserDto.email,
      password: mockUserDto.password
    })

    expect(result).toHaveProperty('token');
  })
})