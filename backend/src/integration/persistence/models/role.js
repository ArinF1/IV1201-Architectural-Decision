const { DataTypes } = require('sequelize');

/**
 * Defines the Role model representing the 'role' table.
 * Used for authorization (applicant vs recruiter).
 *
 * @param {import('sequelize').Sequelize} sequelize
 * @returns {import('sequelize').Model} Role
 */
function defineRoleModel(sequelize) {
    return sequelize.define('Role', {
        role_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: true
        }
    }, {
        tableName: 'role',
        timestamps: false
    });
}

module.exports = { defineRoleModel };
