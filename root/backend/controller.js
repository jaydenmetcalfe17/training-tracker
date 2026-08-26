const { session } = require('passport');

// to delete ////////////////
const pool = require('./config/database');
const queries = require('./queries.json');
////////////////////////////////


const prisma = require('./prismaClient');
const bcrypt = require('bcrypt');
const validator = require('validator');
const crypto = require('crypto');

//encryption here???


// Get all data from a specific athlete's profile
const getAllDataFromAthleteProfile = async (req, res) => {
    const { athleteId, userId } = req.query;

    try {
        let result;

        if (athleteId) {
            result = await prisma.athletes.findUnique({
                where: {
                    athlete_id: Number(athleteId)
                },
                include: {
                    team_memberships: {
                        include: {
                            team: {
                                include: {
                                    club: true
                                }
                            }
                        },
                        orderBy: {
                            start_date: 'desc'
                        }
                    }
                }
            });

        } else if (userId) {
            const user = await prisma.users.findUnique({
                where: {
                    user_id: Number(userId)
                },
                include: {
                    athlete: {
                        include: {
                            team_memberships: {
                                include: {
                                    team: {
                                        include: {
                                            club: true
                                        }
                                    }
                                },
                                orderBy: {
                                    start_date: 'desc'
                                }
                            }
                        }
                    }
                }
            });

            result = user?.athlete ?? null;

        } else {
            result = await prisma.athletes.findMany({
                include: {
                    team_memberships: {
                        include: {
                            team: {
                                include: {
                                    club: true
                                }
                            }
                        },
                        orderBy: {
                            start_date: 'desc'
                        }
                    }
                }
            });
        }

        if (
            !result ||
            (Array.isArray(result) && result.length === 0)
        ) {
            return res.status(404).json({
                error: "No athlete data found"
            });
        }

        return res.status(200).json(result);

    } catch (error) {
        console.error('Error getting athlete data:', error);

        return res.status(500).json({
            error: 'Server error retrieving athlete data'
        });
    }
};

// Create an athlete profile
const createAthleteProfile = async (req, res) => {
    const {
        athleteFirstName,
        athleteLastName,
        birthday,
        gender,
        acaId,
        fisId,
        ageGroup,
        teamId
    } = req.body;

    console.log(
        athleteFirstName,
        athleteLastName,
        birthday,
        gender,
        acaId,
        fisId,
        ageGroup,
        teamId
    );

    // Server-side input validation
    let errors = [];

    // First name
    if (!athleteFirstName || validator.isEmpty(athleteFirstName)) {
        errors.push({
            athleteFirstName: 'Must enter a first name'
        });
    }

    // Last name
    if (!athleteLastName || validator.isEmpty(athleteLastName)) {
        errors.push({
            athleteLastName: 'Must enter a last name'
        });
    }

    // Birthday
    if (!birthday) {
        errors.push({
            birthday: 'Must enter a birthday'
        });
    } else if (!validator.isDate(birthday)) {
        errors.push({
            birthday: 'Birthday must be format YYYY-MM-DD'
        });
    }

    // Gender
    if (!gender) {
        errors.push({
            gender: 'Must choose a gender'
        });
    } else if (!['Male', 'Female'].includes(gender)) {
        errors.push({
            gender: 'Gender can only be Male or Female'
        });
    }

    // Age group
    if (!ageGroup) {
        errors.push({
            ageGroup: 'Must choose an age group'
        });
    } else if (
        !['U10', 'U12', 'U14', 'U16', 'FIS'].includes(ageGroup)
    ) {
        errors.push({
            ageGroup: 'Must choose a valid age group'
        });
    }

    // Team
    if (!teamId) {
        errors.push({
            teamId: 'Must choose a team'
        });
    }

    // ACA ID
    if (
        acaId !== undefined &&
        acaId !== null &&
        acaId !== ''
    ) {
        if (!Number.isInteger(Number(acaId))) {
            errors.push({
                acaId: 'ACA ID must be a number'
            });
        }
    }

    // FIS ID
    if (
        fisId !== undefined &&
        fisId !== null &&
        fisId !== ''
    ) {
        if (!Number.isInteger(Number(fisId))) {
            errors.push({
                fisId: 'FIS ID must be a number'
            });
        }
    }

    // Return validation errors
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    try {
        const result = await prisma.$transaction(async (tx) => {

            // 1. Create the athlete
            const athlete = await tx.athletes.create({
                data: {
                    athlete_first_name: athleteFirstName,
                    athlete_last_name: athleteLastName,
                    birthday: new Date(birthday),
                    gender: gender,
                    aca_id: acaId
                        ? Number(acaId)
                        : null,
                    fis_id: fisId
                        ? Number(fisId)
                        : null,
                    age_group: ageGroup
                }
            });

            // 2. Create the athlete's initial team membership
            await tx.team_memberships.create({
                data: {
                    athlete_id: athlete.athlete_id,
                    team_id: Number(teamId),
                    start_date: new Date()
                }
            });

            // 3. Fetch the newly-created athlete with
            //    their complete team/club information
            const completeAthlete =
                await tx.athletes.findUnique({
                    where: {
                        athlete_id: athlete.athlete_id
                    },
                    include: {
                        team_memberships: {
                            include: {
                                team: {
                                    include: {
                                        club: true
                                    }
                                }
                            }
                        }
                    }
                });

            return completeAthlete;
        });

        console.log(
            "Created athlete:",
            result
        );

        return res.status(201).json(result);

    } catch (error) {
        console.error(
            'Error creating athlete profile:',
            error
        );

        return res.status(500).json({
            error: 'Server error creating athlete profile'
        });
    }
};

