const { DataTypes } = require('sequelize');

/**
 * Defines the Role model in the database.
 * Representation for the different roles of a person, such as applicant, admin, etc.
 * @param sequelize - The Sequelize instance to define the model on.
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
