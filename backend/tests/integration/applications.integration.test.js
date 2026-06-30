const { describeIfDb } = require('./helpers/db');
const { request } = require('./helpers/api');

describeIfDb('Applications API integration', () => {
  let app;

  beforeAll(() => {
    jest.resetModules();
    app = require('../../src/app');
  });

  it('POST /api/applications/eligibility/aps evaluates subject marks', async () => {
    const response = await request(app)
      .post('/api/applications/eligibility/aps')
      .send({
        study_level: 'undergraduate',
        subjects: [
          { name: 'Mathematics', symbol: 'B' },
          { name: 'English', percentage: 75 },
          { name: 'Life Orientation', symbol: 'A' },
        ],
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.aps_score).toBeGreaterThan(0);
    expect(Array.isArray(response.body.data.recommended)).toBe(true);
  });

  it('GET /api/applications/identity/status requires identity value', async () => {
    const response = await request(app).get('/api/applications/identity/status');

    expect(response.status).toBe(400);
  });

  it('GET /api/applications/identity/status returns no records for unknown ID', async () => {
    const response = await request(app).get(
      '/api/applications/identity/status?id_number=8001015800085&nationality=South%20African'
    );

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.data.has_records).toBe(false);
  });

  it('GET /api/applications/contact/check reports unavailable email', async () => {
    const response = await request(app).get(
      '/api/applications/contact/check?email=admin@eduhub.ac.za'
    );

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.email_available).toBe(false);
  });

  it('GET /api/applications/contact/check allows own draft contact details', async () => {
    const draftRes = await request(app)
      .post('/api/applications/drafts/start')
      .send({
        first_name: 'Contact',
        last_name: 'Check',
        email: `contact.${Date.now()}@integration.test`,
        phone: '0821112222',
        nationality: 'South African',
        id_number: '9001015800088',
      });

    const draftId = draftRes.body.data.draft.id;
    const email = draftRes.body.data.draft.email;

    const response = await request(app).get(
      `/api/applications/contact/check?email=${encodeURIComponent(email)}&phone=0821112222&draft_id=${draftId}&id_number=9001015800088`
    );

    expect(response.status).toBe(200);
    expect(response.body.data.email_available).toBe(true);
    expect(response.body.data.phone_available).toBe(true);
  });
});
