/**
 * @fileoverview User routes
 * @module routes/userRoutes
 */

const express = require('express');
const router = express.Router();
const userController = require('../../controllers/userController');

router.get('/', userController.getAllUsers);

router.post('/', userController.createUser);

router.post('/login', userController.login);

router.post('/logout', userController.logout);

router.get('/:id', userController.getUserById);

router.put('/:id', userController.updateUser);

router.delete('/:id', userController.deleteUser);

/**
 * Express router for user endpoints
 * @type {express.Router}
 */
module.exports = router;