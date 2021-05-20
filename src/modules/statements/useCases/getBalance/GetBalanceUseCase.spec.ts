import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { GetBalanceUseCase } from "./GetBalanceUseCase";
import { GetBalanceError } from './GetBalanceError'
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { OperationType } from "../../entities/Statement";

describe('GetBalanceUseCase', () => {
  let getBalanceUseCase: GetBalanceUseCase;
  let createStatementUseCase: CreateStatementUseCase;
  let inMemoryUsersRepository: IUsersRepository;
  let inMemoryStatementsRepository: IStatementsRepository;

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
  })

  it('should throw an error if user is not found', async () => {
    await getBalanceUseCase.execute({user_id: '123'}).catch(error => {
      expect(error).toBeInstanceOf(GetBalanceError);
      expect(error.message).toEqual('User not found');
      expect(error.statusCode).toEqual(404);
    })
  })

  it('should return the user balance with statement', async () => {
    const mockUser = await inMemoryUsersRepository.create({
      email: 'test-email@hotmail.com',
      name: 'test-name',
      password: 'test-password'
    })

    await createStatementUseCase.execute({
      amount: 50,
      description: 'test deposit',
      type: OperationType.DEPOSIT,
      user_id: mockUser.id ?? ''
    })
    await createStatementUseCase.execute({
      amount: 25,
      description: 'test withdraw',
      type: OperationType.WITHDRAW,
      user_id: mockUser.id ?? ''
    })

    const result = await getBalanceUseCase.execute({user_id: mockUser.id ?? ''});

    expect(result.balance).toEqual(25);
    expect(result.statement).toHaveLength(2);
  })
})