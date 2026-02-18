const userRepo = require('../../integration/repositories/userRepo');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sequelize } = require('../../integration/persistence');
const { HttpError } = require('../../errors/httpsError');

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
        if (!data || !data.username || !data.password || !data.email) {
            throw new HttpError(400, "Missing required registration fields", "BAD_REQUEST");
        }


        const saltRounds = 10;

        return sequelize.transaction(async function (transaction) {
            const hashedPassword = await bcrypt.hash(data.password, saltRounds);
            const recruiterCode = process.env.RECRUITER_SECRET_CODE;
            let roleId = 2;
            if (data.recruiter_code && recruiterCode && data.recruiter_code === recruiterCode) {
                roleId = 1;
            }
            // Remove recruiter_code from data before saving — it's not a DB column
            const { recruiter_code, ...userData } = data;
            return await userRepo.createUser({
                ...userData,
                password: hashedPassword,
                role_id: roleId
            }, transaction);
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
            throw new HttpError(401, "Invalid credentials", "UNAUTHORIZED");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new HttpError(401, "Invalid credentials", "UNAUTHORIZED");
        }

        const token = jwt.sign(
            { id: user.person_id, role_id: user.role_id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        )
        return { token, user: { ...user, role_id: user.role_id } };
    }
}

module.exports = new UserService();