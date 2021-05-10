const express = require('express');
const chalk = require('chalk');
const debug = require('debug')('app');
const morgan = require('morgan');
const path = require('path');
const bodyParser = require('body-parser');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const session = require('express-session');

// const sql = require('mssql');
//--------------------------------------------------------
//: Own modification using different library
const mysql = require('mysql');
//---------------------------------------------------------
const app = express();
const port = process.env.PORT || 3000;

// MySQL - own adaptation
// const pool = mysql.createPool({
//     connectionLimit: 10,
//     host: 'localhost',
//     port: 3306,
//     user: 'root',
//     password: null,
//     database: 'classicmodels'
// });

const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'remotemysql.com',
    port: 3306,
    user: 'mNyDF0sDUp',
    password: '7DmGKyNdaL',
    database: 'mNyDF0sDUp'
});
// DB_HOST=remotemysql.com
// DB_USER=mNyDF0sDUp
// DB_PASSWORD=7DmGKyNdaL
// DB_NAME=mNyDF0sDUp
// DB_PORT=3306

pool.getConnection((err, connection) => {
    if (err) throw err => { debug(err) };
    console.log(`Mysql connected as id ${connection.threadId}`);
    console.log(`Mysql listening at port ${chalk.bgRed(connection.config.host, connection.config.port)}`);
    module.exports = connection;
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
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/img', express.static(path.join(__dirname, 'img')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
const searchRouter = require('./src/routes/searchRoutes')(nav);


app.use('/books', bookRouter);
app.use('/admin', adminRouter);
app.use('/MongoDB', mongoRouter);
app.use('/auth', authRouter);
app.use('/search', searchRouter);


app.get('/', (req, res) => {
    res.render('indexQM',
        {
            nav: [{ link: '/books', title: 'SQL - Customer List' },
            { link: '/MongoDB', title: 'MongoDB - Books' },
            { link: '/admin', title: 'Admin: Add books to MongoDB' }],
            title: 'Main Menu'
        });  //for ejs
});

app.listen(port, function () {
    debug(`listening at port ${chalk.green(port)}`);
    console.log(`app is listening at port ${chalk.bgGreen(port)}`);
});

