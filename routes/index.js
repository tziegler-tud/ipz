var express = require('express');
var router = express.Router();
var uuid = require('uuid');
const passport = require('passport');
const bodyParser = require("body-parser");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index',
      {
          title: "ImpfApp Dresden - Startseite",
          user: req.user,
          items: [
              {
                  name: "CheckIn - Wartebereich II",
                  url: "/checkin",
                  auth: false,
                  class: "checkin",
              },
              {
                  name: "Impfstrecke",
                  url: "/tracks",
                  auth: false,
                  class: "track"
              },
              {
                  name: "Apotheke",
                  url: "/apotheke",
                  auth: false,
                  class: "apotheke"
              },
              {
                  name: "Teamleiter",
                  url: "/management",
                  auth: true,
                  class: "management"
              }
            ]
      });
  //   res.redirect('/management');
});



/* GET checkin page. */
router.get('/checkin', function(req, res, next) {
    res.render('pages/checkin',
        {
            user: req.user,
            title: "CheckIn - ImpfApp Dresden",
        });
});


/* GET management page. */
router.get('/management', function(req, res, next) {
    res.render('pages/management/management',
        {
            user: req.user,
            title: "Teamleiter - ImpfApp Dresden",
        });
});





/* GET apotheke page. */
router.get('/apotheke', function(req, res, next) {
    res.render('pages/apotheke',
        {
            user: req.user,
            title: "Apotheke - ImpfApp Dresden",
        });
});

/* GET settings page. */
router.get('/settings', function(req, res, next) {
    res.render('pages/settings',
        {
            user: req.user,
            title: "Einstellungen - ImpfApp Dresden",
        });
});

/* GET settings page. */
router.get('/statistics', function(req, res, next) {
    res.render('pages/statistics',
        {
            user: req.user,
            title: "Statistik - ImpfApp Dresden",
        });
});

/* GET device page. */
router.get('/device', function(req, res, next) {
    res.render('pages/device',
        {
            user: req.user,
            title: "Mein Gerät - ImpfApp Dresden",
        });
});



module.exports = router;
