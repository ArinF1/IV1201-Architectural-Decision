const { Sequelize, DataTypes } = require('sequelize');  // Imports sequelize library

/*
* This function defines the Message model in the database.
* It includes fields for id and text and with appropriate data types/constraints
* The model ("messages") is the table name in the database.
* @param sequelize - The Sequelize instance to define the model on.
* @returns Message - The defined Message model.
*/
function defineMessageModel(sequelize) {
    const Message = sequelize.define('Message', {
       id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        text: {
            type: DataTypes.STRING(500),
            allowNull: false,
        },
    }, {
        tableName: "messages", 
        timestamps: true, 
    });

    return Message;
}

module.exports = { defineMessageModel };  // Exports the model definition function