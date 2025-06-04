const pool = require('./config/database')
const queries = require('./queries')

//encryption here???

// Get all data from a specific athlete's profile
const getAllDataFromAthleteProfile = async (req, res) => {
    const athleteId = req.query.athleteId;
    if (!athleteId) {
        res.status(200).json("Route undefined. Input valid athleteId"); //or would this also be the same as "no athlete found. input valid athlete ID"
        return;
    }
    try {
        const result = await pool.query(queries.getAllDataFromAthleteProfile, [athleteId]);
        if (result.rows.length === 0) {
            res.status(200).json("No training data found associated with this athlete");
            return;
        }
    } catch (error) {
        console.error('Error getting athlete data: ', error);
        res.status(500).send('Failed to get athlete training data');
    }
};

module.exports = {
    getAllDataFromAthleteProfile,

}