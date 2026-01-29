const { session } = require('passport');
const pool = require('./config/database');
const queries = require('./queries.json');
const bcrypt = require('bcrypt');
const validator = require('validator');
const crypto = require ('crypto');

//encryption here???


// Get all data from a specific athlete's profile
const getAllDataFromAthleteProfile = async (req, res) => {
    const { athleteId, userId } = req.query;

    try {
        let result;

        if (athleteId) {
            result = await pool.query(queries.athletes.getAllDataFromAthleteProfileWithAthleteId, [athleteId]);
        } else if (userId) {
            result = await pool.query(queries.athletes.getAthleteDataWithUserId, [userId]);
        } else {
            result = await pool.query(queries.athletes.getAllAthletes);
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

    //server side input validation
     let errors = [];

    //validation:
    if (validator.isEmpty(athleteFirstName)) {
      errors.push({athleteFirstName:'Must enter a first name'});
    }

    if (!validator.isAlpha(athleteFirstName)) {
      errors.push({athleteFirstName:'First name can only be letters'});
    }

    if (validator.isEmpty(athleteLastName)) {
      errors.push({athleteLastName:'Must enter a last name'});
    }

     if (!validator.isAlpha(athleteLastName)) {
      errors.push({athleteFirstName:'Last name can only be letters'});
    }

    if (validator.isEmpty(birthday)) {
      errors.push({birthday:'Must enter a birthday'});
    }

    // add: is year of birth greater than current date?
    if (!validator.isDate(birthday)) {
      errors.push({birthday:'Birthday must be format YYYY-MM-DD'});
    }

    if (validator.isEmpty(gender)) {
      errors.push({gender:'Must choose a gender'});
    }

    if (!['Male', 'Female'].includes(gender)){
        errors.push({gender:'Gender can only be Male or Female'});
    }

    if (validator.isEmpty(team)) {
      errors.push({team:'Must choose a team'});
    }

    if (validator.isEmpty(ageGroup)) {
      errors.push({ageGroup:'Must choose an age group'});
    }

    if (!['U10', 'U12', 'U14', 'U16', 'FIS'].includes(ageGroup)) {
      errors.push({ageGroup:'Must choose a valid age group'});
    }


    // if any errors:
     if (errors.length > 0) {
      return res.status(400).json({ errors });
    }



    try {
        const result = await pool.query(queries.athletes.createAthleteProfile, [athleteFirstName, athleteLastName, birthday, gender, team, ageGroup]);
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

    //server side input validation
     let errors = [];

    //validation:
    if (validator.isEmpty(athleteFirstName)) {
      errors.push({athleteFirstName:'Must enter a first name'});
    }

    if (!validator.isAlpha(athleteFirstName)) {
      errors.push({athleteFirstName:'First name can only be letters'});
    }

    if (validator.isEmpty(athleteLastName)) {
      errors.push({athleteLastName:'Must enter a last name'});
    }

     if (!validator.isAlpha(athleteLastName)) {
      errors.push({athleteFirstName:'Last name can only be letters'});
    }

    if (validator.isEmpty(birthday)) {
      errors.push({birthday:'Must enter a birthday'});
    }

    // add: is year of birth greater than current date?
    if (!validator.isDate(birthday)) {
      errors.push({birthday:'Birthday must be format YYYY-MM-DD'});
    }

    if (validator.isEmpty(gender)) {
      errors.push({gender:'Must choose a gender'});
    }

    if (!['Male', 'Female'].includes(gender)){
        errors.push({gender:'Gender can only be Male or Female'});
    }

    if (validator.isEmpty(team)) {
      errors.push({team:'Must choose a team'});
    }

    if (validator.isEmpty(ageGroup)) {
      errors.push({ageGroup:'Must choose an age group'});
    }

    if (!['U10', 'U12', 'U14', 'U16', 'FIS'].includes(ageGroup)) {
      errors.push({ageGroup:'Must choose a valid age group'});
    }


    // if any errors:
     if (errors.length > 0) {
      return res.status(400).json({ errors });
    }



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
        const result = await pool.query(queries.athletes.updateAthleteProfile, [athleteId, athleteFirstName, athleteLastName, birthday, gender, team, ageGroup]);
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

        const attendanceDelete = await pool.query(queries.attendance.deleteAllAttendanceForAthlete, [athleteId]);
        
        if (attendanceDelete.rows.length === 0) {
            return res.status(404).json({ error: "Could not delete athlete from attendance table"} );
        } 
        console.log('Athlete attendance result rows:', attendanceDelete.rows);
        res.status(200).json(attendanceDelete.rows);


        const athleteDelete = await pool.query(queries.athletes.deleteAthleteProfile, [athleteId]);
        
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


// delete athlete from attendance of a single session 
const deleteAthleteAttendanceSingleSession = async (req, res) => {
    const {athleteId, sessionId} = req.params;
    
    try {

        const attendanceDelete = await pool.query(queries.attendance.deleteAthleteAttendanceSingleSession, [athleteId, sessionId]);
        
        if (attendanceDelete.rows.length === 0) {
            return res.status(404).json({ error: "Could not delete athlete from attendance table"} );
        } 
        console.log('Athlete attendance result rows:', attendanceDelete.rows);
        res.status(200).json(attendanceDelete.rows);

    } catch (error) {
        console.error('Error deleting athlete attendance: ', error);
        res.status(500).send({error: 'Server error deleting athlete attendance'} );
    } 
};


const addAthletesToAttendance = async (req, res) => {
    const {athleteIds, sessionId} = req.body;
    console.log(athleteIds);
    
    try {
       const check = await pool.query(queries.sessions.getAllAthletesAttendanceFromSession, [sessionId])
       const attendingIds = check.rows.map(row => row.athlete_id)
        // loop through athletes in attendance
       for (const athlete of athleteIds) {
            if (attendingIds.includes(athlete)){
                console.error('Error adding athletes to attendance: ', error);
                res.status(500).send({error: 'Cannot add athlete to a session more than once'} );
            } else {
                console.log("Adding athlete attendance: ", athlete);
                await pool.query(queries.attendance.addAthleteAttendance, [athlete, sessionId]);
            }
        }
        // res.status(200).json(attendanceDelete.rows);

    } catch (error) {
        console.error('Error adding athletes to attendance: ', error);
        res.status(500).send({error: 'Server error adding athletes to attendance'} );
    } 
};



// Create a new session
const createSession = async (req, res) => {
    const {
        sessionDay, 
        location,
        startTime,
        endTime,
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
        createdBy,
        attendance} = req.body; 

    console.log(sessionDay, location, discipline);
    console.log("Athletes in attendance: ", attendance[0]);

    //backend validation
    let errors = [];

    if (validator.isEmpty(sessionDay)) {
      errors.push({sessionDay:'Session must have a date'});
    }

    if (!validator.isDate(sessionDay)) {
      errors.push({sessionDay:'Session must be of format YYYY-MM-DD'});
    }

    // make this a time (version of type Date?)
    if (validator.isEmpty(startTime)) {
      errors.push({startTime:'Session must have a start time'});
    }

    // make this a time (version of type Date? then turn into string for database entry?)
    if (validator.isEmpty(endTime)) {
      errors.push({endTime:'Session must have an end time'});
    }

    if (validator.isEmpty(location)) {
      errors.push({location:'Session must have a location'});
    }

    if (validator.isEmpty(discipline)) {
      errors.push({discipline:'Session must have a discipline'});
    }

    if (!['SL', 'GS', 'SG', 'DH', 'Other'].includes(discipline)) {
      errors.push({discipline:'Must choose a valid discipline'});
    }

    if (validator.isEmpty(snowConditions)) {
      errors.push({snowConditions:'Session must have snow conditions'});
    }

    if (!['Soft', 'Compact-soft', 'Hard grippy', 'Ice', 'Wet', 'Salted', 'Non-groomed', 'Ball bearings', 'Powder'].includes(snowConditions)) {
      errors.push({snowConditions:'Must choose valid snow conditions'});
    }

    if (validator.isEmpty(visConditions)) {
      errors.push({visConditions:'Session must have a vis conditions'});
    }

    if (!['Sunny', 'Flat light', 'Fog', 'Snowing', 'Variable', 'Rain'].includes(visConditions)) {
      errors.push({visConditions:'Must choose valid snow conditions'});
    }

    if (validator.isEmpty(terrainType)) {
      errors.push({terrainType:'Session must have terrain type'});
    }

    if (!['Flat', 'Medium', 'Steep', 'Rolly', 'Mixed'].includes(terrainType)) {
      errors.push({terrainType:'Must choose valid snow conditions'});
    }

    // number validation 
    // FOR NOW: isNumeric checks if a STRING is all numbers... doesn't check if type is a number
    // if (validator.isNumeric(numFreeskiRuns)) {
    //   errors.push({numFreeskiRuns:'Must be a number'});
    // }

    // if (validator.isNumeric(numDrillRuns)) {
    //   errors.push({numDrillRuns:'Must be a number'});
    // }

    // if (validator.isNumeric(numEducationalCourseRuns)) {
    //   errors.push({numEducationalCourseRuns:'Must be a number'});
    // }

    // if (validator.isNumeric(numGatesEducationalCourse)) {
    //   errors.push({numGatesEducationalCourse:'Must be a number'});
    // }

    // if (validator.isNumeric(numRaceTrainingCourseRuns)) {
    //   errors.push({numRaceTrainingCourseRuns:'Must be a number'});
    // }

    // if (validator.isNumeric(numGatesRaceTrainingCourse)) {
    //   errors.push({numGatesRaceTrainingCourse:'Must be a number'});
    // }

    // if (validator.isNumeric(numRaceRuns)) {
    //   errors.push({numRaceRuns:'Must be a number'});
    // }

    // if (validator.isNumeric(numGatesRace)) {
    //   errors.push({numGatesRace:'Must be a number'});
    // }


    // if any errors:
     if (errors.length > 0) {
      return res.status(400).json({ errors });
    }


    if (!sessionDay) {
        return res.status(400).json( {error: "Missing session day"} );
    }

    try {
        const result = await pool.query(queries.sessions.createSession, [
            sessionDay, 
            startTime,
            endTime,
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
            createdBy
        ]);
        const newSession = result.rows[0]
        const sessionId = newSession.session_id;

        console.log("Create session: ", sessionId);

        // loop through athletes in attendance
       for (const athlete of attendance) {
            console.log("Adding athlete attendance: ", athlete);
            await pool.query(queries.attendance.addAthleteAttendance, [athlete, sessionId]);
        }
        

        res.status(201).json(newSession);
        

    } catch (error) {
        console.error('Error creating session: ', error);
        res.status(500).json({ error: error.message }); //
    }
}

// Get sessions
const getSessions = async (req, res) => {

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
            result = await pool.query(queries.sessions.oneAthleteSessionsFilterSearch, values);
        } else if (sessionId) { //getting session by specific session ID
            result = await pool.query(queries.sessions.getSessionById, [sessionId]);
        } else {  //getting all sessions
            result = await pool.query(queries.sessions.getAllSessions);
        }
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "No sessions found"} );
        }

        const attendance = await pool.query(queries.sessions.getAllAthletesAttendanceFromSession, [sessionId]);

        const sessionsWithAttendance = result.rows.map((session) => ({
            ...session,
            attendance: attendance.rows
                .filter(att => att.session_id === session.session_id)
                .map(att => ({
                    attendanceId: att.attendance_id,
                    individualComments: att.individual_comments,
                    athlete: {
                        athleteId: att.athlete_id,
                        athleteFirstName: att.athlete_first_name,
                        athleteLastName: att.athlete_last_name,
                        birthday: att.birthday,
                        gender: att.gender,
                        userId: att.user_id,
                        team: att.team,
                        ageGroup: att.age_group,
                    },
                })),
        }));

        res.status(200).json(sessionsWithAttendance);


    } catch (error) {
        console.error('Error getting sessions: ', error);
        res.status(500).send({error: 'Server error retrieving sessions'} );
    }
};

