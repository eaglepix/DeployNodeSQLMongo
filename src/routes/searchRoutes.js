const express = require('express');
const debug = require('debug')('app:searchRoutes');
const searchRouter = express.Router();


function router(nav) {
    searchRouter.route('/search')
        .get((req, res) => {
            (async function searchTicker() {
                console.log(req.params);

                debug(req.params);
                // const { username, password } = req.body;


                // check user details and create user
                res.render(req.params);

            }());
        });
        return searchRouter;
    };
    module.exports = router;
