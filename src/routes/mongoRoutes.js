const express = require('express');
const mongoRouter = express.Router();
const bookService = require('../services/openLibraryService');

const { bookController } = require('../controllers/bookController');

function router(nav) {
    const { getIndex, getById, middleware } = bookController(bookService, nav);
    mongoRouter.use(middleware);
    mongoRouter.route('/')
        .get(getIndex);
    mongoRouter.route('/:id')
        // .all((req,res,next) =>{})    to inject middleware if want
        .get(getById);
    return mongoRouter;
};

module.exports = router;
