const applicationRepo = require('../integration/repositories/applicationRepo');
const ApplicationDTO = require('./ApplicationDTO');

const { sequelize } = require('../integration/persistance');

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
        return await sequelize.transaction(async (t) => {
            // Validate required fields
            if (!applicationData.person_id) {
                throw new Error("Person ID is required");
            }

            if (!applicationData.competencies || applicationData.competencies.length === 0) {
                throw new Error("At least one competence is required");
            }

            if (!applicationData.availabilities || applicationData.availabilities.length === 0) {
                throw new Error("At least one availability period is required");
            }

            // Validate competencies
            for (const comp of applicationData.competencies) {
                if (!comp.competence_id || comp.years_of_experience == null) {
                    throw new Error("Each competence must have competence_id and years_of_experience");
                }
                if (comp.years_of_experience < 0) {
                    throw new Error("Years of experience cannot be negative");
                }
            }

            // Validate availabilities
            for (const avail of applicationData.availabilities) {
                if (!avail.from_date || !avail.to_date) {
                    throw new Error("Each availability must have from_date and to_date");
                }
                if (new Date(avail.from_date) > new Date(avail.to_date)) {
                    throw new Error("from_date cannot be after to_date");
                }
            }

            const result = await applicationRepo.createApplication(applicationData, t);
            return result;
            return await applicationRepo.createApplication(text, t);
        });
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
            new ApplicationDTO(app.name, app.surname, app.status || 'unhandled')
        );
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
     * Updates the status of an application.
     * @param {number} applicationId - The ID of the application.
     * @param {string} status - The new status ('accepted' or 'rejected').
     * @return {Object} The updated application.
     */
    async updateApplicationStatus(applicationId, status) {
        // Validate status
        const validStatuses = ['accepted', 'rejected'];
        if (!validStatuses.includes(status)) {
            throw new Error("Status must be 'accepted' or 'rejected'");
        }

        const result = await applicationRepo.updateApplicationStatus(applicationId, status);
        return result;
    }

}

module.exports = new ApplicationService();