// edit an athlete's profile
const updateAthleteProfile = async (req, res) => {
    const athleteId = Number(req.params.athleteId);

    const {
        athleteFirstName,
        athleteLastName,
        birthday,
        gender,
        acaId,
        fisId,
        ageGroup,
        teamId
    } = req.body;

    console.log("Values for athlete update:", [
        athleteId,
        athleteFirstName,
        athleteLastName,
        birthday,
        gender,
        acaId,
        fisId,
        ageGroup,
        teamId
    ]);

    // Server-side input validation
    let errors = [];

    // Athlete ID
    if (!Number.isInteger(athleteId)) {
        errors.push({
            athleteId: "Invalid athlete ID"
        });
    }

    // First name
    if (!athleteFirstName || validator.isEmpty(athleteFirstName)) {
        errors.push({
            athleteFirstName: "Must enter a first name"
        });
    }

    // Last name
    if (!athleteLastName || validator.isEmpty(athleteLastName)) {
        errors.push({
            athleteLastName: "Must enter a last name"
        });
    }

    // Birthday
    if (!birthday) {
        errors.push({
            birthday: "Must enter a birthday"
        });
    } else if (!validator.isDate(birthday)) {
        errors.push({
            birthday: "Birthday must be format YYYY-MM-DD"
        });
    }

    // Gender
    if (!gender) {
        errors.push({
            gender: "Must choose a gender"
        });
    } else if (!["Male", "Female"].includes(gender)) {
        errors.push({
            gender: "Gender can only be Male or Female"
        });
    }

    // Age group
    if (!ageGroup) {
        errors.push({
            ageGroup: "Must choose an age group"
        });
    } else if (
        !["U10", "U12", "U14", "U16", "FIS"].includes(ageGroup)
    ) {
        errors.push({
            ageGroup: "Must choose a valid age group"
        });
    }

    // Team
    if (!teamId) {
        errors.push({
            teamId: "Must choose a team"
        });
    } else if (!Number.isInteger(Number(teamId))) {
        errors.push({
            teamId: "Team ID must be a number"
        });
    }

    // ACA ID
    if (
        acaId !== undefined &&
        acaId !== null &&
        acaId !== ""
    ) {
        if (!Number.isInteger(Number(acaId))) {
            errors.push({
                acaId: "ACA ID must be a number"
            });
        }
    }

    // FIS ID
    if (
        fisId !== undefined &&
        fisId !== null &&
        fisId !== ""
    ) {
        if (!Number.isInteger(Number(fisId))) {
            errors.push({
                fisId: "FIS ID must be a number"
            });
        }
    }

    // Return validation errors
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    try {
        const result = await prisma.$transaction(async (tx) => {

            // ----------------------------------------
            // 1. Update athlete information
            // ----------------------------------------

            const updatedAthlete =
                await tx.athletes.update({
                    where: {
                        athlete_id: athleteId
                    },

                    data: {
                        athlete_first_name:
                            athleteFirstName,

                        athlete_last_name:
                            athleteLastName,

                        birthday:
                            new Date(birthday),

                        gender:
                            gender,

                        aca_id:
                            acaId
                                ? Number(acaId)
                                : null,

                        fis_id:
                            fisId
                                ? Number(fisId)
                                : null,

                        age_group:
                            ageGroup
                    }
                });


            // ----------------------------------------
            // 2. Find current team membership
            // ----------------------------------------

            const currentMembership =
                await tx.team_memberships.findFirst({
                    where: {
                        athlete_id: athleteId,
                        end_date: null
                    },

                    orderBy: {
                        start_date: "desc"
                    }
                });


            // ----------------------------------------
            // 3. Check whether the team changed
            // ----------------------------------------

            if (
                !currentMembership ||
                currentMembership.team_id !== Number(teamId)
            ) {

                // End the old membership
                if (currentMembership) {
                    await tx.team_memberships.update({
                        where: {
                            team_membership_id:
                                currentMembership
                                    .team_membership_id
                        },

                        data: {
                            end_date: new Date()
                        }
                    });
                }


                // Create new membership
                await tx.team_memberships.create({
                    data: {
                        athlete_id: athleteId,

                        team_id:
                            Number(teamId),

                        start_date:
                            new Date(),

                        end_date:
                            null
                    }
                });
            }


            // ----------------------------------------
            // 4. Return athlete with memberships
            // ----------------------------------------

            return await tx.athletes.findUnique({
                where: {
                    athlete_id: athleteId
                },

                include: {
                    team_memberships: {
                        include: {
                            team: {
                                include: {
                                    club: true
                                }
                            }
                        }
                    }
                }
            });
        });


        console.log(
            "Updated athlete:",
            result
        );

        return res.status(200).json(result);

    } catch (error) {
        console.error(
            "Error updating athlete profile:",
            error
        );

        return res.status(500).json({
            error: "Server error updating athlete profile"
        });
    }
};

