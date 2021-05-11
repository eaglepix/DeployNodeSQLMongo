const debug = require('debug')('app:bookController');
const numCustomer = 8; //MongoDB to extract number of books

// const MongoClient = require('mongodb').MongoClient;
const mongoose = require('mongoose');
// Reading configVar.json
const env = require('C:/Users/kl/Documents/configVar.json').mongoDB
const ID = env['ID2'];
const pw = env['pw2'];
const db = env['db1'];
const mongoURL = env['url1'] + ID + ":" + pw + "@" + env['url2'] + db + env['url3'];

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};

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

async function asyncCall(bookService, nav, req, res, option, mongoURL, options) {
    // MongoDB Atlas connection
    const dbName = 'libraryApp';  //libraryApp  pydot16

    if (option == 1) {
        console.log('calling randomuser photos');
        const faceLinkArray = await getJSON(numCustomer);
        console.log('randomuser successfully retrieved', faceLinkArray);

        (async () => {
            var client = mongoose.connection;
            console.log('Not connected=0 =>', mongoose.connection.readyState);
            console.log('Connecting to Mongo Atlas Server ...');
            await mongoose.connect(mongoURL, options);
            console.log('Connected=1 =>', mongoose.connection.readyState);
            console.log('Connected correctly to MongoDB server ');
            client.on('error', console.error.bind(console, 'MongoDB Atlas connection error:'));
            try {
                const db = client.useDb(dbName);

                const col = db.collection('books');
                const books = await col.find().toArray();

                let contactName = new Array();
                let customerName = new Array();
                let city = new Array();
                let customerNumber = new Array();

                for (let i = 0; i < books.length; i++) {
                    customerName.push(books[i].title);
                    contactName.push(books[i].author);
                    city.push(books[i].genre);
                    customerNumber.push(books[i]._id);
                };

                res.render('bookListView',
                    {
                        nav,
                        title: 'Mongo Books List',
                        length: books.length,
                        pageNum: 1,
                        customerName,
                        contactName,
                        city,
                        customerNumber,
                        picture: faceLinkArray,
                        link: '/MongoDB/'
                    });
            }
            catch (err) {
                console.error(`Error operating the database. \n${err}`);
                debug(err.stack);
            };
            client.close();
        })();

    } else if (option == 2) {
        const numCustomer = 1;
        const faceLinkArray = await getJSON(numCustomer);
        console.log('async', faceLinkArray);
        debug(req.params);
        const { id } = req.params;

        (async () => {
            var client = mongoose.connection;
            console.log('Not connected=0 =>', mongoose.connection.readyState);
            console.log('Connecting to Mongo Atlas Server ...');
            await mongoose.connect(mongoURL, options);
            console.log('Connected=1 =>', mongoose.connection.readyState);
            console.log('Connected correctly to MongoDB server ');
            client.on('error', console.error.bind(console, 'MongoDB Atlas connection error:'));
            try {
                const db = client.useDb(dbName);

                const col = db.collection('books');
                const book = await col.findOne({ _id: new mongoose.Types.ObjectId(id) });
                debug(book);

                // API connect to openLibrary
                const libraryAPI = await bookService.getBookById(book.title);
                console.log('libraryAPI', libraryAPI);

                let { title, author, genre, _id, } = book;
                console.log('MongoDB Book details:', book, title, author, genre, _id);

                res.render('bookView',
                    {
                        nav,
                        title: 'Individual Book Details',
                        customerName: title,
                        contactName: author,
                        database: 'MongoDB',
                        pageNum: '',
                        comm1: `Genre: ${genre}`,
                        comm2: `URL: ${libraryAPI.link}`,
                        comm3: `First Published Year: ${libraryAPI.first_publish_year}`,
                        detail_1: `Book ID: ${libraryAPI.OLID_ID}`,
                        detail_2: `Subject: ${libraryAPI.subject}`,
                        detail_3: `Description: ${libraryAPI.description}`,
                        picture: `http://covers.openlibrary.org/a/olid/${libraryAPI.authorpix}-L.jpg`,
                        // picture: `http://covers.openlibrary.org/b/olid/${book.desc.bookCover}-L.jpg`,
                        // picture: faceLinkArray[0],
                    });
            }
            catch (err) {
                console.error(`Error operating the database. \n${err}`);
                debug(err.stack);
            };
            client.close();
        })();
    };
};


function bookController(bookService, nav) {
    console.log('bookService', bookService);
    function getIndex(req, res) {
        asyncCall(bookService, nav, req, res, 1, mongoURL, options);
    }
    function getById(req, res) {
        asyncCall(bookService, nav, req, res, 2, mongoURL, options);
    }
    function middleware(req, res, next) {
        if (req.user) {
            next();
        } else {
            res.redirect('/');
        }
    }
    return {
        getIndex, getById, middleware
    };
};

module.exports = {
    'bookController': bookController,
    'mongoURL': mongoURL,
    'options': options
};