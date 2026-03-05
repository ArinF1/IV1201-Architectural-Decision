/**
 * Unit tests for applicationRepo (repository layer)
 */
const applicationRepo = require('../backend/src/integration/repositories/applicationRepo');
const { Person } = require('../backend/src/integration/persistence');

jest.mock('../backend/src/integration/persistence', () => ({
  Person: { findByPk: jest.fn() }
}));

describe('applicationRepo', () => {
  afterEach(() => jest.clearAllMocks());

  test('submitApplication throws error if person not found', async () => {
    Person.findByPk.mockResolvedValue(null);
    await expect(
      applicationRepo.submitApplication({ person_id: 999 }, {})
    ).rejects.toThrow('Person not found');
  });

  
});
