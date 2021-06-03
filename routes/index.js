var express = require('express');
var router = express.Router();
var uuid = require('uuid');
const passport = require('passport');
const bodyParser = require("body-parser");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index',
      {
          title: "ImpFLow Dresden - Startseite",
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

router.get('/login', function(req, res, next) {
    if(req.isAuthenticated()) {
        res.redirect('/')
    } else {
        res.render('index', {
            title: "ImpFLow Dresden - Startseite",
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
    }
});

/* POST user login */
router.post('/login', function(req, res, next) {
    if(req.isAuthenticated()) {
        res.redirect('/management')
    } else {
        passport.authenticate('local', {}, (err, user, info) => {
            if (!user) { return res.redirect("/login"); }
            req.login(user, (err) => {
                var redirectTo = req.session.redirectTo || "/management";
                res.redirect(redirectTo);
            })
        })(req, res, next);
    }
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
    res.render('pages/management/management',
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
