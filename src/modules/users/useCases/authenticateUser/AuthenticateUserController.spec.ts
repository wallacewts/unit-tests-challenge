import { Connection } from "typeorm"
import request from 'supertest'
import createConnection from '../../../../database'
import { app } from "../../../../app";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";

describe('AuthenticateUserController', () => {
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

  it('should be able to create a user token', async () => {
    const result = await request(app).post('/api/v1/sessions').send({
      email: mockUserDto.email,
      password: mockUserDto.password
    })

    expect(result.body).toHaveProperty('token')
    expect(result.status).toEqual(200)
  })


  it('should throw an error if email is not found', async () => {
    const result = await request(app).post('/api/v1/sessions').send({
      email: 'wrong-email',
      password: mockUserDto.password
    })

    expect(result.body.message).toEqual('Incorrect email or password')
    expect(result.status).toEqual(401)
  })

  it('should throw an error if password is wrong', async () => {
    const result = await request(app).post('/api/v1/sessions').send({
      email: mockUserDto,
      password: 'wrong-password'
    })

    expect(result.body.message).toEqual('Incorrect email or password')
    expect(result.status).toEqual(401)
  })
})