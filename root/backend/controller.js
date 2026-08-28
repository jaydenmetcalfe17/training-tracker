const { session } = require('passport');

const prisma = require('./prismaClient');
const bcrypt = require('bcrypt');
const validator = require('validator');
const crypto = require('crypto');

//encryption here???


// Get all data from a specific athlete's profile
const getAllDataFromAthleteProfile = async (req, res) => {

    const {
        athleteId,
        userId,
        parentUserId,
        teamId,
        clubId,
        acaId,
        fisId
    } = req.query;


    try {

        let result;


        // ----------------------------------------
        // Validate IDs
        // ----------------------------------------

        let parsedTeamId = null;
        let parsedClubId = null;
        let parsedAthleteId = null;
        let parsedUserId = null;
        let parsedParentUserId = null;
        let parsedAcaId = null;
        let parsedFisId = null;


        if (teamId) {

            parsedTeamId =
                Number(teamId);

            if (
                !Number.isInteger(
                    parsedTeamId
                )
            ) {

                return res.status(400).json({
                    error: "Invalid teamId"
                });
            }
        }


        if (clubId) {

            parsedClubId =
                Number(clubId);

            if (
                !Number.isInteger(
                    parsedClubId
                )
            ) {

                return res.status(400).json({
                    error: "Invalid clubId"
                });
            }
        }


        if (athleteId) {

            parsedAthleteId =
                Number(athleteId);

            if (
                !Number.isInteger(
                    parsedAthleteId
                )
            ) {

                return res.status(400).json({
                    error: "Invalid athleteId"
                });
            }
        }


        if (userId) {

            parsedUserId =
                Number(userId);

            if (
                !Number.isInteger(
                    parsedUserId
                )
            ) {

                return res.status(400).json({
                    error: "Invalid userId"
                });
            }
        }


        if (parentUserId) {

            parsedParentUserId =
                Number(parentUserId);

            if (
                !Number.isInteger(
                    parsedParentUserId
                )
            ) {

                return res.status(400).json({
                    error: "Invalid parentUserId"
                });
            }
        }


        if (
            acaId !== undefined &&
            acaId !== null &&
            acaId !== ""
        ) {

            parsedAcaId =
                Number(acaId);

            if (
                !Number.isInteger(
                    parsedAcaId
                )
            ) {

                return res.status(400).json({
                    error: "Invalid ACA ID"
                });
            }
        }


        if (
            fisId !== undefined &&
            fisId !== null &&
            fisId !== ""
        ) {

            parsedFisId =
                Number(fisId);

            if (
                !Number.isInteger(
                    parsedFisId
                )
            ) {

                return res.status(400).json({
                    error: "Invalid FIS ID"
                });
            }
        }


        // ----------------------------------------
        // Common membership include
        // ----------------------------------------

        const membershipInclude = {

            where: {
                end_date: null
            },

            orderBy: {
                start_date: "desc"
            },

            include: {

                team: {
                    include: {
                        club: true
                    }
                }
            }
        };


        // ----------------------------------------
        // Search by ACA ID
        // ----------------------------------------

        if (parsedAcaId !== null) {

            result =
                await prisma.athletes.findUnique({

                    where: {
                        aca_id:
                            parsedAcaId
                    },

                    include: {
                        team_memberships:
                            membershipInclude
                    }
                });


        // ----------------------------------------
        // Search by FIS ID
        // ----------------------------------------

        } else if (
            parsedFisId !== null
        ) {

            result =
                await prisma.athletes.findUnique({

                    where: {
                        fis_id:
                            parsedFisId
                    },

                    include: {
                        team_memberships:
                            membershipInclude
                    }
                });


        // ----------------------------------------
        // Get athletes belonging to a team
        // ----------------------------------------

        } else if (
            parsedTeamId !== null
        ) {

            const teamWhere = {

                team_id:
                    parsedTeamId,

                end_date:
                    null
            };


            // If clubId is also supplied,
            // make sure the team belongs
            // to that club.

            if (
                parsedClubId !== null
            ) {

                teamWhere.team = {
                    club_id:
                        parsedClubId
                };
            }


            result =
                await prisma.athletes.findMany({

                    where: {

                        team_memberships: {

                            some:
                                teamWhere
                        }
                    },

                    include: {

                        team_memberships:
                            membershipInclude
                    }
                });


        // ----------------------------------------
        // Get athletes belonging to a club
        // ----------------------------------------

        } else if (
            parsedClubId !== null
        ) {

            result =
                await prisma.athletes.findMany({

                    where: {

                        team_memberships: {

                            some: {

                                team: {

                                    club_id:
                                        parsedClubId
                                },

                                end_date:
                                    null
                            }
                        }
                    },

                    include: {

                        team_memberships:
                            membershipInclude
                    }
                });


        // ----------------------------------------
        // Get one athlete by athleteId
        // ----------------------------------------

        } else if (
            parsedAthleteId !== null
        ) {

            result =
                await prisma.athletes.findUnique({

                    where: {

                        athlete_id:
                            parsedAthleteId
                    },

                    include: {

                        team_memberships:
                            membershipInclude
                    }
                });


        // ----------------------------------------
        // Get athletes associated with parent user
        // ----------------------------------------

        } else if (
            parsedParentUserId !== null
        ) {

            result =
                await prisma.athletes.findMany({

                    where: {

                        parents: {

                            some: {

                                user_id:
                                    parsedParentUserId
                            }
                        }
                    },

                    include: {

                        team_memberships:
                            membershipInclude
                    }
                });


        // ----------------------------------------
        // Get athlete associated with user
        // ----------------------------------------

        } else if (
            parsedUserId !== null
        ) {

            const user =
                await prisma.users.findUnique({

                    where: {

                        user_id:
                            parsedUserId
                    },

                    include: {

                        athlete: {

                            include: {

                                team_memberships:
                                    membershipInclude
                            }
                        }
                    }
                });


            result =
                user?.athlete ?? null;


        // ----------------------------------------
        // Get all athletes
        // ----------------------------------------

        } else {

            result =
                await prisma.athletes.findMany({

                    include: {

                        team_memberships:
                            membershipInclude
                    }
                });
        }


        // ----------------------------------------
        // No results
        // ----------------------------------------

        const isListQuery =
            parsedTeamId !== null ||
            parsedClubId !== null ||
            parsedParentUserId !== null ||
            (
                parsedAcaId === null &&
                parsedFisId === null &&
                parsedAthleteId === null &&
                parsedParentUserId === null &&
                parsedUserId === null
            );

        if (
            !result ||
            (Array.isArray(result) && result.length === 0)
        ) {
            if (isListQuery) {
                return res.status(200).json([]);
            }

            return res.status(404).json({
                error: "No athlete data found"
            });
        }

        return res.status(200).json(result);


    } catch (error) {

        console.error(
            "Error getting athlete data:",
            error
        );


        return res.status(500).json({

            error:
                "Server error retrieving athlete data"
        });
    }
};

