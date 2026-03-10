/**
 * Unit tests for userRepo (repository layer)
 */
require('dotenv').config({ path: './backend/.env' });
const userRepo = require('../backend/src/integration/repositories/userRepo');
const { Person } = require('../backend/src/integration/persistence');

jest.mock('../backend/src/integration/persistence', () => {
  const mockPerson = {
    findOne: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn()
  };
  return { Person: mockPerson, Role: {}, sequelize: {} };
});

describe('userRepo', () => {
  afterEach(() => jest.clearAllMocks());

  /**
   * Tests for findAllUsers – retrieves all users from the database.
   * Verifies that Person.findAll is called and the result is returned correctly.
   */
  describe('findAllUsers', () => {
    // Tests that all users are fetched from the Person table via Sequelize
    it('should return all users', async () => {
      const mockUsers = [{ person_id: 1, name: 'Test', surname: 'User' }];
      Person.findAll.mockResolvedValue(mockUsers);
      const result = await userRepo.findAllUsers();
      expect(result).toEqual(mockUsers);
      expect(Person.findAll).toHaveBeenCalled();
    });
  });

  /**
   * Tests for findUserById – retrieves a specific user by primary key.
   * Verifies that the correct user is returned and that null is given for a missing ID.
   */
  describe('findUserById', () => {
    // Tests that a user is found and returned via Person.findByPk
    it('should return user by id', async () => {
      const mockUser = { person_id: 1, name: 'Test' };
      Person.findByPk.mockResolvedValue(mockUser);
      const result = await userRepo.findUserById(1);
      expect(result).toEqual(mockUser);
      expect(Person.findByPk).toHaveBeenCalledWith(1, expect.anything());
    });

    // Tests that null is returned if no ID matches in the database
    it('should return null if user not found', async () => {
      Person.findByPk.mockResolvedValue(null);
      const result = await userRepo.findUserById(999);
      expect(result).toBeNull();
    });
  });

  /**
   * Tests for createUser – creates a new user in the database.
   * Verifies that Person.create is called with a transaction,
   * and that an error is thrown if the transaction is missing (data integrity protection).
   */
  describe('createUser', () => {
    // Tests that a new user is correctly created via Person.create with a transaction
    it('should create and return user', async () => {
      const mockCreated = { get: jest.fn().mockReturnValue({ person_id: 1, name: 'New' }) };
      Person.create.mockResolvedValue(mockCreated);
      const transaction = {};
      const result = await userRepo.createUser({ name: 'New', password: 'hashed' }, transaction);
      expect(result).toEqual({ person_id: 1, name: 'New' });
      expect(Person.create).toHaveBeenCalledWith({ name: 'New', password: 'hashed' }, { transaction });
    });

    // Tests that an error is thrown if no database transaction is provided (security requirement)
    it('should throw error if no transaction provided', async () => {
      await expect(userRepo.createUser({ name: 'New' })).rejects.toThrow('DB transaction is required');
    });
  });

  /**
   * Tests for findUserByUsername – searches for a user by username.
   * Verifies that Person.findOne is called and that null is returned if the user does not exist.
   */
  describe('findUserByUsername', () => {
    // Tests that a user is correctly found by their username
    it('should return user by username', async () => {
      const mockUser = { person_id: 1, username: 'testuser' };
      Person.findOne.mockResolvedValue(mockUser);
      const result = await userRepo.findUserByUsername('testuser');
      expect(result).toEqual(mockUser);
    });

    // Tests that null is returned if the username does not exist in the database
    it('should return null if username not found', async () => {
      Person.findOne.mockResolvedValue(null);
      const result = await userRepo.findUserByUsername('noone');
      expect(result).toBeNull();
    });
  });
});
