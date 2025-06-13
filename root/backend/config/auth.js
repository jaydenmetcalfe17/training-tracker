// root/backend/config/auth.js

const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
require('dotenv').config(); 
const pool = require('./database');
const queries = require('../queries');

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
}, 
    async (accessToken, refreshToken, profile, done) => {
        const account = profile._json;

        // is there a better way to store this?
        let user = {};

        console.log(account);
        try {
            const currentUserQuery = await pool.query(queries.checkUserAuth, [account.sub.toString()]);
            if (currentUserQuery.rows.length === 0) {
                // create user
                await pool.query(queries.createUser, [account.name, account.sub.toString()]); //option to do img which would be account.picture
                const id = await pool.query(queries.getUserID, [account.sub.toString()]);

                user = {
                    userId: id.rows[0].user_id,
                    username: account.name,
                    // img: account.picture
                }

            } else {
                // user already exists
                user = {
                    userId: currentUserQuery.rows[0].user_id,
                    username: currentUserQuery.rows[0].username,
                    // img: currentUserQuery.rows[0].img (but img is not a column in the database table yet)
                }
            }
            done(null, user);
        } catch (error) {
            // console.error('Error checking user authentication: ', error);
            // res.status(500).send( {error: 'Server error checking user authentication'} );
            done(error);
        }
    }
));

passport.serializeUser((user, done) => {
    // loads into req.session.passport.user
    done(null, user);
});

passport.deserializeUser((user, done) => {
    // loads into req.user
    done(null, user);
});