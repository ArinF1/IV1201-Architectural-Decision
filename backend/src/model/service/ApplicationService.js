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
     * Retrieves recent applications with full details.
     * @return {Array} Array of applications with person, competence, and availability data.
     */
    async getRecentApplications() {
        const applications = await applicationRepo.listApplications(50);
        if (!applications) {
            throw new Error("Failed to retrieve applications");
        }
        return applications.map(app => 
            new ApplicationDTO(
                app.person?.name, 
                app.person?.surname,
                app.status || 'unhandled')
        );
    }

    /**
     * Retrieves all applications (for recruiters) with applicant full name and status.
     * @returns {Array<{fullName: string, status: string}>}
     */
    async listAllApplications() {
        // use a large limit to return all for now
        const applications = await applicationRepo.listApplications(1000);
        if (!applications) {
            throw new Error("Failed to retrieve applications");
        }

        return applications.map(function(app) {
            const person = app.person || {};
            const first = person.name || '';
            const last = person.surname || '';
            return {
                fullName: `${first} ${last}`.trim(),
                status: app.status || 'unhandled'
            };
        });
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

}

module.exports = new ApplicationService();