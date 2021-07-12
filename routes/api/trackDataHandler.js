var express = require('express');
var router = express.Router();

const trackDataService = require('../../services/trackDataService');
const settingsService = require('../../services/settingsService');


//simulate load
// router.post("*", wait);

function wait(req,res,next){
    setTimeout(next,10000)
}

//hooked at /api/v1/data/track

// routes
router.get('/', get);
router.get('/getEntry/:id', getById);
router.post('/add', addData);
router.post('/update', update);
router.get('/counts', getAllCounts);
router.get('/counts/:trackId', getCounts);
router.post('/remove', remove);
router.post('/removeById', removeById);
router.get('/getSwitched', getSwitched);
router.get('/getSwitched/:trackId', getSwitched);
router.get('/:trackId', get);
router.post('/getLastOfAllTypes', getLastOfAllTypes);


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
    if(req.body.type === undefined || req.body.track === undefined){
        next(err)
    }

    trackDataService.add(req.body)
        .then(result => res.json(result))
        .catch(err => next(err));
}

function get (req, res, next){
    //validate data
    let trackId = req.params.trackId;
    if(trackId !== undefined) {
        trackDataService.getByTrack({id: trackId})
            .then(result => res.json(result))
            .catch(err => next(err));
    }
    else {
        trackDataService.getAll()
            .then(result => res.json(result))
            .catch(err => next(err));
    }
}

function getById (req, res, next){
    //validate data
    let id = req.params.id;
    trackDataService.getById(id)
        .then(result => res.json(result))
        .catch(err => next(err));
}

function update (req, res, next) {
    let err = new Error("invalid arguments received")
    if (req.body === undefined) {
        next(err);
    }
    if(req.body.id === undefined){
        next(err);
    }

    trackDataService.update(req.body.id, req.body)
        .then(result => res.json(result))
        .catch(err => next(err));
}

function getSwitched (req, res, next){
    //validate data
    let trackId = req.params.trackId;
    if(trackId !== undefined) {
        trackDataService.getByTrack({id: trackId}, {filter: "isSwitched", value: true})
            .then(result => res.json(result))
            .catch(err => next(err));
    }
    else {
        trackDataService.getAll({filter: {filter: "isSwitched", value: true}})
            .then(result => res.json(result))
            .catch(err => next(err));
    }
}

function getAllCounts (req, res, next){
    //validate data
    trackDataService.getCounts()
        .then(result => res.json(result))
        .catch(err => next(err));
}

function getCounts (req, res, next){
    let trackId = req.params.trackId;
    //validate data
    trackDataService.getCounts({id: trackId})
        .then(result => res.json(result))
        .catch(err => next(err));
}

function remove (req, res, next){
    //validate data
    let err = new Error("invalid arguments received")
    if (req.body === undefined) {
        next(err);
    }
    if(req.body.type === undefined){
        next(err)
    }
    if(req.body.trackId === undefined){
        next(err)
    }
    let args = {
        second: req.body.second,
        isSwitched: req.body.isSwitched,
        originalType: req.body.originalType,
    }

    trackDataService.remove(req.body.type, req.body.trackId, args)
        .then(result => res.json(result))
        .catch(err => next(err));
}


function removeById (req, res, next){
    //validate data
    let err = new Error("invalid arguments received")
    if (req.body === undefined) {
        next(err);
    }
    if(req.body.id === undefined){
        next(err)
    }

    trackDataService.removeById(req.body.id)
        .then(result => res.json(result))
        .catch(err => next(err));
}

function getLastOfAllTypes (req, res, next){
    //validate data
    trackDataService.getLastOfAllTypes(req.body.track, req.body.filter)
        .then(result => res.json(result))
        .catch(err => next(err));
}

module.exports = router;