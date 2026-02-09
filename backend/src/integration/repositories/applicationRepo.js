const { Application, Person, CompetenceProfile, Competence, Availability } = require("../persistance");

/**
 * Creates a new application in the database with the provided data.
 * @param {Object} applicationData - The application data including person_id, competencies, and availabilities.
 * @param {number} applicationData.person_id - The ID of the person submitting the application.
 * @param {Array} applicationData.competencies - Array of competence objects with competence_id and years_of_experience.
 * @param {Array} applicationData.availabilities - Array of availability objects with from_date and to_date.
 * @param {Object} transaction - The database transaction object.
 * @return {Object} The created application instance with related data.
 */
async function createApplication(applicationData, transaction = null) {
    const { person_id, competencies, availabilities } = applicationData;

    // Create the application record
    const application = await Application.create(
        { person_id, status: 'unhandled' },
        { transaction }
    );

    // Create competence profiles
    if (competencies && competencies.length > 0) {
        const competenceProfiles = competencies.map(function (comp) {
            return {
                person_id,
                competence_id: comp.competence_id,
                years_of_experience: comp.years_of_experience,
            };
        });
        await CompetenceProfile.bulkCreate(competenceProfiles, { transaction });
    }

    // Create availability records
    if (availabilities && availabilities.length > 0) {
        const availabilityRecords = availabilities.map(function (avail) {
            return {
                person_id,
                from_date: avail.from_date,
                to_date: avail.to_date,
            };
        });
        await Availability.bulkCreate(availabilityRecords, { transaction });
    }

    return application.get({ plain: true });
}

/**
 * Lists applications from the database with related person, competence, and availability data.
 * @param {number} limit - The maximum number of applications to retrieve (default: 50).
 * @return {Array} An array of application instances with related data.
 */
async function listApplications(limit = 50) {
    const applications = await Application.findAll({
        include: [
            {
                model: Person,
                as: 'person',
                attributes: ['person_id', 'name', 'surname', 'email', 'pnr'],
                include: [
                    {
                        model: CompetenceProfile,
                        as: 'competenceProfiles',
                        include: [
                            {
                                model: Competence,
                                as: 'competence',
                                attributes: ['competence_id', 'name'],
                            },
                        ],
                    },
                    {
                        model: Availability,
                        as: 'availabilities',
                        attributes: ['availability_id', 'from_date', 'to_date'],
                    },
                ],
            },
        ],
        order: [['createdAt', 'DESC']],
        limit,
    });

    return applications.map(function (app) {
        return app.get({ plain: true });
    });
}

/**
 * Gets all available competencies from the database.
 * @return {Array} An array of competence objects.
 */
async function listCompetencies() {
    const competencies = await Competence.findAll({
        attributes: ['competence_id', 'name'],
        order: [['name', 'ASC']],
    });

    return competencies.map(function (comp) {
        return comp.get({ plain: true });
    });
}

/**
 * Updates the status of an application.
 * @param {number} applicationId - The ID of the application to update.
 * @param {string} status - The new status ('accepted' or 'rejected').
 * @return {Object} The updated application instance.
 */
async function updateApplicationStatus(applicationId, status) {
    const application = await Application.findByPk(applicationId);

    if (!application) {
        throw new Error('Application not found');
    }

    application.status = status;
    await application.save();

    return application.get({ plain: true });
}



module.exports = {
    createApplication,
    listApplications,
    listCompetencies,
    updateApplicationStatus,

};