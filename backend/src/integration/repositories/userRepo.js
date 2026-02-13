const { Person } = require('../persistence');

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
    const { Person, Role } = require('../persistence');
    return await Person.findOne({
        where: { username },
        include: [{ model: Role, as: 'role', attributes: ['name'] }],
        raw: true,
        nest: true
    });
}


/**
 * Persists a new user record into the 'person' table.
 * * @param {Object} userData - The user data to be created (password must be hashed).
 * @returns {Promise<Object>} The created user instance.
 */
async function createUser(userData) {
    const createdUser = await Person.create(userData);
    return createdUser.get({ plain: true });
}

/**
 * Retrieves all users from the database. 
 * @returns {Promise<Array>} Array of user entities.
 */
async function findAllUsers() {
    return await Person.findAll({
        attributes: ['person_id', 'name', 'surname', 'email', 'role_id', 'username', 'pnr'],
        raw: true
    });
}

/**
 * Retrieves a single user by their unique ID.
 * @param {number} id - The user's ID.
 * @returns {Promise<Object|null>} The user entity or null if not found.
 */
async function findUserById(id) {
    return await Person.findByPk(id, {
        attributes: ['person_id', 'name', 'surname', 'email', 'role_id', 'username', 'pnr'],   
        raw: true
    });
}

module.exports = { findUserByUsername, createUser, findAllUsers, findUserById };