const applicationRepo = require('../../integration/repositories/applicationRepo');

/**
 * Automated decision-making service for applications
 * Evaluates applications based on configurable rules
 */
class DecisionMakingService {
    /**
     * Evaluate a single application based on rules
     * @param {Object} application - Application with person data
     * @returns {string} 'accepted' or 'rejected'
     */
    evaluateApplication(application) {
        const person = application.person;
        
        // Rule 1: Must have at least one competence
        if (!person.competenceProfiles || person.competenceProfiles.length === 0) {
            return 'rejected';
        }
        
        // Rule 2: Must have at least 1 year total experience
        const totalExperience = person.competenceProfiles.reduce(function(sum, cp) {
            return sum + parseFloat(cp.years_of_experience || 0);
        }, 0);
        
        if (totalExperience < 1) {
            return 'rejected';
        }
        
        // Rule 3: Must have availability
        if (!person.availabilities || person.availabilities.length === 0) {
            return 'rejected';
        }
        
        return 'accepted';
    }
    
    /**
     * Process all unhandled applications with automated decision
     * @returns {Object} Results of processing
     */
    async processUnhandledApplications() {
        const applications = await applicationRepo.listApplications({}, false);
        const unhandled = applications.filter(function(app) {
            return app.status === 'unhandled';
        });
        
        let accepted = 0;
        let rejected = 0;
        
        for (const app of unhandled) {
            const decision = this.evaluateApplication(app);
            await applicationRepo.updateApplicationStatus(app.id, decision);
            
            if (decision === 'accepted') {
                accepted++;
            } else {
                rejected++;
            }
        }
        
        return {
            processed: unhandled.length,
            accepted,
            rejected
        };
    }
}

module.exports = new DecisionMakingService();
