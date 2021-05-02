var express = require('express');
var router = express.Router();

const checkinDataService = require('../../services/dataService');
const settingsService = require('../../services/settingsService');



//hooked at /api/v1/checkin

// routes
router.post('/add', addData);
router.get('/get', get);
router.get('/counts', getCounts);

/**
 * add Numbers to Checkin waiting list
 * req.body is expected to be of the form
 *  {amount: {Integer}, data: {Array<Integer>}}
 *
 * @param req
 * @param res
 * @param next
 */
function addData (req, res, next){
    //validate data
    let err = new Error("invalid arguments received")
    if (req.body === undefined) {
        next(err);
    }
    if(req.body.type === undefined){
        next(err)
    }

    checkinDataService.add(req.body)
        .then(result => res.json(result))
        .catch(err => next(err));
}

function get (req, res, next){
    //validate data
    checkinDataService.getAll()
        .then(result => res.json(result))
        .catch(err => next(err));
}

function getCounts (req, res, next){
    //validate data
    checkinDataService.getCounts({
        status: 0
    })
        .then(result => res.json(result))
        .catch(err => next(err));
}

module.exports = router;