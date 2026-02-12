const userRepo = require('../../integration/repositories/userRepo');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * Application Layer service for user-related business logic.
 * All authentication (bcrypt, JWT) happens here to maintain layer separation.
 */
class UserService {
    /**
     * Retrieves all users via the Integration layer.
     * @returns {Promise<Array>} Array of user entities.
     */
    async findAllUsers() {
        return await userRepo.findAllUsers();
    }

    /**
     * Retrieves a single user by ID via the Integration layer.
     * @param {number} id - The user's ID.
     * @returns {Promise<Object|null>} The user entity or null.
     */
    async getUserById(id) {
        return await userRepo.findUserById(id);
    }

    /**
     * Registers a new user with bcrypt-hashed password.
     * @param {Object} data - User registration data.
     * @returns {Promise<Object>} The created user entity.
     */
    async registerUser(data) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);

        return await userRepo.createUser({
            ...data,
            password: hashedPassword,
            role_id: 2
        });
    }

    /**
     * Authenticates a user and generates a JWT.
     * @param {string} username - The user's username.
     * @param {string} password - The user's plaintext password.
     * @returns {Promise<{token: string, user: Object}>} JWT token and user entity.
     * @throws {Error} With status 401 if credentials are invalid.
     */
    async login(username, password) {
        const user = await userRepo.findUserByUsername(username);
        if (!user) {
            const error = new Error("Invalid credentials");
            error.status = 401;
            throw error;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            const error = new Error("Invalid credentials");
            error.status = 401;
            throw error;
        }

        const token = jwt.sign(
            { id: user.person_id, role: user.role_id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        return { token, user };
    }
}

module.exports = new UserService();