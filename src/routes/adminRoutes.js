const express = require('express');
const adminRouter = express.Router();
const { mongoDBconnection } = require('../../app');
const debug = require('debug')('app:adminRoutes');

const books = [
    {
        title: 'War and Peace',
        genre: 'Historical Fiction',
        author: 'Lev Nikolayevich Tolstoy',
        read: false
    },
    {
        title: 'Les Misérables',
        genre: 'Historical Fiction',
        author: 'Victor Hugo',
        read: false
    },
    {
        title: 'The Time Machine',
        genre: 'Science Fiction',
        author: 'H. G. Wells',
        read: false
    },
    {
        title: 'A Journey into the Center of the Earth',
        genre: 'Science Fiction',
        author: 'Jules Verne',
        read: false
    },
    {
        title: 'The Dark World',
        genre: 'Fantasy',
        author: 'Henry Kuttner',
        read: false
    },
    {
        title: 'The Wind in the Willows',
        genre: 'Fantasy',
        author: 'Kenneth Grahame',
        read: false
    },
    {
        title: 'Life On The Mississippi',
        genre: 'History',
        author: 'Mark Twain',
        read: false
    },
    {
        title: 'Childhood',
        genre: 'Biography',
        author: 'Lev Nikolayevich Tolstoy',
        read: false
    }];

module.exports = function router(nav) {
    adminRouter.route('/')
        .get((req, res) => {
            const dbName = 'libraryApp';

            (async function mongo() {
                try {
                    const client = await mongoDBconnection();
                    const db = client.useDb(dbName);
                    if (books.length == 0) return res.status(422).json('No data to insert');
                    const response = await db.collection('books').insertMany(books);
                    res.json({ 'Books inserted': response });
                } catch (err) {
                    debug(err.stack);
                }
                // client.close();
            }());
            // res.send('inserting books');
        });
    return adminRouter;
};

// Notes: To access the MongoDB:
// C:\Program Files\MongoDB\Server\4.4\bin>mongo
// > show dbs
// > use libraryApp
// > db.books.find().pretty()     (without pretty() it would look gross)
