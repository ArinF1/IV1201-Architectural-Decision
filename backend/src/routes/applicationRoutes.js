const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { authenticateToken } = require('../middleware/authMiddleware');

// GET /api/applications/competencies - Get all available competencies
router.get('/competencies', function(req, res, next) {
  return applicationController.getCompetencies(req, res, next);
});

// POST /api/applications
router.post('/', function(req, res, next) {
  return applicationController.postApplication(req, res, next);
});

// GET /api/applications
router.get('/', function(req, res, next) {
  return applicationController.getApplications(req, res, next);
});

// PATCH /api/applications/:id/status - Update application status
router.patch('/:id/status', function(req, res, next) {
  return applicationController.updateApplicationStatus(req, res, next);
});
//router.post('/', (req, res, next) => applicationController.postApplication(req, res, next));

// GET /api/applications
//router.get('/', (req, res, next) => applicationController.getApplications(req, res, next));

router.get('/', authenticateToken, applicationController.getApplications);

router.post('/', authenticateToken, applicationController.postApplication);

// POST /api/applications/auto-process - Automatically process unhandled applications
router.post('/auto-process', function(req, res, next) {
  return applicationController.autoProcessApplications(req, res, next);
});

module.exports = router;
