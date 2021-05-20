import { Connection } from "typeorm"
import request from 'supertest'
import createConnection from '../../../../database'
import { app } from "../../../../app";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";

describe('CreateUserController', () => {
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

  it('should throw an error if email is already registered', async () => {
    const result = await request(app).post('/api/v1/users').send(mockUserDto);

    expect(result.body.message).toEqual('User already exists');
    expect(result.status).toEqual(400);
  })

  it('should create an user', async () => {
    const result = await request(app).post('/api/v1/users').send({...mockUserDto, email: 'test@hotmail.com'});
    
    expect(result.status).toEqual(201);
  })
})