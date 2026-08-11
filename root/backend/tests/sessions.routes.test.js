const request = require('supertest');
const app = require('../app');

describe('Session Routes', () => {

    // reusable valid session body
    const validSession = {
        sessionDay: '2025-12-02',
        startTime: '07:00',
        endTime: '11:00',
        location: 'Osler Bluff',
        discipline: 'GS',
        snowConditions: 'Ice',
        visConditions: 'Snowing',
        terrainType: 'Medium',
        numFreeskiRuns: 2,
        numDrillRuns: 2,
        numEducationalCourseRuns: 2,
        numGatesEducationalCourse: 0,
        numRaceTrainingCourseRuns: 0,
        numGatesRaceTrainingCourse: 0,
        numRaceRuns: 2,
        numGatesRace: 22,
        generalComments: 'Back in Ontario',
        attendance: [],
        createdBy: 1,
    };



    test('GET /api/session returns sessions', async () => {

        const response = await request(app)
            .get('/api/session');

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });



    test('POST /api/session creates session', async () => {

        const response = await request(app)
            .post('/api/session')
            .send(validSession);

        // helps debugging if it fails
        // console.log(response.body);

        expect([200, 201]).toContain(response.statusCode);
    });



    test('POST /api/session rejects invalid discipline', async () => {

        const response = await request(app)
            .post('/api/session')
            .send({
                ...validSession,
                discipline: 'INVALID',
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toBeDefined();
    });



    test('PUT /api/session/:sessionId updates session', async () => {

        // first create a real session
        const createResponse = await request(app)
            .post('/api/session')
            .send(validSession);

        expect([200, 201]).toContain(createResponse.statusCode);

        // safely grab created session id
        const createdSession =
            Array.isArray(createResponse.body)
                ? createResponse.body[0]
                : createResponse.body;

        const sessionId =
            createdSession?.session_id ||
            createdSession?.sessionId;

        expect(sessionId).toBeDefined();

        // now update THAT session
        const updateResponse = await request(app)
            .put(`/api/session/${sessionId}`)
            .send({
                ...validSession,
                location: 'Updated Mountain',
                generalComments: 'Updated',
            });

        expect([200, 201]).toContain(updateResponse.statusCode);
    });



    test('PUT /api/session/:sessionId rejects invalid discipline', async () => {

        const response = await request(app)
            .put('/api/session/1')
            .send({
                ...validSession,
                discipline: 'INVALID',
            });

        expect(response.statusCode).toBe(400);
    });



    test('DELETE /api/session/:sessionId deletes existing session', async () => {

        // create a real session first
        const createResponse = await request(app)
            .post('/api/session')
            .send(validSession);

        expect([200, 201]).toContain(createResponse.statusCode);

        const createdSession =
            Array.isArray(createResponse.body)
                ? createResponse.body[0]
                : createResponse.body;

        const sessionId =
            createdSession?.session_id ||
            createdSession?.sessionId;

        expect(sessionId).toBeDefined();

        // delete the real session
        const deleteResponse = await request(app)
            .delete(`/api/session/${sessionId}`);

        expect([200, 204]).toContain(deleteResponse.statusCode);
    });



    test('DELETE /api/session/:sessionId returns 404 for missing session', async () => {

        const response = await request(app)
            .delete('/api/session/999999');

        expect(response.statusCode).toBe(404);
    });

});