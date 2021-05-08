var express = require('express');
var router = express.Router();

const trackService = require('../../services/trackService');
const settingsService = require('../../services/settingsService');



//hooked at /api/v1/track

// routes
router.get('/', get);
router.post('/add', add);
router.post('/update/:id', update);
router.delete('/remove/:id', remove);
router.get('/:id', getById);

/**
 * add track entity
 *
 * @param req
 * @param res
 * @param next
 */
function add (req, res, next){
    //validate data
    let err = new Error("invalid arguments received")
    if (req.body === undefined) {
        next(err);
    }
    if(req.body.name === undefined){
        next(err)
    }
    trackService.add(req.body)
        .then(result => res.json(result))
        .catch(err => next(err));
}

function get (req, res, next){
    trackService.get()
            .then(result => res.json(result))
            .catch(err => next(err));
}

function getById (req, res, next){
    trackService.getById(req.params.id)
        .then(result => res.json(result))
        .catch(err => next(err));
}

function remove (req, res, next){
    trackService.remove(req.params.id)
        .then(result => res.json(result))
        .catch(err => next(err));
}


/**
 * finds and updates a track entity by the given id. failes if no matching entity is found.
 *
 * @param req
 * @param res
 * @param next
 */
function update (req, res, next){
    //validate data
    let err = new Error("invalid arguments received")
    if (req.body === undefined) {
        next(err);
    }
    if(req.body.name === undefined){
        next(err)
    }
    trackService.update(req.params.id, req.body)
        .then(result => res.json(result))
        .catch(err => next(err));
}

module.exports = router;