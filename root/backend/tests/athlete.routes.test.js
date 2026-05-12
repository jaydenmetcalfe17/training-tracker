const request = require('supertest');
const app = require('../app');

describe('Athlete Routes', () => {

    test('GET /api/athlete returns athletes', async () => {

        const response = await request(app)
            .get('/api/athlete');

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });



    test('GET /api/athlete?athleteId=1 returns one athlete', async () => {

        const response = await request(app)
            .get('/api/athlete?athleteId=1');

        expect(response.statusCode).toBe(200);

        expect(response.body[0]).toHaveProperty('athlete_id');
    });



    test('POST /api/athlete creates athlete', async () => {

        const response = await request(app)
            .post('/api/athlete')
            .send({
                athleteFirstName: 'Test',
                athleteLastName: 'User',
                birthday: '2002-01-01',
                gender: 'Female',
                team: 'Test Team',
                ageGroup: 'FIS',
            });

        expect(response.statusCode).toBe(201);
    });



    test('PUT /api/athlete/:athleteId updates athlete', async () => {

        const response = await request(app)
            .put('/api/athlete/1')
            .send({
                athleteFirstName: 'Updated',
                athleteLastName: 'Athlete',
                birthday: '2002-01-01',
                gender: 'Female',
                team: 'Updated Team',
                ageGroup: 'FIS',
            });

        expect(response.statusCode).toBe(201);
    });



    test('DELETE /api/athlete/:athleteId deletes existing athlete', async () => {

        // create athlete first
        const createResponse = await request(app)
            .post('/api/athlete')
            .send({
                athleteFirstName: 'Delete',
                athleteLastName: 'Me',
                birthday: '2001-01-01',
                gender: 'Female',
                team: 'Test Team',
                ageGroup: 'FIS',
            });

        expect([200, 201]).toContain(createResponse.statusCode);

        // grab created athlete id
        const athleteId =
            createResponse.body.athlete_id ||
            createResponse.body[0]?.athlete_id;

        expect(athleteId).toBeDefined();

        // now delete actual athlete
        const deleteResponse = await request(app)
            .delete(`/api/athlete/${athleteId}`);

        expect([200, 204]).toContain(deleteResponse.statusCode);
    });

});