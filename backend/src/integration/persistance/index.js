const {sequelize} = require('./sequelize'); // Imports config. sequelize instance
const {defineApplicationModel} = require('./models/application'); // Imports model definitions
const {definePersonModel} = require('../../model/person');
const {defineCompetenceModel} = require('./models/competence');
const {defineCompetenceProfileModel} = require('./models/competenceProfile');
const {defineAvailabilityModel} = require('./models/availability');
const { definePersonModel } = require('./models/person'); // Import Person definition

// Define all models
const Application = defineApplicationModel(sequelize);
const Competence = defineCompetenceModel(sequelize);
const CompetenceProfile = defineCompetenceProfileModel(sequelize);
const Availability = defineAvailabilityModel(sequelize);
const Person = definePersonModel(sequelize); // Defines the Person model


// Define relationships
Application.belongsTo(Person, { foreignKey: 'person_id', as: 'person' });
Person.hasMany(Application, { foreignKey: 'person_id', as: 'applications' });

CompetenceProfile.belongsTo(Person, { foreignKey: 'person_id', as: 'person' });
CompetenceProfile.belongsTo(Competence, { foreignKey: 'competence_id', as: 'competence' });
Person.hasMany(CompetenceProfile, { foreignKey: 'person_id', as: 'competenceProfiles' });
Competence.hasMany(CompetenceProfile, { foreignKey: 'competence_id', as: 'competenceProfiles' });

Availability.belongsTo(Person, { foreignKey: 'person_id', as: 'person' });
Person.hasMany(Availability, { foreignKey: 'person_id', as: 'availabilities' });


/*
* Database is initialized and synched with the defined models. 
* The function is for external use to set up the database connection and ensure models are in sync.
* authenticate verifies the connection to the database.
*/

async function initDb() {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
}

module.exports = { 
    sequelize, 
    Application, 
    Person,
    Competence,
    CompetenceProfile,
    Availability,
    initDb 
};

