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

      expect(result.identity_type).toBe('id_number');
      expect(result.has_records).toBe(false);
      expect(result.has_open_draft).toBe(false);
    });

    it('requires an identity value', async () => {
      await expect(
        applicationService.checkIdentityStatus({ nationality: 'South African' })
      ).rejects.toMatchObject({ statusCode: 400, message: 'Identity value is required' });
    });

    it('detects an open draft application', async () => {
      mockSequelize.query.mockResolvedValueOnce([
        { id: 'draft-1', status: 'draft', reference_number: 'APP-2026-ABC' },
        { id: 'old-1', status: 'rejected', reference_number: 'APP-2025-XYZ' },
      ]);

      const result = await applicationService.checkIdentityStatus({
        nationality: 'South African',
        id_number: '9001015800085',
      });

      expect(result.has_records).toBe(true);
      expect(result.has_open_draft).toBe(true);
      expect(result.draft_id).toBe('draft-1');
      expect(result.latest_status).toBe('draft');
    });
  });

  describe('_classifyEligibility edge cases', () => {
    it('flags higher certificate programmes with low APS', () => {
      const result = applicationService._classifyEligibility(
        'Higher Certificate in Business',
        'undergraduate',
        1,
        true,
        false
      );
      expect(result.reasons.join(' ')).toContain('APS below minimum threshold (2)');
    });

    it('marks severely ineligible applicants as not_eligible', () => {
      const result = applicationService._classifyEligibility(
        'Master of Business Administration',
        'undergraduate',
        1,
        false,
        false
      );
      expect(result.status).toBe('not_eligible');
      expect(result.reasons.length).toBeGreaterThan(2);
    });

    it('detects postgraduate study level mismatch', () => {
      const result = applicationService._classifyEligibility(
        'Bachelor of Commerce',
        'postgraduate',
        30,
        true,
        true
      );
      expect(result.reasons.join(' ')).toContain('undergraduate-level');
    });
  });

  describe('evaluateApsEligibility mark formats', () => {
    it('resolves percentage ranges to APS points', async () => {
      mockSequelize.query.mockResolvedValueOnce([
        { id: 1, code: 'HC', name: 'Higher Certificate', campuses: [] },
      ]);

      const result = await applicationService.evaluateApsEligibility({
        subjects: [{ name: 'Accounting', range: '60-69' }],
        study_level: 'undergraduate',
      });

      const accounting = result.subject_breakdown.find((s) => s.name === 'Accounting');
      expect(accounting.aps_points).toBe(5);
      expect(accounting.source).toBe('range');
    });

    it('mixes symbols and percentages using symbol averages for APS', async () => {
      mockSequelize.query.mockResolvedValueOnce([
        { id: 1, code: 'BSCIT', name: 'BSc Information Technology', campuses: [] },
      ]);

      const result = await applicationService.evaluateApsEligibility({
        subjects: [
          { name: 'Mathematics', symbol: 'A' },
          { name: 'English', percentage: 74 },
          { name: 'Life Orientation', symbol: 'B' },
          { name: 'Accounting', symbol: 'B' },
        ],
        study_level: 'undergraduate',
      });

      const maths = result.subject_breakdown.find((s) => s.name === 'Mathematics');
      const english = result.subject_breakdown.find((s) => s.name === 'English');
      const accounting = result.subject_breakdown.find((s) => s.name === 'Accounting');
      const lifeOrientation = result.subject_breakdown.find((s) => s.name === 'Life Orientation');

      expect(maths.resolved_percentage).toBe(85);
      expect(english.resolved_percentage).toBe(74);
      expect(accounting.resolved_percentage).toBe(75);
      expect(lifeOrientation.ignored).toBe(true);
      expect(lifeOrientation.counted_in_aps).toBe(false);
      expect(maths.counted_in_aps).toBe(true);
      expect(result.aps_score).toBeGreaterThan(0);
    });

    it('counts prior qualifications for postgraduate eligibility', async () => {
      mockSequelize.query.mockResolvedValueOnce([
        { id: 2, code: 'MBA', name: 'Master of Business Administration', campuses: [] },
      ]);

      const result = await applicationService.evaluateApsEligibility({
        subjects: [{ name: 'Mathematics', symbol: 'A' }],
        study_level: 'postgraduate',
        additional_qualifications: [{ study_status: 'completed' }],
      });

      const mba = [...result.recommended, ...result.possibly_eligible, ...result.not_eligible]
        .find((q) => q.qualification_code === 'MBA');
      expect(mba.status).toBe('recommended');
    });
  });

  describe('findDuplicateOpenApplication', () => {
    it('returns null when SA applicant has no id number', async () => {
      const result = await applicationService.findDuplicateOpenApplication(1, 'South African', '', null);
      expect(result).toBeNull();
      expect(mockSequelize.query).not.toHaveBeenCalled();
    });

    it('finds duplicate SA applications by id number', async () => {
      mockSequelize.query.mockResolvedValueOnce([{ id: 'dup-1', status: 'draft' }]);

      const result = await applicationService.findDuplicateOpenApplication(
        1,
        'South African',
        '9001015800085',
        null
      );

      expect(result.id).toBe('dup-1');
    });

    it('finds duplicate foreign applications by passport', async () => {
      mockSequelize.query.mockResolvedValueOnce([{ id: 'dup-2', status: 'pending' }]);

      const result = await applicationService.findDuplicateOpenApplication(
        1,
        'Zimbabwean',
        null,
        'AB123456'
      );

      expect(result.id).toBe('dup-2');
    });
  });

  describe('findRejectedApplication', () => {
    it('returns null when passport is missing for foreign applicants', async () => {
      const result = await applicationService.findRejectedApplication(1, 'Nigerian', null, '');
      expect(result).toBeNull();
    });

    it('finds prior rejected SA applications', async () => {
      mockSequelize.query.mockResolvedValueOnce([{ id: 'rej-1', status: 'rejected' }]);

      const result = await applicationService.findRejectedApplication(
        1,
        'South African',
        '9001015800085',
        null
      );

      expect(result.status).toBe('rejected');
    });
  });

  describe('getApplicationStatsByStatus', () => {
    it('returns grouped application counts', async () => {
      mockSequelize.query.mockResolvedValueOnce([
        { status: 'draft', count: 3 },
        { status: 'approved', count: 1 },
      ]);

      const stats = await applicationService.getApplicationStatsByStatus();

      expect(stats).toHaveLength(2);
      expect(stats[0].count).toBe(3);
    });
  });

  describe('createApplication validation', () => {
    it('rejects missing campus and qualification', async () => {
      await expect(
        applicationService.createApplication({ first_name: 'A', last_name: 'B', email: 'a@b.com', phone: '1' })
      ).rejects.toMatchObject({
        statusCode: 400,
        message: 'campus_id and qualification_id are required',
      });
      expect(mockSequelize.mockTransaction.rollback).toHaveBeenCalled();
    });

    it('rejects foreign nationals without passport on submit', async () => {
      await expect(
        applicationService.createApplication({
          campus_id: 'campus-uuid',
          qualification_id: 'qual-uuid',
          first_name: 'A',
          last_name: 'B',
          email: 'a@b.com',
          phone: '0820000000',
          nationality: 'Nigerian',
        })
      ).rejects.toMatchObject({
        statusCode: 400,
        message: 'Foreign nationals must provide a passport number (at least 5 characters)',
      });
    });

    it('rejects SA IDs with an invalid check digit', async () => {
      await expect(
        applicationService.createApplication({
          campus_id: 'campus-uuid',
          qualification_id: 'qual-uuid',
          first_name: 'A',
          last_name: 'B',
          email: 'a@b.com',
          phone: '0820000000',
          nationality: 'South African',
          id_number: '9001015800085',
        })
      ).rejects.toMatchObject({
        statusCode: 400,
        message: 'South African ID number is invalid. The check digit (last digit) does not match.',
      });
    });
  });
});
