import { Connection } from "typeorm"
import request from 'supertest'
import createConnection from '../../../../database'
import { app } from "../../../../app";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";

describe('ShowUserProfileController', () => {
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

  it('should throw an error if token is not provided', async () => {
    const result = await request(app).get('/api/v1/profile');
    expect(result.body.message).toEqual('JWT token is missing!');
    expect(result.status).toEqual(401);
  })

  it('should throw an error if token is invalid', async () => {
    const result = await request(app).get('/api/v1/profile').set({
      Authorization: 'Bearer invalid.token'
    });

    expect(result.body.message).toEqual('JWT invalid token!');
    expect(result.status).toEqual(401);
  })

  it('should be able to return the user data', async () => {
    const tokenResult = await request(app).post('/api/v1/sessions').send({
      email: mockUserDto.email,
      password: mockUserDto.password
    })

    const result = await request(app).get('/api/v1/profile').set({
      Authorization: `Bearer ${tokenResult.body.token}`
    })

    expect(result.body).toHaveProperty('id');
    expect(result.status).toEqual(200);
  })
})