const applicationRepo = require('../integration/repositories/applicationRepo');

const { sequelize } = require('../integration/db');

class ApplicationService {
 
    /**
     * function to send an application via application repository, it creates a new application record
     */
    async sendApplication(text) {
        return await sequelize.transaction(async (t) => {
            if (!text || text.trim().length === 0) {
                throw new Error("Application content cannot be empty");
            }

            const applicationData = await messageRepo.createApplication(text, t); // Passes the transaction object
            return applicationData;
        });
    }

    /**
     * function to get recent applications via application repository that lists the last 50 applications
     */
    async getRecentApplications() {
        const applications = await applicationRepo.listApplications(50);
        if (!applications) {
            throw new Error("Failed to retrieve applications");
        }
        return applications;
    }
}

module.exports = new ApplicationService();