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
const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: null,
    database: 'classicmodels'
});
pool.getConnection((err, connection) => {
    if (err) throw err => { debug(err) };
    console.log(`connected as id ${connection.threadId}`);
    console.log(`listening at port ${chalk.green(port)}`);
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
    // res.render('index', { list: ['a', 'b'] }); //for pug
    // res.send('Hello from my library app');
    // res.sendFile(path.join(__dirname, '/views/index.html'));
    // with path.jion ... can anyhow put in /, \ lol
});

app.listen(port, function () {
    debug(`listening at port ${chalk.green(port)}`);
});

