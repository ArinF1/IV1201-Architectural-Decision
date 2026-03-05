require('dotenv').config({ path: './backend/.env' });
const request = require('supertest');
const express = require('express');
const userController = require('../backend/src/controllers/userController');
const userService = require('../backend/src/model/service/userService');


jest.mock('../backend/src/model/service/userService');

const app = express();
app.use(express.json());

// Setup routes for testing
app.get('/users', userController.getAllUsers);
app.get('/users/:id', userController.getUserById);
app.post('/users', userController.createUser);
app.post('/login', userController.login);
app.post('/logout', userController.logout);


describe('User Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should return all users as DTOs', async () => {
      userService.findAllUsers.mockResolvedValue([
        { id: 1, name: 'Test', surname: 'User', pnr: '123', email: 'test@example.com', username: 'testuser', role_id: 2 }
      ]);
      const res = await request(app).get('/users');
      expect(res.statusCode).toBe(200);
      expect(res.body[0]).toMatchObject({ name: 'Test', username: 'testuser' });
    });
  });

  describe('getUserById', () => {
    it('should return user DTO if found', async () => {
      userService.getUserById.mockResolvedValue({ id: 1, name: 'Test', surname: 'User', pnr: '123', email: 'test@example.com', username: 'testuser', role_id: 2 });
      const res = await request(app).get('/users/1');
      expect(res.statusCode).toBe(200);
      expect(res.body).toMatchObject({ name: 'Test', username: 'testuser' });
    });
    it('should return 404 if user not found', async () => {
      userService.getUserById.mockResolvedValue(null);
      const res = await request(app).get('/users/999');
      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({});
    });
  });

  describe('createUser', () => {
    it('should create user and return DTO', async () => {
      userService.registerUser.mockResolvedValue({ person_id: 2, name: 'New', surname: 'User', pnr: '456', email: 'new@example.com', username: 'newuser', role_id: 2 });
      const res = await request(app).post('/users').send({ name: 'New', surname: 'User', pnr: '456', email: 'new@example.com', password: 'pass', username: 'newuser' });
      expect(res.statusCode).toBe(201);
      expect(res.body).toMatchObject({ name: 'New', username: 'newuser' });
    });
    it('should return 400 if required fields missing', async () => {
      const res = await request(app).post('/users').send({ username: '', password: '', email: '' });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('login', () => {
    it('should login and return user data', async () => {
      userService.login.mockResolvedValue({ token: 'jwt', user: { person_id: 1, name: 'Test', surname: 'User', pnr: '123', email: 'test@example.com', username: 'testuser', role_id: 1 } });
      const res = await request(app).post('/login').send({ username: 'testuser', password: 'pass' });
      expect(res.statusCode).toBe(200);
      expect(res.body).toMatchObject({ name: 'Test', username: 'testuser', role: 'recruiter' });
    });
    it('should return 400 if username or password missing', async () => {
      const res = await request(app).post('/login').send({ username: '', password: '' });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('logout', () => {
    it('should clear cookie and return success message', async () => {
      const res = await request(app).post('/logout');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ message: 'Logged out successfully' });
    });
  });
});
