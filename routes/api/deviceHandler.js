var express = require('express');
var router = express.Router();

const userService = require('../../services/userService');
const userManager = require('../../services/userManager');



//hooked at /api/v1/devices

// routes
router.get('/', get);
router.get('/connected', getConnected);
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
    if(req.body === undefined || req.body.user === undefined) {
        console.error("Failed to refresh user: Invalid arguments received.")
    }
    userManager.connect(req.body.user, req.body.task)
        .then(function(user){
            console.log("user " + req.body.user.username + " connected successfully.")
            res.status(200).send();
        })
        .catch(function(error){
            console.warn("failed to connect user " + req.body.user.username + ": " + error)
            next(error);
        });
}

function disconnect(req, res, next){
    if(req.body === undefined || req.body.user === undefined) {
        console.error("Failed to refresh user: Invalid arguments received.")
    }
    userManager.disconnect(req.body.user, "apiDisconnectRequest")
        .then(function(user){
            console.log("user " + req.body.user.username + " disconnected successfully.")
            res.status(200).send();
        })
        .catch(function(error){
            console.warn("failed to disconnect user " + req.body.user.username + ": " + error)
            next(error);
        });
}

function refresh(req, res, next){
    if(req.body.user === undefined) {
        console.error("Failed to refresh user: Invalid arguments received.")
    }
    userManager.refresh(req.body.user, req.body.task)
        .then(function(user){
            console.log("user " + req.body.user.username + " refreshed successfully.")
            res.json(user);
        })
        .catch(function(error){
            console.warn("failed to refresh user " + req.body.user.username + ": " + error)
        });

}

module.exports = router;