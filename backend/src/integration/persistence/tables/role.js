const { DataTypes } = require('sequelize');

/**
 * Defines the Role model in the database.
 * @param {import('sequelize').Sequelize} sequelize - The Sequelize instance.
 * @returns {import('sequelize').Model} The defined Role model.
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
