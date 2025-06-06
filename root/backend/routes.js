const { Router } = require('express');
const controller = require('./controller');
const router = Router();


// Example: GET /api/athlete?athleteId=1
router.get("/athlete", controller.getAllDataFromAthleteProfile);

// Example: POST /api/athlete// last name, bday 
router.post("/athlete", controller.createAthleteProfile);

// Example: POST /api/session // etc...
router.post("/session", controller.createSession);

module.exports = router;