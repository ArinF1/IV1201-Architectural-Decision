/**
 * Unit tests for UserService (service layer)
 */
require('dotenv').config({ path: './backend/.env' });
const bcrypt = require('bcrypt');
const userRepo = require('../backend/src/integration/repositories/userRepo');

jest.mock('../backend/src/integration/repositories/userRepo');

// Mock sequelize transaction
jest.mock('../backend/src/integration/persistence', () => ({
  sequelize: {
    transaction: jest.fn(async (cb) => cb({}))
  },
  Person: {},
  Role: {}
}));

const userService = require('../backend/src/model/service/userService');

describe('UserService', () => {
  afterEach(() => jest.clearAllMocks());

  /**
   * Tests for findAllUsers – retrieves all users via the repository.
   * Verifies that the service layer correctly delegates to userRepo.
   */
  describe('findAllUsers', () => {
    // Tests that all users from the database are returned via the repository layer
    it('should return all users from repo', async () => {
      const mockUsers = [
        { person_id: 1, name: 'Test', surname: 'User', email: 'test@test.com', role_id: 2, username: 'testuser', pnr: '123' }
      ];
      userRepo.findAllUsers.mockResolvedValue(mockUsers);
      const result = await userService.findAllUsers();
      expect(result).toEqual(mockUsers);
      expect(userRepo.findAllUsers).toHaveBeenCalled();
    });
  });

  /**
   * Tests for getUserById – retrieves a user by ID.
   * Verifies that the correct user is returned, and that null is given if ID does not exist.
   */
  describe('getUserById', () => {
    // Tests that a user is found and returned by their ID
    it('should return user by id', async () => {
      const mockUser = { person_id: 1, name: 'Test', surname: 'User' };
      userRepo.findUserById.mockResolvedValue(mockUser);
      const result = await userService.getUserById(1);
      expect(result).toEqual(mockUser);
      expect(userRepo.findUserById).toHaveBeenCalledWith(1);
    });

    // Tests that null is returned if the user does not exist
    it('should return null if not found', async () => {
      userRepo.findUserById.mockResolvedValue(null);
      const result = await userService.getUserById(999);
      expect(result).toBeNull();
    });
  });

  /**
   * Tests for registerUser – registration of a new user.
   * Verifies validation (missing fields, invalid personal number),
   * password hashing with bcrypt, and that the correct role is assigned.
   */
  describe('registerUser', () => {
    // Tests that a 400 error is thrown if required fields (username, password, email) are missing
    it('should throw 400 if required fields are missing', async () => {
      await expect(userService.registerUser({})).rejects.toThrow('Missing required registration fields');
    });

    // Tests that a 400 error is thrown if the personal number contains letters instead of digits
    it('should throw 400 if pnr contains non-digits', async () => {
      await expect(userService.registerUser({
        username: 'user', password: 'pass', email: 'e@e.com', pnr: 'abc'
      })).rejects.toThrow('Personal number (pnr) must contain digits only');
    });

    // Tests that the password is hashed (not stored in plaintext) and the user is created with role 2 (applicant)
    it('should create user with hashed password via repo', async () => {
      userRepo.createUser.mockResolvedValue({
        person_id: 1, name: 'New', surname: 'User', email: 'new@test.com', username: 'newuser', role_id: 2
      });
      const result = await userService.registerUser({
        name: 'New', surname: 'User', email: 'new@test.com', password: 'pass123', username: 'newuser'
      });
      expect(userRepo.createUser).toHaveBeenCalled();
      // Verify password was hashed (not stored as plaintext)
      const callArgs = userRepo.createUser.mock.calls[0][0];
      expect(callArgs.password).not.toBe('pass123');
      expect(result.role_id).toBe(2);
    });
  });

  /**
   * Tests for login – user authentication.
   * Verifies that missing credentials, non-existent users, and
   * incorrect passwords all return the correct error message,
   * while a successful login returns a JWT token and user data.
   */
  describe('login', () => {
    // Tests that a 400 error is thrown if username or password is empty
    it('should throw 400 if username or password missing', async () => {
      await expect(userService.login('', '')).rejects.toThrow('Username and password are required');
    });

    // Tests that a 401 error is thrown if the user does not exist in the database
    it('should throw 401 if user not found', async () => {
      userRepo.findUserByUsername.mockResolvedValue(null);
      await expect(userService.login('nouser', 'pass')).rejects.toThrow('Invalid credentials');
    });

    // Tests that a 401 error is thrown if the password does not match the hashed password in the database
    it('should throw 401 if password does not match', async () => {
      const hashed = await bcrypt.hash('correctpass', 10);
      userRepo.findUserByUsername.mockResolvedValue({ person_id: 1, password: hashed, role_id: 2 });
      await expect(userService.login('user', 'wrongpass')).rejects.toThrow('Invalid credentials');
    });

    // Tests that a JWT token and user data are returned on successful login
    it('should return token and user on successful login', async () => {
      const hashed = await bcrypt.hash('pass', 10);
      userRepo.findUserByUsername.mockResolvedValue({ person_id: 1, password: hashed, role_id: 2, name: 'Test' });
      const result = await userService.login('user', 'pass');
      expect(result.token).toBeDefined();
      expect(result.user.person_id).toBe(1);
    });
  });
});
