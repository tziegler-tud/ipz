var express = require('express');
var router = express.Router();
var uuid = require('uuid');
const passport = require('passport');
const bodyParser = require("body-parser");

const authenticationService = require("../services/authenticationService");
const userService = require("../services/userService");

var app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());


/*
hoked at /login
* */

router.get('/login', function(req, res, next) {
  if(req.isAuthenticated()) {
    res.redirect('/management')
  } else {
    res.render('login', { title: 'ImpFlow Dresden - Login' });
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
        req.session.save(() => {
          res.redirect(redirectTo);
        });
      })
    })(req, res, next);
  }
});

router.all("/logout", function(req, res, next) {
  req.session.destroy(function (err) {
    res.redirect('/login'); //Inside a callback… bulletproof!
  });
});

/*
register
 */
router.get('/register', function(req, res, next) {
  if(req.isAuthenticated()) {
    res.redirect('/')
  } else {
    res.render('register', { title: 'ImpFlow Dresden - Gerät einrichten' });
  }
});


/* POST user login */
router.post('/register', function(req, res, next) {
  if(req.isAuthenticated()) {
    res.redirect('/management')
  } else {
      //check authentication
      authenticationService.authenticate(req.body.authentication, "Teamleiter")
          .then(function(){
            //create new user
            let userObject = {username: req.body.username, password: req.body.password}
            let user = userService.add(userObject)
                .then(function(user){
                  req.login(user, (err) => {
                    var redirectTo = req.session.redirectTo || "/management";
                    req.session.save(() => {
                      res.redirect(redirectTo);
                    });
                  })(req, res, next);
                })
          })
          .catch(function(reason){
            let e = new Error("Login failed: " + reason);
            next(e);
          })
  }
});

module.exports = router;