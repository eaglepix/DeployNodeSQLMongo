const passport = require('passport');
const { Strategy } = require('passport-local');
const mongoose = require('mongoose');
const { mongoURL, options } = require('../../controllers/bookController');
const debug = require('debug')('app:local.strategy');
console.log('mongoURL', mongoURL, 'options', options);

module.exports = function localStrategy() {
    passport.use(new Strategy(
        {
            usernameField: 'username',
            passwordField: 'password'
        }, (username, password, done) => {
            var client = mongoose.connection;
            console.log('Not connected=0 =>', mongoose.connection.readyState);
            const dbName = 'libraryApp';

            (async function mongo() {
                console.log('Local.Strategy is connecting to Mongo Atlas Server ...');
                await mongoose.connect(mongoURL, options);
                console.log('Connected=1 =>', mongoose.connection.readyState);
                console.log('Connected correctly to MongoDB server ');
                client.on('error', console.error.bind(console, 'MongoDB Atlas connection error:'));

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
                // Close connection
                client.close();
            }());
        }));
};

