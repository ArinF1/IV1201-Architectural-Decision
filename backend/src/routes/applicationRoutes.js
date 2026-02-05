const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');

// POST /api/applications
router.post('/', (req, res, next) => applicationController.postApplication(req, res, next));

// GET /api/applications
router.get('/', (req, res, next) => applicationController.getApplications(req, res, next));

module.exports = router;
