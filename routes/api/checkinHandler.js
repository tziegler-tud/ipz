var express = require('express');
var router = express.Router();

const checkinDataService = require('../../services/checkinDataService');



//hooked at /api/v1/checkin

// routes
router.post('/add', addData);
router.get('/get', get);
router.get('/getCheckoutData', getCheckoutData);
router.post('/getCheckoutData', getCheckoutEntry);
router.post('/redraw', redraw);
router.get('/getCheckoutDataVersion', getCheckoutDataVersion);
router.post('/checkout', checkout);

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

function checkout (req, res, next){
    //validate data
    let err = new Error("invalid arguments received")
    if (req.body === undefined) {
        next(err);
    }
    if(req.body.entry === undefined){
        next(err)
    }
    let entry = req.body.entry;

    checkinDataService.checkout(entry)
        .then(result => res.json(result))
        .catch(err => next(err));
}

function get (req, res, next){
    //validate data
    checkinDataService.getAll()
        .then(result => res.json(result))
        .catch(err => next(err));
}

function getCheckoutData (req, res, next){
    //validate data
    checkinDataService.getCheckoutData()
        .then(result => res.json(result))
        .catch(err => next(err));
}

function getCheckoutEntry (req, res, next){
    //validate data
    checkinDataService.getCheckoutEntry(req.body.id)
        .then(result => res.json(result))
        .catch(err => next(err));
}

function redraw (req, res, next){
    //validate data
    checkinDataService.redraw(req.body.id, req.body.minutes)
        .then(result => res.json(result))
        .catch(err => next(err));
}

function getCheckoutDataVersion (req, res, next){
    //validate data
    checkinDataService.getCheckoutDataVersion()
        .then(result => res.json(result))
        .catch(err => next(err));
}

module.exports = router;