// Create an athlete profile OR add an existing athlete to a team
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


    // ----------------------------------------
    // Validation
    // ----------------------------------------

    let errors = [];


    if (
        !athleteFirstName ||
        validator.isEmpty(
            athleteFirstName
        )
    ) {

        errors.push({
            athleteFirstName:
                "Must enter a first name"
        });
    }


    if (
        !athleteLastName ||
        validator.isEmpty(
            athleteLastName
        )
    ) {

        errors.push({
            athleteLastName:
                "Must enter a last name"
        });
    }


    if (!birthday) {

        errors.push({
            birthday:
                "Must enter a birthday"
        });

    } else if (
        !validator.isDate(
            birthday
        )
    ) {

        errors.push({
            birthday:
                "Birthday must be format YYYY-MM-DD"
        });
    }


    if (!gender) {

        errors.push({
            gender:
                "Must choose a gender"
        });

    } else if (
        ![
            "Male",
            "Female"
        ].includes(gender)
    ) {

        errors.push({
            gender:
                "Gender can only be Male or Female"
        });
    }


    if (!teamId) {

        errors.push({
            teamId:
                "Must choose a team"
        });
    }


    if (
        acaId !== undefined &&
        acaId !== null &&
        acaId !== ""
    ) {

        if (
            !Number.isInteger(
                Number(acaId)
            )
        ) {

            errors.push({
                acaId:
                    "ACA ID must be a number"
            });
        }
    }


    if (
        fisId !== undefined &&
        fisId !== null &&
        fisId !== ""
    ) {

        if (
            !Number.isInteger(
                Number(fisId)
            )
        ) {

            errors.push({
                fisId:
                    "FIS ID must be a number"
            });
        }
    }


    if (
        ageGroup &&
        ![
            "U10",
            "U12",
            "U14",
            "U16",
            "FIS"
        ].includes(ageGroup)
    ) {

        errors.push({
            ageGroup:
                "Must choose a valid age group"
        });
    }


    if (errors.length > 0) {

        return res.status(400).json({
            errors
        });
    }


    try {

        const parsedTeamId =
            Number(teamId);

        const parsedAcaId =
            acaId !== undefined &&
            acaId !== null &&
            acaId !== ""
                ? Number(acaId)
                : null;

        const parsedFisId =
            fisId !== undefined &&
            fisId !== null &&
            fisId !== ""
                ? Number(fisId)
                : null;


        // ----------------------------------------
        // Make sure team exists
        // ----------------------------------------

        const team =
            await prisma.teams.findUnique({
                where: {
                    team_id:
                        parsedTeamId
                }
            });


        if (!team) {

            return res.status(404).json({
                error:
                    "Team not found"
            });
        }


        // ----------------------------------------
        // Transaction
        // ----------------------------------------

        const result =
            await prisma.$transaction(
                async (tx) => {

                    let athlete = null;


                    // ========================================
                    // LOOK FOR EXISTING ATHLETE
                    // ========================================

                    if (
                        parsedAcaId !== null
                    ) {

                        athlete =
                            await tx.athletes.findUnique({
                                where: {
                                    aca_id:
                                        parsedAcaId
                                }
                            });
                    }


                    // If ACA did not find anyone,
                    // search by FIS ID.

                    if (
                        !athlete &&
                        parsedFisId !== null
                    ) {

                        athlete =
                            await tx.athletes.findUnique({
                                where: {
                                    fis_id:
                                        parsedFisId
                                }
                            });
                    }


                    // ========================================
                    // EXISTING ATHLETE
                    // ========================================

                    if (athlete) {

                        // Check whether this athlete
                        // is already on this team.

                        const existingMembership =
                            await tx.team_memberships.findFirst({

                                where: {

                                    athlete_id:
                                        athlete.athlete_id,

                                    team_id:
                                        parsedTeamId,

                                    end_date:
                                        null
                                }
                            });


                        if (
                            existingMembership
                        ) {

                            throw new Error(
                                "Athlete is already a member of this team"
                            );
                        }


                        // ------------------------------------
                        // Add ONLY a new membership.
                        //
                        // Do NOT modify existing memberships.
                        // ------------------------------------

                        await tx.team_memberships.create({

                            data: {

                                athlete_id:
                                    athlete.athlete_id,

                                team_id:
                                    parsedTeamId,

                                start_date:
                                    new Date(),

                                end_date:
                                    null
                            }
                        });


                    } else {

                        // ====================================
                        // NEW ATHLETE
                        // ====================================

                        athlete =
                            await tx.athletes.create({

                                data: {

                                    athlete_first_name:
                                        athleteFirstName,

                                    athlete_last_name:
                                        athleteLastName,

                                    birthday:
                                        new Date(
                                            birthday
                                        ),

                                    gender:
                                        gender,

                                    aca_id:
                                        parsedAcaId,

                                    fis_id:
                                        parsedFisId,

                                    age_group:
                                        ageGroup
                                            || null
                                }
                            });


                        // ------------------------------------
                        // Create initial membership
                        // ------------------------------------

                        await tx.team_memberships.create({

                            data: {

                                athlete_id:
                                    athlete.athlete_id,

                                team_id:
                                    parsedTeamId,

                                start_date:
                                    new Date(),

                                end_date:
                                    null
                            }
                        });
                    }


                    // ========================================
                    // Return complete athlete
                    // ========================================

                    const completeAthlete =
                        await tx.athletes.findUnique({

                            where: {

                                athlete_id:
                                    athlete.athlete_id
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
                }
            );


        console.log(
            "Athlete added/created:",
            result
        );


        return res.status(201).json(
            result
        );


    } catch (error) {

        console.error(
            "Error creating/adding athlete:",
            error
        );


        // ----------------------------------------
        // Already on team
        // ----------------------------------------

        if (
            error instanceof Error &&
            error.message ===
                "Athlete is already a member of this team"
        ) {

            return res.status(409).json({

                error:
                    "Athlete is already a member of this team"
            });
        }


        // ----------------------------------------
        // Unique ID race condition
        // ----------------------------------------

        if (
            error?.code ===
            "P2002"
        ) {

            return res.status(409).json({

                error:
                    "An athlete with this ACA ID or FIS ID already exists"
            });
        }


        return res.status(500).json({

            error:
                "Server error creating athlete profile"
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

// update the athlete's attendance/individual sessions details
const updateAttendance = async (req, res) => {
    const attendanceId = Number(req.params.attendanceId);

    const {
        individualComments,
        freeskiRuns,
        drillRuns,
        educationalCourseRuns,
        raceTrainingCourseRuns,
        raceRuns
    } = req.body;

    let errors = [];

    if (!Number.isInteger(attendanceId)) {
        errors.push({ attendanceId: "Invalid attendance ID" });
    }

    // A blank/omitted run field clears that value (saved as null).
    // A provided value must be a non-negative whole number.
    const parseOptionalInt = (value, fieldName) => {
        if (value === undefined || value === null || value === "") {
            return null;
        }

        const parsed = Number(value);

        if (!Number.isInteger(parsed) || parsed < 0) {
            errors.push({
                [fieldName]: `${fieldName} must be a non-negative whole number`
            });
            return null;
        }

        return parsed;
    };

    const parsedFreeskiRuns = parseOptionalInt(freeskiRuns, "freeskiRuns");
    const parsedDrillRuns = parseOptionalInt(drillRuns, "drillRuns");
    const parsedEducationalCourseRuns = parseOptionalInt(educationalCourseRuns, "educationalCourseRuns");
    const parsedRaceTrainingCourseRuns = parseOptionalInt(raceTrainingCourseRuns, "raceTrainingCourseRuns");
    const parsedRaceRuns = parseOptionalInt(raceRuns, "raceRuns");

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    try {

        // ----------------------------------------
        // Authorization: a coach may only edit attendance
        // for sessions belonging to teams in their own club(s).
        // ----------------------------------------

        const attendanceRecord = await prisma.attendance.findUnique({
            where: { attendance_id: attendanceId },
            select: {
                session: {
                    select: {
                        session_teams: {
                            select: { team: { select: { club_id: true } } }
                        }
                    }
                }
            }
        });

        if (!attendanceRecord) {
            return res.status(404).json({ error: "Attendance not found" });
        }

        if (req.user?.status !== "coach") {
            return res.status(403).json({ error: "Coaches only" });
        }

        const sessionClubIds = attendanceRecord.session.session_teams.map(
            (st) => st.team.club_id
        );

        const coachMemberships = await prisma.coach_memberships.findMany({
            where: { user_id: req.user.user_id },
            select: { team: { select: { club_id: true } } }
        });

        const coachClubIds = [
            ...new Set(coachMemberships.map((m) => m.team.club_id))
        ];

        const authorized = sessionClubIds.some((id) => coachClubIds.includes(id));

        if (!authorized) {
            return res.status(403).json({
                error: "You do not have permission to edit this attendance record"
            });
        }

        // ----------------------------------------
        // Update
        // ----------------------------------------

        const updatedAttendance = await prisma.attendance.update({
            where: { attendance_id: attendanceId },
            data: {
                individual_comments: individualComments ?? null,
                freeski_runs: parsedFreeskiRuns,
                drill_runs: parsedDrillRuns,
                educational_course_runs: parsedEducationalCourseRuns,
                race_training_course_runs: parsedRaceTrainingCourseRuns,
                race_runs: parsedRaceRuns
            }
        });

        return res.status(200).json(updatedAttendance);

    } catch (error) {
        console.error("Error updating attendance:", error);

        if (error.code === "P2025") {
            return res.status(404).json({ error: "Attendance not found" });
        }

        return res.status(500).json({
            error: "Server error updating attendance"
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
        attendance,
        teamIds
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

    console.log("Team IDs:", teamIds);

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

    // Team IDs
    if (!Array.isArray(teamIds) || teamIds.length === 0) {
        errors.push({
            teamIds:
                "Session must have at least one team"
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
                                new Date(
                                    `1970-01-01T${formStartTime}`
                                ),

                            end_time:
                                new Date(
                                    `1970-01-01T${formEndTime}`
                                ),

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
                // 2. Associate session with teams
                // ----------------------------------------

                await tx.sessions_teams.createMany({
                    data: teamIds.map((teamId) => ({
                        session_id:
                            newSession.session_id,

                        team_id:
                            Number(teamId)
                    })),
                    skipDuplicates: true
                });

                // ----------------------------------------
                // 3. Add athletes to attendance
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
                // 4. Return created session
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
        teamId,
        clubId,
        startDate,
        endDate,
        location,
        discipline,
        snowConditions,
        visConditions,
        terrainType
    } = req.query;


    try {

        // ==================================================
        // VALIDATE IDs
        // ==================================================

        let parsedSessionId = null;
        let parsedAthleteId = null;
        let parsedTeamId = null;
        let parsedClubId = null;


        if (sessionId) {

            parsedSessionId =
                Number(sessionId);

            if (
                !Number.isInteger(
                    parsedSessionId
                )
            ) {

                return res.status(400).json({
                    error:
                        "Invalid sessionId"
                });
            }
        }


        if (athleteId) {

            parsedAthleteId =
                Number(athleteId);

            if (
                !Number.isInteger(
                    parsedAthleteId
                )
            ) {

                return res.status(400).json({
                    error:
                        "Invalid athleteId"
                });
            }
        }


        if (teamId) {

            parsedTeamId =
                Number(teamId);

            if (
                !Number.isInteger(
                    parsedTeamId
                )
            ) {

                return res.status(400).json({
                    error:
                        "Invalid teamId"
                });
            }
        }


        if (clubId) {

            parsedClubId =
                Number(clubId);

            if (
                !Number.isInteger(
                    parsedClubId
                )
            ) {

                return res.status(400).json({
                    error:
                        "Invalid clubId"
                });
            }
        }


        // ==================================================
        // GET COACH'S CLUBS
        // ==================================================
        //
        // This is the source of truth for authorization.
        //
        // A coach can only see sessions associated with
        // clubs they are actually a member of.
        //
        // ==================================================

        let coachClubIds = null;


        if (
            req.user &&
            req.user.status === "coach"
        ) {

            const coachMemberships =
                await prisma.coach_memberships.findMany({

                    where: {
                        user_id:
                            req.user.user_id
                    },

                    select: {
                        team: {
                            select: {
                                club_id:
                                    true
                            }
                        }
                    }
                });


            coachClubIds =
                [
                    ...new Set(
                        coachMemberships.map(
                            membership =>
                                membership
                                    .team
                                    .club_id
                        )
                    )
                ];
        }


        // ==================================================
        // BUILD WHERE CLAUSE
        // ==================================================

        const where = {};


        // ==================================================
        // SPECIFIC SESSION
        // ==================================================

        if (
            parsedSessionId !== null
        ) {

            where.session_id =
                parsedSessionId;
        }


        // ==================================================
        // ATHLETE FILTER
        // ==================================================

        if (
            parsedAthleteId !== null
        ) {

            where.attendance = {
                some: {
                    athlete_id:
                        parsedAthleteId
                }
            };
        }


        // ==================================================
        // TEAM FILTER
        // ==================================================
        //
        // Session must belong to this exact team.
        //
        // ==================================================

        if (
            parsedTeamId !== null
        ) {

            where.session_teams = {
                some: {
                    team_id:
                        parsedTeamId
                }
            };
        }


        // ==================================================
        // CLUB FILTER
        // ==================================================
        //
        // Session must belong to at least one team
        // belonging to this exact club.
        //
        // ==================================================

        if (
            parsedClubId !== null
        ) {

            where.session_teams = {
                some: {
                    team: {
                        club_id:
                            parsedClubId
                    }
                }
            };
        }


        // ==================================================
        // COACH AUTHORIZATION
        // ==================================================
        //
        // IMPORTANT:
        //
        // This is applied based on the requested resource.
        //
        // A coach cannot see:
        //
        // Test Club sessions
        // unless Test Club is one of their clubs.
        //
        // ==================================================

        if (
            coachClubIds !== null
        ) {

            // --------------------------------------------------
            // If requesting a specific club
            // --------------------------------------------------

            if (
                parsedClubId !== null
            ) {

                if (
                    !coachClubIds.includes(
                        parsedClubId
                    )
                ) {

                    return res.status(403).json({
                        error:
                            "You do not have permission to access this club"
                    });
                }


            // --------------------------------------------------
            // If requesting a specific team
            // --------------------------------------------------

            } else if (
                parsedTeamId !== null
            ) {

                where.session_teams = {
                    some: {
                        team_id:
                            parsedTeamId,

                        team: {
                            club_id: {
                                in:
                                    coachClubIds
                            }
                        }
                    }
                };


            // --------------------------------------------------
            // If requesting an athlete
            // --------------------------------------------------
            //
            // The athlete may belong to many clubs.
            //
            // Only return sessions from clubs that THIS
            // coach belongs to.
            //
            // --------------------------------------------------

            } else if (
                parsedAthleteId !== null
            ) {

                where.session_teams = {
                    some: {
                        team: {
                            club_id: {
                                in:
                                    coachClubIds
                            }
                        }
                    }
                };


            // --------------------------------------------------
            // Generic session request by a coach
            // --------------------------------------------------
            //
            // If there is no athlete/team/club filter,
            // restrict the entire result to the coach's
            // clubs.
            //
            // --------------------------------------------------

            } else {

                where.session_teams = {
                    some: {
                        team: {
                            club_id: {
                                in:
                                    coachClubIds
                            }
                        }
                    }
                };
            }
        }


        // ==================================================
        // DATE FILTER
        // ==================================================

        if (
            startDate ||
            endDate
        ) {

            where.session_day = {};


            if (startDate) {

                where.session_day.gte =
                    new Date(
                        startDate
                    );
            }


            if (endDate) {

                where.session_day.lte =
                    new Date(
                        endDate
                    );
            }
        }


        // ==================================================
        // OTHER FILTERS
        // ==================================================

        if (location) {

            where.location = {
                contains:
                    location,

                mode:
                    "insensitive"
            };
        }


        if (discipline) {

            where.discipline =
                discipline;
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


        // ==================================================
        // GET SESSIONS
        // ==================================================

        let sessions;


        if (
            parsedSessionId !== null
        ) {

            const session =
                await prisma.sessions.findFirst({

                    where,

                    include: {

                        session_teams: {
                            include: {
                                team: {
                                    include: {
                                        club: true
                                    }
                                }
                            }
                        },

                        attendance: {
                            include: {
                                athlete: {
                                    include: {
                                        team_memberships: {
                                            orderBy: {
                                                start_date:
                                                    "desc"
                                            },

                                            include: {
                                                team: {
                                                    include: {
                                                        club:
                                                            true
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


            if (!session) {

                return res.status(404).json({
                    error:
                        "No sessions found"
                });
            }


            sessions = [
                session
            ];


        } else {

            sessions =
                await prisma.sessions.findMany({

                    where,

                    orderBy: {
                        session_day:
                            "desc"
                    },

                    include: {

                        session_teams: {
                            include: {
                                team: {
                                    include: {
                                        club: true
                                    }
                                }
                            }
                        },

                        attendance: {
                            include: {
                                athlete: {
                                    include: {
                                        team_memberships: {
                                            orderBy: {
                                                start_date:
                                                    "desc"
                                            },

                                            include: {
                                                team: {
                                                    include: {
                                                        club:
                                                            true
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


        // ==================================================
        // NO SESSIONS
        // ==================================================

        if (sessions.length === 0) {
            return res.status(200).json([]);
        }


        // ==================================================
        // FRONTEND RESPONSE
        // ==================================================

        const sessionsWithAttendance =
            sessions.map(
                session => ({

                    session_id:
                        session.session_id,


                    // --------------------------------------
                    // Session teams
                    // --------------------------------------

                    teams:
                        session.session_teams.map(
                            sessionTeam => ({

                                teamId:
                                    sessionTeam
                                        .team
                                        .team_id,

                                teamName:
                                    sessionTeam
                                        .team
                                        .name,

                                clubId:
                                    sessionTeam
                                        .team
                                        .club
                                        .club_id,

                                clubName:
                                    sessionTeam
                                        .team
                                        .club
                                        .name
                            })
                        ),


                    session_day:
                        session.session_day,


                    start_time:
                        session.start_time
                            ? session
                                .start_time
                                .toISOString()
                                .slice(
                                    11,
                                    16
                                )
                            : null,


                    end_time:
                        session.end_time
                            ? session
                                .end_time
                                .toISOString()
                                .slice(
                                    11,
                                    16
                                )
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


                    // --------------------------------------
                    // Attendance
                    // --------------------------------------

                    attendance:
                        session.attendance.map(
                            att => ({

                                attendanceId:
                                    att
                                        .attendance_id,


                                freeskiRuns:
                                    att
                                        .freeski_runs,


                                drillRuns:
                                    att
                                        .drill_runs,


                                educationalCourseRuns:
                                    att
                                        .educational_course_runs,


                                raceTrainingCourseRuns:
                                    att
                                        .race_training_course_runs,


                                raceRuns:
                                    att
                                        .race_runs,


                                individualComments:
                                    att
                                        .individual_comments,


                                athlete: {

                                    athleteId:
                                        att
                                            .athlete
                                            .athlete_id,


                                    athleteFirstName:
                                        att
                                            .athlete
                                            .athlete_first_name,


                                    athleteLastName:
                                        att
                                            .athlete
                                            .athlete_last_name,


                                    birthday:
                                        att
                                            .athlete
                                            .birthday,


                                    gender:
                                        att
                                            .athlete
                                            .gender,


                                    userId:
                                        att
                                            .athlete
                                            .users?.[0]
                                            ?.user_id ??
                                        null,


                                    ageGroup:
                                        att
                                            .athlete
                                            .age_group,


                                    teamMemberships:
                                        att
                                            .athlete
                                            .team_memberships
                                            .map(
                                                membership =>
                                                    ({

                                                        teamMembershipId:
                                                            membership
                                                                .team_membership_id,

                                                        athleteId:
                                                            membership
                                                                .athlete_id,

                                                        teamId:
                                                            membership
                                                                .team_id,

                                                        startDate:
                                                            membership
                                                                .start_date,

                                                        endDate:
                                                            membership
                                                                .end_date,

                                                        team:
                                                            membership
                                                                .team
                                                                ? {

                                                                    teamId:
                                                                        membership
                                                                            .team
                                                                            .team_id,

                                                                    clubId:
                                                                        membership
                                                                            .team
                                                                            .club_id,

                                                                    name:
                                                                        membership
                                                                            .team
                                                                            .name,

                                                                    club:
                                                                        membership
                                                                            .team
                                                                            .club
                                                                            ? {

                                                                                clubId:
                                                                                    membership
                                                                                        .team
                                                                                        .club
                                                                                        .club_id,

                                                                                name:
                                                                                    membership
                                                                                        .team
                                                                                        .club
                                                                                        .name
                                                                            }

                                                                            : undefined
                                                                }

                                                                : undefined
                                                    })
                                            )
                                }
                            })
                        )
                })
            );


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

    const {
        teamId,
        athleteId,
        clubId,
        column
    } = req.params;

    const {
        startDate,
        endDate
    } = req.query;

    console.log(
        "teamId to search:",
        teamId
    );

    console.log(
        "athleteId to search:",
        athleteId
    );

    console.log(
        "column to search:",
        column
    );

    console.log(
        "startDate:",
        startDate
    );

    console.log(
        "endDate:",
        endDate
    );

    // ========================================
    // Validate team ID
    // ========================================

    const parsedTeamId = teamId !== undefined ? Number(teamId) : null;

    if (teamId !== undefined && !Number.isInteger(parsedTeamId)) {
        return res.status(400).json({ error: "Invalid team ID" });
    }

    // ========================================
    // Validate club ID
    // ========================================

    const parsedClubId = clubId !== undefined ? Number(clubId) : null;

    if (clubId !== undefined && !Number.isInteger(parsedClubId)) {
        return res.status(400).json({ error: "Invalid club ID" });
    }

    // ========================================
    // Column mapping
    // ========================================

    const columnMap = {
        sessionDay:
            "session_day",

        location:
            "location",

        discipline:
            "discipline",

        snowConditions:
            "snow_conditions",

        visConditions:
            "vis_conditions",

        terrainType:
            "terrain_type"
    };

    // ========================================
    // Validate column
    // ========================================

    if (
        column !== "runColumn" &&
        !columnMap[column]
    ) {
        return res.status(400).json({
            error: "Invalid column"
        });
    }

    // ========================================
    // Validate athlete ID
    // ========================================

    let parsedAthleteId = null;

    if (athleteId) {
        parsedAthleteId = Number(athleteId);

        if (!Number.isInteger(parsedAthleteId)) {
            return res.status(400).json({ error: "Invalid athlete ID" });
        }
    }

    // ========================================
    // Build date filter
    // ========================================

    const dateFilter = {};

    if (startDate) {

        dateFilter.gte =
            new Date(
                `${startDate}T00:00:00`
            );
    }

    if (endDate) {

        dateFilter.lte =
            new Date(
                `${endDate}T23:59:59.999`
            );
    }

    // ========================================
    // Validate dates
    // ========================================

    if (
        startDate &&
        isNaN(
            dateFilter.gte.getTime()
        )
    ) {
        return res.status(400).json({
            error:
                "Invalid start date"
        });
    }

    if (
        endDate &&
        isNaN(
            dateFilter.lte.getTime()
        )
    ) {
        return res.status(400).json({
            error:
                "Invalid end date"
        });
    }

    try {

        // ========================================
        // Determine allowed teams
        // ========================================

        let allowedTeamIds = [];

        // ----------------------------------------
        // CASE 1:
        // Team dashboard
        // ----------------------------------------

        if (!parsedAthleteId && !parsedClubId) {
            if (parsedTeamId === null) {
                return res.status(400).json({ error: "Team ID required" });
            }
            allowedTeamIds = [parsedTeamId];
        }

        // ----------------------------------------
        // CASE 2: Club dashboard
        //
        // All teams belonging to the club. Only a
        // coach who belongs to this club may view it.
        // ----------------------------------------

        if (parsedClubId !== null && !parsedAthleteId) {

            if (req.user?.status !== "coach") {
                return res.status(403).json({
                    error: "Only coaches can view club-wide data"
                });
            }

            const coachMemberships =
                await prisma.coach_memberships.findMany({
                    where: { user_id: req.user.user_id },
                    select: { team: { select: { club_id: true } } }
                });

            const coachClubIds = [
                ...new Set(coachMemberships.map(m => m.team.club_id))
            ];

            if (!coachClubIds.includes(parsedClubId)) {
                return res.status(403).json({
                    error: "You do not have permission to view this club's data"
                });
            }

            const clubTeams = await prisma.teams.findMany({
                where: { club_id: parsedClubId },
                select: { team_id: true }
            });

            allowedTeamIds = clubTeams.map(t => t.team_id);
        }

        // ----------------------------------------
        // CASE 3:
        // Athlete data
        //
        // Get every team the athlete has ever
        // belonged to.
        // ----------------------------------------

        if (parsedAthleteId) {

            const memberships =
                await prisma.team_memberships.findMany({

                    where: {
                        athlete_id:
                            parsedAthleteId
                    },

                    select: {
                        team_id: true,

                        team: {
                            select: {
                                team_id: true,
                                club_id: true
                            }
                        }
                    }
                });

            allowedTeamIds = [
                ...new Set(
                    memberships.map(
                        membership =>
                            membership.team_id
                    )
                )
            ];

            console.log(
                "Athlete historical team IDs:",
                allowedTeamIds
            );
        }

        // ========================================
        // CASE 4:
        // Coach viewing athlete
        //
        // A coach can only see the athlete's
        // sessions from teams belonging to
        // clubs that the coach is authorized for.
        // ========================================

        if (
            parsedAthleteId &&
            req.user?.status === "coach"
        ) {

            const coachMemberships =
                await prisma.coach_memberships.findMany({

                    where: {
                        user_id:
                            req.user.user_id
                    },

                    select: {
                        team: {
                            select: {
                                team_id: true,
                                club_id: true
                            }
                        }
                    }
                });

            const authorizedTeamIds =
                coachMemberships.map(
                    membership =>
                        membership.team.team_id
                );

            console.log(
                "Coach authorized team IDs:",
                authorizedTeamIds
            );

            // Keep only the athlete's teams
            // that the coach is authorized to see.
            allowedTeamIds =
                allowedTeamIds.filter(
                    teamId =>
                        authorizedTeamIds.includes(
                            teamId
                        )
                );

            console.log(
                "Final allowed athlete team IDs:",
                allowedTeamIds
            );
        }

        // ========================================
        // No teams available
        // ========================================

        if (
            allowedTeamIds.length === 0
        ) {
            return res.status(404).json({
                error:
                    "No data found"
            });
        }

        // ========================================
        // RUN COLUMN
        // ========================================

        if (
            column === "runColumn"
        ) {

            // ====================================
            // Athlete run totals
            // ====================================

            if (parsedAthleteId) {

                const attendance =
                    await prisma.attendance.findMany({

                        where: {

                            // Specific athlete
                            athlete_id:
                                parsedAthleteId,

                            // Session must belong to
                            // one of the allowed teams
                            session: {

                                session_teams: {
                                    some: {
                                        team_id: {
                                            in:
                                                allowedTeamIds
                                        }
                                    }
                                },

                                // Date filter
                                ...(startDate ||
                                endDate
                                    ? {
                                        session_day:
                                            dateFilter
                                    }
                                    : {})
                            }
                        },

                        select: {

                            freeski_runs:
                                true,

                            drill_runs:
                                true,

                            educational_course_runs:
                                true,

                            race_training_course_runs:
                                true,

                            race_runs:
                                true
                        }
                    });

                if (
                    attendance.length === 0
                ) {
                    return res.status(404).json({
                        error:
                            "No data found"
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
                        (
                            sum,
                            row
                        ) =>
                            sum +
                            (
                                row.freeski_runs ||
                                0
                            ),
                        0
                    ),

                    attendance.reduce(
                        (
                            sum,
                            row
                        ) =>
                            sum +
                            (
                                row.drill_runs ||
                                0
                            ),
                        0
                    ),

                    attendance.reduce(
                        (
                            sum,
                            row
                        ) =>
                            sum +
                            (
                                row.educational_course_runs ||
                                0
                            ),
                        0
                    ),

                    attendance.reduce(
                        (
                            sum,
                            row
                        ) =>
                            sum +
                            (
                                row.race_training_course_runs ||
                                0
                            ),
                        0
                    ),

                    attendance.reduce(
                        (
                            sum,
                            row
                        ) =>
                            sum +
                            (
                                row.race_runs ||
                                0
                            ),
                        0
                    )
                ];

                return res.status(200).json({
                    labels,
                    values
                });
            }

            // ====================================
            // Team-wide run totals
            // ====================================

            const sessions =
                await prisma.sessions.findMany({

                    where: {

                        session_teams: {
                            some: {
                                team_id: {
                                    in:
                                        allowedTeamIds
                                }
                            }
                        },

                        ...(startDate ||
                        endDate
                            ? {
                                session_day:
                                    dateFilter
                            }
                            : {})
                    },

                    select: {

                        num_freeski_runs:
                            true,

                        num_drill_runs:
                            true,

                        num_educational_course_runs:
                            true,

                        num_race_training_course_runs:
                            true,

                        num_race_runs:
                            true
                    }
                });

            if (
                sessions.length === 0
            ) {
                return res.status(404).json({
                    error:
                        "No data found"
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
                    (
                        sum,
                        session
                    ) =>
                        sum +
                        (
                            session.num_freeski_runs ||
                            0
                        ),
                    0
                ),

                sessions.reduce(
                    (
                        sum,
                        session
                    ) =>
                        sum +
                        (
                            session.num_drill_runs ||
                            0
                        ),
                    0
                ),

                sessions.reduce(
                    (
                        sum,
                        session
                    ) =>
                        sum +
                        (
                            session.num_educational_course_runs ||
                            0
                        ),
                    0
                ),

                sessions.reduce(
                    (
                        sum,
                        session
                    ) =>
                        sum +
                        (
                            session.num_race_training_course_runs ||
                            0
                        ),
                    0
                ),

                sessions.reduce(
                    (
                        sum,
                        session
                    ) =>
                        sum +
                        (
                            session.num_race_runs ||
                            0
                        ),
                    0
                )
            ];

            return res.status(200).json({
                labels,
                values
            });
        }

        // ========================================
        // NORMAL SESSION COLUMNS
        // ========================================

        const dbColumn =
            columnMap[column];

        // ========================================
        // Build session query
        // ========================================

        const sessions =
            await prisma.sessions.findMany({

                where: {

                    // --------------------------------
                    // Allowed teams
                    // --------------------------------

                    session_teams: {
                        some: {
                            team_id: {
                                in:
                                    allowedTeamIds
                            }
                        }
                    },

                    // --------------------------------
                    // Date filter
                    // --------------------------------

                    ...(startDate ||
                    endDate
                        ? {
                            session_day:
                                dateFilter
                        }
                        : {}),

                    // --------------------------------
                    // If athlete supplied,
                    // session must have that athlete
                    // in attendance
                    // --------------------------------

                    ...(parsedAthleteId
                        ? {
                            attendance: {
                                some: {
                                    athlete_id:
                                        parsedAthleteId
                                }
                            }
                        }
                        : {})
                },

                select: {

                    session_day:
                        true,

                    location:
                        true,

                    discipline:
                        true,

                    snow_conditions:
                        true,

                    vis_conditions:
                        true,

                    terrain_type:
                        true
                }
            });

        // ========================================
        // No sessions found
        // ========================================

        if (
            sessions.length === 0
        ) {
            return res.status(404).json({
                error:
                    "No data found"
            });
        }

        // ========================================
        // Count values
        // ========================================

        const counts = {};

        for (
            const session of sessions
        ) {

            let value =
                session[dbColumn];

            // ------------------------------------
            // Format session date
            // ------------------------------------

            if (
                column === "sessionDay" &&
                value
            ) {

                value =
                    value
                        .toISOString()
                        .split("T")[0];
            }

            // ------------------------------------
            // Count value
            // ------------------------------------

            if (
                value !== null &&
                value !== undefined
            ) {

                counts[value] =
                    (
                        counts[value] ||
                        0
                    ) + 1;
            }
        }

        // ========================================
        // Convert counts to chart data
        // ========================================

        const labels =
            Object.keys(counts);

        const values =
            Object.values(counts);

        // ========================================
        // No usable values
        // ========================================

        if (
            labels.length === 0
        ) {
            return res.status(404).json({
                error:
                    "No data found"
            });
        }

        // ========================================
        // Return chart data
        // ========================================

        return res.status(200).json({
            labels,
            values
        });

    } catch (error) {

        console.error(
            "Error getting pie chart data:",
            error
        );

        return res.status(500).json({
            error:
                "Server error retrieving pie chart data"
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
        teamIds
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

    // ----------------------------------------
    // Validate team IDs
    // ----------------------------------------

    if (!Array.isArray(teamIds) || teamIds.length === 0) {
        errors.push({
            teamIds: "Session must have at least one team"
        });
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    // ----------------------------------------
    // Update session + teams
    // ----------------------------------------

    try {

        const result = await prisma.$transaction(
            async (tx) => {

                // ----------------------------------------
                // 1. Update session
                // ----------------------------------------

                const updatedSession =
                    await tx.sessions.update({
                        where: {
                            session_id: sessionId
                        },

                        data: {
                            session_day:
                                new Date(sessionDay),

                            start_time:
                                new Date(
                                    `1970-01-01T${formStartTime}`
                                ),

                            end_time:
                                new Date(
                                    `1970-01-01T${formEndTime}`
                                ),

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

                // ----------------------------------------
                // 2. Remove existing team associations
                // ----------------------------------------

                await tx.sessions_teams.deleteMany({
                    where: {
                        session_id: sessionId
                    }
                });

                // ----------------------------------------
                // 3. Add new team associations
                // ----------------------------------------

                await tx.sessions_teams.createMany({
                    data: teamIds.map((teamId) => ({
                        session_id:
                            sessionId,

                        team_id:
                            Number(teamId)
                    })),

                    skipDuplicates: true
                });

                // ----------------------------------------
                // 4. Get updated session with teams
                // ----------------------------------------

                return await tx.sessions.findUnique({
                    where: {
                        session_id: sessionId
                    },

                    include: {
                        session_teams: {
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
            }
        );

        console.log(
            "Updated session:",
            result
        );

        return res.status(200).json({
            ...result,

            start_time:
                result.start_time
                    ? result.start_time
                        .toISOString()
                        .slice(11, 16)
                    : null,

            end_time:
                result.end_time
                    ? result.end_time
                        .toISOString()
                        .slice(11, 16)
                    : null,

            teams:
                result.session_teams.map(
                    (sessionTeam) => ({
                        teamId:
                            sessionTeam.team.team_id,

                        teamName:
                            sessionTeam.team.name,

                        clubId:
                            sessionTeam.team.club.club_id,

                        clubName:
                            sessionTeam.team.club.name
                    })
                )
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
    const {
        athleteId,
        teamId,
        role,
        currentURL
    } = req.body;

    // ----------------------------------------
    // Validate role
    // ----------------------------------------

    if (
        !role ||
        !["athlete", "parent", "coach"].includes(role)
    ) {
        return res.status(400).json({
            error: "Invalid role"
        });
    }

    // ----------------------------------------
    // Validate invite target
    // ----------------------------------------

    const parsedAthleteId =
        athleteId != null
            ? Number(athleteId)
            : null;

    const parsedTeamId =
        teamId != null
            ? Number(teamId)
            : null;

    if (
        role === "athlete" ||
        role === "parent"
    ) {
        if (
            parsedAthleteId === null ||
            !Number.isInteger(parsedAthleteId)
        ) {
            return res.status(400).json({
                error:
                    "An athleteId is required for this invite."
            });
        }

        if (parsedTeamId !== null) {
            return res.status(400).json({
                error:
                    "A teamId cannot be supplied for this invite."
            });
        }
    }

    if (role === "coach") {
        if (
            parsedTeamId === null ||
            !Number.isInteger(parsedTeamId)
        ) {
            return res.status(400).json({
                error:
                    "A teamId is required for a coach invite."
            });
        }

        if (parsedAthleteId !== null) {
            return res.status(400).json({
                error:
                    "An athleteId cannot be supplied for a coach invite."
            });
        }
    }

    try {

        // ----------------------------------------
        // Verify target exists
        // ----------------------------------------

        if (
            role === "athlete" ||
            role === "parent"
        ) {
            const athlete =
                await prisma.athletes.findUnique({
                    where: {
                        athlete_id:
                            parsedAthleteId
                    }
                });

            if (!athlete) {
                return res.status(404).json({
                    error:
                        "Athlete not found."
                });
            }
        }

        if (role === "coach") {
            const team =
                await prisma.teams.findUnique({
                    where: {
                        team_id:
                            parsedTeamId
                    }
                });

            if (!team) {
                return res.status(404).json({
                    error:
                        "Team not found."
                });
            }
        }

        // ----------------------------------------
        // Check whether athlete already has
        // an athlete account
        // ----------------------------------------

        if (
            role === "athlete"
        ) {
            const existingAthleteUser =
                await prisma.users.findFirst({
                    where: {
                        athlete_id:
                            parsedAthleteId,

                        status:
                            "athlete"
                    }
                });

            if (existingAthleteUser) {
                return res.status(400).json({
                    error:
                        "An athlete account is already associated with this athlete. Please have the athlete log in instead."
                });
            }
        }

        // ----------------------------------------
        // Generate token
        // ----------------------------------------

        const token =
            crypto
                .randomBytes(32)
                .toString("hex");

        // ----------------------------------------
        // Expires in 7 days
        // ----------------------------------------

        const expiresAt =
            new Date();

        expiresAt.setDate(
            expiresAt.getDate() + 7
        );

        // ----------------------------------------
        // Create invite
        // ----------------------------------------

        const invite =
            await prisma.invites.create({
                data: {
                    athlete_id:
                        role === "athlete" ||
                        role === "parent"
                            ? parsedAthleteId
                            : null,

                    team_id:
                        role === "coach"
                            ? parsedTeamId
                            : null,

                    token,

                    role,

                    expires_at:
                        expiresAt,

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
            error:
                "Failed to generate invite link"
        });
    }
};

// ensures that the invite link is valid and returns the role and athleteId if applicable
const getInviteDetails = async (req, res) => {
    const { token } = req.params;

    try {

        const invite =
            await prisma.invites.findUnique({
                where: {
                    token
                },
                include: {
                    athlete: true,
                    team: {
                        include: {
                            club: true
                        }
                    }
                }
            });

        // ----------------------------------------
        // Invite doesn't exist
        // ----------------------------------------

        if (!invite) {
            return res.status(404).json({
                error:
                    "Invalid invite link."
            });
        }

        // ----------------------------------------
        // Invite already used
        // ----------------------------------------

        if (invite.used) {
            return res.status(400).json({
                error:
                    "This invite link has already been used."
            });
        }

        // ----------------------------------------
        // Invite expired
        // ----------------------------------------

        if (
            invite.expires_at < new Date()
        ) {
            return res.status(400).json({
                error:
                    "This invite link has expired."
            });
        }

        // ----------------------------------------
        // Return invite details
        // ----------------------------------------

        return res.status(200).json({

            role:
                invite.role,

            athleteId:
                invite.athlete_id,

            teamId:
                invite.team_id,

            athlete:
                invite.athlete
                    ? {
                        athleteId:
                            invite.athlete.athlete_id,

                        firstName:
                            invite.athlete.athlete_first_name,

                        lastName:
                            invite.athlete.athlete_last_name
                    }
                    : null,

            team:
                invite.team
                    ? {
                        teamId:
                            invite.team.team_id,

                        name:
                            invite.team.name,

                        club:
                            invite.team.club
                                ? {
                                    clubId:
                                        invite.team.club.club_id,

                                    name:
                                        invite.team.club.name
                                }
                                : null
                    }
                    : null,

            used:
                invite.used,

            expiresAt:
                invite.expires_at

        });

    } catch (error) {

        console.error(
            "Error getting invite details:",
            error
        );

        return res.status(500).json({
            error:
                "Server error validating invite"
        });
    }
};

// Accept an invite for an existing authenticated user
const acceptInvite = async (req, res) => {
    const { token } = req.params;

    try {

        // ----------------------------------------
        // 1. Get authenticated user
        // ----------------------------------------

        const userId =
            req.user?.user_id;

        if (!userId) {
            return res.status(401).json({
                error:
                    "You must be logged in to accept this invite."
            });
        }


        // ----------------------------------------
        // 2. Get authenticated user
        // ----------------------------------------

        const user =
            await prisma.users.findUnique({
                where: {
                    user_id:
                        userId
                }
            });

        if (!user) {
            return res.status(404).json({
                error:
                    "Authenticated user not found."
            });
        }


        // ----------------------------------------
        // 3. Get invite
        // ----------------------------------------

        const invite =
            await prisma.invites.findUnique({
                where: {
                    token:
                        token
                }
            });

        if (!invite) {
            return res.status(404).json({
                error:
                    "Invalid invite link."
            });
        }


        // ----------------------------------------
        // 4. Check whether invite is already used
        // ----------------------------------------

        if (invite.used) {
            return res.status(400).json({
                error:
                    "This invite link has already been used."
            });
        }


        // ----------------------------------------
        // 5. Check whether invite has expired
        // ----------------------------------------

        if (
            invite.expires_at <
            new Date()
        ) {
            return res.status(400).json({
                error:
                    "This invite link has expired."
            });
        }


        // ----------------------------------------
        // 6. Accept invite inside transaction
        // ----------------------------------------

        await prisma.$transaction(
            async (tx) => {

                // ========================================
                // PARENT INVITE
                // ========================================

                if (
                    invite.role === "parent"
                ) {

                    if (
                        invite.athlete_id === null
                    ) {
                        throw new Error(
                            "This parent invite is missing an athlete."
                        );
                    }


                    // Verify athlete exists

                    const athlete =
                        await tx.athletes.findUnique({
                            where: {
                                athlete_id:
                                    invite.athlete_id
                            }
                        });

                    if (!athlete) {
                        throw new Error(
                            "The athlete associated with this invite could not be found."
                        );
                    }


                    // Create parent → athlete
                    // relationship.
                    //
                    // If the parent is already associated
                    // with this athlete, upsert does nothing.
                    //
                    // This prevents duplicate relationships.

                    await tx.parents.upsert({

                        where: {
                            athlete_id_user_id: {
                                athlete_id:
                                    invite.athlete_id,

                                user_id:
                                    userId
                            }
                        },

                        update: {},

                        create: {
                            athlete_id:
                                invite.athlete_id,

                            user_id:
                                userId
                        }
                    });
                }


                // ========================================
                // ATHLETE INVITE
                // ========================================

                else if (
                    invite.role === "athlete"
                ) {

                    if (
                        invite.athlete_id === null
                    ) {
                        throw new Error(
                            "This athlete invite is missing an athlete."
                        );
                    }


                    // An existing athlete account
                    // must already be associated with
                    // the athlete in the invite.

                    if (
                        user.athlete_id !==
                        invite.athlete_id
                    ) {
                        throw new Error(
                            "This invite does not belong to your athlete account."
                        );
                    }


                    // Nothing else needs to be created.
                    //
                    // The athlete already has:
                    //
                    // users.athlete_id
                    //
                    // so accepting the invite simply
                    // validates that this is their invite.
                }


                // ========================================
                // COACH INVITE
                // ========================================

                else if (
                    invite.role === "coach"
                ) {

                    if (
                        invite.team_id === null
                    ) {
                        throw new Error(
                            "This coach invite is missing a team."
                        );
                    }


                    // Verify team exists

                    const team =
                        await tx.teams.findUnique({
                            where: {
                                team_id:
                                    invite.team_id
                            }
                        });

                    if (!team) {
                        throw new Error(
                            "The team associated with this invite could not be found."
                        );
                    }


                    // Create coach → team membership.
                    //
                    // If the coach is already a member
                    // of this team, upsert does nothing.
                    //
                    // This prevents duplicate memberships.

                    await tx.coach_memberships.upsert({

                        where: {
                            user_id_team_id: {
                                user_id:
                                    userId,

                                team_id:
                                    invite.team_id
                            }
                        },

                        update: {},

                        create: {
                            user_id:
                                userId,

                            team_id:
                                invite.team_id
                        }
                    });
                }


                // ========================================
                // INVALID ROLE
                // ========================================

                else {

                    throw new Error(
                        "Invalid invite role."
                    );
                }


                // ========================================
                // MARK INVITE AS USED
                // ========================================

                // This happens INSIDE the transaction.
                //
                // Therefore, if any of the operations above
                // fails, the transaction rolls back and the
                // invite remains unused.

                await tx.invites.update({

                    where: {
                        invite_id:
                            invite.invite_id
                    },

                    data: {
                        used:
                            true
                    }
                });
            }
        );


        // ----------------------------------------
        // 7. Return success
        // ----------------------------------------

        return res.status(200).json({

            success:
                true,

            message:
                "Invite accepted successfully.",

            role:
                invite.role,

            athleteId:
                invite.athlete_id,

            teamId:
                invite.team_id
        });


    } catch (error) {

        console.error(
            "Error accepting invite:",
            error
        );


        // ----------------------------------------
        // Known invite/business errors
        // ----------------------------------------

        const knownErrors = [

            "This parent invite is missing an athlete.",

            "The athlete associated with this invite could not be found.",

            "This athlete invite is missing an athlete.",

            "This invite does not belong to your athlete account.",

            "This coach invite is missing a team.",

            "The team associated with this invite could not be found.",

            "Invalid invite role."
        ];


        if (
            error instanceof Error &&
            knownErrors.includes(error.message)
        ) {

            return res.status(400).json({
                error:
                    error.message
            });
        }


        // ----------------------------------------
        // Unexpected server error
        // ----------------------------------------

        return res.status(500).json({
            error:
                "Server error accepting invite."
        });
    }
};

// get all clubs in the database, ordered by name
const getClubs = async (req, res) => {
    try {
        const clubs = await prisma.clubs.findMany({
            orderBy: {
                name: "asc"
            }
        });

        const mappedClubs = clubs.map((club) => ({
            clubId: club.club_id,
            name: club.name
        }));

        return res.status(200).json(mappedClubs);

    } catch (error) {
        console.error("Error getting clubs:", error);

        return res.status(500).json({
            error: "Server error retrieving clubs"
        });
    }
};

// get all teams in the database, optionally filtered by clubId or filtered by coachId
const getTeams = async (req, res) => {
    const { teamId, clubId, coachId } = req.query;

    try {
        let teams;

        // --------------------------------------------------
        // If logged-in user is a coach, determine which
        // clubs they belong to.
        // --------------------------------------------------

        let coachClubIds = [];

        if (req.user && req.user.status === "coach") {

            const memberships =
                await prisma.coach_memberships.findMany({
                    where: {
                        user_id: req.user.user_id
                    },

                    include: {
                        team: {
                            select: {
                                team_id: true,
                                club_id: true
                            }
                        }
                    }
                });

            coachClubIds = [
                ...new Set(
                    memberships
                        .map(
                            membership =>
                                membership.team.club_id
                        )
                )
            ];
        }


        // --------------------------------------------------
        // Get a specific team
        // --------------------------------------------------

        if (teamId) {

            const parsedTeamId = Number(teamId);

            if (!Number.isInteger(parsedTeamId)) {
                return res.status(400).json({
                    error: "Invalid teamId"
                });
            }

            const team = await prisma.teams.findUnique({
                where: {
                    team_id: parsedTeamId
                },

                include: {
                    club: true
                }
            });

            if (!team) {
                return res.status(404).json({
                    error: "Team not found"
                });
            }


            // --------------------------------------------------
            // Coach permission check
            // --------------------------------------------------

            if (
                req.user &&
                req.user.status === "coach" &&
                !coachClubIds.includes(team.club_id)
            ) {
                return res.status(403).json({
                    error:
                        "You do not have permission to access this team"
                });
            }


            // Return as an array so the response shape stays
            // consistent with the existing /api/teams endpoint.
            teams = [team];


        // --------------------------------------------------
        // Get teams associated with coach
        // --------------------------------------------------

        } else if (coachId) {

            const parsedCoachId = Number(coachId);

            if (!Number.isInteger(parsedCoachId)) {
                return res.status(400).json({
                    error: "Invalid coachId"
                });
            }


            // --------------------------------------------------
            // If the logged-in user is a coach, only allow
            // them to request their own teams.
            // --------------------------------------------------

            if (
                req.user &&
                req.user.status === "coach" &&
                parsedCoachId !== req.user.user_id
            ) {
                return res.status(403).json({
                    error:
                        "You do not have permission to access this coach's teams"
                });
            }


            const memberships =
                await prisma.coach_memberships.findMany({
                    where: {
                        user_id: parsedCoachId
                    },

                    include: {
                        team: {
                            include: {
                                club: true
                            }
                        }
                    }
                });


            teams = memberships
                .map(
                    (membership) =>
                        membership.team
                )
                .sort(
                    (a, b) =>
                        a.name.localeCompare(
                            b.name
                        )
                );


        // --------------------------------------------------
        // Get teams filtered by club
        // --------------------------------------------------

        } else if (clubId) {

            const parsedClubId = Number(clubId);

            if (!Number.isInteger(parsedClubId)) {
                return res.status(400).json({
                    error: "Invalid clubId"
                });
            }


            // --------------------------------------------------
            // Coach permission check
            // --------------------------------------------------

            if (
                req.user &&
                req.user.status === "coach" &&
                !coachClubIds.includes(parsedClubId)
            ) {
                return res.status(403).json({
                    error:
                        "You do not have permission to access this club"
                });
            }


            teams = await prisma.teams.findMany({
                where: {
                    club_id: parsedClubId
                },

                include: {
                    club: true
                },

                orderBy: {
                    name: "asc"
                }
            });


        // --------------------------------------------------
        // Get all teams
        // --------------------------------------------------

        } else {

            // --------------------------------------------------
            // Coaches can only see teams from their clubs.
            // --------------------------------------------------

            if (
                req.user &&
                req.user.status === "coach"
            ) {

                teams = await prisma.teams.findMany({
                    where: {
                        club_id: {
                            in: coachClubIds
                        }
                    },

                    include: {
                        club: true
                    },

                    orderBy: {
                        name: "asc"
                    }
                });

            } else {

                // Non-coaches retain the existing behaviour
                // for now.
                teams = await prisma.teams.findMany({
                    include: {
                        club: true
                    },

                    orderBy: {
                        name: "asc"
                    }
                });
            }
        }


        return res.status(200).json(teams);

    } catch (error) {

        console.error(
            "Error getting teams:",
            error
        );

        return res.status(500).json({
            error:
                "Server error retrieving teams"
        });
    }
};

// get all teams an athlete has ever been apart of
const getAthleteTeamMemberships = async (req, res) => {

    const { athleteId } = req.params;

    const parsedAthleteId = Number(athleteId);

    if (!Number.isInteger(parsedAthleteId)) {
        return res.status(400).json({
            error: "Invalid athleteId"
        });
    }

    try {

        const memberships =
            await prisma.team_memberships.findMany({

                where: {
                    athlete_id: parsedAthleteId
                },

                include: {

                    team: {
                        include: {
                            club: true
                        }
                    }

                },

                orderBy: [
                    {
                        start_date: "desc"
                    },
                    {
                        team_id: "asc"
                    }
                ]
            });


        return res.status(200).json(
            memberships.map(
                (membership) => ({

                    teamMembershipId:
                        membership.team_membership_id,

                    athleteId:
                        membership.athlete_id,

                    teamId:
                        membership.team_id,

                    startDate:
                        membership.start_date,

                    endDate:
                        membership.end_date,

                    team: {
                        teamId:
                            membership.team.team_id,

                        clubId:
                            membership.team.club_id,

                        name:
                            membership.team.name,

                        club: {
                            clubId:
                                membership.team.club.club_id,

                            name:
                                membership.team.club.name
                        }
                    }

                })
            )
        );

    } catch (error) {

        console.error(
            "Error getting athlete team memberships:",
            error
        );

        return res.status(500).json({
            error:
                "Server error retrieving athlete team memberships"
        });
    }
};


// update athlete's team memberships
const updateAthleteTeamMemberships = async (req, res) => {

    const athleteId =
        Number(
            req.params.athleteId
        );

    if (
        !Number.isInteger(
            athleteId
        )
    ) {

        return res.status(400).json({
            error:
                "Invalid athlete ID"
        });
    }


    const {
        memberships
    } = req.body;


    if (
        !Array.isArray(
            memberships
        )
    ) {

        return res.status(400).json({
            error:
                "Request must contain memberships"
        });
    }


    try {

        // --------------------------------------------------
        // Make sure athlete exists
        // --------------------------------------------------

        const athlete =
            await prisma.athletes.findUnique({
                where: {
                    athlete_id:
                        athleteId
                }
            });

        if (!athlete) {

            return res.status(404).json({
                error:
                    "Athlete not found"
            });
        }


        // --------------------------------------------------
        // Get clubs the coach is a member of
        // --------------------------------------------------

        const coachMemberships =
            await prisma.coach_memberships.findMany({
                where: {
                    user_id:
                        req.user.user_id
                },

                select: {
                    team: {
                        select: {
                            club_id: true
                        }
                    }
                }
            });


        const coachClubIds =
            new Set(
                coachMemberships.map(
                    membership =>
                        membership
                            .team
                            .club_id
                )
            );


        // --------------------------------------------------
        // Validate memberships
        // --------------------------------------------------

        const parsedMemberships =
            memberships.map(
                membership => ({

                    teamMembershipId:
                        membership
                            .teamMembershipId
                            ? Number(
                                membership
                                    .teamMembershipId
                            )
                            : undefined,

                    teamId:
                        Number(
                            membership.teamId
                        ),

                    startDate:
                        membership.startDate
                            || null,

                    endDate:
                        membership.endDate
                            || null
                })
            );


        // --------------------------------------------------
        // Validate team IDs
        // --------------------------------------------------

        const invalidTeam =
            parsedMemberships.some(
                membership =>
                    !Number.isInteger(
                        membership.teamId
                    )
            );

        if (invalidTeam) {

            return res.status(400).json({
                error:
                    "All team IDs must be valid integers"
            });
        }


        // --------------------------------------------------
        // Validate dates
        // --------------------------------------------------

        for (
            const membership
            of parsedMemberships
        ) {

            if (
                membership.startDate &&
                Number.isNaN(
                    Date.parse(
                        membership.startDate
                    )
                )
            ) {

                return res.status(400).json({
                    error:
                        "Invalid start date"
                });
            }


            if (
                membership.endDate &&
                Number.isNaN(
                    Date.parse(
                        membership.endDate
                    )
                )
            ) {

                return res.status(400).json({
                    error:
                        "Invalid end date"
                });
            }


            if (
                membership.startDate &&
                membership.endDate &&
                new Date(
                    membership.endDate
                ) <
                new Date(
                    membership.startDate
                )
            ) {

                return res.status(400).json({
                    error:
                        "End date cannot be before start date"
                });
            }
        }


        // --------------------------------------------------
        // Get existing memberships
        // --------------------------------------------------

        const existingMemberships =
            await prisma.team_memberships.findMany({
                where: {
                    athlete_id:
                        athleteId
                }
            });


        // --------------------------------------------------
        // Only allow updates to memberships that actually
        // belong to this athlete.
        // --------------------------------------------------

        const existingIds =
            new Set(
                existingMemberships.map(
                    membership =>
                        membership
                            .team_membership_id
                )
            );


        const updateIds =
            parsedMemberships
                .filter(
                    membership =>
                        membership
                            .teamMembershipId
                )
                .map(
                    membership =>
                        membership
                            .teamMembershipId
                );


        const invalidMembershipId =
            updateIds.some(
                id =>
                    !existingIds.has(
                        id
                    )
            );

        if (
            invalidMembershipId
        ) {

            return res.status(403).json({
                error:
                    "You do not have permission to modify one or more memberships"
            });
        }


        // --------------------------------------------------
        // Get all requested teams
        // --------------------------------------------------

        const teamIds =
            [
                ...new Set(
                    parsedMemberships.map(
                        membership =>
                            membership.teamId
                    )
                )
            ];


        const teams =
            await prisma.teams.findMany({
                where: {
                    team_id: {
                        in: teamIds
                    }
                },

                select: {
                    team_id: true,
                    club_id: true
                }
            });


        if (
            teams.length !==
            teamIds.length
        ) {

            return res.status(404).json({
                error:
                    "One or more teams were not found"
            });
        }


        // --------------------------------------------------
        // Make sure every requested team belongs to a club
        // the coach is authorized to edit.
        // --------------------------------------------------

        const unauthorizedTeams =
            teams.filter(
                team =>
                    !coachClubIds.has(
                        team.club_id
                    )
            );


        if (
            unauthorizedTeams.length > 0
        ) {

            return res.status(403).json({
                error:
                    "You do not have permission to modify affiliations for one or more clubs"
            });
        }


        // --------------------------------------------------
        // Perform updates and creates in one transaction
        // --------------------------------------------------

        await prisma.$transaction(
            async (tx) => {

                for (
                    const membership
                    of parsedMemberships
                ) {

                    // --------------------------------------
                    // Existing membership
                    // --------------------------------------

                    if (
                        membership
                            .teamMembershipId
                    ) {

                        // ----------------------------------
                        // Find the existing membership
                        // ----------------------------------

                        const existingMembership =
                            existingMemberships.find(
                                existing =>
                                    existing
                                        .team_membership_id ===
                                    membership
                                        .teamMembershipId
                            );


                        if (
                            !existingMembership
                        ) {
                            continue;
                        }


                        // ----------------------------------
                        // Make sure the EXISTING membership
                        // belongs to a club the coach can edit.
                        //
                        // This prevents a coach from taking
                        // an unauthorized membership ID and
                        // moving it onto one of their teams.
                        // ----------------------------------

                        const existingTeam =
                            teams.find(
                                team =>
                                    team.team_id ===
                                    existingMembership
                                        .team_id
                            );


                        if (
                            !existingTeam ||
                            !coachClubIds.has(
                                existingTeam.club_id
                            )
                        ) {
                            continue;
                        }


                        await tx.team_memberships.update({

                            where: {
                                team_membership_id:
                                    membership
                                        .teamMembershipId
                            },

                            data: {

                                team_id:
                                    membership
                                        .teamId,

                                start_date:
                                    membership
                                        .startDate
                                        ? new Date(
                                            membership
                                                .startDate
                                        )
                                        : null,

                                end_date:
                                    membership
                                        .endDate
                                        ? new Date(
                                            membership
                                                .endDate
                                        )
                                        : null
                            }
                        });


                    // --------------------------------------
                    // New membership
                    // --------------------------------------

                    } else {

                        await tx.team_memberships.create({

                            data: {

                                athlete_id:
                                    athleteId,

                                team_id:
                                    membership
                                        .teamId,

                                start_date:
                                    membership
                                        .startDate
                                        ? new Date(
                                            membership
                                                .startDate
                                        )
                                        : null,

                                end_date:
                                    membership
                                        .endDate
                                        ? new Date(
                                            membership
                                                .endDate
                                        )
                                        : null
                            }
                        });
                    }
                }
            }
        );


        // --------------------------------------------------
        // Return updated memberships
        // --------------------------------------------------

        const updatedMemberships =
            await prisma.team_memberships.findMany({

                where: {
                    athlete_id:
                        athleteId
                },

                include: {
                    team: {
                        include: {
                            club: true
                        }
                    }
                },

                orderBy: [
                    {
                        start_date:
                            "desc"
                    },
                    {
                        team_id:
                            "asc"
                    }
                ]
            });


        const result =
            updatedMemberships.map(
                membership => ({

                    teamMembershipId:
                        membership
                            .team_membership_id,

                    athleteId:
                        membership
                            .athlete_id,

                    teamId:
                        membership
                            .team_id,

                    startDate:
                        membership
                            .start_date,

                    endDate:
                        membership
                            .end_date,

                    team: {
                        teamId:
                            membership
                                .team
                                .team_id,

                        clubId:
                            membership
                                .team
                                .club_id,

                        name:
                            membership
                                .team
                                .name,

                        club: {
                            clubId:
                                membership
                                    .team
                                    .club
                                    .club_id,

                            name:
                                membership
                                    .team
                                    .club
                                    .name
                        }
                    }
                })
            );


        return res.status(200).json(
            result
        );

    } catch (error) {

        console.error(
            "Error updating athlete team memberships:",
            error
        );

        return res.status(500).json({
            error:
                "Server error updating athlete affiliations"
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
    updateAttendance,
    createSession,
    getSessions,
    getPieChartData,
    updateSession,
    deleteSession,
    createUser,
    createInvite,
    getInviteDetails,
    acceptInvite,
    getClubs,
    getTeams,
    getAthleteTeamMemberships,
    updateAthleteTeamMemberships
}