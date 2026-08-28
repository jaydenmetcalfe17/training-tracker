//routes/routes.js
//for routes related to athletes and sessions (as of now)

const { Router } = require('express');
const controller = require('../controller');
const {
    requireAuth,
    requireCoach,
    requireClubCoach,
    requireAthleteAffiliationCoach
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

// Athlete's own historical data (all teams they've ever belonged to)
router.get(
    "/data/athlete/:athleteId/:column",
    requireAuth,
    controller.getPieChartData
);

// Club dashboard (all teams belonging to the club)
router.get(
    "/data/club/:clubId/:column",
    requireAuth,
    controller.getPieChartData
);

/*************************************/
/********* ATTENDANCE ROUTES *********/
/*************************************/

// Example: DELETE /api/attendance/:athleteId/:sessionId
router.delete("/attendance/:athleteId/:sessionId", requireClubCoach, controller.deleteAthleteAttendanceSingleSession);

// Example: PUT /api/attendance/?attendanceId=1 // etc...
router.put("/attendance/:attendanceId", requireClubCoach, controller.updateAttendance);

// Example: PUT /api/attendance/
router.put("/attendance/", requireClubCoach, controller.addAthletesToAttendance);

/*************************************/
/********** INVITE ROUTES ***********/
/*************************************/

// POST /api/invite
router.post("/invite", requireCoach, controller.createInvite);

// accept an invite and mark it as used
router.post("/invite/:token/accept", requireAuth, controller.acceptInvite);

// GET /api/invite/:token
router.get("/invite/:token", controller.getInviteDetails);

/*************************************/
/******** CLUB + TEAM ROUTES *********/
/*************************************/

// Get all clubs
router.get("/clubs", controller.getClubs);

// Get teams, optionally filtered by club
router.get("/teams", requireAuth, controller.getTeams);

// Get all teams an athlete has been apart of
router.get("/athlete/:athleteId/team-memberships", requireAuth, controller.getAthleteTeamMemberships)

// update an athlete's team membership(s)
router.put("/athlete/:athleteId/team-memberships", requireAthleteAffiliationCoach, controller.updateAthleteTeamMemberships);


module.exports = router;