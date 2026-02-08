const { DataTypes } = require('sequelize');

/**
 * Defines the CompetenceProfile model in the database.
 * Links persons to their competencies with years of experience.
 * @param {import('sequelize').Sequelize} sequelize - The Sequelize instance to define the model on.
 * @returns {import('sequelize').Model} CompetenceProfile - The defined CompetenceProfile model.
 */
function defineCompetenceProfileModel(sequelize) {
    const CompetenceProfile = sequelize.define('CompetenceProfile', {
        competence_profile_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        person_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'person',
                key: 'person_id',
            },
        },
        competence_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'competence',
                key: 'competence_id',
            },
        },
        years_of_experience: {
            type: DataTypes.DECIMAL(4, 2),
            allowNull: false,
        },
    }, {
        tableName: 'competence_profile',
        timestamps: false,
    });

    return CompetenceProfile;
}

module.exports = { defineCompetenceProfileModel };
