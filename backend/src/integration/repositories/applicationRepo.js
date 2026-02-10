const { application } = require("express");
const { Person, CompetenceProfile, Competence, Availability } = require("../persistence");

/**
 * Submits a new applicant via an application record associated with their competencies and availabilities.
 * @param {Object} applicationData - The application data including person_id, competencies, and availabilities.
 * @param {number} applicationData.person_id - The ID of the person submitting the application.
 * @param {Array} applicationData.competencies - Array of competence objects with competence_id and years_of_experience.
 * @param {Array} applicationData.availabilities - Array of availability objects with from_date and to_date.
 * @param {Object} transaction - The database transaction object.
 * @return {Object} The created application instance with related data.
 */
async function submitApplication(applicationData, transaction = null) {
    const { person_id, competencies, availabilities } = applicationData;

    // Validate persons existence
    const person = await Person.findByPk(person_id, { transaction });
    if (!person) {
        throw new Error("Person not found");
    }

    // Insertion of competence profiles
    let insertedCompetenceProfiles = [];
    if (competencies && competencies.length > 0) {
        const competenceProfilesRows = competencies.map((comp) => ({
            person_id,
            competence_id: comp.competence_id,
            years_of_experience: comp.years_of_experience, 
        }));

        const createdCompetenceProfiles = await CompetenceProfile.bulkCreate(competenceProfilesRows, {
            transaction,
            returning: true,
        }); 

        insertedCompetenceProfiles = createdCompetenceProfiles.map((row) => row.get({ plain: true }));
    }

    // Insertion of availability records
    let insertedAvailabilities = [];
    if (availabilities && availabilities.length > 0) {
        const availabilityRows = availabilities.map((avail) => ({
            person_id,
            from_date: avail.from_date,
            to_date: avail.to_date,
        }));

        const createdAvailabilities = await Availability.bulkCreate(availabilityRows, {
            transaction,
            returning: true,
        });

        insertedAvailabilities = createdAvailabilities.map((row) => row.get({ plain: true }));
    }

    return {
        person_id,
        competenceProfiles: insertedCompetenceProfiles,
        availabilities: insertedAvailabilities,
    };
}

/**
 * Lists applicants from the database via applicantdata through their competence and availability data.
 * @param {number} limit - The maximum number of applications to retrieve (default: 50).
 * @return {Array} An array of application instances with related data.
 */
async function listApplications(limit = 50) {
    const persons = await Person.findAll({
    where: { role_id: 2 }, // applicants are role_id = 2 (from the database, 1 = Recruiter)
    attributes: ["person_id", "name", "surname", "email", "pnr"],
    include: [
      {
        model: CompetenceProfile,
        as: "competenceProfiles",
        attributes: ["competence_profile_id", "competence_id", "years_of_experience"],
        include: [
          {
            model: Competence,
            as: "competence",
            attributes: ["competence_id", "name"],
          },
        ],
      },
      {
        model: Availability,
        as: "availabilities",
        attributes: ["availability_id", "from_date", "to_date"],
      },
    ],
    limit,
    order: [["person_id", "DESC"]],
  });

  return persons.map(function (person) {
    const plain = person.get({ plain: true });
    return {
        application_id: plain.person_id,
        person: plain,
        status: 'unhandled',
    };
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
* FUnction to remove!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 */
async function updateApplicationStatus(applicationId, status) {
    throw new Error("remove this shit");
}

/** 
 * Creates the application by inserting the applicant's competencies and availabilities into the database.
 * @param applicationData - The application data containing person_id, competencies, and availabilities.
 * @param transaction - The database transaction obbject 
 */
async function createApplication(applicationData, transaction = null) {
  return submitApplication(applicationData, transaction);
}

module.exports = {
  submitApplication,
  createApplication, // compatibility
  listApplications,
  listCompetencies,
  updateApplicationStatus,
};