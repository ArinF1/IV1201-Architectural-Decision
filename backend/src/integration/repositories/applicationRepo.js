const { Person, CompetenceProfile, Competence, Availability } = require("../persistence");
const { HttpError } = require('../../errors/httpsError');

/**
 * Submits a new applicant via an application record associated with their competencies and availabilities.
 * @param {Object} applicationData - The application data including person_id, competencies, and availabilities.
 * @param {number} applicationData.person_id - The ID of the person submitting the application.
 * @param {Array} applicationData.competencies - Array of competence objects with competence_id and years_of_experience.
 * @param {Array} applicationData.availabilities - Array of availability objects with from_date and to_date.
 * @param {Object} transaction - The database transaction object.
 * @return {Object} The created application instance with related data.
 */
async function submitApplication(applicationData, transaction) {

  if (!transaction) {
    throw new HttpError(500, "DB transaction is required for submitting an application", "INTERNAL_SERVER_ERROR");
  }

  const person_id = applicationData.person_id;
  const availabilities = applicationData.availabilities;
  const competencies = applicationData.competencies;

  // Validate persons existence
  const person = await Person.findByPk(person_id, { transaction: transaction });
  if (!person) {
    throw new HttpError(404, "Person not found", "NOT_FOUND");
  }

  /**
   *  DB rows are created for competence profiles linked to the person_id.
   *  Each object represents one competence that is linked to the applying person,
   *  and these rows are prepped before insertion into the DB.
   */
  const competenceProfilesRows = [];
  for (const comp of competencies) {
    competenceProfilesRows.push({
      person_id: person_id,
      competence_id: comp.competence_id,
      years_of_experience: comp.years_of_experience,
    });
  }

  /**
   *  Similar to competence profiles, availability rows are created for each availability period linked to the person_id.
   *  An object represents one availability period of the applying person,
   *  and these rows are prepped before insertion into the DB.
   */
  const availabilityRows = [];
  for (const avail of availabilities) {
    availabilityRows.push({
      person_id: person_id,
      from_date: avail.from_date,
      to_date: avail.to_date,
    });
  }

  /**
   *  Stores the competence profile records. 
   *  Each entry is a Sequelized model instance created in the transaction.
   *  for loop inserts each competence profile into DB, and all inserts are part of the same transaction, this ensures atomicity.
   */
  const createdCompetenceProfiles = [];

  for (const row of competenceProfilesRows) {
    const created = await CompetenceProfile.create(row, { transaction: transaction });
    createdCompetenceProfiles.push(created);
  }

  /**
   * Stores the availability records.
   * Each entry is a Sequelized model instance created in the transaction.
   * for loop inserts each availability into DB, and all inserts are part of the same transaction, this ensures atomicity.
   */
  const createdAvailabilities = [];

  for (const row of availabilityRows) {
    const created = await Availability.create(row, { transaction: transaction });
    createdAvailabilities.push(created);
  }

  // Returns the submitted application data, contains applicants person_id, and the created competence profiles and availabilities as plain objects.
  return {
    person_id: person_id,
    competenceProfiles: createdCompetenceProfiles.map(function (row) {
      return row.get({ plain: true });
    }),
    availabilities: createdAvailabilities.map(function (row) {
      return row.get({ plain: true });
    }),
  };
}

/**
 * Lists applicants from the database via applicantdata through their competence and availability data.
 * @param {number} limit - The maximum number of applications to retrieve.
 * @param {number} offset - How many applicants to skip (pagination).
 * @param {boolean} hideEmpty - hides applicants with no competence profiles or availabilities when true, shows all applicants when false.
 * 
 */
async function listApplications(limit = 10, offset = 0, hideEmpty = true) {
  const whereClause = { role_id: 2 };

  const baseInclude = [
    {
      model: CompetenceProfile,
      as: "competenceProfiles",
      required: hideEmpty, // only includes persons that HAVE competenceProfiles when hideEmpty=true
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
      required: hideEmpty, // only includes persons that HAVE availabilities when hideEmpty=true
      attributes: ["availability_id", "from_date", "to_date"],
    },
  ];

  const totalCount = await Person.count({
    where: whereClause,
    distinct: true,
    col: "person_id",
    include: baseInclude,
  });

  const persons = await Person.findAll({
    where: whereClause,
    attributes: ["person_id", "name", "surname", "email", "pnr"],
    include: baseInclude,
    limit,
    offset,
    order: [["person_id", "DESC"]],
  });

  const applications = persons.map((person) => {
    const plain = person.get({ plain: true });
    return {
      application_id: plain.person_id,
      person: plain,
      status: "unhandled",
    };
  });

  return { totalCount, applications };
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

module.exports = {
  submitApplication,
  listApplications,
  listCompetencies,
};