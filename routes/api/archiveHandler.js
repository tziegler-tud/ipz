var express = require('express');
var router = express.Router();

const archiveService = require('../../services/archiveService');
const settingsService = require('../../services/settingsService');



//hooked at /api/v1/data/archive

// routes
router.get('/', get);
router.post('/add', add);
router.post('/update/:id', update);
router.delete('/remove/:id', remove);
router.get('/:id', getById);

router.post('/archiveCurrentDay', archiveCurrentDay);


/**
 * add archive document
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
    archiveService.add(req.body)
        .then(result => res.json(result))
        .catch(err => next(err));
}

function get (req, res, next){
    archiveService.get()
            .then(result => res.json(result))
            .catch(err => next(err));
}

function getById (req, res, next){
    archiveService.getById(req.params.id)
        .then(result => res.json(result))
        .catch(err => next(err));
}

function remove (req, res, next){
    archiveService.remove(req.params.id)
        .then(result => res.json(result))
        .catch(err => next(err));
}


/**
 * finds and updates a archive document by the given id. failes if no matching entity is found.
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
    archiveService.update(req.params.id, req.body)
        .then(result => res.json(result))
        .catch(err => next(err));
}

function archiveCurrentDay (req, res, next) {
    //store current db collections in archive collection
    archiveService.archiveCurrentDay()
        .then(result => res.json(result))
        .catch(err => next(err));
}

module.exports = router;