const { createMockSequelize } = require('../helpers/mockSequelize');

const mockSequelize = createMockSequelize();
jest.mock('../../src/config/database', () => mockSequelize);
jest.mock('../../src/services/email.service', () => ({}));

const applicationService = require('../../src/services/application.service');

describe('ApplicationService', () => {
  beforeEach(() => mockSequelize.reset());

  describe('_classifyEligibility', () => {
    it('recommends eligible undergraduate applicants', () => {
      const result = applicationService._classifyEligibility(
        'Bachelor of Science in Information Technology',
        'undergraduate',
        30,
        true,
        false
      );
      expect(result.status).toBe('recommended');
    });

    it('flags IT programmes without mathematics', () => {
      const result = applicationService._classifyEligibility(
        'Bachelor of Science in Information Technology',
        'undergraduate',
        30,
        false,
        false
      );
      expect(result.status).not.toBe('recommended');
      expect(result.reasons.join(' ')).toContain('Mathematics required');
    });

    it('requires prior qualification for postgraduate study', () => {
      const result = applicationService._classifyEligibility(
        'Master of Business Administration',
        'postgraduate',
        30,
        true,
        false
      );
      expect(result.reasons.join(' ')).toContain('Prior tertiary qualification');
    });
  });

  describe('evaluateApsEligibility', () => {
    it('calculates APS from subject symbols', async () => {
      mockSequelize.query.mockResolvedValueOnce([
        {
          id: 1,
          code: 'BSCIT',
          name: 'BSc Information Technology',
          campuses: [{ id: 1, name: 'Johannesburg' }],
        },
      ]);

      const result = await applicationService.evaluateApsEligibility({
        subjects: [
          { name: 'Mathematics', symbol: 'B' },
          { name: 'English', percentage: 75 },
          { name: 'Life Orientation', symbol: 'A' },
        ],
        study_level: 'undergraduate',
      });

      expect(result.aps_score).toBeGreaterThan(0);
      expect(result.subject_breakdown.find((s) => s.name === 'Life Orientation').ignored).toBe(true);
      expect(result.recommended.length + result.possibly_eligible.length + result.not_eligible.length).toBe(1);
    });
  });

  describe('checkIdentityStatus', () => {
    it('validates South African ID numbers', async () => {
      mockSequelize.query.mockResolvedValueOnce([]);

      const result = await applicationService.checkIdentityStatus({
        nationality: 'South African',
        id_number: '9001015800085',
      });

      expect(result).toBeDefined();
    });
  });
});
