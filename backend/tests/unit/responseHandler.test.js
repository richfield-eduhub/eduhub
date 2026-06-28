const ResponseHandler = require('../../src/utils/responseHandler');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('ResponseHandler', () => {
  it('sends success response with default 200', () => {
    const res = mockRes();
    ResponseHandler.success(res, { id: 1 }, 'OK');

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'OK',
      data: { id: 1 },
    });
  });

  it('sends created response with 201', () => {
    const res = mockRes();
    ResponseHandler.created(res, { id: 2 });

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: { id: 2 } })
    );
  });

  it('sends error response with optional errors array', () => {
    const res = mockRes();
    ResponseHandler.error(res, 'Failed', 500, ['detail']);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Failed',
      errors: ['detail'],
    });
  });

  it('sends standard HTTP error helpers', () => {
    const cases = [
      ['badRequest', 400],
      ['unauthorized', 401],
      ['forbidden', 403],
      ['notFound', 404],
      ['conflict', 409],
      ['validationError', 422],
      ['serverError', 500],
    ];

    for (const [method, code] of cases) {
      const res = mockRes();
      if (method === 'validationError') {
        ResponseHandler.validationError(res, ['field required']);
      } else {
        ResponseHandler[method](res);
      }
      expect(res.status).toHaveBeenCalledWith(code);
    }
  });

  it('sends paginated response with computed totalPages', () => {
    const res = mockRes();
    ResponseHandler.paginated(res, [{ id: 1 }], { page: 1, limit: 10, total: 25 });

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Success',
      data: [{ id: 1 }],
      pagination: {
        page: 1,
        limit: 10,
        total: 25,
        totalPages: 3,
      },
    });
  });
});
