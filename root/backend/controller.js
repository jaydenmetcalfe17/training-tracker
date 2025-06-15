const pool = require('./config/database');
const queries = require('./queries');
const bcrypt = require('bcrypt');

//encryption here???

// Get all data from a specific athlete's profile
const getAllDataFromAthleteProfile = async (req, res) => {
    const athleteId = req.query.athleteId;
    if (!athleteId) {
        return res.status(400).json( {error: "Missing athlete ID in query."} );
    }
    try {
        const result = await pool.query(queries.getAllDataFromAthleteProfile, [athleteId]);
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
    const {athleteFirstName, athleteLastName, birthday } = req.body;
    console.log(athleteFirstName, athleteLastName, birthday);

    if (!athleteFirstName || !athleteLastName) {
        return res.status(400).json( {error: "Missing first or last name"} );
    }

    try {
        const result = await pool.query(queries.createAthleteProfile, [athleteFirstName, athleteLastName, birthday]);
        const newAthlete = result.rows[0]
        res.status(201).json(newAthlete);
        

    } catch (error) {
        console.error('Error creating athlete profile: ', error);
        res.status(500).send( {error: 'Server error creating athlete profile'} );
    }
}


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
        numCourseRuns, 
        generalComments} = req.body; //should I make this a type somewhere?? 

    console.log(sessionDay, location, discipline);

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
            numCourseRuns, 
            generalComments
        ]);
        const newSession = result.rows[0]
        res.status(201).json(newSession);
        

    } catch (error) {
        console.error('Error creating session: ', error);
        res.status(500).json({ error: error.message }); //
    }
}

// Create user profile
const createUser = async (req, res) => {
    const {userFirstName, userLastName, email, password, password2, status } = req.body;
    const fullName = userFirstName + ' ' + userLastName;
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
            const result = await pool.query(queries.createUser, [fullName, email, hashed, status]);
            const newUser = result.rows[0]
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
    createSession,
    createUser
}