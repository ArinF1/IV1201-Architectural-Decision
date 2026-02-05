const messageRepo = require('../integration/repositories/applicationRepo');

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
        return await messageRepo.listApplications(50);
          const err = new Error("Application content cannot be empty");
            err.status = 400;
  throw err;
    }
}

module.exports = new ApplicationService();