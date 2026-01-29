const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', (req, res, next) => {
  userController.getAllUsers(req, res, next);
});

router.get('/:id', (req, res, next) => {
  if (!req.params.id) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  userController.getUserById(req, res, next);
});

router.post('/', (req, res, next) => {
  if (!req.body) {
    return res.status(400).json({ error: 'Request body is required' });
  }
  userController.createUser(req, res, next);
});

router.put('/:id', (req, res, next) => {
  if (!req.params.id) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  if (!req.body) {
    return res.status(400).json({ error: 'Request body is required' });
  }
  userController.updateUser(req, res, next);
});

router.delete('/:id', (req, res, next) => {
  if (!req.params.id) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  userController.deleteUser(req, res, next);
});

module.exports = router;
