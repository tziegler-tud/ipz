var express = require('express');
var router = express.Router();

const userService = require('../../services/userService');
const userManager = require('../../services/userManager');



//hooked at /api/v1/devices

// routes
router.get('/', get);
router.get('/connected', getConnected);
router.post('/connect', connect);
router.post('/disconnect', disconnect);
router.post('/refresh', refresh);
router.get('/:id', getById);

function get (req, res, next){
    userManager.getRegisteredUsers()
            .then(result => res.json(result))
            .catch(err => next(err));
}

function getConnected(req, res, next){
    userManager.getConnectedUsers()
        .then(result => res.json(result))
        .catch(err => next(err));
}

function getById (req, res, next){
    userManager.getById(req.params.id)
        .then(result => res.json(result))
        .catch(err => next(err));
}

function connect(req, res, next){
    userManager.connect(req.body.user)
        .then(result => res.json(result))
        .catch(err => next(err));
}

function disconnect(req, res, next){
    userManager.disconnect(req.body.user)
        .then(result => res.json(result))
        .catch(err => next(err));
}

function refresh(req, res, next){
    userManager.refresh(req.body.user)
        .then(result => res.json(result))
        .catch(err => next(err));
}

module.exports = router;