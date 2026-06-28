const { createMockSequelize } = require('../helpers/mockSequelize');

const mockSequelize = createMockSequelize();
jest.mock('../../src/config/database', () => mockSequelize);

const documentService = require('../../src/services/document.service');

describe('DocumentService', () => {
  beforeEach(() => mockSequelize.reset());

  it('returns application documents with formatted size', async () => {
    mockSequelize.query.mockResolvedValueOnce([{
      id: 1,
      application_id: 10,
      document_type: 'id_document',
      file_name: 'id.pdf',
      file_size: 2048,
    }]);

    const docs = await documentService.getApplicationDocuments(10);
    expect(docs[0].formatted_size).toBe('2 KB');
  });

  it('throws when document is not found', async () => {
    mockSequelize.query.mockResolvedValueOnce([]);

    await expect(documentService.getDocumentById(999)).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});
