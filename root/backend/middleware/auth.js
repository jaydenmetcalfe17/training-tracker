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
    // Get club ID
    // --------------------------------------------------

    const clubId = Number(
        req.params.clubId ||
        req.body.clubId
    );

    // --------------------------------------------------
    // Validate club ID
    // --------------------------------------------------

    if (!Number.isInteger(clubId)) {
        return res.status(400).json({
            error: "Invalid club ID"
        });
    }

    try {

        // --------------------------------------------------
        // Check whether coach belongs to this club
        // --------------------------------------------------

        const membership =
            await prisma.coach_memberships.findFirst({
                where: {
                    user_id: req.user.user_id,

                    team: {
                        club_id: clubId
                    }
                }
            });

        // --------------------------------------------------
        // Coach does not belong to this club
        // --------------------------------------------------

        if (!membership) {
            return res.status(403).json({
                error:
                    "You do not have permission to access this club"
            });
        }

        // --------------------------------------------------
        // Coach belongs to club
        // --------------------------------------------------

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