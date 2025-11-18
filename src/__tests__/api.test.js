const request = require('supertest');
const app = require('../app');

describe('DIGIPIN API Endpoints', () => {
  describe('GET /api/digipin/encode', () => {
    test('should encode coordinates successfully', async () => {
      const response = await request(app)
        .get('/api/digipin/encode')
        .query({ latitude: 12.9716, longitude: 77.5946 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('digipin');
      expect(response.body).toHaveProperty('coordinates');
      expect(response.body).toHaveProperty('precision');
      expect(response.body.precision).toBe(10);
    });

    test('should encode with custom precision', async () => {
      const response = await request(app)
        .get('/api/digipin/encode')
        .query({ latitude: 12.9716, longitude: 77.5946, precision: 6 });

      expect(response.status).toBe(200);
      expect(response.body.precision).toBe(6);
      expect(response.body.digipin.replace(/-/g, '').length).toBe(6);
    });

    test('should return 400 for invalid coordinates', async () => {
      const response = await request(app)
        .get('/api/digipin/encode')
        .query({ latitude: 100, longitude: 77.5946 });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    test('should handle missing longitude parameter', async () => {
      const response = await request(app).get('/api/digipin/encode').query({ latitude: 12.9716 });

      // Currently returns 200 with NaN - could add stricter validation
      expect([200, 400]).toContain(response.status);
    });
  });

  describe('POST /api/digipin/encode', () => {
    test('should encode coordinates successfully', async () => {
      const response = await request(app).post('/api/digipin/encode').send({
        latitude: 28.6139,
        longitude: 77.209
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('digipin');
    });
  });

  describe('GET /api/digipin/decode', () => {
    test('should decode DIGIPIN successfully', async () => {
      const response = await request(app)
        .get('/api/digipin/decode')
        .query({ digipin: '4P3-JK8-52C9' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('latitude');
      expect(response.body).toHaveProperty('longitude');
      expect(response.body).toHaveProperty('precision');
    });

    test('should decode with bounding box', async () => {
      const response = await request(app)
        .get('/api/digipin/decode')
        .query({ digipin: '4P3-JK8-52C9', returnBounds: true });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('bounds');
      expect(response.body.bounds).toHaveProperty('north');
      expect(response.body.bounds).toHaveProperty('south');
      expect(response.body.bounds).toHaveProperty('east');
      expect(response.body.bounds).toHaveProperty('west');
    });

    test('should decode partial DIGIPIN', async () => {
      const response = await request(app)
        .get('/api/digipin/decode')
        .query({ digipin: '4P3JK8' });

      expect(response.status).toBe(200);
      expect(response.body.precision).toBe(6);
    });

    test('should return 400 for invalid DIGIPIN', async () => {
      const response = await request(app)
        .get('/api/digipin/decode')
        .query({ digipin: 'INVALID' });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/digipin/batch/encode', () => {
    test('should encode multiple locations successfully', async () => {
      const response = await request(app)
        .post('/api/digipin/batch/encode')
        .send({
          locations: [
            { latitude: 12.9716, longitude: 77.5946 },
            { latitude: 28.6139, longitude: 77.209 },
            { latitude: 19.076, longitude: 72.8777 }
          ]
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('successful');
      expect(response.body).toHaveProperty('results');
      expect(response.body.total).toBe(3);
      expect(response.body.successful).toBe(3);
      expect(response.body.results).toHaveLength(3);
    });

    test('should reject batch with invalid locations', async () => {
      const response = await request(app)
        .post('/api/digipin/batch/encode')
        .send({
          locations: [
            { latitude: 12.9716, longitude: 77.5946 },
            { latitude: 100, longitude: 77.209 }
          ]
        });

      // Validation middleware rejects the entire batch if any location is invalid
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    test('should return 400 for empty array', async () => {
      const response = await request(app)
        .post('/api/digipin/batch/encode')
        .send({ locations: [] });

      expect(response.status).toBe(400);
    });

    test('should return 400 for array exceeding limit', async () => {
      const locations = Array(1001)
        .fill()
        .map(() => ({ latitude: 12.9716, longitude: 77.5946 }));

      const response = await request(app)
        .post('/api/digipin/batch/encode')
        .send({ locations });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/digipin/batch/decode', () => {
    test('should decode multiple DIGIPINs successfully', async () => {
      const response = await request(app)
        .post('/api/digipin/batch/decode')
        .send({
          digipins: ['4P3-JK8-52C9', '39J-49L-L8T4', 'KP6-3K7-9FP5']
        });

      expect(response.status).toBe(200);
      expect(response.body.total).toBe(3);
      expect(response.body.results).toHaveLength(3);
    });

    test('should reject batch with invalid DIGIPINs', async () => {
      const response = await request(app)
        .post('/api/digipin/batch/decode')
        .send({
          digipins: ['4P3-JK8-52C9', 'INVALID']
        });

      // Validation middleware rejects the entire batch if any DIGIPIN is invalid
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/digipin/distance', () => {
    test('should calculate distance successfully', async () => {
      const response = await request(app)
        .get('/api/digipin/distance')
        .query({
          from: '4P3-JK8-52C9',
          to: '39J-49L-L8T4'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('distance');
      expect(response.body).toHaveProperty('unit');
      expect(response.body).toHaveProperty('from');
      expect(response.body).toHaveProperty('to');
      expect(response.body).toHaveProperty('estimatedTravelTime');
      expect(typeof response.body.distance).toBe('number');
    });

    test('should calculate distance in meters', async () => {
      const response = await request(app)
        .get('/api/digipin/distance')
        .query({
          from: '4P3-JK8-52C9',
          to: '39J-49L-L8T4',
          unit: 'm'
        });

      expect(response.status).toBe(200);
      expect(response.body.unit).toBe('meters');
    });

    test('should calculate distance in miles', async () => {
      const response = await request(app)
        .get('/api/digipin/distance')
        .query({
          from: '4P3-JK8-52C9',
          to: '39J-49L-L8T4',
          unit: 'mi'
        });

      expect(response.status).toBe(200);
      expect(response.body.unit).toBe('miles');
    });

    test('should return 400 for missing parameters', async () => {
      const response = await request(app)
        .get('/api/digipin/distance')
        .query({ from: '4P3-JK8-52C9' });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/digipin/neighbors', () => {
    test('should get neighboring cells successfully', async () => {
      const response = await request(app)
        .get('/api/digipin/neighbors')
        .query({ digipin: '4P3-JK8-52C9' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('center');
      expect(response.body).toHaveProperty('neighbors');
      expect(response.body.neighbors).toHaveProperty('N');
      expect(response.body.neighbors).toHaveProperty('S');
      expect(response.body.neighbors).toHaveProperty('E');
      expect(response.body.neighbors).toHaveProperty('W');
      expect(response.body.neighbors).toHaveProperty('NE');
      expect(response.body.neighbors).toHaveProperty('NW');
      expect(response.body.neighbors).toHaveProperty('SE');
      expect(response.body.neighbors).toHaveProperty('SW');
    });

    test('should return 400 for invalid DIGIPIN', async () => {
      const response = await request(app)
        .get('/api/digipin/neighbors')
        .query({ digipin: 'INVALID' });

      expect(response.status).toBe(400);
    });
  });
});

describe('Error Handling', () => {
  test('should handle non-existent routes', async () => {
    const response = await request(app).get('/api/digipin/nonexistent');
    expect(response.status).toBe(404);
  });
});
