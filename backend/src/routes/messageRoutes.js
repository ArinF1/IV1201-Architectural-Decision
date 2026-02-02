const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// POST /api/messages
router.post('/', (req, res, next) => messageController.postMessage(req, res, next));

// GET /api/messages
router.get('/', (req, res, next) => messageController.getMessages(req, res, next));

module.exports = router;
