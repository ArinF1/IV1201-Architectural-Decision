const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { authenticateToken } = require('../middleware/authMiddleware');

// POST /api/applications
//router.post('/', (req, res, next) => applicationController.postApplication(req, res, next));

// GET /api/applications
//router.get('/', (req, res, next) => applicationController.getApplications(req, res, next));

router.get('/', authenticateToken, applicationController.getApplications);

router.post('/', authenticateToken, applicationController.postApplication);

module.exports = router;
