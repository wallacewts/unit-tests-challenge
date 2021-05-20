import { Connection } from "typeorm"
import request from 'supertest'
import createConnection from '../../../../database'
import { app } from "../../../../app";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";

describe('GetStatementOperationController', () => {
  let connection: Connection;

  const mockUserDto: ICreateUserDTO = {
    name: 'Test Name',
    email: 'Test Email',
    password: 'Test Password'
  }

  beforeAll(async () => {
    connection = await createConnection();

    await connection.runMigrations();
    await request(app).post('/api/v1/users').send(mockUserDto)
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })

  it('should throw an error if the token was not provided when getting the statement', async () => {
    const result = await request(app).get('/api/v1/statements/statement_id');
    expect(result.body.message).toEqual('JWT token is missing!');
    expect(result.status).toEqual(401);
  })

  it('should throw an error if the token is invalid when getting the statement', async () => {
    const result = await request(app)
      .get('/api/v1/statements/statement_id')
      .set({
        Authorization: 'Bearer invalid.token'
      });

    expect(result.body.message).toEqual('JWT invalid token!');
    expect(result.status).toEqual(401);
  })

  it('should be able to return the user statement', async () => {
    const mockDepositBody = {
      amount: 50,
      description: 'Test description'
    };
    const tokenResult = await request(app)
      .post('/api/v1/sessions')
      .send(mockUserDto)
    const { body: depositStatement } = await request(app)
      .post('/api/v1/statements/deposit')
      .set({
        Authorization: `Bearer ${tokenResult.body.token}`
      })
      .send(mockDepositBody)

    const result = await request(app)
      .get(`/api/v1/statements/${depositStatement.id}`)
      .set({
        Authorization: `Bearer ${tokenResult.body.token}`
      });

    expect(result.body.id).toEqual(depositStatement.id)
  })
})