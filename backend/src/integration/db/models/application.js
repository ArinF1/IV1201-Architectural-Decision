const { Sequelize, DataTypes } = require('sequelize');  // Imports sequelize library

/*
* This function defines the Application model in the database.
* It includes fields for id and text and with appropriate data types/constraints
* The model ("applications") is the table name in the database.
* @param sequelize - The Sequelize instance to define the model on.
* @returns Application - The defined Application model.
*/
function defineApplicationModel(sequelize) {
    const Application = sequelize.define('Application', {
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
        tableName: "applications", 
        timestamps: true, 
    });

    return Application;
}

module.exports = { defineApplicationModel };  // Exports the model definition function