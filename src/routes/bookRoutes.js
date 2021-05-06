const express = require('express');
const bookRouter = express.Router();
const debug = require('debug')('app:bookRoutes');

const getConnection = () => {
    return require('../../app');
}
const numCustomer = 10; //SQL to extract number of customers
var currPage;

function getJSON(numCustomer) {
    return new Promise(resolve => {
        const request = require('request');
        let url = `https://randomuser.me/api/?results=${numCustomer}`;

        let options = { json: true };
        var linkArray = [];
        request(url, options, (error, res, body) => {
            if (error) {
                resolve(error)
            };

            if (!error && res.statusCode == 200) {
                // do something with JSON, using the 'body' variable
                for (let i = 0; i < numCustomer; i++) {
                    linkArray.push(body.results[i].picture.large);
                    console.log('from requestHTTP', linkArray[i]);
                }
            };
            resolve(linkArray);
        });
    });
};

async function asyncCall(nav, req, res, option, numCustomer) {
    console.log('calling getJSON()');

    if (option == 1) {
        const faceLinkArray = await getJSON(numCustomer);
        console.log('async', faceLinkArray);

        let pgNum;
        debug(req.params);
        console.log('req.params',req.params);
        if ( Object.keys(req.params).length === 0 ) {
            console.log('req.param is null');
            pgNum = 1;
        } else {
            pgNum = req.params.pgNum;
            console.log('pgNum',pgNum);
        }
        currPage = Number(pgNum);
        console.log('currPage',currPage);
        offsetNum = (currPage-1)*numCustomer;

        // example: query(sqlString, callback)
        await getConnection().query(`SELECT * from customers LIMIT ${numCustomer} OFFSET ${offsetNum}`, (err, result) => {
            // connection.release(); // When done with the connection, release it.
            debug(result);
            let contactName = new Array();
            let customerName = new Array();
            let city = new Array();
            let customerNumber = new Array();

            for (let i = 0; i < result.length; i++) {
                customerName.push(result[i].customerName);
                contactName.push([result[i].contactFirstName, result[i].contactLastName].join(' '));
                city.push(result[i].city);
                customerNumber.push(result[i].customerNumber);
            }
            console.log(customerName, contactName, customerName, customerNumber);
            res.render('bookListView',
                {
                    nav,
                    title: 'SQL Customer List',
                    pageNum: currPage,
                    length: result.length,
                    customerName,
                    contactName,
                    city,
                    customerNumber,
                    picture: faceLinkArray,
                    link: '/books/indv/'
                });
        });

    } else if (option == 2) {
        const numCustomer = 1;
        const faceLinkArray = await getJSON(numCustomer);
        console.log('async', faceLinkArray);

        console.log('currPage', currPage);
        debug(req.params);
        const { customerNumber } = req.params;
        // const { id } = req.params;
        // connection.input('customerNumber', customerNumber)
        // .query(`SELECT * from customers WHERE customerNumber=@customerNumber}`, (err, result) => {
        // example: query(sqlString, callback)
        await getConnection().query('SELECT * from customers WHERE customerNumber=?', [customerNumber], (err, result) => {
            // getConnection().query(`SELECT * from customers WHERE customerNumber=${customerNumber}`, (err, result) => {
            console.log('Result:', result[0]);
            console.log(result[0].customerName);
            let { customerName, city, country, customerNumber, phone, salesRepEmployeeNumber, creditLimit } = result[0];
            let contactName = [result[0].contactFirstName, result[0].contactLastName].join(' ')

            res.render('bookView',
                {
                    nav,
                    database: 'books',
                    pageNum: currPage,
                    title: 'Individual Customer List',
                    customerName,
                    contactName,
                    comm1: `City: ${city}`,
                    comm2: `Country: ${country}`,
                    comm3: `Customer Number: ${customerNumber}`,
                    detail_1: `Phone: ${phone}`,
                    detail_2: `Sales Rep. Number: ${salesRepEmployeeNumber}`,
                    detail_3: `Credit Limit: ${creditLimit}`,
                    picture: faceLinkArray[0],
                });
            // res.send('hello single book');
        });
    };
};

function router(nav) {
    let offsetNum;

    bookRouter.use((req, res, next) => {
        if (req.user) {
            next();
        } else {
            res.redirect('/');
        }
    });

    bookRouter.route('/').get((req, res) => {
        asyncCall(nav, req, res, 1, numCustomer);
    });
    bookRouter.route('/indv/:customerNumber')
        // .all((req,res,next) =>{})    to inject middleware if want
        .get((req, res) => {
            asyncCall(nav, req, res, 2, numCustomer);
        });

    bookRouter.route('/:pgNum')
        // .all((req,res,next) =>{})    to inject middleware if want
        .get((req, res) => {
            asyncCall(nav, req, res, 1, numCustomer);
        });


    return bookRouter;
};

// bookRouter.route('/').get((req, res) => {
//     const request = new sql.Request();
//     request.query('Select * from customers')
//         .then((result) => {
//             debug(result);
//             console.log(result);
//             res.render('bookListView',
//                 {
//                     nav,
//                     title: 'Library',
//                     books: result.customerName
//                 });
//         });
// bookRouter.route('/:id').get((req, res) => {
//     const { id } = req.params;
//     res.render('bookView',
//         {
//             nav,
//             title: 'Library',
//             book: books[id]
//         });
//     res.send('hello single book');
// });
// return bookRouter;
// });

module.exports = router;