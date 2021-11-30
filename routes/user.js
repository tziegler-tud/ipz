var express = require('express');
var router = express.Router();
var uuid = require('uuid');
const passport = require('passport');
const bodyParser = require("body-parser");

const UserService = require("../services/userService");
const userManager = require("../services/userManager");


/*
hooked at /settings/user
 */

router.get("/", getAllUserPage);
router.get("/current", getCurrentUserPage);
router.get("/:id", getUserPage);




function getAllUserPage(req, res, next){
    userManager.connect(req.user, "Nutzerverwaltung")
    res.render('pages/user',
        {
            user: req.user,
            title: "Nutzer & Geräte - ImpfApp Dresden",
        });
}

function getCurrentUserPage(req, res, next){
    userManager.connect(req.user, "Nutzerverwaltung")
    res.render('pages/userpage',
        {
            user: req.user,
            exploredUser: req.user,
            currentUser: true,
            title: "Mein Gerät - ImpfApp Dresden",
        });
}

function getUserPage(req, res, next){
    //get user
    userManager.connect(req.user, "Nutzerverwaltung")
        .then(function(user) {
        })
    if (req.params.id === req.user.id) res.redirect("/user/current");
    else {
        UserService.getById(req.params.id)
            .then(function (exploredUser) {
                res.render('pages/userpage',
                    {
                        user: req.user,
                        exploredUser: exploredUser,
                        currentUser: false,
                        title: exploredUser.username + " - ImpfApp Dresden",
                    });
            })
            .catch(err => next(err));
    }
}

module.exports = router;
