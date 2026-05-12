const request = require('supertest');
const app = require('../app');

describe('Attendance Routes', () => {
    let athleteId;
    let sessionId;
    let attendanceId;

    // -------------------------
    // SETUP: create real data
    // -------------------------
    beforeAll(async () => {
        // create athlete
        const athleteRes = await request(app)
            .post('/api/athlete')
            .send({
                athleteFirstName: 'Test',
                athleteLastName: 'Athlete',
                birthday: '2012-01-01',
                gender: 'Male',
                team: 'Test Team',
                ageGroup: 'U16',
            });

        athleteId = athleteRes.body.athlete_id || athleteRes.body[0]?.athlete_id;

        // create session
        const sessionRes = await request(app)
            .post('/api/session')
            .send({
                sessionDay: '2025-12-02',
                startTime: '07:00',
                endTime: '11:00',
                location: 'Osler Bluff',
                discipline: 'GS',
                snowConditions: 'Ice',
                visConditions: 'Sunny',
                terrainType: 'Rolly',
                numFreeskiRuns: 2,
                numDrillRuns: 2,
                numEducationalCourseRuns: 2,
                numGatesEducationalCourse: 0,
                numRaceTrainingCourseRuns: 0,
                numGatesRaceTrainingCourse: 0,
                numRaceRuns: 2,
                numGatesRace: 22,
                generalComments: 'Setup session',
                createdBy: 1,
                attendance: []
            });

        sessionId = sessionRes.body.session_id || sessionRes.body[0]?.session_id;
    });

    // -------------------------
    // TEST: add attendance
    // -------------------------
    test('PUT /api/attendance adds athletes to attendance', async () => {
        const response = await request(app)
            .put('/api/attendance')
            .send({
                athleteIds: [athleteId],
                sessionId
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Athletes added to attendance');
    });

    // -------------------------
    // TEST: update comment
    // -------------------------
    test('PUT /api/attendance/:attendanceId updates comment', async () => {

        // get attendance first (important!)
        const sessionRes = await request(app)
            .get(`/api/session?sessionId=${sessionId}`);

        const attendance = sessionRes.body[0].attendance;

        attendanceId = attendance[0].attendanceId;

        const response = await request(app)
            .put(`/api/attendance/${attendanceId}`)
            .send({
                individualComments: 'Great effort'
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.individual_comments).toBe('Great effort');
    });

    // -------------------------
    // TEST: delete attendance
    // -------------------------
    test('DELETE /api/attendance/:athleteId/:sessionId deletes attendance', async () => {

        const response = await request(app)
            .delete(`/api/attendance/${athleteId}/${sessionId}`);

        expect([200, 204]).toContain(response.statusCode);
    });
});