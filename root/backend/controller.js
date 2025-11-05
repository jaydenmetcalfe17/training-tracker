const pool = require('./config/database');
const queries = require('./queries');
const bcrypt = require('bcrypt');

//encryption here???


// Get all data from a specific athlete's profile
const getAllDataFromAthleteProfile = async (req, res) => {
    const { athleteId, userId } = req.query;

    try {
        let result;

        if (athleteId) {
            result = await pool.query(queries.getAllDataFromAthleteProfileWithAthleteId, [athleteId]);
        } else if (userId) {
            result = await pool.query(queries.getAthleteDataWithUserId, [userId]);
        } else {
            result = await pool.query(queries.getAllAthletes);
        }

        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "No training data found for this athlete"} );
        }
        res.status(200).json(result.rows);

    } catch (error) {
        console.error('Error getting athlete data: ', error);
        res.status(500).send({error: 'Server error retrieving athlete training data'} );
    }
};


// Create an athlete profile
const createAthleteProfile = async (req, res) => {
    const {athleteFirstName, athleteLastName, birthday, gender, team, ageGroup } = req.body;
    console.log(athleteFirstName, athleteLastName, birthday, gender, team, ageGroup);

    if (!athleteFirstName || !athleteLastName || !birthday || !gender || !team || !ageGroup) {
        return res.status(400).json( {error: "Missing information"} );
    }

    try {
        const result = await pool.query(queries.createAthleteProfile, [athleteFirstName, athleteLastName, birthday, gender, team, ageGroup]);
        const newAthlete = result.rows[0]
        res.status(201).json(newAthlete);
        

    } catch (error) {
        console.error('Error creating athlete profile: ', error);
        res.status(500).send( {error: 'Server error creating athlete profile'} );
    }
}

const updateAthleteProfile = async (req, res) => {
    const athleteId = req.params.athleteId;
    const { athleteFirstName, athleteLastName, birthday, gender, team, ageGroup } = req.body;


    console.log("Values for update query:", [
        athleteId,
        athleteFirstName,
        athleteLastName,
        birthday,
        gender,
        ageGroup,
        team
     ]);
    try {
        const result = await pool.query(queries.updateAthleteProfile, [athleteId, athleteFirstName, athleteLastName, birthday, gender, team, ageGroup]);
        const updatedAthlete = result.rows[0]
        res.status(201).json(updatedAthlete);
        

    } catch (error) {
        console.error('Error updating athlete profile: ', error);
        res.status(500).send( {error: 'Server error updating athlete profile'} );
    }
}

//delete an athlete's profile and everything related to them in attendance table

const deleteAthleteProfile = async (req, res) => {
    console.log("ENTERED to Delete athlete");

    const {athleteId} = req.params;
    
    try {

        const attendanceDelete = await pool.query(queries.deleteAllAttendanceForAthlete, [athleteId]);
        
        if (attendanceDelete.rows.length === 0) {
            return res.status(404).json({ error: "Could not delete athlete from attendance table"} );
        } 
        console.log('Athlete attendance result rows:', attendanceDelete.rows);
        res.status(200).json(attendanceDelete.rows);


        const athleteDelete = await pool.query(queries.deleteAthleteProfile, [athleteId]);
        
        if (athleteDelete.rows.length === 0) {
            return res.status(404).json({ error: "No athleteId found"} );
        } 
        console.log('Athletes result rows:', athleteDelete.rows);
        res.status(200).json(athleteDelete.rows);

    } catch (error) {
        console.error('Error deleting athlete: ', error);
        res.status(500).send({error: 'Server error deleting athlete'} );
    }
};




// Create a new session
const createSession = async (req, res) => {
    const {
        sessionDay, 
        location,
        discipline, 
        snowConditions, 
        visConditions, 
        terrainType, 
        numFreeskiRuns, 
        numDrillRuns, 
        numEducationalCourseRuns, 
        numGatesEducationalCourse, 
        numRaceTrainingCourseRuns,
        numGatesRaceTrainingCourse,
        numRaceRuns,
        numGatesRace,
        generalComments,
        attendance} = req.body; 

    console.log(sessionDay, location, discipline);
    console.log("Athletes in attendance: ", attendance[0]);

    if (!sessionDay) {
        return res.status(400).json( {error: "Missing session day"} );
    }

    try {
        const result = await pool.query(queries.createSession, [
            sessionDay, 
            location,
            discipline, 
            snowConditions, 
            visConditions, 
            terrainType, 
            numFreeskiRuns, 
            numDrillRuns, 
            numEducationalCourseRuns, 
            numGatesEducationalCourse, 
            numRaceTrainingCourseRuns,
            numGatesRaceTrainingCourse,
            numRaceRuns,
            numGatesRace,
            generalComments,
        ]);
        const newSession = result.rows[0]
        const sessionId = newSession.session_id;

        console.log("Create session: ", sessionId);

        // loop through athletes in attendance
       for (const athlete of attendance) {
            console.log("Adding athlete attendance: ", athlete);
            await pool.query(queries.addAthleteAttendance, [athlete, sessionId]);
        }
        

        res.status(201).json(newSession);
        

    } catch (error) {
        console.error('Error creating session: ', error);
        res.status(500).json({ error: error.message }); //
    }
}

