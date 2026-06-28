const { createMockSequelize } = require('../helpers/mockSequelize');

const mockSequelize = createMockSequelize();
jest.mock('../../src/config/database', () => mockSequelize);
jest.mock('uuid', () => ({ v4: () => 'announcement-uuid-1' }));

const announcementService = require('../../src/services/announcement.service');

describe('AnnouncementService', () => {
  beforeEach(() => mockSequelize.reset());

  it('requires title and content', async () => {
    await expect(
      announcementService.createAnnouncement({
        moduleId: 1,
        createdBy: 2,
        lecturerId: 3,
        title: '',
        content: 'Body',
      })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('rejects invalid priority', async () => {
    await expect(
      announcementService.createAnnouncement({
        moduleId: 1,
        createdBy: 2,
        lecturerId: 3,
        title: 'Title',
        content: 'Body',
        priority: 'critical',
      })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('rejects unassigned lecturers', async () => {
    mockSequelize.query
      .mockResolvedValueOnce([{ id: 1, code: 'IT101', name: 'Intro' }])
      .mockResolvedValueOnce([]);

    await expect(
      announcementService.createAnnouncement({
        moduleId: 1,
        createdBy: 2,
        lecturerId: 3,
        title: 'Title',
        content: 'Body',
      })
    ).rejects.toMatchObject({ statusCode: 403 });
  });
});
