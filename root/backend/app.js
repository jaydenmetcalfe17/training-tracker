const express = require('express');
const { spawn } = require('child_process');
const bodyParser = require('body-parser');
const session = require('express-session');
const routes = require('./routes/routes');
const authRoutes = require('./routes/auth');
const cors = require('cors');
const passport = require('passport');
require('./config/auth');
require('dotenv').config();


const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL
}));

app.use(
    session({
        secret: process.env.COOKIE_SECRET,
        cookie: {
            secure: process.env.NODE_ENV === 'production' ? 'true' : 'auto',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        },
        resave: false,
        saveUninitialized: false,
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(express.urlencoded({extended: false}));


app.use("/api", routes);
app.use('/auth', authRoutes);



// to get rid of silly backend favicon error
app.get('/favicon.ico', (req, res) => res.status(204).end());


app.listen(port, () => {
    console.log("Server started on port", port);
});