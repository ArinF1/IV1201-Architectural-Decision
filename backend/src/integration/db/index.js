const {sequelize} = require('./sequelize'); // Imports config. sequelize instance
const {defineMessageModel} = require('./models/message'); // Imports model definitions

const Message = defineMessageModel(sequelize); // Defines the Message model

/*
* Database is initialized and synched with the defined models. 
* The function is for external use to set up the database connection and ensure models are in sync.
* authenticate verifies the connection to the database.
*/

async function initDb() {
    await sequelize.authenticate();
    await sequelize.sync();  //syncs the db tables with the defined models
}

module.exports = { sequelize, Message, initDb };