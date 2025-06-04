const getAllDataFromAthleteProfile = "SELECT * FROM training_tracker WHERE athlete_id = $1";
const getAllDataFromTrainingByDate = "SELECT * FROM training_tracker WHERE session_day = $1";

// EXAMPLE, to fill in with proper initial varibales later  
const setUpAthleteProfilesTable = `CREATE TABLE IF NOT EXISTS athlete_profiles (
    athlete_id SERIAL PRIMARY KEY
    athlete_name VARCHAR(100) NOT NULL,
    birthday DATE
);`

// separate table for

module.exports = {
    getAllDataFromAthleteProfile,
    getAllDataFromTrainingByDate,

    setUpAthleteProfilesTable
}