const express = require('express');
const searchRouter = express.Router();
const debug = require('debug')('app:searchRoutes');


function router(nav) {
    searchRouter.route('/')
        .post((req, res) => {
            console.log(req.body);

            (async function searchTicker() {

                // debug(json(req.params));
                // const { username, password } = req.body;


                // check user details and create user
                // res.json(req.params);
                res.render('searchTicker',{
                    'country': `${req.body.country}`,
                    'ticker': `${req.body.ticker}`
                });
            }());
        });



    return searchRouter;
    };
    module.exports = router;
