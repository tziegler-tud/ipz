var express = require('express');
var router = express.Router();
var uuid = require('uuid');
const passport = require('passport');
const bodyParser = require("body-parser");

const sysinfo = require('../config/sysinfo.json');

const userManager = require("../services/userManager")
const taskManager = require("../services/taskService")


//hooked at: /settings
router.get('/', getIndexPage);
router.get('/tasks', getTasksPage);
router.get('/tracks', getTracksPage);



/* GET settings page. */
function getIndexPage(req, res, next) {
    req.user._doc.currentTask = "Einstellungen";
    let task = "Einstellungen";
    userManager.connect(req.user, task);
    sysinfo.uptime = process.uptime();
    res.render('pages/settings/settings',
        {
            user: req.user,
            title: "Einstellungen - ImpfApp Dresden",
            task: task,
            sysinfo: sysinfo,
        });
};

/* GET tasks page. */
function getTasksPage(req, res, next) {
    req.user._doc.currentTask = "Einstellungen";
    let task = "Einstellungen";
    userManager.connect(req.user, task);
    res.render('pages/settings/db',
        {
            dbPageType: "tasks",
            user: req.user,
            title: "DbViewer (Tasks) - ImpfApp Dresden",
            task: task,

        });
};


/* GET tracks page. */
function getTracksPage(req, res, next) {
    req.user._doc.currentTask = "Einstellungen";
    let task = "Einstellungen";
    userManager.connect(req.user, task);
    res.render('pages/settings/db',
        {
            dbPageType: "tracks",
            user: req.user,
            title: "DbViewer (Tracks) - ImpfApp Dresden",
            task: task,
        });
};


module.exports = router;
