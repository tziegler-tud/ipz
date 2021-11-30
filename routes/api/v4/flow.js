var express = require('express');
var router = express.Router();

const settingsService = require('../../../services/settingsService');
const flowService = require('../../../services/flow/flowService');



//hooked at /api/v4/flow

// routes
router.post('/checkin/add', addData);
router.get('/get', getAll);

// checkout
router.get('/checkout/get', getCheckoutData);
router.post('/checkout/get', getCheckoutData);
router.post('/checkout/getByTrack/:id', getByTrack);
router.post('/checkout/getAllTracks', getAllTracks);
router.post('/checkout/getEntry', getCheckoutEntry);
router.post('/checkout/setSorting', setCheckoutSorting);
router.get('/checkout/getSorting', getCheckoutSorting);
router.post('/checkout/redraw', redraw);
router.get('/checkout/getDataVersion/:trackId', getCheckoutDataVersion);
router.get('/checkout/getDisplayDataVersion', getDisplayDataVersion);
router.post('/checkout/checkout', checkout);

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
    if(req.body.amount === undefined || req.body.data === undefined || req.body.track === undefined){
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
    let track = req.body.track;
    //add document containing all data entries

    flowService.add(track, amount, dataArray, date)
        .then(function(result){
            res.json(result)
        })
        .catch(function(err){
            next(err)
        } );
}

function getByTrack (req, res, next) {
    flowService.getByTrack(req.params.id, req.body.sort)
        .then(result => res.json(result))
        .catch(err => next(err));
}

function getAllTracks (req, res, next) {
    flowService.getAllTracks(req.body.sort)
        .then(result => res.json(result))
        .catch(err => next(err));
}

function getAll (req, res, next){
    //validate data
    flowService.getAll()
        .then(result => res.json(result))
        .catch(err => next(err));
}


//checkout

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

    flowService.checkout(entry)
        .then(result => res.json(result))
        .catch(err => next(err));
}

function getCheckoutData (req, res, next){
    //validate data
    let sort = undefined;
    if(req.body){
        sort = req.body.sort;
    }
    flowService.getCheckoutData(sort)
        .then(result => res.json(result))
        .catch(err => next(err));
}

function getCheckoutEntry (req, res, next){
    //validate data
    flowService.getCheckoutEntry(req.body.id)
        .then(result => res.json(result))
        .catch(err => next(err));
}

function redraw (req, res, next){
    //validate data
    flowService.redraw(req.body.id, req.body.minutes)
        .then(result => res.json(result))
        .catch(err => next(err));
}

function getCheckoutDataVersion (req, res, next){
    //validate data
    flowService.getCheckoutDataVersion(req.params.trackId)
        .then(result => res.json(result))
        .catch(err => next(err));
}

function getDisplayDataVersion (req, res, next){
    //validate data
    flowService.getDisplayDataVersion()
        .then(result => res.json(result))
        .catch(err => next(err));
}

function setCheckoutSorting (req, res, next){
    //validate data
    if(!req.body.property || !req.body.direction) {
        next(new Error("invalid parameter settings"));
        return;
    }
    settingsService.updateCheckoutSettings({
        sorting: {
            property: req.body.property,
            direction: req.body.direction,
        }
    })
        .then(function(){
            flowService.updateVersion()
                .then(result => res.json(result))
                .catch(err => next(err));
        })
        .catch(err => next(err));
}

function getCheckoutSorting (req, res, next){
    //validate data
    settingsService.getCheckoutSettings()
        .then(result => res.json(result.sorting))
        .catch(err => next(err));
}

module.exports = router;