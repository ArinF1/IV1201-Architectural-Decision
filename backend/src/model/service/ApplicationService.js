const applicationRepo = require('../../integration/repositories/applicationRepo');
const ApplicationDTO = require('../DTO/ApplicationDTO');
const { sequelize } = require('../../integration/persistence');
const { HttpError } = require('../../errors/HttpsError');

class ApplicationService {
 
    /**
     * Creates a new application with competencies and availabilities.
     * @param {Object} applicationData - The application data.
     * @param {number} applicationData.person_id - The ID of the person submitting.
     * @param {Array} applicationData.competencies - Array of competence profiles.
     * @param {Array} applicationData.availabilities - Array of availability periods.
     * @return {Object} The created application data.
     */
    async sendApplication(applicationData) {
        this.validateApplicationSubmission(applicationData);

        return sequelize.transaction(async function (transaction) {
            return applicationRepo.submitApplication(applicationData, transaction);
        });
    }


    /**
     * Validates the application data for submission. Checks for required fields and correct formats.
     * @param {Object} applicationData - The application submission data.
     */
    validateApplicationSubmission(applicationData) {
        if (!applicationData ||!applicationData.person_id) {
                throw new HttpError(400, "Person ID is required", "BAD_REQUEST");
            }

            if (!applicationData.competencies || applicationData.competencies.length === 0) {
                throw new HttpError(400, "At least one competence is required", "BAD_REQUEST");
            }

            if (!applicationData.availabilities || applicationData.availabilities.length === 0) {
                throw new HttpError(400, "At least one availability period is required", "BAD_REQUEST");
            }
    

            // Validate competencies
            for (const comp of applicationData.competencies) {
                if (!comp.competence_id || comp.years_of_experience === undefined || comp.years_of_experience === null ) {
                    throw new HttpError(400, "Each competence must have competence_id and years_of_experience", "BAD_REQUEST");
                }
                if (Number(comp.years_of_experience) < 0) {
                    throw new HttpError(400, "Years of experience can't be negative", "BAD_REQUEST");
                }
            }

            // Validate availabilities
            for (const avail of applicationData.availabilities) {
                if (!avail.from_date || !avail.to_date) {
                    throw new HttpError(400, "Each availability must have from_date and to_date", "BAD_REQUEST");
                }
                if (new Date(avail.from_date) > new Date(avail.to_date)) {
                    throw new HttpError(400, "from_date cannot be after to_date", "BAD_REQUEST");
                }
            }
        }

    /**
     * Gets all available competencies.
     * @return {Array} Array of competence objects.
     */
    async getCompetencies() {
        const competencies = await applicationRepo.listCompetencies();
        if (!competencies) {
            throw new Error("Failed to retrieve competencies");
        }
        return competencies;
    }

    /**
     * Gets applications for a specific page.
     * @param {number} page - The page number (1-indexed).
     * @param {number} pageSize - The number of applications per page.
     * @param {boolean} hideEmpty - Whether to hide empty applications.
     * @returns {Object} The paginated applications and metadata.
     */
    async getApplicationsPage(page, pageSize, hideEmpty) {
        const safePage = Number(page) || 1;
        const safePageSize = Math.min(Number(pageSize) || 10, 10);

        if (safePage < 1 || safePageSize < 1) {
          throw new HttpError(400, "Invalid page or pageSize", "BAD_REQUEST");
     }

        const offset = (safePage - 1) * safePageSize;
        const result = await applicationRepo.listApplications(safePageSize, offset, Boolean(hideEmpty));
        const totalPages = Math.ceil(result.totalCount / safePageSize);

        const dtoApplications = result.applications.map(app => {
          const p = app.person || {};
    
          return new ApplicationDTO({
            applicationId: app.application_id,
            personId: p.person_id,
            personNumber: p.pnr,
            fullName: `${p.name || ""} ${p.surname || ""}`.trim(),
            status: app.status || "unhandled",
            competenceProfiles: (p.competenceProfiles || []).map(cp => ({
              competenceId: cp.competence_id,
              competenceName: cp.competence ? cp.competence.name : null,
              yearsOfExperience: cp.years_of_experience
            })),
            availabilities: (p.availabilities || []).map(a => ({
              fromDate: a.from_date,
              toDate: a.to_date
            }))
          });
        });

         return { page: safePage, pageSize: safePageSize, totalCount: result.totalCount, totalPages, applications: dtoApplications };
        }   
        

}

module.exports = new ApplicationService();