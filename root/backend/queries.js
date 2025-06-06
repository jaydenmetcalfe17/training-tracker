const getAllDataFromAthleteProfile = "SELECT * FROM athletes WHERE athlete_id = $1";
const getAllDataFromTrainingByDate = "SELECT * FROM sessions WHERE session_day = $1";
const createAthleteProfile = "INSERT INTO athletes (athlete_first_name, athlete_last_name, birthday) VALUES ($1, $2, $3) RETURNING *";

const createSession = 
`INSERT INTO sessions (
    session_day, 
    location, 
    discipline,
    snow_conditions, 
    vis_conditions, 
    terrain_type, 
    num_freeski_runs,
    num_drill_runs,
    num_course_runs,
    general_comments
    ) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
    RETURNING *`;

// EXAMPLE, to fill in with proper initial varibales later  
const setUpAthleteProfilesTable = `CREATE TABLE IF NOT EXISTS athletes (
    athlete_id SERIAL PRIMARY KEY,
    athlete_first_name VARCHAR(100) NOT NULL,
    athlete_last_name VARCHAR(100) NOT NULL,
    birthday DATE
);`

const setUpSessionsTable = `CREATE TABLE IF NOT EXISTS sessions (
    session_id SERIAL PRIMARY KEY,
    session_day DATE,
    location VARCHAR(50),
    discipline VARCHAR(20),
    snow_conditions VARCHAR(50),
    vis_conditions VARCHAR(50),
    terrain_type VARCHAR(50),
    num_freeski_runs INT,
    num_drill_runs INT,
    num_course_runs INT,
    general_comments VARCHAR(250)
);`

const setUpUsersTable = `CREATE TABLE IF NOT EXISTS sessions (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50),
    password VARCHAR(25),
    status VARCHAR (10)
);`


// separate table for sessions and attendance

module.exports = {
    getAllDataFromAthleteProfile,
    getAllDataFromTrainingByDate,
    createAthleteProfile,
    createSession,

    setUpAthleteProfilesTable,
    setUpSessionsTable,
    setUpUsersTable
}