//routes/routes.js
//for routes related to athletes and sessions (as of now)

const { Router } = require('express');
const controller = require('../controller');
const {
    requireAuth,
    requireCoach,
    requireClubCoach
} = require('../middleware/auth');
const router = Router();

/*************************************/
/********** ATHLETE ROUTES ***********/
/*************************************/

// Example: GET /api/athlete?athleteId=1 or ?userId=1
router.get("/athlete", requireAuth, controller.getAllDataFromAthleteProfile);

// Example: POST /api/athlete
router.post("/athlete", requireClubCoach, controller.createAthleteProfile);

// Example: PUT /api/athlete/?athleteId=1 // etc...
router.put("/athlete/:athleteId", requireClubCoach, controller.updateAthleteProfile);

// Example: DELETE /api/athlete/?athleteId=1 // etc...
router.delete("/athlete/:athleteId", requireClubCoach, controller.deleteAthleteProfile);


/*************************************/
/********** SESSION ROUTES ***********/
/*************************************/

// Example: POST /api/session // etc...
router.post("/session", requireClubCoach, controller.createSession);

// Example: GET /api/session/ // etc...
router.get("/session", requireAuth, controller.getSessions)

// Example: PUT /api/session?sessionId=1 // etc...
router.put("/session/:sessionId", requireClubCoach, controller.updateSession);

// Example: DELETE /api/session?sessionId=1 // etc...
router.delete("/session/:sessionId", requireClubCoach, controller.deleteSession);

/*************************************/
/********** DATA ROUTES **************/
/*************************************/

// Team dashboard
router.get(
    "/data/team/:teamId/:column",
    requireAuth,
    controller.getPieChartData
);

// Athlete data within a team
router.get(
    "/data/team/:teamId/athlete/:athleteId/:column",
    requireAuth,
    controller.getPieChartData
);

/*************************************/
/********* ATTENDANCE ROUTES *********/
/*************************************/

// Example: DELETE /api/attendance/:athleteId/:sessionId
router.delete("/attendance/:athleteId/:sessionId", requireClubCoach, controller.deleteAthleteAttendanceSingleSession);

// Example: PUT /api/attendance/?attendanceId=1 // etc...
router.put("/attendance/:attendanceId", requireClubCoach, controller.updateIndividualComment);

// Example: PUT /api/attendance/
router.put("/attendance/", requireClubCoach, controller.addAthletesToAttendance);

/*************************************/
/********** INVITE ROUTES ***********/
/*************************************/

// POST /api/invite
router.post("/invite", requireCoach, controller.createInvite);

// GET /api/invite/:token
router.get("/invite/:token", controller.approveInvite);

/*************************************/
/******** CLUB + TEAM ROUTES *********/
/*************************************/

// Get all clubs
router.get("/clubs", controller.getClubs);

// Get teams, optionally filtered by club
router.get("/teams", requireAuth, controller.getTeams);






module.exports = router;