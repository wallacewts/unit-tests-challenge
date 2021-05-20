import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../repositories/IUsersRepository";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

describe('ShowUserProfileUseCase', () => {
  let showUserProfileUseCase: ShowUserProfileUseCase;
  let inMemoryUsersRepository: IUsersRepository;

  const mockUserDto: ICreateUserDTO = {
    email: 'test-email@hotmail.com',
    password: 'test-password',
    name: 'test-name'
  };

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository);
  })

  it('should throw an error if user is not found', async () => {
    const mockUserId = 'test-id';

    await showUserProfileUseCase.execute(mockUserId).catch(error => {
      expect(error).toBeInstanceOf(ShowUserProfileError);
      expect(error.message).toEqual('User not found');
      expect(error.statusCode).toEqual(404);
    })
  })

  it('should return a user', async () => {
    const user = await inMemoryUsersRepository.create(mockUserDto);
    const mockUserId = user.id ?? '';

    const result = await showUserProfileUseCase.execute(mockUserId);

    expect(result).toHaveProperty('id');
  })
})