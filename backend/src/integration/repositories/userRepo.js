const { Person } = require('../persistance');;

/**
 * Data Access Object (DAO) for User-related database operations.
 * This repository encapsulates Sequelize calls to maintain low coupling.
 */

/**
 * Retrieves a single user from the database by their username.
 * * @param {string} username - The unique username to search for.
 * @returns {Promise<Object|null>} The raw user entity or null if not found.
 */
async function findUserByUsername(username) {
    return await Person.findOne({ where: { username }, raw: true });
}


/**
 * Persists a new user record into the 'person' table.
 * * @param {Object} userData - The user data to be created (password must be hashed).
 * @returns {Promise<Object>} The created user instance.
 */
async function createUser(userData) {
    return await Person.create(userData);
}

module.exports = { findUserByUsername, createUser };