const passport = require('passport');
const { Strategy } = require('passport-local');
const { mongoDBconnection } = require('../../../app');
const debug = require('debug')('app:local.strategy');

module.exports = function localStrategy() {
    passport.use(new Strategy(
        {
            usernameField: 'username',
            passwordField: 'password'
        }, (username, password, done) => {

            const dbName = 'libraryApp';

            (async function mongo() {
                const client = await mongoDBconnection();
                const db = client.useDb(dbName);
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
            }());
        }));
};

