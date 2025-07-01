// Just Athlete Queries 
const createAthleteProfile = "INSERT INTO athletes (athlete_first_name, athlete_last_name, birthday, gender) VALUES ($1, $2, $3, $4) RETURNING *";
const getAllDataFromAthleteProfileWithAthleteId = "SELECT * FROM athletes WHERE athlete_id = $1";
const getAllAthletes = "SELECT * FROM athletes";


// EXAMPLE, to fill in with proper initial varibales later  
const setUpAthleteProfilesTable = `CREATE TABLE IF NOT EXISTS athletes (
    athlete_id SERIAL PRIMARY KEY,
    athlete_first_name VARCHAR(100) NOT NULL,
    athlete_last_name VARCHAR(100) NOT NULL,
    birthday DATE,
    gender VARCHAR(10) NOT NULL,
    user_id INTEGER UNIQUE,
    CONSTRAINT fk_athlete_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);`

const getAthleteDataWithUserId = `SELECT * FROM athletes WHERE user_id = $1`


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

const getAllAthleteSessionsFromAttendance = `SELECT * FROM attendance JOIN sessions ON attendance.session_id = sessions.session_id WHERE athlete_id = $1`;


// Just User and Auth Related Queries: 
const setUpUsersTable = `CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(250),
    email VARCHAR (100) UNIQUE,
    password VARCHAR(50),
    status TEXT CHECK (status IN ('coach', 'athlete', 'parent'))
	google_id TEXT UNIQUE
);`

const checkUserAuth = "SELECT * FROM users WHERE google_id = $1"
const createGoogleUser = "INSERT INTO users (name, google_id, email) VALUES ($1, $2, $3) RETURNING *"
const createUser = "INSERT INTO users (name, email, password, status) VALUES ($1, $2, $3, $4) RETURNING *"
const getUserID = "SELECT user_id FROM users WHERE google_id = $1"
const findUserByEmail = "SELECT * FROM users WHERE email = $1"


// Need separate table for Attendance as well 
const setUpAttendanceTable = `CREATE TABLE IF NOT EXISTS attendance (
	attendance_id SERIAL PRIMARY KEY,
	athlete_id INT,
	session_id INT
);`

const addAthleteAttendance = `INSERT INTO attendance (athlete_id, session_id) VALUES ($1, $2) RETURNING *`

// Connect a parent user's account to specific athletes and vice versa
const setUpParentsAthletesTable = `CREATE TABLE athletes_parents (
  athlete_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  PRIMARY KEY (athlete_id, user_id),
  CONSTRAINT fk_athlete FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE CASCADE,
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);`



module.exports = {
    getAllDataFromAthleteProfileWithAthleteId,
    getAllDataFromTrainingByDate,
    createAthleteProfile,
    getAllAthletes,
    createSession,

    setUpAthleteProfilesTable,
    getAthleteDataWithUserId,
    setUpSessionsTable,
    getAllAthleteSessionsFromAttendance,

    setUpUsersTable,
    checkUserAuth,
    createGoogleUser,
    createUser,
    getUserID,
    findUserByEmail,
    setUpAttendanceTable,
    addAthleteAttendance,
    setUpParentsAthletesTable
}