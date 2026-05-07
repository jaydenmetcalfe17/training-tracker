//for routes related to athletes and sessions (as of now)

const { Router } = require('express');
const controller = require('../controller');
// const { requireCoach } = require("../middleware/auth");
const router = Router();


// Example: GET /api/athlete?athleteId=1 or ?userId=1
router.get("/athlete", controller.getAllDataFromAthleteProfile);

// Example: POST /api/athlete// last name, bday 
// router.post("/athlete", requireCoach, controller.createAthleteProfile);
router.post("/athlete", controller.createAthleteProfile);

// Example: PUT /api/athlete/?athleteId=1 // etc...
router.put("/athlete/:athleteId", controller.updateAthleteProfile);

// Example: DELETE /api/athlete/?athleteId=1 // etc...
router.delete("/athlete/:athleteId", controller.deleteAthleteProfile);

// Example: POST /api/session // etc...
router.post("/session", controller.createSession);

// Example: GET /api/session/ // etc...
router.get("/session", controller.getSessions)

// Example: PUT /api/session/?sessionId=1 // etc...
router.put("/session/:sessionId", controller.updateSession);

// Example: DELETE /api/session/?sessionId=1 // etc...
router.delete("/session/:sessionId", controller.deleteSession);

// Pie chart data for all sessions
router.get("/data/:column", controller.getPieChartData);

// Pie chart data for specific athlete
router.get("/data/:athleteId/:column", controller.getPieChartData);

// Example: DELETE /api/attendance/:athleteId/:sessionId
router.delete("/attendance/:athleteId/:sessionId", controller.deleteAthleteAttendanceSingleSession);

// Example: PUT /api/attendance/?attendanceId=1 // etc...
router.put("/attendance/:attendanceId", controller.updateIndividualComment);

// Example: PUT /api/attendance/
router.put("/attendance/", controller.addAthletesToAttendance);

// POST /api/invite
router.post("/invite", controller.createInvite);

// GET /api/invite/:token
router.get("/invite/:token", controller.approveInvite);


module.exports = router;