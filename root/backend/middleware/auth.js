// root/backend/middleware/auth.js

function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Not logged in" });
  }
  next();
}

function requireCoach(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Not logged in" });
  }

  if (req.user.status !== "coach") {
    return res.status(403).json({ error: "Coaches only" });
  }

  next();
}

module.exports = {
  requireAuth,
  requireCoach
};