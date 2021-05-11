const express = require('express');
const chalk = require('chalk');
const debug = require('debug')('app');
const morgan = require('morgan');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');

//---------------------------------------------------------
const app = express();
const port = process.env.PORT || 3000;

// const MongoClient = require('mongodb').MongoClient;
const mongoose = require('mongoose');
// Reading configVar.json
const env = require('C:/Users/kl/Documents/configVar.json').mongoDB
const ID = env['ID2'];
const pw = env['pw2'];
const db = env['db1'];

var mongoURL = env['url1'] + ID + ":" + pw + "@" + env['url2'] + db + env['url3'];
// const mongoURL = 'mongodb+srv://eaglepix:England1@pydot16.tafgx.mongodb.net/pydot16?retryWrites=true&w=majority';
// const mongoURL = 'mongodb://eaglepix:England@pydot16-shard-00-00.tafgx.mongodb.net:27017,
//                      pydot16-shard-00-01.tafgx.mongodb.net:27017,
//                      pydot16-shard-00-02.tafgx.mongodb.net:27017/pydot16?
//                      ssl=true&replicaSet=atlas-yv2p0m-shard-0&authSource=admin&retryWrites=true&w=majority';
console.log(mongoURL);

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};

// app.use(morgan('combined'));
app.use(morgan('tiny'));  //spill out less info ... GET/304
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({ secret: 'library' }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('views', './src/views');
app.set('view engine', 'ejs');


app.get('/', (req, res) => {
    (async () => {
        var client = mongoose.connection;
        console.log('Not connected=0 =>', mongoose.connection.readyState);
        console.log('Connecting to Mongo Atlas Server ...');
        await mongoose.connect(mongoURL, options);
        console.log('Connected=1 =>', mongoose.connection.readyState);
        console.log('Connected correctly to MongoDB server ');
        client.on('error', console.error.bind(console, 'MongoDB Atlas connection error:'));
        try {
            const dbName = 'pydot16';  //libraryApp
            const db = client.useDb(dbName);

            // const col = await db.collection('books').find().toArray(); //users
            const col = await db.collection('users').findOne({ username: 'tom' }); //books

            console.log('COL------------------\n', col);
            res.json(col);
        }
        catch (err) {
            console.error(`Error operating the database. \n${err}`);
            debug(err.stack);
        };
        client.close();
    })();
});


app.listen(port, function () {
    debug(`listening at port ${chalk.green(port)}`);
    console.log(`app is listening at port ${chalk.bgGreen(port)}`);
});
