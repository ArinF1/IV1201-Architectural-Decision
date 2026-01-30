const { Sequelize } = require('sequelize');  // Imports sequelize library

/*
* The function creates and returns a new Sequelize instance that is used for db access.
* The instance is then connected to the postgres database via the DATABASE_URL variable.
* The configuration can be reused throughout the environment, and the model is part of the integration layer.
* @returns - returns a Sequelize instance connected to the database.
*/
function createSequelizeInstance() {
    const databaseURL = ProcessingInstruction.env.DATABASE_URL;
    if (!databaseURL) {
        throw new Error("DATABASE_URL is not set in environment variables"); 
    }

    return new Sequelize(databaseURL, {
        logging: false, 
    });
}

const sequelize = createSequelizeInstance(); // Create the Sequelize instance

module.exports = {sequelize}; // Export the sequelize instance for use in other parts of the application