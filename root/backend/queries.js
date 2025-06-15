// Just Athlete Queries 
const createAthleteProfile = "INSERT INTO athletes (athlete_first_name, athlete_last_name, birthday) VALUES ($1, $2, $3) RETURNING *";
const getAllDataFromAthleteProfile = "SELECT * FROM athletes WHERE athlete_id = $1";

// EXAMPLE, to fill in with proper initial varibales later  
const setUpAthleteProfilesTable = `CREATE TABLE IF NOT EXISTS athletes (
    athlete_id SERIAL PRIMARY KEY,
    athlete_first_name VARCHAR(100) NOT NULL,
    athlete_last_name VARCHAR(100) NOT NULL,
    birthday DATE
);`



// Just Session Queries 
const getAllDataFromTrainingByDate = "SELECT * FROM sessions WHERE session_day = $1";

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


// Just User and Auth Related Queries: 
const setUpUsersTable = `CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(250),
    email VARCHAR (100) UNIQUE,
    password VARCHAR(50),
    status VARCHAR (50),
	google_id TEXT UNIQUE
);`

const checkUserAuth = "SELECT * FROM users WHERE google_id = $1"
const createGoogleUser = "INSERT INTO users (name, google_id, email) VALUES ($1, $2, $3) RETURNING *"
const createUser = "INSERT INTO users (name, email, password, status) VALUES ($1, $2, $3, $4) RETURNING *"
const getUserID = "SELECT user_id FROM users WHERE google_id = $1"
const findUserByEmail = "SELECT * FROM users WHERE email = $1"


// Need separate table for Attendance as well 



module.exports = {
    getAllDataFromAthleteProfile,
    getAllDataFromTrainingByDate,
    createAthleteProfile,
    createSession,

    setUpAthleteProfilesTable,
    setUpSessionsTable,
    setUpUsersTable,
    checkUserAuth,
    createGoogleUser,
    createUser,
    getUserID,
    findUserByEmail
}