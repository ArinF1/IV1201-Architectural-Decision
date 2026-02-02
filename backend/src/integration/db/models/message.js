const { Sequelize, DataTypes } = require('sequelize');  // Imports sequelize library

/*
* The function defines the 'Message' db model used by the application (integration layer)
* This model represents messages stored in the db in a simple format. They are mapped to the 'messages' table via Sequelize.
* Responsible for defining the structure of the message data in the db, no business logic (app. specific rules and decisions).
* @oaram sequelize - the Sequelize instance used to define the model.
* @returns - returns the defined Message model.
*/
function defineMessageModel(sequelize) {
    const Message = sequelize.define('Message', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true, // id increments for each new message
            primaryKey: true, // Unique identifier for each message
        },
        text: {
            type: DataTypes.STRING(500), 
            allowNull: false, // Message text cannot be null
        },
    }, {
        tableName: "messages", 
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    });

    return Message;
}

module.exports = { defineMessageModel };  // Exports the model definition function