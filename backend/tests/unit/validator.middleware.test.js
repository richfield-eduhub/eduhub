const { sanitizeInputs } = require('../../src/middleware/validator.middleware');

function runMiddleware(middleware, req) {
  return new Promise((resolve, reject) => {
    middleware(req, {}, (err) => (err ? reject(err) : resolve()));
  });
}

describe('sanitizeInputs middleware', () => {
  it('strips script tags from request body strings', async () => {
    const req = {
      body: {
        name: 'Hello <script>alert("xss")</script> World',
      },
      query: {},
      params: {},
    };

    await runMiddleware(sanitizeInputs, req);
    expect(req.body.name).toBe('Hello  World');
  });

  it('strips iframe tags from nested objects', async () => {
    const req = {
      body: {
        profile: {
          bio: '<iframe src="evil"></iframe>Safe text',
        },
      },
      query: {},
      params: {},
    };

    await runMiddleware(sanitizeInputs, req);
    expect(req.body.profile.bio).toBe('Safe text');
  });

  it('sanitizes query and params', async () => {
    const req = {
      body: {},
      query: { search: '<script>x</script>term' },
      params: { id: '<script>1</script>42' },
    };

    await runMiddleware(sanitizeInputs, req);
    expect(req.query.search).toBe('term');
    expect(req.params.id).toBe('42');
  });

  it('leaves non-string values unchanged', async () => {
    const req = {
      body: { count: 5, active: true },
      query: {},
      params: {},
    };

    await runMiddleware(sanitizeInputs, req);
    expect(req.body.count).toBe(5);
    expect(req.body.active).toBe(true);
  });
});
