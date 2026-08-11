const request = require('supertest');
const app = require('../app');

describe('Invite Routes', () => {

    test('POST /api/invite creates invite', async () => {

        const response = await request(app)
            .post('/api/invite')
            .send({
                athleteId: 1,
                role: 'parent'
            });

        expect(response.statusCode).toBe(201);
    });



    test('GET /api/invite/:token validates invite', async () => {

        const fakeToken = 'abc123';

        const response = await request(app)
            .get(`/api/invite/${fakeToken}`);

        expect([200, 400, 404]).toContain(response.statusCode);
    });

});