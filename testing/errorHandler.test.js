/**
 * @fileoverview Tests for global error handler
 * Tests that all error types are properly handled and presented to the user
 */
const request = require('supertest');
const app = require('./src/app');

describe('Global Error Handler', () => {
  /**
   * Test 1: Validation Errors (400 Bad Request)
   * When invalid data is sent (missing required fields)
   */
  describe('Validation Errors (400)', () => {
    test('should return 400 with error code when posting application without competencies', async () => {
      const response = await request(app)
        .post('/api/applications')
        .set('Cookie', 'auth_token=invalid_token')
        .send({
          availabilities: [{ from_date: '2024-01-01', to_date: '2024-01-31' }]
          // Missing competencies
        });

      // Expect 400 status and error format
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error.code');
      expect(response.body).toHaveProperty('error.message');
      expect(response.body.error.code).toBe('BAD_REQUEST');
    });

    test('should return 400 when competencies have missing fields', async () => {
      const response = await request(app)
        .post('/api/applications')
        .set('Cookie', 'auth_token=invalid_token')
        .send({
          competencies: [{ /* missing competence_id and years_of_experience */ }],
          availabilities: [{ from_date: '2024-01-01', to_date: '2024-01-31' }]
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('BAD_REQUEST');
    });

    test('should return 400 when availability dates are invalid', async () => {
      const response = await request(app)
        .post('/api/applications')
        .set('Cookie', 'auth_token=invalid_token')
        .send({
          competencies: [{ competence_id: 1, years_of_experience: 5 }],
          availabilities: [{ from_date: '2024-01-31', to_date: '2024-01-01' }] // from_date after to_date
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('BAD_REQUEST');
      expect(response.body.error.message).toContain('from_date');
    });
  });

  /**
   * Test 2: Authentication Errors (401 Unauthorized)
   * When user tries to access protected routes without valid token
   */
  describe('Authentication Errors (401)', () => {
    test('should return 401 when no auth token is provided', async () => {
      const response = await request(app)
        .post('/api/applications')
        .send({
          competencies: [{ competence_id: 1, years_of_experience: 5 }],
          availabilities: [{ from_date: '2024-01-01', to_date: '2024-01-31' }]
        });

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
      expect(response.body.error.message).toContain('Access denied');
    });

    test('should return 401 with invalid credentials on login', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          username: 'nonexistent',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
      expect(response.body.error.message).toBe('Invalid credentials');
    });
  });

  /**
   * Test 3: Not Found Errors (404)
   * When a resource doesn't exist
   */
  describe('Not Found Errors (404)', () => {
    test('should return 404 when user is not found', async () => {
      const response = await request(app)
        .get('/api/users/99999');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    test('should return 404 for non-existent route', async () => {
      const response = await request(app)
        .get('/api/nonexistent');

      expect(response.status).toBe(404);
    });
  });

  /**
   * Test 4: Server Errors (500)
   * Unexpected errors and database issues are caught and logged
   */
  describe('Server Errors (500)', () => {
    test('should return 500 with generic message (not stack trace)', async () => {
      // This test assumes the endpoint handles database errors gracefully
      // In a real scenario, you'd mock the database to fail
      const response = await request(app)
        .get('/api/users/invalid-id'); // Invalid ID format

      // Should not expose stack trace or internal details
      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_SERVER_ERROR');
      expect(response.body.error.message).toBe('Internal server error');
      
      // Ensure sensitive information is NOT exposed
      expect(response.body).not.toHaveProperty('stack');
      expect(response.body.error.message).not.toContain('SELECT');
      expect(response.body.error.message).not.toContain('database');
    });
  });

  /**
   * Test 5: Error Response Format
   * All errors should follow the same JSON structure
   */
  describe('Error Response Format', () => {
    test('all errors should have consistent format: { error: { code, message } }', async () => {
      const tests = [
        {
          name: 'missing auth token',
          request: () => request(app).post('/api/applications').send({}),
          expectedStatus: 401
        },
        {
          name: 'invalid data',
          request: () => request(app).post('/api/users').send({}),
          expectedStatus: 400
        }
      ];

      for (const test of tests) {
        const response = await test.request();
        
        // All errors must have this structure
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toHaveProperty('code');
        expect(response.body.error).toHaveProperty('message');
        expect(typeof response.body.error.code).toBe('string');
        expect(typeof response.body.error.message).toBe('string');
        
        // No success field in error responses
        expect(response.body).not.toHaveProperty('success');
      }
    });
  });

  /**
   * Test 6: Security - Stack Traces Not Exposed in Production
   */
  describe('Security - Information Disclosure', () => {
    test('should not expose stack traces in error responses', async () => {
      const response = await request(app)
        .get('/api/users/999');

      expect(response.body).not.toHaveProperty('stack');
      expect(response.body).not.toHaveProperty('name');
      expect(response.body.error.message).not.toMatch(/at /);
    });

    test('5XX errors should have generic messages to hide implementation details', async () => {
      // When internal errors occur, generic message should be shown
      const response = await request(app)
        .get('/api/users/invalid');

      if (response.status >= 500) {
        expect(response.body.error.message).toBe('Internal server error');
      }
    });
  });
});