// Get sessions
const getSessions = async (req, res) => {
    console.log("ENTERED");

    const {
        sessionId,
        athleteId,
        fromDate,
        toDate,
        location,
        discipline,
        snowConditions,
        visConditions,
        terrainType
    } = req.query;


    try {
        const values = [
            athleteId,
            fromDate || null,
            toDate || null,
            location || null,
            discipline || null,
            snowConditions || null,
            visConditions || null,
            terrainType || null
        ];

        let result;

        if (athleteId) {
            result = await pool.query(queries.oneAthleteSessionsFilterSearch, values);
        } else if (sessionId) { //getting session by specific session ID
            result = await pool.query(queries.getSessionById, [sessionId]);
        } else {  //getting all sessions
            result = await pool.query(queries.getAllSessions);
        }

        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "No sessions found"} );
        }
        console.log('Sessions result rows:', result.rows);
        res.status(200).json(result.rows);

    } catch (error) {
        console.error('Error getting sessions: ', error);
        res.status(500).send({error: 'Server error retrieving sessions'} );
    }
};

const updateSession = async (req, res) => {
    const sessionId = req.params.sessionId;
    const { 
        sessionDay, 
        location,
        discipline, 
        snowConditions, 
        visConditions, 
        terrainType, 
        numFreeskiRuns, 
        numDrillRuns, 
        numEducationalCourseRuns, 
        numGatesEducationalCourse, 
        numRaceTrainingCourseRuns,
        numGatesRaceTrainingCourse,
        numRaceRuns,
        numGatesRace,
        generalComments,
     } = req.body;


    console.log("Values for update query:", [
        sessionId,
        sessionDay, 
        location,
        discipline, 
        snowConditions, 
        visConditions, 
        terrainType, 
        numFreeskiRuns, 
        numDrillRuns, 
        numEducationalCourseRuns, 
        numGatesEducationalCourse, 
        numRaceTrainingCourseRuns,
        numGatesRaceTrainingCourse,
        numRaceRuns,
        numGatesRace,
        generalComments,
     ]);
    try {
        const result = await pool.query(queries.updateSession, [
            sessionId,
            sessionDay, 
            location,
            discipline, 
            snowConditions, 
            visConditions, 
            terrainType, 
            numFreeskiRuns, 
            numDrillRuns, 
            numEducationalCourseRuns, 
            numGatesEducationalCourse, 
            numRaceTrainingCourseRuns,
            numGatesRaceTrainingCourse,
            numRaceRuns,
            numGatesRace,
            generalComments,
        ]);
        const updatedSession = result.rows[0]
        res.status(201).json(updatedSession);
        

    } catch (error) {
        console.error('Error updating session: ', error);
        res.status(500).send( {error: 'Server error updating session'} );
    }
}

const deleteSession = async (req, res) => {
    console.log("ENTERED to Delete");

    const {sessionId} = req.params;

    try {

        const attendanceDelete = await pool.query(queries.deleteAllAttendanceForSession, [sessionId]);

        if (attendanceDelete.rows.length === 0) {
            return res.status(404).json({ error: "No sessions found"} );
        }
        console.log('Sessions result rows:', attendanceDelete.rows);
        res.status(200).json(attendanceDelete.rows);


        const sessionDelete = await pool.query(queries.deleteSession, [sessionId]);

        if (sessionDelete.rows.length === 0) {
            return res.status(404).json({ error: "No sessions found"} );
        }
        console.log('Sessions result rows:', sessionDelete.rows);
        res.status(200).json(sessionDelete.rows);


    } catch (error) {
        console.error('Error deleting session: ', error);
        res.status(500).send({error: 'Server error deleting session'} );
    }
};




// Create user profile
const createUser = async (req, res) => {
    const {userFirstName, userLastName, email, password, password2, status } = req.body;
    // const fullName = userFirstName + ' ' + userLastName;
    console.log(userFirstName, userLastName,  email, password, status);

    let errors = [];

    // Check that all fields were filled out: 
    if (!userFirstName || !userLastName || !email || !password || !password2 || !status) {
        errors.push({message: "Please fill out all fields"})
        // return res.status(400).json( {error: "Missing information"} );
    }

    // Password validation: 
    if (!password.length < 6) {
         errors.push({message: "Password should be at least 6 characters long"})
        // return res.status(400).json( {error: "Missing information"} );
    }

    if (password != password2) {
        errors.push({message: "Passwords do not match"})
    }

    // Display errors and restart registration attempts 
    // if (errors.length > 0) {
    //     res.render('registration', {errors}); 
    // }

    // Hashing password: 
    let hashed = await bcrypt.hash(password, 10);
    console.log("hashed: ", hashed);

    
    try {
        // Check if user exists first
        const checkUserExists = await pool.query(queries.findUserByEmail, [email]);

        if (checkUserExists.rows.length > 0) {
            // console.error('User already exists!: ', error);
            res.status(500).send( {error: 'User already exists.'} );
        } else {
            const result = await pool.query(queries.createUser, [userFirstName, userLastName, email, hashed, status]);
            const newUser = result.rows[0]

            console.log("NEW USER: ", newUser);

            if (newUser.status == 'athlete') {
                const updated = await pool.query(queries.addUserIDtoAthlete, [newUser.user_id, userFirstName, userLastName]);
                console.log("Successfully updated with userID: ", updated);
            }

            res.status(201).json(newUser);
        }

    } catch (error) {
        console.error('Error creating user profile: ', error);
        res.status(500).send( {error: 'Server error creating user profile'} );
    } 
}

module.exports = {
    getAllDataFromAthleteProfile,
    createAthleteProfile,
    updateAthleteProfile,
    deleteAthleteProfile,
    createSession,
    getSessions,
    updateSession,
    deleteSession,
    createUser
}