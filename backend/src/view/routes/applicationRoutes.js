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

module.exports = router;