//delete an athlete's profile and everything related to them in attendance table
// Delete an athlete's profile and everything related to them
const deleteAthleteProfile = async (req, res) => {
    console.log("ENTERED to Delete athlete");
    console.log("PARAMS:", req.params);
    console.log("BODY:", req.body);

    const athleteId = Number(req.params.athleteId);

    // Validate athlete ID
    if (!Number.isInteger(athleteId)) {
        return res.status(400).json({
            error: "Invalid athlete ID"
        });
    }

    try {
        const result = await prisma.$transaction(async (tx) => {

            // ----------------------------------------
            // 1. Check that the athlete exists
            // ----------------------------------------

            const athlete =
                await tx.athletes.findUnique({
                    where: {
                        athlete_id: athleteId
                    }
                });

            if (!athlete) {
                return null;
            }


            // ----------------------------------------
            // 2. Delete all attendance records
            // ----------------------------------------

            await tx.attendance.deleteMany({
                where: {
                    athlete_id: athleteId
                }
            });


            // ----------------------------------------
            // 3. Delete all team memberships
            // ----------------------------------------

            await tx.team_memberships.deleteMany({
                where: {
                    athlete_id: athleteId
                }
            });


            // ----------------------------------------
            // 4. Delete the athlete
            // ----------------------------------------

            const deletedAthlete =
                await tx.athletes.delete({
                    where: {
                        athlete_id: athleteId
                    }
                });


            return deletedAthlete;
        });


        // Athlete didn't exist
        if (!result) {
            return res.status(404).json({
                error: "No athleteId found"
            });
        }


        console.log(
            "Deleted athlete:",
            result
        );

        return res.status(200).json(result);

    } catch (error) {
        console.error(
            "Error deleting athlete:",
            error
        );

        return res.status(500).json({
            error: "Server error deleting athlete"
        });
    }
};
 

// delete athlete from attendance of a single session 
const deleteAthleteAttendanceSingleSession = async (req, res) => {
    const athleteId = Number(req.params.athleteId);
    const sessionId = Number(req.params.sessionId);

    console.log("DELETE ATTENDANCE PARAMS:", {
        athleteId,
        sessionId
    });

    if (!Number.isInteger(athleteId)) {
        return res.status(400).json({
            error: "Invalid athlete ID"
        });
    }

    if (!Number.isInteger(sessionId)) {
        return res.status(400).json({
            error: "Invalid session ID"
        });
    }

    try {
        const attendance =
            await prisma.attendance.findUnique({
                where: {
                    athlete_id_session_id: {
                        athlete_id: athleteId,
                        session_id: sessionId
                    }
                }
            });

        console.log(
            "ATTENDANCE FOUND:",
            attendance
        );

        if (!attendance) {
            return res.status(404).json({
                error: "No attendance record found for this athlete and session",
                athleteId,
                sessionId
            });
        }

        const deletedAttendance =
            await prisma.attendance.delete({
                where: {
                    athlete_id_session_id: {
                        athlete_id: athleteId,
                        session_id: sessionId
                    }
                }
            });

        console.log(
            "DELETED ATTENDANCE:",
            deletedAttendance
        );

        return res.status(200).json(
            deletedAttendance
        );

    } catch (error) {
        console.error(
            "Error deleting athlete attendance:",
            error
        );

        return res.status(500).json({
            error: "Server error deleting athlete attendance"
        });
    }
};


