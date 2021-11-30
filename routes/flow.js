var express = require('express');
var router = express.Router();

const trackService = require('../services/trackService');
const userManager = require("../services/userManager");

//hooked at /flow
router.get('/checkin/:trackId', getCheckinPage);
router.get('/track/:trackId', getTrackPage);
router.get('/display', getDisplayPage);

/* GET track page. */
function getCheckinPage (req, res, next) {
    let titleString = "Checkin ";
    let trackId = req.params.trackId;
    //find track
    trackService.getById(trackId)
        .then(function(track){
            let task = "Checkin";
            userManager.connect(req.user, task)
            res.render('pages/flow/checkin',
                {
                    user: req.user,
                    title: titleString + track.name,
                    id: track.id,
                    trackId: track.trackId,
                    trackTitle: titleString + track.name,
                    trackName: track.name,
                    task: task,
                });
        })
        .catch(err => next(err));
}


/* GET track page. */
function getTrackPage (req, res, next) {
    let titleString = "Impfstrecke ";
    let trackId = req.params.trackId;
    //find track
    trackService.getById(trackId)
        .then(function(track){
            let task = "Impfstrecke";
            userManager.connect(req.user, task)
            res.render('pages/flow/track',
                {
                    user: req.user,
                    title: titleString + track.name,
                    id: track.id,
                    trackId: track.trackId,
                    trackTitle: titleString + track.name,
                    trackName: track.name,
                    task: task,
                });
        })
        .catch(err => next(err));
}

/* GET track page. */
function getDisplayPage (req, res, next) {
    let titleString = "ImpFlow Dresden - Wartebereich";
    let task = "Display Wartebereich";
    userManager.connect(req.user, task)
    res.render('pages/flow/display',
        {
            user: req.user,
            title: titleString,
            task: task,
        });
}

module.exports = router;
