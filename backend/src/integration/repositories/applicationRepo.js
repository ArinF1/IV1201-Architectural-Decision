const {Application} = require("../persistence"); // Imports the Message model

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
    const rows = await Application.findAll({ 
        order: [['createdAt', 'DESC']], // Orders applications by creation date descending
        limit, // calls limit param
        raw: true
    });
    return rows;
}

module.exports = {
    createApplication,
    listApplications,
};