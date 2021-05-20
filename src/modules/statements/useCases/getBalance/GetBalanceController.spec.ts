import { Connection } from "typeorm"
import request from 'supertest'
import createConnection from '../../../../database'
import { app } from "../../../../app";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";

describe('GetBalanceController', () => {
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

  it('should throw an error if the token was not provided when getting the user balance', async () => {
    const result = await request(app).get('/api/v1/statements/balance');
    expect(result.body.message).toEqual('JWT token is missing!');
    expect(result.status).toEqual(401);
  })

  it('should throw an error if the token is invalid when getting the user balance', async () => {
    const result = await request(app)
      .get('/api/v1/statements/balance')
      .set({
        Authorization: 'Bearer invalid.token'
      });

    expect(result.body.message).toEqual('JWT invalid token!');
    expect(result.status).toEqual(401);
  })

  it('should be able to return the user balance', async () => {
    const mockDepositBody = {
      amount: 50,
      description: 'Test description'
    };
    const mockWithdrawBody = {
      amount: 25,
      description: 'Test description'
    };
    const tokenResult = await request(app)
      .post('/api/v1/sessions')
      .send(mockUserDto)

    await request(app)
      .post('/api/v1/statements/deposit')
      .set({
        Authorization: `Bearer ${tokenResult.body.token}`
      })
      .send(mockDepositBody)
      await request(app)
        .post('/api/v1/statements/withdraw')
        .set({
          Authorization: `Bearer ${tokenResult.body.token}`
        })
        .send(mockWithdrawBody)

    const result = await request(app)
      .get('/api/v1/statements/balance')
      .set({
        Authorization: `Bearer ${tokenResult.body.token}`
      });

    expect(result.body.statement).toHaveLength(2);
    expect(result.body.balance).toEqual(25);
  })
})