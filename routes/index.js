var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  // res.render('index',
  //     {
  //       title: "ImpFLow Dresden - Startseite",
  //     });
    res.redirect('/management');
});


/* GET checkin page. */
router.get('/checkin', function(req, res, next) {
    res.render('pages/checkin',
        {
            title: "CheckIn - ImpFLow Dresden",
        });
});


/* GET management page. */
router.get('/management', function(req, res, next) {
    res.render('pages/management',
        {
            title: "Teamleiter - ImpFLow Dresden",
        });
});

/* GET list page. */
router.get('/list', function(req, res, next) {
    res.render('pages/list',
        {
            title: "Teamleiter - ImpFLow Dresden",
        });
});


/* GET apotheke page. */
router.get('/apotheke', function(req, res, next) {
    res.render('pages/apotheke',
        {
            title: "Apotheke - ImpFlow Dresden",
        });
});

/* GET settings page. */
router.get('/settings', function(req, res, next) {
    res.render('pages/settings',
        {
            title: "Einstellungen - ImpFlow Dresden",
        });
});

/* GET settings page. */
router.get('/statistics', function(req, res, next) {
    res.render('pages/statistics',
        {
            title: "Statistik - ImpFlow Dresden",
        });
});



module.exports = router;
