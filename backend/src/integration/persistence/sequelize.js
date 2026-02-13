const { Sequelize } = require('sequelize');  // Imports sequelize library

/*
* The function creates and returns a new Sequelize instance that is used for db access.
* The instance is then connected to the postgres database via the DATABASE_URL variable (from.env).
* @returns - returns a Sequelize instance connected to the database.
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