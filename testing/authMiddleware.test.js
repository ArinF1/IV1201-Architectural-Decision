/**
 * Unit tests for authMiddleware (middleware layer)
 */
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('../backend/src/middleware/authMiddleware');

const TEST_SECRET = 'test-secret-key';

beforeAll(() => {
  process.env.JWT_SECRET = TEST_SECRET;
});

function mockReqResNext() {
  const req = { cookies: {} };
  const res = {};
  const next = jest.fn();
  return { req, res, next };
}

/**
 * Tests the JWT authentication middleware.
 * Verifies three scenarios:
 * 1. No cookie → 401 Unauthorized
 * 2. Valid JWT token → user is attached to req.user and next middleware is called
 * 3. Invalid/tampered token → 403 Forbidden
 */
describe('authMiddleware - authenticateToken', () => {
  // Tests that a 401 error is passed to next() if no auth_token cookie exists in the request
  it('should call next with 401 error if no auth_token cookie', () => {
    const { req, res, next } = mockReqResNext();
    req.cookies = {};
    authenticateToken(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 401 }));
  });

  // Tests that a valid JWT token is verified, user data is attached to req.user, and next() is called without error
  it('should attach user to req and call next on valid token', () => {
    const { req, res, next } = mockReqResNext();
    const token = jwt.sign({ id: 1, role_id: 2 }, TEST_SECRET);
    req.cookies = { auth_token: token };
    authenticateToken(req, res, next);
    expect(req.user).toMatchObject({ id: 1, role_id: 2 });
    expect(next).toHaveBeenCalledWith();
  });

  // Tests that an invalid/tampered token results in a 403 Forbidden error via next()
  it('should call next with 403 error if token is invalid', () => {
    const { req, res, next } = mockReqResNext();
    req.cookies = { auth_token: 'bad_token' };
    authenticateToken(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 403 }));
  });
});
