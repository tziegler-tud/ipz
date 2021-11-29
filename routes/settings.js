var express = require('express');
var router = express.Router();
var uuid = require('uuid');
const passport = require('passport');
const bodyParser = require("body-parser");

const userManager = require("../services/userManager")
const taskManager = require("../services/taskService")


//hooked at: /settings
router.get('/', getIndexPage);
router.get('/tasks', getTasksPage);



/* GET settings page. */
function getIndexPage(req, res, next) {
    req.user._doc.currentTask = "Einstellungen";
    let task = "Einstellungen";
    userManager.connect(req.user, task);
    res.render('pages/settings/settings',
        {
            user: req.user,
            title: "Einstellungen - ImpfApp Dresden",
            task: task,
        });
};

/* GET tasks page. */
function getTasksPage(req, res, next) {
    req.user._doc.currentTask = "checkin";
    let task = "Einstellungen";
    userManager.connect(req.user, task);
    res.render('pages/settings/tasks',
        {
            user: req.user,
            title: "Tasks - ImpfApp Dresden",
            task: task,
        });
};



module.exports = router;
