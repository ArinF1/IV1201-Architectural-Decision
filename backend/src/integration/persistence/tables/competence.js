const { DataTypes } = require('sequelize');

/**
 * Defines the Competence model in the database.
 * Represents different areas of expertise available in the system.
 * @param {import('sequelize').Sequelize} sequelize - The Sequelize instance to define the model on.
 * @returns {import('sequelize').Model} Competence - The defined Competence model.
 */
function defineCompetenceModel(sequelize) {
    const Competence = sequelize.define('Competence', {
        competence_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
    }, {
        tableName: 'competence',
        timestamps: false,
    });

    return Competence;
}

module.exports = { defineCompetenceModel };
