const {sequelize} = require('./sequelize'); // Imports config. sequelize instance
const {defineApplicationModel} = require('./models/application'); // Imports model definitions
const { definePersonModel } = require('./models/person'); // Import Person definition

const Application = defineApplicationModel(sequelize); // Defines the Application model
const Person = definePersonModel(sequelize); // Defines the Person model

/*
* Database is initialized and synched with the defined models. 
* The function is for external use to set up the database connection and ensure models are in sync.
* authenticate verifies the connection to the database.
*/

async function initDb() {
    await sequelize.authenticate();

}

module.exports = { sequelize, Application, initDb, Person };