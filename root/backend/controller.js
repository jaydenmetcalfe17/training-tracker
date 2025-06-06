const pool = require('./config/database')
const queries = require('./queries')

//encryption here???

// Get all data from a specific athlete's profile
const getAllDataFromAthleteProfile = async (req, res) => {
    const athleteId = req.query.athleteId;
    if (!athleteId) {
        return res.status(400).json("Missing athlete ID in query.");
    }
    try {
        const result = await pool.query(queries.getAllDataFromAthleteProfile, [athleteId]);
        if (result.rows.length === 0) {
            return res.status(404).json("No training data found for this athlete");
        }
        res.status(200).json(result.rows);

    } catch (error) {
        console.error('Error getting athlete data: ', error);
        res.status(500).send('Server error retrieving athlete training data');
    }
};

// Create an athlete profile
const createAthleteProfile = async (req, res) => {
    const {athleteFirstName, athleteLastName, birthday } = req.body;
    console.log(athleteFirstName, athleteLastName, birthday);

    if (!athleteFirstName || !athleteLastName) {
        return res.status(400).json("Missing first or last name");
    }

    try {
        const result = await pool.query(queries.createAthleteProfile, [athleteFirstName, athleteLastName, birthday]);
        const newAthlete = result.rows[0]
        res.status(201).json(newAthlete);
        

    } catch (error) {
        console.error('Error creating athlete profile: ', error);
        res.status(500).send('Server error creating athlete profile');
    }
}

module.exports = {
    getAllDataFromAthleteProfile,
    createAthleteProfile
}