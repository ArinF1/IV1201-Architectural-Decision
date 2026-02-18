const { sequelize } = require('./sequelize'); // Imports config. sequelize instance
const { defineCompetenceModel } = require('./tables/competence');
const { defineCompetenceProfileModel } = require('./tables/competenceProfile');
const { defineAvailabilityModel } = require('./tables/availability');
const { definePersonModel } = require('./tables/person');
const { defineRoleModel } = require('./tables/role');

// Define all models
const Competence = defineCompetenceModel(sequelize);
const CompetenceProfile = defineCompetenceProfileModel(sequelize);
const Availability = defineAvailabilityModel(sequelize);
const Role = defineRoleModel(sequelize);
const Person = definePersonModel(sequelize);

// Define relationships
CompetenceProfile.belongsTo(Person, { foreignKey: 'person_id', as: 'person' });
CompetenceProfile.belongsTo(Competence, { foreignKey: 'competence_id', as: 'competence' });
Availability.belongsTo(Person, { foreignKey: 'person_id', as: 'person' });
Person.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });

Competence.hasMany(CompetenceProfile, { foreignKey: 'competence_id', as: 'competenceProfiles' });
Role.hasMany(Person, { foreignKey: 'role_id', as: 'persons' });

Person.hasMany(CompetenceProfile, { foreignKey: 'person_id', as: 'competenceProfiles' });
Person.hasMany(Availability, { foreignKey: 'person_id', as: 'availabilities' });


/**
 * Authenticates the database connection and syncs models.
 * @returns {Promise<void>}
 */
async function initDb() {
    await sequelize.authenticate();
}

module.exports = {
    sequelize,
    Person,
    Role,
    Competence,
    CompetenceProfile,
    Availability,
    initDb
};

