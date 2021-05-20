import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { ICreateStatementDTO } from "./ICreateStatementDTO";
import { OperationType } from '../../entities/Statement'
import { CreateStatementError } from "./CreateStatementError";

describe('CreateUserUseCase', () => {
  let createStatementUseCase: CreateStatementUseCase;
  let inMemoryUsersRepository: IUsersRepository;
  let inMemoryStatementsRepository: IStatementsRepository;

  const mockCreateStatementDto: ICreateStatementDTO = {
    amount: 10,
    description: 'test-description',
    type: OperationType.WITHDRAW,
    user_id: 'test-id'
  }

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
  })

  it('should throw an error if user is not found', async () => {
    await createStatementUseCase.execute(mockCreateStatementDto).catch(error => {
      expect(error).toBeInstanceOf(CreateStatementError.UserNotFound);
      expect(error.message).toEqual('User not found');
      expect(error.statusCode).toEqual(404);
    })
  })

  it('should throw an error if funds is insufficient', async () => {
    const mockUser = await inMemoryUsersRepository.create({
      email: 'test-email@hotmail.com',
      name: 'test-name',
      password: 'test-password'
    });
    const mockStatement: ICreateStatementDTO = {
      ...mockCreateStatementDto,
      user_id: mockUser.id ?? ''
    }

    await createStatementUseCase.execute(mockStatement).catch(error => {
      expect(error).toBeInstanceOf(CreateStatementError.InsufficientFunds);
      expect(error.message).toEqual('Insufficient funds');
      expect(error.statusCode).toEqual(400);
    })
  })

  it('should create an user statement for deposit', async () => {
    const mockUser = await inMemoryUsersRepository.create({
      email: 'test-email@hotmail.com',
      name: 'test-name',
      password: 'test-password'
    });
    const mockStatement: ICreateStatementDTO = {
      ...mockCreateStatementDto,
      user_id: mockUser.id ?? '',
      type: OperationType.DEPOSIT
    }

    const result = await createStatementUseCase.execute(mockStatement)

    expect(result.user_id).toEqual(mockUser.id);
    expect(result.type).toEqual(OperationType.DEPOSIT);
    expect(result.amount).toEqual(mockStatement.amount);
  })

  it('should create an user statement for withdraw', async () => {
    const mockUser = await inMemoryUsersRepository.create({
      email: 'test-email@hotmail.com',
      name: 'test-name',
      password: 'test-password'
    });
    const mockStatement: ICreateStatementDTO = {
      ...mockCreateStatementDto,
      user_id: mockUser.id ?? '',
    }

    await createStatementUseCase.execute({...mockStatement, type: OperationType.DEPOSIT})
    const result = await createStatementUseCase.execute(mockStatement)

    expect(result.user_id).toEqual(mockUser.id);
    expect(result.type).toEqual(OperationType.WITHDRAW);
    expect(result.amount).toEqual(mockStatement.amount);
  })
})