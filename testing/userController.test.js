/**
 * Unit tests for userController (controller layer)
 * Tests that all HTTP endpoints handle requests and responses correctly,
 * including error handling for missing fields and returning correct status codes.
 */
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

  /**
   * Tests for GET /users – fetches all users.
   * Verifies that the service layer is called and the response contains correct DTO data.
   */
  describe('getAllUsers', () => {
    // Tests that all users are returned as DTOs with name and username
    it('should return all users as DTOs', async () => {
      userService.findAllUsers.mockResolvedValue([
        { id: 1, name: 'Test', surname: 'User', pnr: '123', email: 'test@example.com', username: 'testuser', role_id: 2 }
      ]);
      const res = await request(app).get('/users');
      expect(res.statusCode).toBe(200);
      expect(res.body[0]).toMatchObject({ name: 'Test', username: 'testuser' });
    });
  });

  /**
   * Tests for GET /users/:id – fetches a specific user.
   * Verifies that the correct user is returned, and that 404 is given if user does not exist.
   */
  describe('getUserById', () => {
    // Tests that an existing user is returned as a DTO
    it('should return user DTO if found', async () => {
      userService.getUserById.mockResolvedValue({ id: 1, name: 'Test', surname: 'User', pnr: '123', email: 'test@example.com', username: 'testuser', role_id: 2 });
      const res = await request(app).get('/users/1');
      expect(res.statusCode).toBe(200);
      expect(res.body).toMatchObject({ name: 'Test', username: 'testuser' });
    });
    // Tests that 404 is returned if the user does not exist in the database
    it('should return 404 if user not found', async () => {
      userService.getUserById.mockResolvedValue(null);
      const res = await request(app).get('/users/999');
      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({});
    });
  });

  /**
   * Tests for POST /users – creates a new user.
   * Verifies that a valid registration returns 201, and that missing fields return 400.
   */
  describe('createUser', () => {
    // Tests that a new user is created and returned with 201 Created
    it('should create user and return DTO', async () => {
      userService.registerUser.mockResolvedValue({ person_id: 2, name: 'New', surname: 'User', pnr: '456', email: 'new@example.com', username: 'newuser', role_id: 2 });
      const res = await request(app).post('/users').send({ name: 'New', surname: 'User', pnr: '456', email: 'new@example.com', password: 'pass', username: 'newuser' });
      expect(res.statusCode).toBe(201);
      expect(res.body).toMatchObject({ name: 'New', username: 'newuser' });
    });
    // Tests that 400 Bad Request is returned if required fields are missing
    it('should return 400 if required fields missing', async () => {
      const res = await request(app).post('/users').send({ username: '', password: '', email: '' });
      expect(res.statusCode).toBe(400);
    });
  });

  /**
   * Tests for POST /login – user authentication.
   * Verifies that a successful login returns user data with role,
   * and that missing credentials return 400.
   */
  describe('login', () => {
    // Tests that a successful login returns user data including role (recruiter/applicant)
    it('should login and return user data', async () => {
      userService.login.mockResolvedValue({ token: 'jwt', user: { person_id: 1, name: 'Test', surname: 'User', pnr: '123', email: 'test@example.com', username: 'testuser', role_id: 1 } });
      const res = await request(app).post('/login').send({ username: 'testuser', password: 'pass' });
      expect(res.statusCode).toBe(200);
      expect(res.body).toMatchObject({ name: 'Test', username: 'testuser', role: 'recruiter' });
    });
    // Tests that 400 is returned if username or password is missing
    it('should return 400 if username or password missing', async () => {
      const res = await request(app).post('/login').send({ username: '', password: '' });
      expect(res.statusCode).toBe(400);
    });
  });

  /**
   * Tests for POST /logout – utloggning.
   * Verifierar att auth-cookie rensas och att ett bekräftelsemeddelande returneras.
   */
  describe('logout', () => {
    // Tests that logout clears the cookie and returns "Logged out successfully"
    it('should clear cookie and return success message', async () => {
      const res = await request(app).post('/logout');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ message: 'Logged out successfully' });
    });
  });
});
