var express = require('express');
var router = express.Router();

const userService = require('../../services/userService');
const userManager = require('../../services/userManager');



//hooked at /api/v1/user

// routes
router.get('/', get);
router.post('/add', add);
router.post('/update/:id', update);
router.delete('/remove/:id', remove);
router.get('/name/:name', getByName);
router.get('/:id', getById);
router.post("/addTask/:id", addTask);
router.post("/removeTask/:id", removeTask);
router.post("/setRole/:id", setUserRole);


/**
 * add task entity
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
    if(req.body.username === undefined){
        next(err)
    }
    userService.add(req.body)
        .then(result => res.json(result))
        .catch(err => next(err));
}

function get (req, res, next){
    userService.get()
            .then(result => res.json(result))
            .catch(err => next(err));
}

function getById (req, res, next){
    userService.getById(req.params.id)
        .then(result => res.json(result))
        .catch(err => next(err));
}

function getByName (req, res, next){
    userService.getByName(req.params.name)
        .then(result => res.json(result))
        .catch(err => next(err));
}

function remove (req, res, next){
    userService.remove(req.params.id)
        .then(result => res.json(result))
        .catch(err => next(err));
}


/**
 * finds and updates a task entity by the given id. failes if no matching entity is found.
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
        return;
    }
    userService.update(req.params.id, req.body)
        .then(result => res.json(result))
        .catch(err => next(err));
}


function addTask (req, res, next){
    //validate data
    let err = new Error("invalid arguments received")
    if (req.body === undefined) {
        next(err);
    }
    if(req.body.task === undefined){
        next(err)
    }
    userService.addTask(req.params.id, req.body.task)
        .then(result => res.json(result))
        .catch(err => next(err));
}


function removeTask (req, res, next){
    //validate data
    let err = new Error("invalid arguments received")
    if (req.body === undefined) {
        next(err);
    }
    if(req.body.task === undefined){
        next(err)
    }
    userService.removeTask(req.params.id, req.body.task)
        .then(result => res.json(result))
        .catch(err => next(err));
}

function setUserRole (req, res, next){
    //validate data
    let err = new Error("invalid arguments received")
    if (req.body === undefined) {
        next(err);
    }
    if(req.body.role === undefined){
        next(err)
    }
    userService.setUserRole(req.params.id, req.body.role)
        .then(result => res.json(result))
        .catch(err => next(err));
}

module.exports = router;