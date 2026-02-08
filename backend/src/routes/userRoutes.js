/**
 * @fileoverview User routes
 * @module routes/userRoutes
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', function(req, res, next) {
  userController.getAllUsers(req, res, next);
});

router.get('/:id', userController.getUserById);

router.post('/', userController.createUser);

router.put('/:id', userController.updateUser);

router.delete('/:id', userController.deleteUser);

/**
 * Express router for user endpoints
 * @type {express.Router}
 */
module.exports = router;