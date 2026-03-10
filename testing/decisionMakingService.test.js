/**
 * Unit tests for DecisionMakingService (service layer)
 */
require('dotenv').config({ path: './backend/.env' });
const decisionMakingService = require('../backend/src/model/service/decisionMakingService');
const applicationRepo = require('../backend/src/integration/repositories/applicationRepo');

jest.mock('../backend/src/integration/repositories/applicationRepo');

describe('DecisionMakingService', () => {
  afterEach(() => jest.clearAllMocks());

  /**
   * Tests for evaluateApplication – evaluates a single application.
   * Verifies the decision rules: reject if no competencies, < 1 year experience,
   * or no availability. Accept if all conditions are met.
   */
  describe('evaluateApplication', () => {
    // Tests that an application is rejected if the applicant has no competence profiles
    it('should reject if no competence profiles', () => {
      const result = decisionMakingService.evaluateApplication({
        person: { competenceProfiles: [], availabilities: [{ from_date: '2024-01-01', to_date: '2024-06-01' }] }
      });
      expect(result).toBe('rejected');
    });

    // Tests that an application is rejected if total experience is less than 1 year
    it('should reject if total experience < 1 year', () => {
      const result = decisionMakingService.evaluateApplication({
        person: {
          competenceProfiles: [{ years_of_experience: 0.5 }],
          availabilities: [{ from_date: '2024-01-01', to_date: '2024-06-01' }]
        }
      });
      expect(result).toBe('rejected');
    });

    // Tests that an application is rejected if the applicant has no availability periods
    it('should reject if no availabilities', () => {
      const result = decisionMakingService.evaluateApplication({
        person: {
          competenceProfiles: [{ years_of_experience: 3 }],
          availabilities: []
        }
      });
      expect(result).toBe('rejected');
    });

    // Tests that an application is accepted if the applicant has >= 1 year experience and at least one availability period
    it('should accept if has competence >= 1 year and availability', () => {
      const result = decisionMakingService.evaluateApplication({
        person: {
          competenceProfiles: [{ years_of_experience: 2 }],
          availabilities: [{ from_date: '2024-01-01', to_date: '2024-06-01' }]
        }
      });
      expect(result).toBe('accepted');
    });
  });

  /**
   * Tests for processUnhandledApplications – automatic processing of unhandled applications.
   * Verifies that all 'unhandled' applications are evaluated and that the correct
   * accepted/rejected counts are returned. Already handled applications should be skipped.
   */
  describe('processUnhandledApplications', () => {
    // Tests that 2 of 3 applications are processed (one already accepted is skipped), 1 accepted, 1 rejected
    it('should process unhandled applications and return counts', async () => {
      applicationRepo.listApplications.mockResolvedValue([
        { id: 1, status: 'unhandled', person: { competenceProfiles: [{ years_of_experience: 3 }], availabilities: [{}] } },
        { id: 2, status: 'unhandled', person: { competenceProfiles: [], availabilities: [] } },
        { id: 3, status: 'accepted', person: {} } // already handled, should be skipped
      ]);
      applicationRepo.updateApplicationStatus.mockResolvedValue(true);

      const result = await decisionMakingService.processUnhandledApplications();
      expect(result.processed).toBe(2);
      expect(result.accepted).toBe(1);
      expect(result.rejected).toBe(1);
      expect(applicationRepo.updateApplicationStatus).toHaveBeenCalledTimes(2);
    });

    // Tests that the result is zero processed if all applications are already handled
    it('should return zeros if no unhandled applications', async () => {
      applicationRepo.listApplications.mockResolvedValue([
        { id: 1, status: 'accepted', person: {} }
      ]);
      const result = await decisionMakingService.processUnhandledApplications();
      expect(result.processed).toBe(0);
      expect(result.accepted).toBe(0);
      expect(result.rejected).toBe(0);
    });
  });
});
