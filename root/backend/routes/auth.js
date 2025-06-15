// root/backend/routes/auth.js

const { Router } = require('express');
const controller = require('../controller'); //change to a different controller? auth one?
const router = Router();

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
      return res.json({ success: true, user });
    });
  })(req, res, next);
});

// Example: POST /auth/registration // etc...
router.post("/registration", controller.createUser);

module.exports = router;