var express = require('express');
var router = express.Router();

const trackService = require('../services/trackService');


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
            res.render('pages/strecke/strecke',
                {
                    title: titleString + track.name,
                    id: track.id,
                    trackId: track.trackId,
                    trackTitle: titleString + track.name,
                    trackName: track.name,
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
            title: titleString,
            streckeId: streckeId,
            streckeTitle: titleString,
            streckeName: streckeName,
        });
}




module.exports = router;
