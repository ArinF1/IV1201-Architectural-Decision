const { Sequelize } = require('sequelize');  // Imports sequelize library

/**
 * Creates a Sequelize instance connected to the database via DATABASE_URL.
 * @returns {import('sequelize').Sequelize} The configured Sequelize instance.
 */
function createSequelizeInstance() {
    const databaseURL = process.env.DATABASE_URL;
    if (!databaseURL) {
        throw new Error("DATABASE_URL is not set in environment variables");
    }

    const isProduction = process.env.NODE_ENV === 'production';

    return new Sequelize(databaseURL, {
        logging: console.log,
        ...(isProduction && {
            dialectOptions: {
                ssl: {
                    require: true,
                    rejectUnauthorized: false,
                },
            },
        }),
    });
}

const sequelize = createSequelizeInstance();

module.exports = { sequelize }; // Export the sequelize instance for use in other parts of the application