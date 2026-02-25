const { Op } = require('sequelize');
const { Person, CompetenceProfile, Competence, Availability, sequelize: db } = require("../persistence");
const { HttpError } = require('../../errors/httpsError');

/**
 * In-memory store for application statuses.
 * Maps person_id (number) to status string ('unhandled' | 'accepted' | 'rejected').
 * Used because the legacy DB schema has no status column and cannot be modified.
 * @type {Map<number, string>}
 */
const statusStore = new Map();

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
 * Lists applicants from the database with optional filtering.
 * Pagination is handled by the service layer after sorting.
 * @param {Object} filters - Optional filter criteria.
 * @param {string} [filters.competenceName] - Filter by applicants who have this competence.
 * @param {number} [filters.minExperience] - Filter by minimum total years of experience.
 * @param {string} [filters.availFrom] - Filter by availability start (ISO date string).
 * @param {string} [filters.availTo] - Filter by availability end (ISO date string).
 * @param {boolean} hideEmpty - Hide applicants with no competence profiles or availabilities.
 * @returns {Promise<Array>} Array of application objects.
 */
async function listApplications(filters = {}, hideEmpty = true) {
  const { competenceName, minExperience, availFrom, availTo } = filters;

  const whereClause = { role_id: 2 };
  const andConditions = [];

  // Filter: only persons who have the specified competence
  if (competenceName) {
    andConditions.push(
      db.literal(`EXISTS (
        SELECT 1 FROM competence_profile cp2
        JOIN competence c2 ON cp2.competence_id = c2.competence_id
        WHERE cp2.person_id = "Person"."person_id"
        AND c2.name = ${db.escape(competenceName)}
      )`)
    );
  }

  // Filter: only persons whose total experience meets the minimum
  if (minExperience !== undefined && minExperience !== '' && !isNaN(Number(minExperience))) {
    andConditions.push(
      db.literal(`(
        SELECT COALESCE(SUM(cp3.years_of_experience), 0)
        FROM competence_profile cp3
        WHERE cp3.person_id = "Person"."person_id"
      ) >= ${parseFloat(minExperience)}`)
    );
  }

  // Filter: only persons with an availability period overlapping the given range
  if (availFrom || availTo) {
    const conditions = [`av2.person_id = "Person"."person_id"`];
    if (availFrom) conditions.push(`av2.to_date >= ${db.escape(availFrom)}`);
    if (availTo) conditions.push(`av2.from_date <= ${db.escape(availTo)}`);
    andConditions.push(
      db.literal(`EXISTS (
        SELECT 1 FROM availability av2
        WHERE ${conditions.join(' AND ')}
      )`)
    );
  }

  if (andConditions.length > 0) {
    whereClause[Op.and] = andConditions;
  }

  const baseInclude = [
    {
      model: CompetenceProfile,
      as: "competenceProfiles",
      required: hideEmpty,
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
      required: hideEmpty,
      attributes: ["availability_id", "from_date", "to_date"],
    },
  ];

  const persons = await Person.findAll({
    where: whereClause,
    attributes: ["person_id", "name", "surname", "email", "pnr"],
    include: baseInclude,
    order: [["person_id", "ASC"]],
  });

  return persons.map((person) => {
    const plain = person.get({ plain: true });
    return {
      application_id: plain.person_id,
      person: plain,
      status: statusStore.get(plain.person_id) || "unhandled",
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
 * Returns the current status for a given person's application.
 * @param {number} personId - The person's ID.
 * @returns {string} The application status.
 */
function getApplicationStatus(personId) {
  return statusStore.get(personId) || 'unhandled';
}

/**
 * Updates the status of an application in the in-memory store.
 * Called within a Sequelize managed transaction context.
 * @param {number} personId - The person's ID.
 * @param {string} newStatus - The new status ('accepted', 'rejected', or 'unhandled').
 * @param {Object} transaction - The Sequelize transaction object.
 * @returns {Promise<Object>} The updated status record.
 */
async function updateApplicationStatus(personId, newStatus, transaction) {
  if (!transaction) {
    throw new HttpError(500, 'DB transaction is required for updating application status', 'INTERNAL_SERVER_ERROR');
  }

  const VALID_STATUSES = ['accepted', 'rejected', 'unhandled'];
  if (!VALID_STATUSES.includes(newStatus)) {
    throw new HttpError(400, `Invalid status: ${newStatus}. Must be one of: ${VALID_STATUSES.join(', ')}`, 'BAD_REQUEST');
  }

  // Verify that the person exists and is an applicant (role_id = 2)
  const person = await Person.findByPk(personId, { transaction });
  if (!person) {
    throw new HttpError(404, 'Application not found', 'NOT_FOUND');
  }

  if (newStatus === 'unhandled') {
    statusStore.delete(personId);
  } else {
    statusStore.set(personId, newStatus);
  }

  return {
    personId: personId,
    status: getApplicationStatus(personId),
  };
}

module.exports = {
  submitApplication,
  listApplications,
  listCompetencies,
  getApplicationStatus,
  updateApplicationStatus,
};