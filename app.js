const express = require('express');
const chalk = require('chalk');
const debug = require('debug')('app');
const morgan = require('morgan');
const path = require('path');
const bodyParser = require('body-parser');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const app = express();
const port = process.env.PORT || 3000; // Boolean: if main port fails use backup port 3000
//Not recommended to do port this way: process.env.PORT doesn't check if the port is available

// cleardb MySQL server connection:
const mysql = require('mysql');
const pool = mysql.createPool(process.env.MYSQL_URL);

// To deploy the databases locally:
// const { cleardb } = require('C:/Users/kl/Documents/configVar.json');
// const pool = mysql.createPool({
//     connectionLimit: 10,
//     host: cleardb.host,
//     port: 3306,
//     user: cleardb.Username,
//     password: cleardb.Password,
//     database: cleardb.database
// });
// connectionLimit: 10,
// host: 'localhost',
// port: 3306,
// user: 'root',
// password: null,
// database: 'classicmodels'

// MongoDB Atlas connection variables
const mongoose = require('mongoose');
// Reading configVar.json
// const mgo = require('C:/Users/kl/Documents/configVar.json').mongoDB;
// const ID = mgo['ID2'];
// const pw = mgo['pw2'];
// const db = mgo['db1'];
// const mongoURL = mgo['url1'] + ID + ":" + pw + "@" + mgo['url2'] + db + mgo['url3'];
const mongoURL = process.env.MONGODB_URL;

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};

// 2 different ways of module exports:
module.exports = {
    mongoDBconnection: (async () => {
        var client = mongoose.connection;
        console.log('Not connected=0 =>', mongoose.connection.readyState);
        console.log('Connecting to Mongo Atlas Server ...');
        await mongoose.connect(mongoURL, options);
        console.log('Connected=1 =>', mongoose.connection.readyState);
        console.log('Connected correctly to MongoDB server ');
        client.on('error', console.error.bind(console, 'MongoDB Atlas connection error:'));
        // console.log(client);
        return client;
    })
};

pool.getConnection((err, connection) => {
    if (err) throw err => { debug(err) };
    console.log(`connected as id ${connection.threadId}`);
    console.log(`Mysql listening at port ${chalk.bgRed(connection.config.host, connection.config.port)}`);
    module.exports.sqlConnection = connection;
});

// app.use(morgan('combined'));
app.use(morgan('tiny'));  //spill out less info ... GET/304
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({ secret: 'library' }));

require('./src/config/passport.js')(app);

app.use(express.static(path.join(__dirname, '/public')));
app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/jquery/dist')));
app.set('views', './src/views');
app.set('view engine', 'ejs');
// app.set('view engine', 'pug');

const nav = [
    { link: '/books', title: 'SQL-Customers' },
    { link: '/MongoDB', title: 'MongoDB-Books' }
];

const bookRouter = require('./src/routes/bookRoutes')(nav);
const adminRouter = require('./src/routes/adminRoutes')(nav);
const mongoRouter = require('./src/routes/mongoRoutes')(nav);
const authRouter = require('./src/routes/authRoutes')(nav);

app.use('/books', bookRouter);
app.use('/admin', adminRouter);
app.use('/MongoDB', mongoRouter);
app.use('/auth', authRouter);

app.get('/', (req, res) => {
    res.render('index',
        {
            nav: [{ link: '/books', title: 'SQL - Customer List' },
            { link: '/MongoDB', title: 'MongoDB - Books' },
            { link: '/admin', title: 'Admin: Add books to MongoDB' }],
            title: 'Main Menu'
        });  //for ejs
});

app.listen(port, function () {
    debug(`listening at port ${chalk.green(port)}`);
});

