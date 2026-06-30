jest.mock('../../src/services/module.service');
jest.mock('../../src/utils/responseHandler', () => ({
  success: jest.fn(),
}));

const moduleService = require('../../src/services/module.service');
const ResponseHandler = require('../../src/utils/responseHandler');
const moduleController = require('../../src/controllers/module.controller');
const { mockRes, mockReq } = require('../helpers/mockSequelize');

describe('ModuleController', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns all modules', async () => {
    const modules = [{ id: 1, code: 'IT101' }];
    moduleService.getAllModules.mockResolvedValueOnce(modules);
    const res = mockRes();

    await moduleController.getAllModules(mockReq({ query: {} }), res, jest.fn());

    expect(ResponseHandler.success).toHaveBeenCalledWith(
      res,
      modules,
      'Modules retrieved successfully'
    );
  });

  it('returns module by id', async () => {
    const moduleData = { id: 2, lecturers: [] };
    moduleService.getModuleById.mockResolvedValueOnce(moduleData);
    const res = mockRes();

    await moduleController.getModuleById(mockReq({ params: { id: '2' } }), res, jest.fn());

    expect(moduleService.getModuleById).toHaveBeenCalledWith('2');
    expect(ResponseHandler.success).toHaveBeenCalled();
  });
});
