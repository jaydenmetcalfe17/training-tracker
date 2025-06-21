// root/backend/routes/auth.js

const { Router } = require('express');
const controller = require('../controller'); //change to a different controller? auth one?
const router = Router();
const pool = require('../config/database');

const passport = require('passport');


router.get("/", (req, res) => {
    res.send("authing it up");
});

router.get("/google", passport.authenticate("google", {
    scope: ["profile", "email"], 
}));

router.get("/google/callback", passport.authenticate("google", { 
        session: true 
    }),
    (req, res) => {
        res.send(req.user);
    }
);

// router.post("/login", passport.authenticate("local", {
//     successRedirect: "/", // successRedirect: "/dashboard",
//     failureRedirect: "/login",
// }));

router.post('/login', (req, res, next) => {
  passport.authenticate("local", (error, user, info) => {
    if (error) {
        return next(error);
    }

    if (!user) {
      // Login failed
      return res.status(401).json({ success: false, message: info.message || 'Login failed' });
    }

    // Login success
    req.logIn(user, (error) => {
      if (error){
        return next(error);
      }
      // Send user info or success message as JSON
      const safeUser = {
        userId: user.user_id,
        userFirstName: user.name,
        email: user.email,
        status: user.status
      };
      console.log("Safe user passed through: ", safeUser);
      return res.json({ success: true, safeUser });
    });
  })(req, res, next);
});

// Example: POST /auth/registration // etc...
router.post("/registration", controller.createUser);


// Database test route:
router.get('/testdb', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ connected: true, time: result.rows[0].now });
  } catch (error) {
    console.error('DB connection error:', error);
    res.status(500).json({ connected: false, error: error.message });
  }
});

module.exports = router;