const addAthletesToAttendance = async (req, res) => {
    const { athleteIds, sessionId } = req.body;

    const parsedSessionId = Number(sessionId);

    console.log(
        "Adding athletes to session:",
        parsedSessionId
    );

    console.log(
        "Athletes:",
        athleteIds
    );

    // ----------------------------------------
    // Validation
    // ----------------------------------------

    if (!Number.isInteger(parsedSessionId)) {
        return res.status(400).json({
            error: "Invalid session ID"
        });
    }

    if (!Array.isArray(athleteIds)) {
        return res.status(400).json({
            error: "athleteIds must be an array"
        });
    }

    // ----------------------------------------
    // Add attendance records
    // ----------------------------------------

    try {
        // Check which athletes are already attending
        const existingAttendance =
            await prisma.attendance.findMany({
                where: {
                    session_id: parsedSessionId,
                    athlete_id: {
                        in: athleteIds.map(
                            id => Number(id)
                        )
                    }
                },

                select: {
                    athlete_id: true
                }
            });

        const attendingIds =
            existingAttendance.map(
                attendance =>
                    attendance.athlete_id
            );

        // Only add athletes who aren't already attending this session
        const athletesToAdd =
            athleteIds
                .map(id => Number(id))
                .filter(
                    athleteId =>
                        !attendingIds.includes(
                            athleteId
                        )
                );

        // Create attendance records
        if (athletesToAdd.length > 0) {
            await prisma.attendance.createMany({
                data: athletesToAdd.map(
                    athleteId => ({
                        athlete_id: athleteId,
                        session_id:
                            parsedSessionId
                    })
                )
            });
        }

        console.log(
            "Athletes added to attendance:",
            athletesToAdd
        );

        return res.status(200).json({
            message:
                "Athletes added to attendance",
            addedAthleteIds:
                athletesToAdd
        });

    } catch (error) {
        console.error(
            "Error adding athletes to attendance:",
            error
        );

        return res.status(500).json({
            error:
                "Server error adding athletes to attendance"
        });
    }
};

