// root/backend/middleware/auth.js

const prisma = require("../prismaClient");

// --------------------------------------------------
// Require user to be logged in
// --------------------------------------------------

function requireAuth(req, res, next) {
    console.log("USER IN MIDDLEWARE:", req.user);

    if (!req.user) {
        return res.status(401).json({
            error: "Not logged in"
        });
    }

    next();
}

// --------------------------------------------------
// Require user to be a coach
// --------------------------------------------------

function requireCoach(req, res, next) {
    console.log("USER IN MIDDLEWARE:", req.user);

    if (!req.user) {
        return res.status(401).json({
            error: "Not logged in"
        });
    }

    if (req.user.status !== "coach") {
        return res.status(403).json({
            error: "Coaches only"
        });
    }

    next();
}

// --------------------------------------------------
// Require coach to belong to a specific club
// --------------------------------------------------

async function requireClubCoach(req, res, next) {

    console.log(
        "USER IN CLUB COACH MIDDLEWARE:",
        req.user
    );

    console.log(
        "REQUEST PARAMS:",
        req.params
    );

    console.log(
        "REQUEST BODY:",
        req.body
    );

    // --------------------------------------------------
    // Must be logged in
    // --------------------------------------------------

    if (!req.user) {
        return res.status(401).json({
            error: "Not logged in"
        });
    }

    // --------------------------------------------------
    // Must be a coach
    // --------------------------------------------------

    if (req.user.status !== "coach") {
        return res.status(403).json({
            error: "Coaches only"
        });
    }

    // --------------------------------------------------
    // Get team IDs
    // --------------------------------------------------

    const { teamIds } = req.body;

    // --------------------------------------------------
    // Validate team IDs
    // --------------------------------------------------

    if (
        !Array.isArray(teamIds) ||
        teamIds.length === 0
    ) {
        return res.status(400).json({
            error:
                "Request must contain at least one team ID"
        });
    }

    const parsedTeamIds =
        teamIds.map((id) => Number(id));

    if (
        parsedTeamIds.some(
            (id) => !Number.isInteger(id)
        )
    ) {
        return res.status(400).json({
            error:
                "All team IDs must be valid integers"
        });
    }

    // --------------------------------------------------
    // Remove duplicate team IDs
    // --------------------------------------------------

    const uniqueTeamIds =
        [...new Set(parsedTeamIds)];

    try {

        // --------------------------------------------------
        // Find ALL requested teams
        // --------------------------------------------------

        const teams =
            await prisma.teams.findMany({
                where: {
                    team_id: {
                        in: uniqueTeamIds
                    }
                },

                select: {
                    team_id: true,
                    club_id: true
                }
            });

        // --------------------------------------------------
        // Make sure every requested team exists
        // --------------------------------------------------

        if (
            teams.length !==
            uniqueTeamIds.length
        ) {

            const foundTeamIds =
                teams.map(
                    (team) =>
                        team.team_id
                );

            const missingTeamIds =
                uniqueTeamIds.filter(
                    (teamId) =>
                        !foundTeamIds.includes(
                            teamId
                        )
                );

            console.error(
                "Missing team IDs:",
                missingTeamIds
            );

            return res.status(404).json({
                error:
                    "One or more teams were not found",
                missingTeamIds
            });
        }

        // --------------------------------------------------
        // Get unique clubs represented by those teams
        // --------------------------------------------------

        const clubIds =
            [
                ...new Set(
                    teams.map(
                        (team) =>
                            team.club_id
                    )
                )
            ];

        console.log(
            "Requested team IDs:",
            uniqueTeamIds
        );

        console.log(
            "Clubs belonging to requested teams:",
            clubIds
        );

        // --------------------------------------------------
        // Check coach membership in EVERY club
        // --------------------------------------------------

        const memberships =
            await prisma.coach_memberships.findMany({
                where: {
                    user_id:
                        req.user.user_id,

                    team: {
                        club_id: {
                            in: clubIds
                        }
                    }
                },

                select: {
                    team: {
                        select: {
                            club_id: true
                        }
                    }
                }
            });

        // --------------------------------------------------
        // Determine which clubs the coach belongs to
        // --------------------------------------------------

        const coachClubIds =
            [
                ...new Set(
                    memberships.map(
                        (membership) =>
                            membership.team.club_id
                    )
                )
            ];

        console.log(
            "Coach belongs to clubs:",
            coachClubIds
        );

        // --------------------------------------------------
        // Check that coach belongs to EVERY requested club
        // --------------------------------------------------

        const unauthorizedClubIds =
            clubIds.filter(
                (clubId) =>
                    !coachClubIds.includes(
                        clubId
                    )
            );

        if (
            unauthorizedClubIds.length > 0
        ) {

            console.error(
                "Coach does not have access to clubs:",
                unauthorizedClubIds
            );

            return res.status(403).json({
                error:
                    "You do not have permission to access one or more clubs",
                unauthorizedClubIds
            });
        }

        // --------------------------------------------------
        // All teams and clubs are authorized
        // --------------------------------------------------

        console.log(
            "Club authorization successful"
        );

        next();

    } catch (error) {

        console.error(
            "Error checking club coach membership:",
            error
        );

        return res.status(500).json({
            error:
                "Server error checking club permissions"
        });
    }
}

module.exports = {
    requireAuth,
    requireCoach,
    requireClubCoach
};