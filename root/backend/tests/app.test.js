// backend/tests/app.test.js

const request = require('supertest');
const app = require('../app');

describe('GET /favicon.ico', () => {

  test('returns 204', async () => {

    const response = await request(app)
      .get('/favicon.ico');

    expect(response.statusCode).toBe(204);
  });

});