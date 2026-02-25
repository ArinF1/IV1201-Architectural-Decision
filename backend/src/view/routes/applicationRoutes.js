/**
 * @fileoverview Application route definitions.
 * @module routes/applicationRoutes
 */
const express = require('express');
const router = express.Router();

const applicationController = require('../../controllers/applicationController');
const { authenticateToken } = require('../../middleware/authMiddleware');

// GET /api/applications/competencies - get list of competencies for application form
router.get('/competencies', applicationController.getCompetencies);

// GET /api/applications - submit a new application with competencies and availabilities
router.post('/', authenticateToken, applicationController.postApplication);

// GET /api/applications - get list of recent applications with details
router.get('/', authenticateToken, applicationController.getApplications);

// PATCH /api/applications/:id/status - update application status (accept/reject/unhandled)
router.patch('/:id/status', authenticateToken, applicationController.patchApplicationStatus);

module.exports = router;
