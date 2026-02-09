const { DataTypes } = require('sequelize');

/**
 * Defines the Availability model in the database.
 * Represents date ranges when an applicant is available to work.
 * @param {import('sequelize').Sequelize} sequelize - The Sequelize instance to define the model on.
 * @returns {import('sequelize').Model} Availability - The defined Availability model.
 */
function defineAvailabilityModel(sequelize) {
    const Availability = sequelize.define('Availability', {
        availability_id: {
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
        from_date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        to_date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
    }, {
        tableName: 'availability',
        timestamps: false,
    });

    return Availability;
}

module.exports = { defineAvailabilityModel };