const updateIndividualComment = async (req, res) => {
    const attendanceId = Number(req.params.attendanceId);
    const { individualComments } = req.body;

    console.log("Values for attendance comment update:", [
        attendanceId,
        individualComments
    ]);

    // Server-side input validation
    let errors = [];

    // Attendance ID
    if (!Number.isInteger(attendanceId)) {
        errors.push({
            attendanceId: "Invalid attendance ID"
        });
    }

    // Individual comments
    if (individualComments === undefined || individualComments === null) {
        errors.push({
            individualComments: "Comment is required"
        });
    }

    // Return validation errors
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    try {
        const updatedAttendance =
            await prisma.attendance.update({
                where: {
                    attendance_id: attendanceId
                },

                data: {
                    individual_comments:
                        individualComments
                }
            });

        console.log(
            "Updated attendance:",
            updatedAttendance
        );

        return res.status(200).json(
            updatedAttendance
        );

    } catch (error) {
        console.error(
            "Error updating attendance individual comment:",
            error
        );

        // Prisma P2025 = record wasn't found
        if (error.code === "P2025") {
            return res.status(404).json({
                error: "Attendance not found"
            });
        }

        return res.status(500).json({
            error:
                "Server error updating attendance individual comment"
        });
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
    
    const formatTime = (time) => time.length === (5 || 4) ? `${time}:00` : time;

    const formStartTime = formatTime(startTime);
    const formEndTime = formatTime(endTime);

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
    if (validator.isEmpty(formStartTime)) {
      errors.push({formStartTime:'Session must have a start time'});
    }

    // make this a time (version of type Date? then turn into string for database entry?)
    if (validator.isEmpty(formEndTime)) {
      errors.push({formEndTime:'Session must have an end time'});
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
            formStartTime,
            formEndTime,
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
        startDate,
        endDate,
        location,
        discipline,
        snowConditions,
        visConditions,
        terrainType
    } = req.query;



    try {
        const values = [
            athleteId,
            startDate || null,
            endDate || null,
            location || null,
            discipline || null,
            snowConditions || null,
            visConditions || null,
            terrainType || null
        ];

        console.log("THINGS TO FILTER: ", values);

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

  const {athleteId, column} = req.params;
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

     const formatTime = (time) => {
      return time.length === 5 || time.length === 4
        ? `${time}:00`
        : time;
      };

    const formStartTime = formatTime(startTime);
    const formEndTime = formatTime(endTime);

    //backend validation
    let errors = [];

    if (validator.isEmpty(sessionDay)) {
      errors.push({sessionDay:'Session must have a date'});
    }

    if (!validator.isDate(sessionDay)) {
      errors.push({sessionDay:'Session must be of format YYYY-MM-DD'});
    }

    // make this a time (version of type Date?)
    if (validator.isEmpty(formStartTime)) {
      errors.push({formStartTime:'Session must have a start time'});
    }

    // make this a time (version of type Date? then turn into string for database entry?)
    if (validator.isEmpty(formEndTime)) {
      errors.push({formEndTime:'Session must have an end time'});
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
        formStartTime,
        formEndTime,
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
            formStartTime,
            formEndTime,
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
    console.log("ENTERED to Delete session");

    const {sessionId} = req.params;

    try {

        const attendanceDelete = await pool.query(queries.sessions.deleteAllAttendanceForSession, [sessionId]);

        // if (attendanceDelete.rows.length === 0) {
        //     return res.status(404).json({ error: "No sessions found"} );
        // }
        // console.log('Sessions result rows:', attendanceDelete.rows);
        // res.status(200).json(attendanceDelete.rows);


        const sessionDelete = await pool.query(queries.sessions.deleteSession, [sessionId]);

        if (sessionDelete.rows.length === 0) {
            return res.status(404).json({ error: "No sessions found"} );
        }
        console.log('Deleted session: ', sessionDelete.rows);
        return res.status(200).json(sessionDelete.rows);


    } catch (error) {
        console.error('Error deleting session: ', error);
        res.status(500).send({error: 'Server error deleting session'} );
    }
};




// Create user profile
const createUser = async (req, res) => {
    const {userFirstName, userLastName, email, password, password2, status, athleteId } = req.body;
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
            res.status(400).send( {error: 'User already exists.'} );
        } else {
            const result = await pool.query(queries.users.createUser, [userFirstName, userLastName, email, hashed, status]);
            const newUser = result.rows[0]

            console.log("NEW USER: ", newUser);

            if (newUser.status == 'athlete' || newUser.status == 'parent') {
                const updated = await pool.query(queries.users.addAthleteIdToUser, [athleteId, newUser.user_id]);
                console.log("Successfully updated user with athleteId: ", updated);
            }

            res.status(201).json(newUser);
        }

    } catch (error) {
        console.error('Error creating user profile: ', error);
        res.status(500).send( {error: 'Server error creating user profile'} );
    } 
};

const createInvite = async (req, res) => {
  const { athleteId, role, currentURL } = req.body;

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
    const inviteLink = `${currentURL}/register/${token}`;

    res.status(201).json({ inviteLink });

  } catch (err) {
    console.error("Error generating invite", err);
    res.status(500).json({ error: "Failed to generate invite link" });
  }
};

const approveInvite = async (req, res) => {
  const { token } = req.params;

  const result = await pool.query(queries.users.updateRegistrationToken, [token]);

  if (result.rowCount === 0) return res.status(404).json({ error: "Cannot find invite via token" });

  const invite = result.rows[0];
  res.json({
    athleteId: invite.athlete_id,
    role: invite.role,
    used: invite.used,
    expiresAt: invite.expires_at
  });
};

const getClubs = async (req, res) => {
    try {
        const clubs = await prisma.clubs.findMany({
            orderBy: {
                name: 'asc'
            }
        });

        return res.status(200).json(clubs);

    } catch (error) {
        console.error('Error getting clubs:', error);

        return res.status(500).json({
            error: 'Server error retrieving clubs'
        });
    }
};


const getTeams = async (req, res) => {
    const { clubId } = req.query;

    try {
        let teams;

        if (clubId) {
            teams = await prisma.teams.findMany({
                where: {
                    club_id: Number(clubId)
                },
                orderBy: {
                    name: 'asc'
                }
            });
        } else {
            teams = await prisma.teams.findMany({
                orderBy: {
                    name: 'asc'
                }
            });
        }

        return res.status(200).json(teams);

    } catch (error) {
        console.error('Error getting teams:', error);

        return res.status(500).json({
            error: 'Server error retrieving teams'
        });
    }
};

module.exports = {
    getAllDataFromAthleteProfile,
    createAthleteProfile,
    updateAthleteProfile,
    deleteAthleteProfile,
    deleteAthleteAttendanceSingleSession,
    addAthletesToAttendance,
    updateIndividualComment,
    createSession,
    getSessions,
    getPieChartData,
    updateSession,
    deleteSession,
    createUser,
    createInvite,
    approveInvite,
    getClubs,
    getTeams
}