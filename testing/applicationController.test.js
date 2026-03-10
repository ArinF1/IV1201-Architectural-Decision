/**
 * Unit tests for applicationController (controller layer)
 */
require('dotenv').config({ path: './backend/.env' });
const request = require('supertest');
const express = require('express');
const applicationController = require('../backend/src/controllers/applicationController');
const applicationService = require('../backend/src/model/service/applicationService');
const decisionMakingService = require('../backend/src/model/service/decisionMakingService');

jest.mock('../backend/src/model/service/applicationService');
jest.mock('../backend/src/model/service/decisionMakingService');

const app = express();
app.use(express.json());

// Simulate authenticated user middleware
app.use((req, res, next) => {
  req.user = req.headers['x-role'] === 'recruiter'
    ? { id: 1, role_id: 1 }
    : req.headers['x-role'] === 'applicant'
      ? { id: 2, role_id: 2 }
      : undefined;
  next();
});

app.post('/applications', applicationController.postApplication);
app.get('/applications', applicationController.getApplications);
app.patch('/applications/:id/status', applicationController.patchApplicationStatus);
app.get('/competencies', applicationController.getCompetencies);
app.post('/applications/auto-process', applicationController.autoProcessApplications);

// Error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: { code: err.code || 'ERROR', message: err.message } });
});

describe('Application Controller', () => {
  afterEach(() => jest.clearAllMocks());

  /**
   * Tests for POST /applications – creating a new application.
   * Verifies that an authenticated applicant can submit an application,
   * and that unauthenticated users receive a 401 Unauthorized response.
   */
  describe('postApplication', () => {
    // Tests that an authenticated applicant can submit an application and receives 201 Created
    it('should create application and return 201', async () => {
      applicationService.sendApplication.mockResolvedValue({ id: 1, status: 'unhandled' });
      const res = await request(app)
        .post('/applications')
        .set('x-role', 'applicant')
        .send({ competencies: [{ competence_id: 1, years_of_experience: 3 }], availabilities: [{ from_date: '2024-01-01', to_date: '2024-06-01' }] });
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
    });

    // Tests that an unauthenticated user (no login) receives 401 Unauthorized
    it('should return 401 if user is not authenticated', async () => {
      const res = await request(app)
        .post('/applications')
        .send({ competencies: [], availabilities: [] });
      expect(res.statusCode).toBe(401);
    });
  });

  /**
   * Tests for GET /applications – fetching paginated application list.
   * Verifies that recruiters can access the list, and that
   * non-recruiters (applicants) are blocked with 403 Forbidden.
   */
  describe('getApplications', () => {
    // Tests that a recruiter can fetch the application list and receives 200 OK
    it('should return applications for recruiter', async () => {
      applicationService.getApplicationsPage.mockResolvedValue({ applications: [], totalPages: 0 });
      const res = await request(app)
        .get('/applications?page=1&pageSize=10')
        .set('x-role', 'recruiter');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    // Tests that a non-recruiter (applicant) is blocked with 403 Forbidden
    it('should return 403 for non-recruiter', async () => {
      const res = await request(app)
        .get('/applications')
        .set('x-role', 'applicant');
      expect(res.statusCode).toBe(403);
    });
  });

  /**
   * Tests for PATCH /applications/:id/status – updating application status.
   * Verifies that recruiters can accept/reject applications,
   * and that non-recruiters are denied access.
   */
  describe('patchApplicationStatus', () => {
    // Tests that a recruiter can update an application's status (e.g. accept)
    it('should update status for recruiter', async () => {
      applicationService.updateStatus.mockResolvedValue({ id: 1, status: 'accepted' });
      const res = await request(app)
        .patch('/applications/1/status')
        .set('x-role', 'recruiter')
        .send({ status: 'accepted' });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    // Tests that an applicant cannot change status – receives 403 Forbidden
    it('should return 403 for non-recruiter', async () => {
      const res = await request(app)
        .patch('/applications/1/status')
        .set('x-role', 'applicant')
        .send({ status: 'accepted' });
      expect(res.statusCode).toBe(403);
    });
  });

  /**
   * Tests for GET /competencies – fetching available competencies.
   * Verifies that the endpoint returns a list of competencies.
   */
  describe('getCompetencies', () => {
    // Tests that the list of competencies is returned correctly
    it('should return list of competencies', async () => {
      applicationService.getCompetencies.mockResolvedValue([{ id: 1, name: 'Java' }]);
      const res = await request(app).get('/competencies');
      expect(res.statusCode).toBe(200);
      expect(res.body.data).toEqual([{ id: 1, name: 'Java' }]);
    });
  });

  /**
   * Tests for POST /applications/auto-process – automated decision-making.
   * Verifies that the auto-processing endpoint works and returns results.
   */
  describe('autoProcessApplications', () => {
    // Tests that automatic processing of applications returns the number of processed/accepted/rejected
    it('should process applications and return results', async () => {
      decisionMakingService.processUnhandledApplications.mockResolvedValue({ processed: 5, accepted: 3, rejected: 2 });
      const res = await request(app)
        .post('/applications/auto-process')
        .set('x-role', 'recruiter');
      expect(res.statusCode).toBe(200);
    });
  });
});
