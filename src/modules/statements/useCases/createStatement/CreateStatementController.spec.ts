import { Connection } from "typeorm"
import request from 'supertest'
import createConnection from '../../../../database'
import { app } from "../../../../app";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";

describe('CreateStatementController', () => {
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

  it('should throw an error if the token was not provided when making a deposit', async () => {
    const result = await request(app).post('/api/v1/statements/deposit');
    expect(result.body.message).toEqual('JWT token is missing!');
    expect(result.status).toEqual(401);
  })

  it('should throw an error if the token is invalid when making a deposit', async () => {
    const result = await request(app)
      .post('/api/v1/statements/deposit')
      .set({
        Authorization: 'Bearer invalid.token'
      });

    expect(result.body.message).toEqual('JWT invalid token!');
    expect(result.status).toEqual(401);
  })

  it('should be able to create a deposit', async () => {
    const mockDepositBody = {
      amount: 50,
      description: 'Test description'
    };
    const tokenResult = await request(app)
      .post('/api/v1/sessions')
      .send(mockUserDto)

    const result = await request(app)
      .post('/api/v1/statements/deposit')
      .set({
        Authorization: `Bearer ${tokenResult.body.token}`
      })
      .send(mockDepositBody)

    expect(result.body).toHaveProperty('id')
    expect(result.body.type).toEqual('deposit')
    expect(result.status).toEqual(201);
  })

  it('should throw an error if the token was not provided when making a withdraw', async () => {
    const result = await request(app).post('/api/v1/statements/withdraw');
    expect(result.body.message).toEqual('JWT token is missing!');
    expect(result.status).toEqual(401);
  })

  it('should throw an error if the token is invalid when making a withdraw', async () => {
    const result = await request(app)
      .post('/api/v1/statements/withdraw')
      .set({
        Authorization: 'Bearer invalid.token'
      });

    expect(result.body.message).toEqual('JWT invalid token!');
    expect(result.status).toEqual(401);
  })

  it('should trhow an error if funds insufficient when making a withdraw', async () => {
    const mockWithdrawBody = {
      amount: 100,
      description: 'Test description'
    };
    const tokenResult = await request(app)
      .post('/api/v1/sessions')
      .send(mockUserDto)

    const result = await request(app)
      .post('/api/v1/statements/withdraw')
      .set({
        Authorization: `Bearer ${tokenResult.body.token}`
      })
      .send(mockWithdrawBody)

    expect(result.body.message).toEqual('Insufficient funds')
    expect(result.status).toEqual(400);
  })

  it('should be to create a withdraw statement', async () => {
    const mockWithdrawBody = {
      amount: 25,
      description: 'Test description'
    };
    const tokenResult = await request(app)
      .post('/api/v1/sessions')
      .send(mockUserDto)

    const result = await request(app)
      .post('/api/v1/statements/withdraw')
      .set({
        Authorization: `Bearer ${tokenResult.body.token}`
      })
      .send(mockWithdrawBody)
      
    expect(result.body).toHaveProperty('id')
    expect(result.body.type).toEqual('withdraw')
    expect(result.status).toEqual(201);
  })
})