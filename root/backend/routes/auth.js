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

// Example: POST /api/registration // etc...
router.post("/registration", controller.createUser);

module.exports = router;