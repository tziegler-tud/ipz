var express = require('express');
var router = express.Router();
var uuid = require('uuid');
const passport = require('passport');
const bodyParser = require("body-parser");

const userManager = require("../services/userManager")

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
    req.user._doc.currentTask = "checkin";
    let task = "Checkin";
    userManager.connect(req.user, task);
    res.render('pages/checkin',
        {
            user: req.user,
            title: "CheckIn - ImpfApp Dresden",
            task: task,
        });
});


/* GET management page. */
router.get('/management', function(req, res, next) {
    let task = "Teamleiter-Modul";
    userManager.connect(req.user, task)
        .then(function(user){
        })
    res.render('pages/management/management',
        {
            user: req.user,
            title: "Teamleiter - ImpfApp Dresden",
            task: task,
        });
});





/* GET apotheke page. */
router.get('/apotheke', function(req, res, next) {
    req.user._doc.currentTask = "apotheke";
    let task = "Apotheke"
    userManager.connect(req.user, task)
    res.render('pages/apotheke',
        {
            user: req.user,
            title: "Apotheke - ImpfApp Dresden",
            task: task,
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
    let task = "Statistik"
    userManager.connect(req.user, task)
    res.render('pages/statistics',
        {
            user: req.user,
            title: "Statistik - ImpfApp Dresden",
            task: task,
        });
});

/* GET device page. */
router.get('/device', function(req, res, next) {
    let task = "Nutzerverwaltung";
    userManager.connect(req.user, task)
    res.render('pages/device',
        {
            user: req.user,
            title: "Mein Gerät - ImpfApp Dresden",
            task: task,
        });
});



module.exports = router;
