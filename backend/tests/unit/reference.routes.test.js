const express = require('express');
const request = require('supertest');

const mockSequelize = {
  query: jest.fn(),
  QueryTypes: { SELECT: 'SELECT' },
};

jest.mock('../../src/config/database', () => mockSequelize);

const referenceRoutes = require('../../src/routes/reference.routes');

function buildApp() {
  const app = express();
  app.use('/api/reference', referenceRoutes);
  return app;
}

describe('Reference routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSequelize.query.mockReset();
  });

  it('GET /nationalities returns active nationality names', async () => {
    mockSequelize.query.mockResolvedValueOnce([{ name: 'South African' }, { name: 'Zimbabwean' }]);

    const response = await request(buildApp()).get('/api/reference/nationalities');

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(['South African', 'Zimbabwean']);
  });

  it('GET /document-requirements filters foreign national documents', async () => {
    mockSequelize.query.mockResolvedValueOnce([{ document_name: 'Passport' }]);

    const response = await request(buildApp()).get('/api/reference/document-requirements?type=foreign_national');

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(['Passport']);
    expect(mockSequelize.query).toHaveBeenCalledWith(
      expect.stringContaining("foreign_national"),
      expect.any(Object)
    );
  });

  it('GET /qualifications attaches modules to each programme', async () => {
    mockSequelize.query
      .mockResolvedValueOnce([{ id: 1, code: 'BSCIT', name: 'BSc IT', is_active: true }])
      .mockResolvedValueOnce([{ id: 10, code: 'IT101', name: 'Intro', is_active: true }]);

    const response = await request(buildApp()).get('/api/reference/qualifications');

    expect(response.status).toBe(200);
    expect(response.body.data[0].modules).toHaveLength(1);
    expect(response.body.data[0].modules[0].code).toBe('IT101');
  });

  it('GET /home-config returns computed landing page values', async () => {
    const response = await request(buildApp()).get('/api/reference/home-config');

    expect(response.status).toBe(200);
    expect(response.body.data.yearsOfExcellence).toBeGreaterThan(0);
    expect(response.body.data.display.campuses.label).toBe('Campus Locations');
  });
});
