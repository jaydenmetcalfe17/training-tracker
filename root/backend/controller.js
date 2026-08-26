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

// add an athlete to the attendance list for a session
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

// update the athlete's individual comments in the attendance table for a specific session
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
        attendance
    } = req.body;

    console.log(
        sessionDay,
        location,
        discipline
    );

    console.log(
        "Athletes in attendance:",
        attendance
    );

    console.log("REQ.USER:", req.user);
    console.log("CREATED BY FROM BODY:", createdBy);

    // Format time
    const formatTime = (time) => {
        return time.length === 5 || time.length === 4
            ? `${time}:00`
            : time;
    };

    const formStartTime = formatTime(startTime);
    const formEndTime = formatTime(endTime);

    // Backend validation
    let errors = [];

    // Session day
    if (!sessionDay) {
        errors.push({
            sessionDay: "Session must have a date"
        });
    } else if (!validator.isDate(sessionDay)) {
        errors.push({
            sessionDay:
                "Session must be of format YYYY-MM-DD"
        });
    }

    // Start time
    if (!formStartTime) {
        errors.push({
            formStartTime:
                "Session must have a start time"
        });
    }

    // End time
    if (!formEndTime) {
        errors.push({
            formEndTime:
                "Session must have an end time"
        });
    }

    // Location
    if (!location) {
        errors.push({
            location:
                "Session must have a location"
        });
    }

    // Discipline
    if (!discipline) {
        errors.push({
            discipline:
                "Session must have a discipline"
        });
    } else if (
        !["SL", "GS", "SG", "DH", "Other"].includes(
            discipline
        )
    ) {
        errors.push({
            discipline:
                "Must choose a valid discipline"
        });
    }

    // Snow conditions
    if (!snowConditions) {
        errors.push({
            snowConditions:
                "Session must have snow conditions"
        });
    } else if (
        ![
            "Soft",
            "Compact-soft",
            "Hard grippy",
            "Ice",
            "Wet",
            "Salted",
            "Non-groomed",
            "Ball bearings",
            "Powder"
        ].includes(snowConditions)
    ) {
        errors.push({
            snowConditions:
                "Must choose valid snow conditions"
        });
    }

    // Visibility conditions
    if (!visConditions) {
        errors.push({
            visConditions:
                "Session must have visibility conditions"
        });
    } else if (
        ![
            "Sunny",
            "Flat light",
            "Fog",
            "Snowing",
            "Variable",
            "Rain"
        ].includes(visConditions)
    ) {
        errors.push({
            visConditions:
                "Must choose valid visibility conditions"
        });
    }

    // Terrain type
    if (!terrainType) {
        errors.push({
            terrainType:
                "Session must have terrain type"
        });
    } else if (
        ![
            "Flat",
            "Medium",
            "Steep",
            "Rolly",
            "Mixed"
        ].includes(terrainType)
    ) {
        errors.push({
            terrainType:
                "Must choose valid terrain type"
        });
    }

    // Attendance
    if (!Array.isArray(attendance)) {
        errors.push({
            attendance:
                "Attendance must be an array"
        });
    }

    // Return validation errors
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    try {
        const result = await prisma.$transaction(
            async (tx) => {

                // ----------------------------------------
                // 1. Create session
                // ----------------------------------------

                const newSession =
                    await tx.sessions.create({
                        data: {
                            session_day:
                                new Date(sessionDay),

                            start_time:
                                new Date(`1970-01-01T${formStartTime}`),

                            end_time:
                                new Date(`1970-01-01T${formEndTime}`),

                            location:
                                location,

                            discipline:
                                discipline,

                            snow_conditions:
                                snowConditions,

                            vis_conditions:
                                visConditions,

                            terrain_type:
                                terrainType,

                            num_freeski_runs:
                                numFreeskiRuns != null
                                    ? Number(numFreeskiRuns)
                                    : null,

                            num_drill_runs:
                                numDrillRuns != null
                                    ? Number(numDrillRuns)
                                    : null,

                            num_educational_course_runs:
                                numEducationalCourseRuns != null
                                    ? Number(
                                        numEducationalCourseRuns
                                    )
                                    : null,

                            num_gates_educational_course:
                                numGatesEducationalCourse != null
                                    ? Number(
                                        numGatesEducationalCourse
                                    )
                                    : null,

                            num_race_training_course_runs:
                                numRaceTrainingCourseRuns != null
                                    ? Number(
                                        numRaceTrainingCourseRuns
                                    )
                                    : null,

                            num_gates_race_training_course:
                                numGatesRaceTrainingCourse != null
                                    ? Number(
                                        numGatesRaceTrainingCourse
                                    )
                                    : null,

                            num_race_runs:
                                numRaceRuns != null
                                    ? Number(numRaceRuns)
                                    : null,

                            num_gates_race:
                                numGatesRace != null
                                    ? Number(numGatesRace)
                                    : null,

                            general_comments:
                                generalComments || null,

                            created_by:
                                createdBy
                                    ? Number(createdBy)
                                    : null
                        }
                    });

                console.log(
                    "Created session:",
                    newSession.session_id
                );

                // ----------------------------------------
                // 2. Add athletes to attendance
                // ----------------------------------------

                if (attendance.length > 0) {
                    await tx.attendance.createMany({
                        data: attendance.map(
                            (athleteId) => ({
                                athlete_id:
                                    Number(athleteId),

                                session_id:
                                    newSession.session_id
                            })
                        ),
                        skipDuplicates: true
                    });
                }

                // ----------------------------------------
                // 3. Return created session
                // ----------------------------------------

                return newSession;
            }
        );

        console.log(
            "Created session:",
            result
        );

        return res.status(201).json(result);

    } catch (error) {
        console.error(
            "Error creating session:",
            error
        );

        return res.status(500).json({
            error: "Server error creating session"
        });
    }
};

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
        let sessions;

        // ----------------------------------------
        // 1. Get sessions
        // ----------------------------------------

        if (sessionId) {

            // Get one specific session
            sessions = await prisma.sessions.findUnique({
                where: {
                    session_id: Number(sessionId)
                },

                include: {
                    attendance: {
                        include: {
                            athlete: {
                                include: {
                                    team_memberships: {
                                        where: {
                                            end_date: null
                                        },

                                        orderBy: {
                                            start_date: "desc"
                                        },

                                        take: 1,

                                        include: {
                                            team: {
                                                include: {
                                                    club: true
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            if (!sessions) {
                return res.status(404).json({
                    error: "No sessions found"
                });
            }

            sessions = [sessions];

        } else {

            // ----------------------------------------
            // 2. Build session filters
            // ----------------------------------------

            const where = {};

            if (startDate || endDate) {
                where.session_day = {};

                if (startDate) {
                    where.session_day.gte =
                        new Date(startDate);
                }

                if (endDate) {
                    where.session_day.lte =
                        new Date(endDate);
                }
            }

            if (location) {
                where.location = {
                    contains: location,
                    mode: "insensitive"
                };
            }

            if (discipline) {
                where.discipline = discipline;
            }

            if (snowConditions) {
                where.snow_conditions =
                    snowConditions;
            }

            if (visConditions) {
                where.vis_conditions =
                    visConditions;
            }

            if (terrainType) {
                where.terrain_type =
                    terrainType;
            }

            // If filtering by athlete, only return sessions where that athlete has attendance.
            if (athleteId) {
                where.attendance = {
                    some: {
                        athlete_id: Number(athleteId)
                    }
                };
            }

            // ----------------------------------------
            // 3. Get matching sessions + attendance
            // ----------------------------------------

            sessions = await prisma.sessions.findMany({
                where,

                orderBy: {
                    session_day: "desc"
                },

                include: {
                    attendance: {
                        include: {
                            athlete: {
                                include: {
                                    team_memberships: {
                                        where: {
                                            end_date: null
                                        },

                                        orderBy: {
                                            start_date: "desc"
                                        },

                                        take: 1,

                                        include: {
                                            team: {
                                                include: {
                                                    club: true
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });
        }

        if (sessions.length === 0) {
            return res.status(404).json({
                error: "No sessions found"
            });
        }

        // -------------------------------------------------------------
        // 4. Convert Prisma result to existing frontend response shape
        // ----------------------------------------------------------

        const sessionsWithAttendance =
          sessions.map((session) => ({
              session_id:
                  session.session_id,

              session_day:
                  session.session_day,

              start_time:
                session.start_time
                    ? session.start_time.toISOString().slice(11, 16)
                    : null,

            end_time:
                session.end_time
                    ? session.end_time.toISOString().slice(11, 16)
                    : null,

              location:
                  session.location,

              discipline:
                  session.discipline,

              snow_conditions:
                  session.snow_conditions,

              vis_conditions:
                  session.vis_conditions,

              terrain_type:
                  session.terrain_type,

              num_freeski_runs:
                  session.num_freeski_runs,

              num_drill_runs:
                  session.num_drill_runs,

              num_educational_course_runs:
                  session.num_educational_course_runs,

              num_gates_educational_course:
                  session.num_gates_educational_course,

              num_race_training_course_runs:
                  session.num_race_training_course_runs,

              num_gates_race_training_course:
                  session.num_gates_race_training_course,

              num_race_runs:
                  session.num_race_runs,

              num_gates_race:
                  session.num_gates_race,

              general_comments:
                  session.general_comments,

              created_by:
                  session.created_by,

              attendance:
                session.attendance.map((att) => {
                    const membership =
                        att.athlete.team_memberships[0];

                    return {
                        attendanceId:
                            att.attendance_id,

                        freeskiRuns:
                            att.freeski_runs,

                        drillRuns:
                            att.drill_runs,

                        educationalCourseRuns:
                            att.educational_course_runs,

                        raceTrainingCourseRuns:
                            att.race_training_course_runs,

                        raceRuns:
                            att.race_runs,

                        individualComments:
                            att.individual_comments,

                        athlete: {
                            athleteId:
                                att.athlete.athlete_id,

                            athleteFirstName:
                                att.athlete.athlete_first_name,

                            athleteLastName:
                                att.athlete.athlete_last_name,

                            birthday:
                                att.athlete.birthday,

                            gender:
                                att.athlete.gender,

                            userId:
                                att.athlete.users?.[0]
                                    ?.user_id ?? null,

                            team:
                                membership?.team?.name
                                    ?? null,

                            club:
                                membership?.team?.club?.name
                                    ?? null,

                            ageGroup:
                                att.athlete.age_group
                        }
                    };
                })
          }));

        return res.status(200).json(
            sessionsWithAttendance
        );

    } catch (error) {

        console.error(
            "Error getting sessions:",
            error
        );

        return res.status(500).json({
            error:
                "Server error retrieving sessions"
        });
    }
};

// load the data used to create pie charts for the dashboard page
const getPieChartData = async (req, res) => {

    const { athleteId, column } = req.params;

    console.log(
        "athleteID to search:",
        athleteId
    );

    const columnMap = {
        sessionDay: "session_day",
        location: "location",
        discipline: "discipline",
        snowConditions: "snow_conditions",
        visConditions: "vis_conditions",
        terrainType: "terrain_type"
    };

    // ----------------------------------------
    // Validate column
    // ----------------------------------------

    if (
        column !== "runColumn" &&
        !columnMap[column]
    ) {
        return res.status(400).json({
            error: "Invalid column"
        });
    }

    try {

        // ----------------------------------------
        // Run column
        // ----------------------------------------

        if (column === "runColumn") {

            // If an athleteId is provided,
            // get run totals from that athlete's attendance.
            if (athleteId) {

                const attendance =
                    await prisma.attendance.findMany({
                        where: {
                            athlete_id: Number(athleteId)
                        },

                        select: {
                            freeski_runs: true,
                            drill_runs: true,
                            educational_course_runs: true,
                            race_training_course_runs: true,
                            race_runs: true
                        }
                    });

                if (attendance.length === 0) {
                    return res.status(404).json({
                        error: "No data found"
                    });
                }

                const labels = [
                    "Freeski Runs",
                    "Drill Runs",
                    "Educational Course Runs",
                    "Race Training Course Runs",
                    "Race Runs"
                ];

                const values = [
                    attendance.reduce(
                        (sum, row) =>
                            sum + (row.freeski_runs || 0),
                        0
                    ),

                    attendance.reduce(
                        (sum, row) =>
                            sum + (row.drill_runs || 0),
                        0
                    ),

                    attendance.reduce(
                        (sum, row) =>
                            sum + (row.educational_course_runs || 0),
                        0
                    ),

                    attendance.reduce(
                        (sum, row) =>
                            sum + (row.race_training_course_runs || 0),
                        0
                    ),

                    attendance.reduce(
                        (sum, row) =>
                            sum + (row.race_runs || 0),
                        0
                    )
                ];

                return res.status(200).json({
                    labels,
                    values
                });
            }

            // If there is NO athleteId,
            // use the run totals stored in the sessions table.

            const sessions =
                await prisma.sessions.findMany({
                    select: {
                        num_freeski_runs: true,
                        num_drill_runs: true,
                        num_educational_course_runs: true,
                        num_race_training_course_runs: true,
                        num_race_runs: true
                    }
                });

            if (sessions.length === 0) {
                return res.status(404).json({
                    error: "No data found"
                });
            }

            const labels = [
                "Freeski Runs",
                "Drill Runs",
                "Educational Course Runs",
                "Race Training Course Runs",
                "Race Runs"
            ];

            const values = [
                sessions.reduce(
                    (sum, session) =>
                        sum + (session.num_freeski_runs || 0),
                    0
                ),

                sessions.reduce(
                    (sum, session) =>
                        sum + (session.num_drill_runs || 0),
                    0
                ),

                sessions.reduce(
                    (sum, session) =>
                        sum + (session.num_educational_course_runs || 0),
                    0
                ),

                sessions.reduce(
                    (sum, session) =>
                        sum + (session.num_race_training_course_runs || 0),
                    0
                ),

                sessions.reduce(
                    (sum, session) =>
                        sum + (session.num_race_runs || 0),
                    0
                )
            ];

            return res.status(200).json({
                labels,
                values
            });
        }

        // ----------------------------------------
        // Session columns
        // ----------------------------------------

        const dbColumn = columnMap[column];

        const sessions =
            await prisma.sessions.findMany({
                where: athleteId
                    ? {
                        attendance: {
                            some: {
                                athlete_id:
                                    Number(athleteId)
                            }
                        }
                    }
                    : {},

                select: {
                    session_day: true,
                    location: true,
                    discipline: true,
                    snow_conditions: true,
                    vis_conditions: true,
                    terrain_type: true
                }
            });

        if (sessions.length === 0) {
            return res.status(404).json({
                error: "No data found"
            });
        }

        const counts = {};

        for (const session of sessions) {

            let value = session[dbColumn];

            if (
                column === "sessionDay" &&
                value
            ) {
                value =
                    value
                        .toISOString()
                        .split("T")[0];
            }

            if (
                value !== null &&
                value !== undefined
            ) {
                counts[value] =
                    (counts[value] || 0) + 1;
            }
        }

        const labels =
            Object.keys(counts);

        const values =
            Object.values(counts);

        if (labels.length === 0) {
            return res.status(404).json({
                error: "No data found"
            });
        }

        return res.status(200).json({
            labels,
            values
        });

    } catch (error) {

        console.error(
            "Error getting data from sessions:",
            error
        );

        return res.status(500).json({
            error:
                "Server error retrieving sessions"
        });
    }
};

// Update a session
const updateSession = async (req, res) => {
    const sessionId = Number(req.params.sessionId);

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

    // ----------------------------------------
    // Backend validation
    // ----------------------------------------

    let errors = [];

    if (validator.isEmpty(sessionDay)) {
        errors.push({
            sessionDay: "Session must have a date"
        });
    }

    if (!validator.isDate(sessionDay)) {
        errors.push({
            sessionDay: "Session must be of format YYYY-MM-DD"
        });
    }

    if (validator.isEmpty(formStartTime)) {
        errors.push({
            formStartTime: "Session must have a start time"
        });
    }

    if (validator.isEmpty(formEndTime)) {
        errors.push({
            formEndTime: "Session must have an end time"
        });
    }

    if (validator.isEmpty(location)) {
        errors.push({
            location: "Session must have a location"
        });
    }

    if (validator.isEmpty(discipline)) {
        errors.push({
            discipline: "Session must have a discipline"
        });
    }

    if (!["SL", "GS", "SG", "DH", "Other"].includes(discipline)) {
        errors.push({
            discipline: "Must choose a valid discipline"
        });
    }

    if (validator.isEmpty(snowConditions)) {
        errors.push({
            snowConditions: "Session must have snow conditions"
        });
    }

    if (![
        "Soft",
        "Compact-soft",
        "Hard grippy",
        "Ice",
        "Wet",
        "Salted",
        "Non-groomed",
        "Ball bearings",
        "Powder"
    ].includes(snowConditions)) {
        errors.push({
            snowConditions: "Must choose valid snow conditions"
        });
    }

    if (validator.isEmpty(visConditions)) {
        errors.push({
            visConditions: "Session must have a vis conditions"
        });
    }

    if (![
        "Sunny",
        "Flat light",
        "Fog",
        "Snowing",
        "Variable",
        "Rain"
    ].includes(visConditions)) {
        errors.push({
            visConditions: "Must choose valid vis conditions"
        });
    }

    if (validator.isEmpty(terrainType)) {
        errors.push({
            terrainType: "Session must have terrain type"
        });
    }

    if (![
        "Flat",
        "Medium",
        "Steep",
        "Rolly",
        "Mixed"
    ].includes(terrainType)) {
        errors.push({
            terrainType: "Must choose valid terrain type"
        });
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    // ----------------------------------------
    // Update session
    // ----------------------------------------

    try {
        const updatedSession =
            await prisma.sessions.update({
                where: {
                    session_id: sessionId
                },

                data: {
                    session_day:
                        new Date(sessionDay),

                    start_time:
                        new Date(`1970-01-01T${formStartTime}`),

                    end_time:
                        new Date(`1970-01-01T${formEndTime}`),

                    location,
                    discipline,

                    snow_conditions:
                        snowConditions,

                    vis_conditions:
                        visConditions,

                    terrain_type:
                        terrainType,

                    num_freeski_runs:
                        numFreeskiRuns,

                    num_drill_runs:
                        numDrillRuns,

                    num_educational_course_runs:
                        numEducationalCourseRuns,

                    num_gates_educational_course:
                        numGatesEducationalCourse,

                    num_race_training_course_runs:
                        numRaceTrainingCourseRuns,

                    num_gates_race_training_course:
                        numGatesRaceTrainingCourse,

                    num_race_runs:
                        numRaceRuns,

                    num_gates_race:
                        numGatesRace,

                    general_comments:
                        generalComments
                }
            });

        console.log(
            "Updated session:",
            updatedSession
        );

        return res.status(200).json({
            ...updatedSession,
            start_time: updatedSession.start_time
                ? updatedSession.start_time.toISOString().slice(11, 16)
                : null,
            end_time: updatedSession.end_time
                ? updatedSession.end_time.toISOString().slice(11, 16)
                : null
        });

    } catch (error) {

        console.error(
            "Error updating session:",
            error
        );

        if (error.code === "P2025") {
            return res.status(404).json({
                error: "No sessions found"
            });
        }

        return res.status(500).json({
            error:
                "Server error updating session"
        });
    }
};

// Delete a session
const deleteSession = async (req, res) => {
    console.log("ENTERED to Delete session");

    const sessionId = Number(req.params.sessionId);

    try {

        const deletedSession =
            await prisma.sessions.delete({
                where: {
                    session_id: sessionId
                }
            });

        console.log(
            "Deleted session:",
            deletedSession
        );

        return res.status(200).json(
            deletedSession
        );

    } catch (error) {

        console.error(
            "Error deleting session:",
            error
        );

        if (error.code === "P2025") {
            return res.status(404).json({
                error: "No sessions found"
            });
        }

        return res.status(500).json({
            error:
                "Server error deleting session"
        });
    }
};

// Create user profile
const createUser = async (req, res) => {
    const {
        userFirstName,
        userLastName,
        email,
        password,
        password2,
        status,
        athleteId
    } = req.body;

    console.log(
        userFirstName,
        userLastName,
        email,
        password,
        status
    );

    let errors = [];

    // ----------------------------------------
    // Validation
    // ----------------------------------------

    if (!userFirstName) {
        errors.push({
            userFirstName: "Must enter a first name"
        });
    }

    if (!userLastName) {
        errors.push({
            userLastName: "Must enter a last name"
        });
    }

    if (!email) {
        errors.push({
            email: "Must enter an email"
        });
    }

    if (!password) {
        errors.push({
            password: "Must enter a password"
        });
    }

    if (!password2) {
        errors.push({
            password2: "Must re-enter password"
        });
    }

    if (!status) {
        errors.push({
            status: "Must select status"
        });
    }

    // ----------------------------------------
    // Password validation
    // ----------------------------------------

    if (
        password &&
        !validator.isLength(password, {
            min: 8,
            max: 24
        })
    ) {
        errors.push({
            password:
                "Password should be between 8-24 characters long"
        });
    }

    if (
        password &&
        password2 &&
        password !== password2
    ) {
        errors.push({
            password2:
                "Passwords do not match"
        });
    }

    // ----------------------------------------
    // Email validation
    // ----------------------------------------

    if (
        email &&
        !validator.isEmail(email)
    ) {
        errors.push({
            email:
                "Please enter a valid email address"
        });
    }

    // ----------------------------------------
    // Status validation
    // ----------------------------------------

    if (
        status &&
        !["coach", "athlete", "parent"].includes(status)
    ) {
        errors.push({
            status:
                "Must choose a valid status"
        });
    }

    // ----------------------------------------
    // Return validation errors
    // ----------------------------------------

    if (errors.length > 0) {
        return res.status(400).json({
            errors
        });
    }

    try {

        // ----------------------------------------
        // 1. Check if user already exists
        // ----------------------------------------

        const existingUser =
            await prisma.users.findUnique({
                where: {
                    email: email
                }
            });

        if (existingUser) {
            return res.status(400).json({
                error: "User already exists."
            });
        }

        // ----------------------------------------
        // 2. Hash password
        // ----------------------------------------

        const hashed =
            await bcrypt.hash(password, 10);

        console.log(
            "Hashed password:",
            hashed
        );

        // ----------------------------------------
        // 3. Create user
        // ----------------------------------------

        const newUser =
            await prisma.users.create({
                data: {
                    first_name:
                        userFirstName,

                    last_name:
                        userLastName,

                    email:
                        email,

                    password:
                        hashed,

                    status:
                        status,

                    athlete_id:
                        athleteId != null
                            ? Number(athleteId)
                            : null
                }
            });

        console.log(
            "NEW USER:",
            newUser
        );

        // ----------------------------------------
        // 4. Return frontend shape
        // ----------------------------------------

        return res.status(201).json({
            userId:
                newUser.user_id,

            userFirstName:
                newUser.first_name,

            userLastName:
                newUser.last_name,

            email:
                newUser.email,

            status:
                newUser.status,

            athleteId:
                newUser.athlete_id
        });

    } catch (error) {

        console.error(
            "Error creating user profile:",
            error
        );

        return res.status(500).json({
            error:
                "Server error creating user profile"
        });
    }
};

// coach can create an invite link for another coach, parent or athlete to register with the system
const createInvite = async (req, res) => {
    const { athleteId, role, currentURL } = req.body;

    if (!role || !["athlete", "parent", "coach"].includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
    }

    try {
        // Generate random token
        const token = crypto.randomBytes(32).toString("hex");

        // Expires in 7 days
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const invite = await prisma.invites.create({
            data: {
                athlete_id:
                    athleteId != null
                        ? Number(athleteId)
                        : null,

                token: token,

                role: role,

                expires_at: expiresAt,

                used: false
            }
        });

        const inviteLink =
            `${currentURL}/register/${invite.token}`;

        return res.status(201).json({
            inviteLink
        });

    } catch (error) {
        console.error(
            "Error generating invite:",
            error
        );

        return res.status(500).json({
            error: "Failed to generate invite link"
        });
    }
};

// ensures that the invite link is valid and returns the role and athleteId if applicable
const approveInvite = async (req, res) => {
    const { token } = req.params;

    try {
        const invite = await prisma.invites.findUnique({
            where: {
                token: token
            }
        });

        // Invite doesn't exist
        if (!invite) {
            return res.status(404).json({
                error: "Invalid invite link."
            });
        }

        // Invite has already been used
        if (invite.used) {
            return res.status(400).json({
                error: "This invite link has already been used."
            });
        }

        // Invite has expired
        if (invite.expires_at < new Date()) {
            return res.status(400).json({
                error: "This invite link has expired."
            });
        }

        // Invite is valid
        return res.status(200).json({
            athleteId: invite.athlete_id,
            role: invite.role,
            used: invite.used,
            expiresAt: invite.expires_at
        });

    } catch (error) {
        console.error(
            "Error approving invite:",
            error
        );

        return res.status(500).json({
            error: "Server error validating invite"
        });
    }
};

// get all clubs in the database, ordered by name
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

// get all teams in the database, optionally filtered by clubId, ordered by name
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