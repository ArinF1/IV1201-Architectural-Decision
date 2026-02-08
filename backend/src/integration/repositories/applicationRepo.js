const {Application} = require("../persistance"); // Imports the Message model

const { Person } = require('../persistance');

/**
 * Creates a new application in the database with the provided text.
 * @param text - The text content of the application to be created.
 *  @return The created application instance.
 * async function because it involves db operations, inherently asynchronous.
 *  */

async function createApplication(text, transaction = null) {
    const created = await Application.create({ text }, { transaction }); // Creates a new application record in the database
    return created.get({ plain: true }); 
}

/**
 * Lists applications from the database, ordered by creation date descending.
 * @param limit - The maximum number of applications retrieved is 50.
 * @return An array of application instances.
 * async function because it involves db operations, inherently asynchronous.
 * *  */

async function listApplications(limit = 50) {
    return await Person.findAll({
        where: { role_id: 2 },
        attributes: ['name', 'surname'], 
        limit: limit,
        raw: true
    });
}



module.exports = {
    createApplication,
    listApplications,
    
};