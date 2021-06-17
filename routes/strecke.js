var express = require('express');
var router = express.Router();

const trackService = require('../services/trackService');
const userManager = require("../services/userManager");

//hooked at /strecke
router.get('/', getIndexPage);
router.get('/:trackId', getTrackPage);

/* GET track page. */
function getTrackPage (req, res, next) {
    let titleString = "Imfpstrecke ";

    let trackId = req.params.trackId;

    //find track
    trackService.getById(trackId)
        .then(function(track){
            let task = "Impfstrecke " + track.name;
            userManager.connect(req.user, task)
            res.render('pages/strecke/strecke',
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


/* GET track index page. */
function getIndexPage (req, res, next) {
    let titleString = "Imfpstrecke ";
    let streckeId = 0;
    let streckeName = "";

    res.render('pages/strecke/index',
        {
            user: req.user,
            title: titleString,
            streckeId: streckeId,
            streckeTitle: titleString,
            streckeName: streckeName,
        });
}




module.exports = router;
