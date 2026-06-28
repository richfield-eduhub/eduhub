process.env.NODE_ENV = 'test';
process.env.DISABLE_RATE_LIMIT = 'true';

process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '5434';
process.env.DB_NAME = process.env.DB_NAME || 'eduhub_test';
process.env.DB_USER = process.env.DB_USER || 'postgres';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'testpassword';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'integration-test-jwt-secret';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'integration-test-jwt-refresh-secret';
process.env.JWT_EXPIRES_IN = '7d';
