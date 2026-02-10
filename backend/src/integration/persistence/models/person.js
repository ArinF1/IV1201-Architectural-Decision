const { DataTypes } = require('sequelize');



/**
 * Defines the Person model representing the 'person' table in the database.
 * * This model maps directly to the schema provided in existing-database.sql.
 * It includes fields for user identification, contact details, and authentication.
 * * @param {import('sequelize').Sequelize} sequelize - The Sequelize instance.
 * @returns {import('sequelize').Model} The initialized Person model.
 */
function definePersonModel(sequelize) {
    return sequelize.define('Person', {
        person_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: { type: DataTypes.STRING(255) },
        surname: { type: DataTypes.STRING(255) },
        pnr: { type: DataTypes.STRING(255) },
        email: { type: DataTypes.STRING(255) },
        password: { type: DataTypes.STRING(255) },
        role_id: { type: DataTypes.INTEGER },
        username: { type: DataTypes.STRING(255) }
    }, {
        tableName: 'person',
        timestamps: false 
    });
}

module.exports = { definePersonModel };