const { createMockSequelize } = require('../helpers/mockSequelize');

const mockSequelize = createMockSequelize();
jest.mock('../../src/config/database', () => mockSequelize);
jest.mock('uuid', () => ({ v4: () => 'contact-uuid-123' }));

const emergencyContactService = require('../../src/services/emergencyContact.service');

describe('EmergencyContactService', () => {
  beforeEach(() => mockSequelize.reset());

  it('maps contact rows to API shape', async () => {
    mockSequelize.query.mockResolvedValueOnce([{
      id: 'c1',
      student_id: 5,
      name: 'Jane Doe',
      relationship: 'Mother',
      phone: '0821234567',
      alternate_phone: null,
      email: 'jane@test.com',
      address: null,
      is_primary: true,
      created_at: new Date(),
      updated_at: new Date(),
    }]);

    const contacts = await emergencyContactService.getStudentContacts(5);
    expect(contacts[0].full_name).toBe('Jane Doe');
    expect(contacts[0].phone_number).toBe('0821234567');
  });

  it('rejects creating more than 3 contacts', async () => {
    mockSequelize.query.mockResolvedValue([
      { id: '1', student_id: 5, name: 'A', relationship: 'Parent', phone: '1', alternate_phone: null, email: null, address: null, is_primary: false, created_at: new Date(), updated_at: new Date() },
      { id: '2', student_id: 5, name: 'B', relationship: 'Parent', phone: '2', alternate_phone: null, email: null, address: null, is_primary: false, created_at: new Date(), updated_at: new Date() },
      { id: '3', student_id: 5, name: 'C', relationship: 'Parent', phone: '3', alternate_phone: null, email: null, address: null, is_primary: false, created_at: new Date(), updated_at: new Date() },
    ]);

    await expect(
      emergencyContactService.createContact(5, {
        name: 'Fourth',
        relationship: 'Uncle',
        phone: '0820000000',
      })
    ).rejects.toMatchObject({
      statusCode: 400,
      message: 'Maximum 3 emergency contacts allowed per student',
    });
  });

  it('requires name, relationship, and phone', async () => {
    mockSequelize.query.mockResolvedValueOnce([]);

    await expect(
      emergencyContactService.createContact(5, { name: 'Only Name' })
    ).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it('throws when contact is not found', async () => {
    mockSequelize.query.mockResolvedValueOnce([]);

    await expect(emergencyContactService.getContactById('missing')).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});
