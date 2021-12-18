var express = require('express');
var router = express.Router();

const archiveService = require('../../services/archiveService');
const statisticService = require('../../services/statisticService');
const settingsService = require('../../services/settingsService');



//hooked at /api/v1/statistics

// routes
router.get('/', get);
router.get('/overview', getOverview);
router.get('/current', getDayStats);
router.get('/week', getWeekStats);
router.get('/month', getMonthStats);
router.post("/getDayStats", getDayStatsFromArchive);
router.post("/getStats", getStatsFromArchive);

router.post('/', getSpecific);

function get (req, res, next){
    statisticService.get()
            .then(result => res.json(result))
            .catch(err => next(err));
}

function getSpecific (req, res, next){
    //validate
    //body contains either id or date
    if (req.body === undefined || (req.body.id === undefined && req.body.date === undefined)) {
        //invalid body
        let err = new Error("Failed to obtain statistic data: invalid payload. Did you mean to do a GET request?");
        next(err);
    }

    if(req.body.id){
        statisticService.getById(req.body.id)
            .then(result => res.json(result))
            .catch(err => next(err));
    }
    else {
        if (req.body.date) {
            statisticService.getByDate(req.body.date)
                .then(result => res.json(result))
                .catch(err => next(err));
        }
    }
}

function getOverview (req, res, next){
    statisticService.getOverview()
        .then(result => res.json(result))
        .catch(err => next(err));
}

function getDayStats (req, res, next){
    statisticService.getDayStats()
        .then(result => res.json(result))
        .catch(err => next(err));
}

function getWeekStats (req, res, next){
    statisticService.getWeekStats()
        .then(result => res.json(result))
        .catch(err => next(err));
}
function getMonthStats (req, res, next){
    statisticService.getMonthStats()
        .then(result => res.json(result))
        .catch(err => next(err));
}

function getDayStatsFromArchive (req, res, next){
    statisticService.getDayStatsFromArchive(req.body.date)
        .then(result => res.json(result))
        .catch(err => next(err));
}

function getStatsFromArchive (req, res, next){
    statisticService.getArchiveStats(req.body.daysBack, req.body.daysAhead, req.body.startDate)
        .then(result => res.json(result))
        .catch(err => next(err));
}



module.exports = router;