//for routes related to athletes and sessions (as of now)

const { Router } = require('express');
const controller = require('../controller');
const router = Router();


// Example: GET /api/athlete?athleteId=1 or ?userId=1
router.get("/athlete", controller.getAllDataFromAthleteProfile);

// Example: POST /api/athlete// last name, bday 
router.post("/athlete", controller.createAthleteProfile);

// Example: PUT /api/athlete/?athleteId=1 // etc...
router.put("/athlete/:athleteId", controller.updateAthleteProfile);

// Example: POST /api/session // etc...
router.post("/session", controller.createSession);

// Example: GET /api/session/?athleteId=1 // etc...
router.get("/session", controller.getSessions)


module.exports = router;