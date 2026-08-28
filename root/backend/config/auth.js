// root/backend/config/auth.js

// require('dotenv').config({ path: './.env' }); // explicit path

const passport = require('passport');
// const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const {Strategy: LocalStrategy } = require('passport-local');
const prisma = require('../prismaClient');
const bcrypt = require('bcrypt');


passport.use(new LocalStrategy ({
    usernameField: "email",
    passwordField: "password",
},
    async (email, password, done) => {
        try {
            const user = await prisma.users.findUnique({
                where: {
                    email: email
                }
            });

            if (!user) {
                return done(null, false, {
                    message: 'No account associated with this email.'
                });
            }

            const isMatch = await bcrypt.compare(
                password,
                user.password
            );

            if (isMatch) {
                return done(null, user);
            }

            return done(null, false, {
                message: 'Incorrect password!'
            });
        } catch (error) {
            return done(error);
        }
    }
));

 






// passport.use(new GoogleStrategy({
//     clientID: process.env.CLIENT_ID,
//     clientSecret: process.env.CLIENT_SECRET,
//     callbackURL: process.env.GOOGLE_CALLBACK_URL
// }, 
//     async (accessToken, refreshToken, profile, done) => {
//         const account = profile._json;

//         // is there a better way to store this?
//         let user = {};

//         console.log(account);
//         try {
//             const currentUserQuery = await pool.query(queries.users.checkUserAuth, [account.sub.toString()]);
//             if (currentUserQuery.rows.length === 0) {
//                 // create user
//                 await pool.query(queries.users.createGoogleUser, [account.name, account.sub.toString(), account.email]); //option to do img which would be account.picture
//                 const id = await pool.query(queries.users.getUserID, [account.sub.toString()]);

//                 user = {
//                     userId: id.rows[0].user_id,
//                     userName: account.name,
//                     email: account.email,
//                     // img: account.picture
                    
//                 }

//             } else {
//                 // user already exists
//                 user = {
//                     userId: currentUserQuery.rows[0].user_id,
//                     userName: currentUserQuery.rows[0].name,
//                     email: currentUserQuery.rows[0].email,
//                     // img: currentUserQuery.rows[0].img (but img is not a column in the database table yet)
//                 }
//             }
//             done(null, user);
//         } catch (error) {
//             // console.error('Error checking user authentication: ', error);
//             // res.status(500).send( {error: 'Server error checking user authentication'} );
//             done(error);
//         }
//     }
// ));

passport.serializeUser((user, done) => {
    // loads into req.session.passport.user
    done(null, user);
});

passport.deserializeUser((user, done) => {
    // loads into req.user
    done(null, user);
});