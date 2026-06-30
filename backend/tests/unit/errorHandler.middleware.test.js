const { errorHandler, notFoundHandler } = require('../../src/middleware/errorHandler.middleware');
const { mockRes, mockReq } = require('../helpers/mockSequelize');

describe('errorHandler.middleware', () => {
  it('returns 404 for unknown routes', () => {
    const req = mockReq({ originalUrl: '/api/missing' });
    const res = mockRes();

    notFoundHandler(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Route /api/missing not found',
      })
    );
  });

  it('uses custom status codes from errors', () => {
    const req = mockReq();
    const res = mockRes();
    const err = { statusCode: 400, message: 'Bad input' };

    errorHandler(err, req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'Bad input' })
    );
  });

  it('defaults to 500 for unhandled errors', () => {
    const req = mockReq();
    const res = mockRes();

    errorHandler(new Error('boom'), req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'boom' })
    );
  });
});
