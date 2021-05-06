const passport = require('passport');
const { Strategy } = require('passport-local');
const { MongoClient } = require('mongodb');  //.MongoClient
const debug = require('debug')('app:local.strategy');


module.exports = function localStrategy() {
    passport.use(new Strategy(
        {
            usernameField: 'username',
            passwordField: 'password'
        }, (username, password, done) => {
            const url = 'mongodb://localhost:27017';
            const dbName = 'libraryApp';
            (async function mongo() {
                let client;
                // try {
                client = await MongoClient.connect(url);
                debug('Connected correctly to MongoDB server');
                const db = client.db(dbName);
                const col = db.collection('users');

                const user = await col.findOne({ username });
                debug(user);
                if (user === null) {
                    return done(null, false, { message: 'Incorrect username.' });
                } else if (user.username == username && user.password === password) {
                    return done(null, user, { message: 'Successfully logged in!' });
                } else {
                    return done(null, false, { message: 'Incorrect password.' });
                };
                // Close connection
                client.close();
            }
                ());
        }));
};

