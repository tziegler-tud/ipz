var express = require('express');
var router = express.Router();

const checkinDataService = require('../../services/checkinDataService');
const settingsService = require('../../services/settingsService');



//hooked at /api/v1/checkin

// routes
router.post('/add', addData);
router.get('/get', get);

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
    if(req.body.amount === undefined || req.body.data === undefined){
        next(err)
    }
    let date;
    if(req.body.date === undefined) {
        req.body.date = Date.now();
    }
    else {
        date = req.body.date;
    }
    //read data amount
    let amount = req.body.amount;
    //get data array
    let dataArray = req.body.data;
    //add document containing all data entries

    checkinDataService.add(amount, dataArray, date)
        .then(result => res.json(result))
        .catch(err => next(err));
}

function get (req, res, next){
    //validate data
    checkinDataService.getAll()
        .then(result => res.json(result))
        .catch(err => next(err));
}

module.exports = router;