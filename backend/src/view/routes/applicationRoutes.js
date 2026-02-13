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

// GET /api/applications/list - recruiter-only list of all applications (full name + status)
router.get('/list', authenticateToken, applicationController.listAllApplications);

// POST /api/applications/auto-process - trigger auto-processing of applications
// router.post('/auto-process', authenticateToken, applicationController.autoProcessApplications);

module.exports = router;
