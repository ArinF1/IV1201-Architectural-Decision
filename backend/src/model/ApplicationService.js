const applicationRepo = require('../integration/repositories/applicationRepo');
const ApplicationDTO = require('./ApplicationDTO');

const { sequelize } = require('../integration/persistance');

class ApplicationService {
 
    /**
     * function to send an application via application repository, it creates a new application record
     */
    async sendApplication(text) {
        return await sequelize.transaction(async (t) => {
            if (!text || text.trim().length === 0) {
                throw new Error("Application content cannot be empty");
            }

            return await applicationRepo.createApplication(text, t);
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
        return applications.map(app => 
            new ApplicationDTO(app.name, app.surname, app.status || 'unhandled')
        );
    }


}

module.exports = new ApplicationService();