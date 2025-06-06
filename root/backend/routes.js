const { Router } = require('express');
const controller = require('./controller');
const router = Router();


// Example: GET /api/athlete?athleteId=1
router.get("/athlete", controller.getAllDataFromAthleteProfile);

// Example: POST /api/athlete?athleteFirstName=Jayden // last name, bday 
router.post("/athlete", controller.createAthleteProfile);

module.exports = router;