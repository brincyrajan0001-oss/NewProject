const request = require('supertest');
const app = require('../server');

// Mock the database connection for tests
jest.mock('../config/database', () => ({
  pool: {
    query: jest.fn(),
    connect: jest.fn(() => ({
      query: jest.fn(),
      release: jest.fn()
    }))
  },
  testConnection: jest.fn(() => Promise.resolve(true)),
  checkPgcrypto: jest.fn(() => Promise.resolve(true))
}));

// Mock the migration
jest.mock('../migrations/migrate', () => ({
  runMigrations: jest.fn(() => Promise.resolve())
}));

describe('Patient API Tests', () => {
  const apiKey = 'test-api-key';
  const validPatient = {
    firstName: 'John',
    lastName: 'Doe',
    dob: '1990-01-01',
    sex: 'male',
    phone: '+1234567890',
    email: 'john.doe@email.com',
    addressLine1: '123 Main St',
    city: 'New York',
    postalCode: '10001',
    countryCode: 'US'
  };

  beforeEach(() => {
    // Set environment variables for tests
    process.env.API_KEY = apiKey;
    process.env.CRYPTO_KEY = 'test-crypto-key-min-32-chars';
  });

  describe('POST /api/v1/patients', () => {
    it('should create a patient successfully', async () => {
      const response = await request(app)
        .post('/api/v1/patients')
        .set('x-api-key', apiKey)
        .send(validPatient)
        .expect(201);

      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.firstName).toBe(validPatient.firstName);
      expect(response.headers.etag).toBeDefined();
    });

    it('should return 401 without API key', async () => {
      await request(app)
        .post('/api/v1/patients')
        .send(validPatient)
        .expect(401);
    });

    it('should return 400 for invalid data', async () => {
      const invalidPatient = { ...validPatient, dob: 'invalid-date' };
      
      const response = await request(app)
        .post('/api/v1/patients')
        .set('x-api-key', apiKey)
        .send(invalidPatient)
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_FAILED');
    });
  });

  describe('GET /api/v1/patients/:id', () => {
    it('should return 401 without API key', async () => {
      await request(app)
        .get('/api/v1/patients/test-id')
        .expect(401);
    });
  });

  describe('PUT /api/v1/patients/:id', () => {
    it('should return 428 without If-Match header', async () => {
      const response = await request(app)
        .put('/api/v1/patients/test-id')
        .set('x-api-key', apiKey)
        .send({ firstName: 'Jane' })
        .expect(428);

      expect(response.body.error.code).toBe('PRECONDITION_REQUIRED');
    });
  });

  describe('Health Checks', () => {
    it('should return 200 for /healthz', async () => {
      const response = await request(app)
        .get('/healthz')
        .expect(200);

      expect(response.body.status).toBe('healthy');
    });

    it('should return 200 for /readyz', async () => {
      const response = await request(app)
        .get('/readyz')
        .expect(200);

      expect(response.body.status).toBe('ready');
    });
  });
});
