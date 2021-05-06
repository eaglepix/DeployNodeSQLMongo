const express = require('express');
const bookRouter = express.Router();
const bookService = require('../services/openLibraryService');

const bookController = require('../controllers/bookController');

function router(nav) {
    const { getIndex, getById, middleware } = bookController(bookService, nav);
    bookRouter.use(middleware);
    bookRouter.route('/')
        .get(getIndex);
    bookRouter.route('/:id')
        // .all((req,res,next) =>{})    to inject middleware if want
        .get(getById);
    return bookRouter;
};

module.exports = router;


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

