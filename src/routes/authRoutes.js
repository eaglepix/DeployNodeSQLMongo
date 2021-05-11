const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const debug = require('debug')('app:authRoutes');
const authRouter = express.Router();
const {mongoURL, options}  = require('../controllers/bookController')
const passwordValidator = require('password-validator');
// Create a schema
var schema = new passwordValidator();
// Add properties to it
schema
    .is().min(8)                                    // Minimum length 8
    .is().max(100)                                  // Maximum length 100
    .has().uppercase()                              // Must have uppercase letters
    .has().lowercase()                              // Must have lowercase letters
    .has().digits(1)                                // Must have at least 1 digits
    .has().not().spaces()                           // Should not have spaces
    .is().not().oneOf(['Passw0rd', 'Password123']); // Blacklist these values

function checkValidID_PW(username, password) {
    // Validate against a password string
    if (schema.validate(password)) {
        console.log('Password valid');
        return true;
    } else {
        console.log('Password invalid');
        return false
    }
};

function router(nav) {
    authRouter.route('/signUp')
        .post((req, res) => {
            (async function addUser() {
                const dbName = 'libraryApp';

                // check user details and create user
                const { username, password } = req.body;

                // var client = mongoose.connection;
                // console.log('Not connected=0 =>', mongoose.connection.readyState);
                // console.log('Connecting to Mongo Atlas Server ...');
                // await mongoose.connect(mongoURL, options);
                // console.log('Connected=1 =>', mongoose.connection.readyState);
                // console.log('Connected correctly to MongoDB server ');
                // client.on('error', console.error.bind(console, 'MongoDB Atlas connection error:'));

                const validEntry = await checkValidID_PW(username, password);
                if (!validEntry) {
                    req.session.error = 'Incorrect username or password';
                    res.redirect('../../?error=' + encodeURIComponent('Incorrect_Credential'));
                    delete req.session.error; // remove from further requests
                } else {
                    try {
                        var client = mongoose.connection;
                        console.log('Not connected=0 =>', mongoose.connection.readyState);
                        console.log('Connecting to Mongo Atlas Server ...');
                        await mongoose.connect(mongoURL, options);
                        console.log('Connected=1 =>', mongoose.connection.readyState);
                        console.log('Connected correctly to MongoDB server ');
                        client.on('error', console.error.bind(console, 'MongoDB Atlas connection error:'));
                        
                        const db = client.useDb(dbName);
                        const col = db.collection('users');
                        const user = { username, password };
                        const results = await col.insertOne(user);
                        debug(results);
                        req.login(results.ops[0], () => {
                            res.redirect('/auth/profile');
                        });
                    } catch (err) {
                        debug(err);
                    }
                };
            }());
        });
    authRouter.route('/signin')
        .get((req, res) => {
            res.render('signin', {
                nav,
                title: 'Sign In Option'
            });
        })
        .post(passport.authenticate('local', {
            successRedirect: '/auth/profile',
            failureRedirect: '/',
        }));
    authRouter.route('/profile')
        .all((req, res, next) => {
            if (req.user) {
                next();
            } else {
                res.redirect('/');
            }
        })
        .get((req, res) => {
            // Output username, password in json format under '/auth/profile'
            // res.json(req.user)
            res.render('signInMain', {
                nav,
                title: 'Select One'
            });
        });
    return authRouter;
};
module.exports = router;