const getPieChartData = async(req, res) => {

  // future: add athlete pie chart functionality so it doesn't just search sessions table in database -- need to change query or add new one here. pass through another param?

  const {column, athleteId} = req.params;
  console.log("athleteID to search: ", athleteId);

  const columnMap = {
      sessionDay: "session_day",
      location: "location",
      discipline: "discipline",
      snowConditions: "snow_conditions",
      visConditions: "vis_conditions",
      terrainType: "terrain_type",
      runColumn: "run_column"
  };

  db_col = columnMap[column] || null;


  if (!db_col) {
    return res.status(400).json({ error: "Invalid column" });
  }

  try {
      if (athleteId) {
        if (db_col == "run_column"){
          result = await pool.query(queries.sessions.getSingleAthleteRunColumnData, [athleteId])
        }
        else {
          result = await pool.query(queries.sessions.getSingleAthleteSingleColumnDataSessions.replace(/{{column}}/g, db_col), [athleteId])
        }
      } 
      else if (db_col == "run_column"){
        result = await pool.query(queries.sessions.getRunColumnData)
      }
      else {
        result = await pool.query(queries.sessions.getSingleColumnDataSessions.replace(/{{column}}/g, db_col))
      }

    let labels = [];
    let values = [];

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No data found" });
    }


    if (result.rows[0].drill_runs !== undefined) {
      const row = result.rows[0];
      labels = Object.keys(row);         
      values = Object.values(row).map(Number); 
    } else {

      labels = result.rows.map(r => r[db_col]);
      values = result.rows.map(r => Number(r.count));
    }

    res.status(200).json({ labels, values });

  } catch (error) {
        console.error('Error getting data from sessions: ', error);
        res.status(500).send({error: 'Server error retrieving sessions'} );
    }

};

