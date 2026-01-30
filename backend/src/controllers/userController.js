const userService = require('../model/UserService.js'); 
const UserDTO = require('../model/userDTO');

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.findAllUsers();
        // Map the array of entities to an array of DTOs
    const userDtos = users.map(user => new UserDTO(
      user.id, user.name, user.surname, user.pnr, user.email, user.username, user.role_id
    ));
    res.status(200).json(userDtos);
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userResponse = new UserDTO(
      user.id, user.name, user.surname, user.pnr, user.email, user.username, user.role_id
    );

    res.status(200).json(userResponse);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller for User operations.
 * Strictly handles HTTP translation and response formatting.
 */
exports.createUser = async (req, res, next) => {
    try {
        const { name, surname, pnr, email, password, username } = req.body;

        // Validation for missing fields
        if (!username || !password || !email) {
            const error = new Error('Missing required registration fields');
            error.status = 400;
            throw error;
        }

        // Call to model/service layer
        const user = await userService.registerUser({ 
            name, surname, pnr, email, password, username 
        });

        // We wrap the result in a DTO before sending it to the View.
        const userResponse = new UserDTO(
            user.id, 
            user.name, 
            user.surname, 
            user.pnr, 
            user.email, 
            user.username,
            user.role_id // Role ID mapping
        );

        res.status(201).json(userResponse);
    } catch (error) {
        // Passes error to the centralized handler in app.js
        next(error);
    }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    res.status(200).json({ message: `User ${id} updated` });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    res.status(200).json({ message: `User ${id} deleted` });
  } catch (error) {
    next(error);
  }
};
