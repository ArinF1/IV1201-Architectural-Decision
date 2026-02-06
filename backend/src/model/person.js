const { DataTypes } = require('sequelize');

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