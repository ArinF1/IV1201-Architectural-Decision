/**
 * Unit tests for ApplicationService (service layer)
 */
require('dotenv').config({ path: './backend/.env' });
const service = require('../backend/src/model/service/applicationService');
const applicationRepo = require('../backend/src/integration/repositories/applicationRepo');

jest.mock('../backend/src/integration/repositories/applicationRepo');

describe('ApplicationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

    test('getApplicationsPage should call repo and return paged applications', async () => {
      applicationRepo.listApplications = jest.fn();
      const mockRawApps = [
        {
          application_id: 1,
          status: 'accepted',
          person: {
            person_id: 1,
            name: 'Test',
            surname: 'User',
            pnr: '123',
            competenceProfiles: [],
            availabilities: []
          }
        },
        {
          application_id: 2,
          status: 'unhandled',
          person: {
            person_id: 2,
            name: 'Another',
            surname: 'User',
            pnr: '456',
            competenceProfiles: [],
            availabilities: []
          }
        }
      ];
      applicationRepo.listApplications.mockResolvedValue(mockRawApps);
      const result = await service.getApplicationsPage(1, 10, false, {}, 'status');
      expect(applicationRepo.listApplications).toHaveBeenCalled();
      expect(result.applications.length).toBe(2);
      expect(result.applications[0].fullName).toBe('Another User');
      expect(result.applications[1].fullName).toBe('Test User');
    });
  
});
