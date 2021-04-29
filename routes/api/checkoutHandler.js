var express = require('express');
var router = express.Router();

const checkinDataService = require('../../services/checkinDataService');
const settingsService = require('../../services/settingsService');



//hooked at /api/v1/checkin

// routes
router.get('/get', getCheckoutData);
router.post('/get', getCheckoutData);
router.post('/getEntry', getCheckoutEntry);
router.post('/setSorting', setCheckoutSorting);
router.get('/getSorting', getCheckoutSorting);
router.post('/redraw', redraw);
router.get('/getDataVersion', getCheckoutDataVersion);
router.post('/checkout', checkout);


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

function getCheckoutData (req, res, next){
    //validate data
    let sort = undefined;
    if(req.body){
        sort = req.body.sort;
    }
    checkinDataService.getCheckoutData(sort)
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
            checkinDataService.updateVersion()
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