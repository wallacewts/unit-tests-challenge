import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { OperationType } from "../../entities/Statement";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";

describe('GetStatementOperationUseCase', () => {
  let getStatementOperationUseCase: GetStatementOperationUseCase;
  let createStatementUseCase: CreateStatementUseCase;
  let inMemoryUsersRepository: IUsersRepository;
  let inMemoryStatementsRepository: IStatementsRepository;

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
  })

  it('should throw an error if user is not found', async () => {
    const mockRequest = {
      user_id: 'test-user-id',
      statement_id: 'test-statement-id'
    };

    await getStatementOperationUseCase.execute(mockRequest).catch(error => {
      expect(error).toBeInstanceOf(GetStatementOperationError.UserNotFound);
      expect(error.message).toEqual('User not found');
      expect(error.statusCode).toEqual(404);
    })
  })

  it('should throw an error if statement is not found', async () => {
      const mockUser = await inMemoryUsersRepository.create({
        email: 'test-email@hotmail.com',
        name: 'test-name',
        password: 'test-password'
      })
    const mockRequest = {
      user_id: mockUser.id ?? '',
      statement_id: 'test-statement-id'
    };

    await getStatementOperationUseCase.execute(mockRequest).catch(error => {
      expect(error).toBeInstanceOf(GetStatementOperationError.StatementNotFound);
      expect(error.message).toEqual('Statement not found');
      expect(error.statusCode).toEqual(404);
    })
  })

  it('should return the user statement by id', async () => {
    const mockUser = await inMemoryUsersRepository.create({
      email: 'test-email@hotmail.com',
      name: 'test-name',
      password: 'test-password'
    })
    const mockStatement = await createStatementUseCase.execute({
      amount: 50,
      description: 'test deposit',
      type: OperationType.DEPOSIT,
      user_id: mockUser.id ?? ''
    })
    const mockRequest = {
      user_id: mockUser.id ?? '',
      statement_id: mockStatement.id ?? ''
    };

    const result = await getStatementOperationUseCase.execute(mockRequest);
    
    expect(result.id).toEqual(mockStatement.id);
    expect(result.user_id).toEqual(mockUser.id);
  })
})