const updateSession = async (req, res) => {
    const sessionId = req.params.sessionId;
    const { 
        sessionDay, 
        startTime,
        endTime,
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

    //backend validation
    let errors = [];

    if (validator.isEmpty(sessionDay)) {
      errors.push({sessionDay:'Session must have a date'});
    }

    if (!validator.isDate(sessionDay)) {
      errors.push({sessionDay:'Session must be of format YYYY-MM-DD'});
    }

    // make this a time (version of type Date?)
    if (validator.isEmpty(startTime)) {
      errors.push({startTime:'Session must have a start time'});
    }

    // make this a time (version of type Date? then turn into string for database entry?)
    if (validator.isEmpty(endTime)) {
      errors.push({endTime:'Session must have an end time'});
    }


    if (validator.isEmpty(location)) {
      errors.push({location:'Session must have a location'});
    }

    if (validator.isEmpty(discipline)) {
      errors.push({discipline:'Session must have a discipline'});
    }

    if (!['SL', 'GS', 'SG', 'DH', 'Other'].includes(discipline)) {
      errors.push({discipline:'Must choose a valid discipline'});
    }

    if (validator.isEmpty(snowConditions)) {
      errors.push({snowConditions:'Session must have snow conditions'});
    }

    if (!['Soft', 'Compact-soft', 'Hard grippy', 'Ice', 'Wet', 'Salted', 'Non-groomed', 'Ball bearings', 'Powder'].includes(snowConditions)) {
      errors.push({snowConditions:'Must choose valid snow conditions'});
    }

    if (validator.isEmpty(visConditions)) {
      errors.push({visConditions:'Session must have a vis conditions'});
    }

    if (!['Sunny', 'Flat light', 'Fog', 'Snowing', 'Variable', 'Rain'].includes(visConditions)) {
      errors.push({visConditions:'Must choose valid snow conditions'});
    }

    if (validator.isEmpty(terrainType)) {
      errors.push({terrainType:'Session must have terrain type'});
    }

    if (!['Flat', 'Medium', 'Steep', 'Rolly', 'Mixed'].includes(terrainType)) {
      errors.push({terrainType:'Must choose valid snow conditions'});
    }

    // number validation
    // FOR NOW: isNumeric checks if a STRING is all numbers... doesn't check if type is a number
    // if (validator.isNumeric(numFreeskiRuns)) {
    //   errors.push({numFreeskiRuns:'Must be a number'});
    // }

    // if (validator.isNumeric(numDrillRuns)) {
    //   errors.push({numDrillRuns:'Must be a number'});
    // }

    // if (validator.isNumeric(numEducationalCourseRuns)) {
    //   errors.push({numEducationalCourseRuns:'Must be a number'});
    // }

    // if (validator.isNumeric(numGatesEducationalCourse)) {
    //   errors.push({numGatesEducationalCourse:'Must be a number'});
    // }

    // if (validator.isNumeric(numRaceTrainingCourseRuns)) {
    //   errors.push({numRaceTrainingCourseRuns:'Must be a number'});
    // }

    // if (validator.isNumeric(numGatesRaceTrainingCourse)) {
    //   errors.push({numGatesRaceTrainingCourse:'Must be a number'});
    // }

    // if (validator.isNumeric(numRaceRuns)) {
    //   errors.push({numRaceRuns:'Must be a number'});
    // }

    // if (validator.isNumeric(numGatesRace)) {
    //   errors.push({numGatesRace:'Must be a number'});
    // }


    // if any errors:
     if (errors.length > 0) {
      return res.status(400).json({ errors });
    }



    console.log("Values for update query:", [
        sessionId,
        sessionDay, 
        startTime,
        endTime,
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
        const result = await pool.query(queries.sessions.updateSession, [
            sessionId,
            sessionDay, 
            startTime,
            endTime,
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

        const attendanceDelete = await pool.query(queries.sessions.deleteAllAttendanceForSession, [sessionId]);

        if (attendanceDelete.rows.length === 0) {
            return res.status(404).json({ error: "No sessions found"} );
        }
        console.log('Sessions result rows:', attendanceDelete.rows);
        res.status(200).json(attendanceDelete.rows);


        const sessionDelete = await pool.query(queries.sessions.deleteSession, [sessionId]);

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

    if (validator.isEmpty(userFirstName)) {
      errors.push({userFirstName:'Must enter a first name'});
    }

    if (validator.isEmpty(userLastName)) {
      errors.push({userLastName: 'Must enter a last name'});
    }

    if (validator.isEmpty(email)) {
      errors.push({email: 'Must enter an email'});
    }

    if (validator.isEmpty(password)) {
      errors.push({password: 'Must enter a password'});
    }

    if (validator.isEmpty(password2)) {
      errors.push({password2: 'Must re-enter password'});
    }

    if (validator.isEmpty(status)) {
      errors.push({status: 'Must select status'});
    }

    // Password validation: 
    if (!validator.isLength(password, { min: 8 , max: 24})) {
      errors.push({password: "Password should be between 8-24 characters long"});
    }

    if (password != password2) {
        errors.push({password2: "Passwords do not match"})
    }

    if (!validator.isEmail(email)) {
        errors.push({email: 'Please enter a valid email address'});
    }

    // Display errors and restart registration attempts 
    // if (errors.length > 0) {
    //     res.render('registration', {errors}); 
    // }

    // Hashing password: 
    let hashed = await bcrypt.hash(password, 10);
    console.log("hashed: ", hashed);

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    
    try {
        // Check if user exists first
        const checkUserExists = await pool.query(queries.users.findUserByEmail, [email]);

        if (checkUserExists.rows.length > 0) {
            // console.error('User already exists!: ', error);
            res.status(500).send( {error: 'User already exists.'} );
        } else {
            const result = await pool.query(queries.users.createUser, [userFirstName, userLastName, email, hashed, status]);
            const newUser = result.rows[0]

            console.log("NEW USER: ", newUser);

            if (newUser.status == 'athlete') {
                const updated = await pool.query(queries.athletes.addUserIDtoAthlete, [newUser.user_id, userFirstName, userLastName]);
                console.log("Successfully updated with userID: ", updated);
            }

            res.status(201).json(newUser);
        }

    } catch (error) {
        console.error('Error creating user profile: ', error);
        res.status(500).send( {error: 'Server error creating user profile'} );
    } 
};

const createInvite = async (req, res) => {
  const { athleteId, role } = req.body;

  if (!role || !["athlete", "parent", "coach"].includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  try {
    // Generate a random token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Save the token in DB with role and optional athlete link
    await pool.query(queries.users.generateRegistrationToken, [athleteId, token, role, expiresAt]);

    // Construct the link to send
    const inviteLink = `${process.env.FRONTEND_URL}/register/${token}`;

    res.status(201).json({ inviteLink });

  } catch (err) {
    console.error("Error generating invite", err);
    res.status(500).json({ error: "Failed to generate invite link" });
  }
};

const approveInvite = async (req, res) => {
  const { token } = req.params;

  const result = await pool.query(queries.users.updateRegistrationToken, [token]);

  if (result.rowCount === 0) return res.status(404).json({ error: "Invalid or expired invite" });

  const invite = result.rows[0];
  res.json({
    athleteId: invite.athlete_id,
    role: invite.role
  });
};

module.exports = {
    getAllDataFromAthleteProfile,
    createAthleteProfile,
    updateAthleteProfile,
    deleteAthleteProfile,
    deleteAthleteAttendanceSingleSession,
    addAthletesToAttendance,
    createSession,
    getSessions,
    getPieChartData,
    updateSession,
    deleteSession,
    createUser,
    createInvite,
    approveInvite
}