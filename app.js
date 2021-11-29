var createError = require('http-errors');
var express = require('express');
const session = require("express-session");
const FileStore = require('session-file-store')(session);
const { v4: uuidv4 } = require('uuid');
var path = require('path');
var fs = require('fs');
var cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
var lessMiddleware = require('less-middleware');
var logger = require('morgan');



const passport = require('./config/passport');

var schedule = require ('node-schedule');

var indexRouter = require('./routes/index');
var loginRouter = require('./routes/login');
var trackRouter = require('./routes/strecke');
var userRouter = require('./routes/user');
var settingsRouter = require('./routes/settings');

var checkinDataRouter = require('./routes/api/checkinHandler');
var checkoutDataRouter = require('./routes/api/checkoutHandler');
var trackDataRouter = require('./routes/api/trackDataHandler');
var trackApiHandler = require('./routes/api/trackHandler');
var taskApiHandler = require('./routes/api/taskHandler');
var userApiHandler = require('./routes/api/userHandler');
var deviceApiHandler = require('./routes/api/deviceHandler');
var archiveHandler = require('./routes/api/archiveHandler');
var statisticsHandler = require('./routes/api/statisticsHandler');
var authenticationHandler = require('./routes/api/authenticationHandler');
var roleHandler = require('./routes/api/roleHandler');

var pushRouter = require("./routes/push");

var archiveService = require('./services/archiveService');
var errorHandler = require("./helpers/error-handler");

global.appRoot = path.resolve(__dirname);

var app = express();

app.use(lessMiddleware(path.join(__dirname, 'src')));
app.use(express.static(path.join(__dirname, 'src')));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(bodyParser.text());

//user manager
var userManager = require("./services/userManager");


app.use(session({
    genid: (req) => {
        console.log('Inside the session middleware');
        console.log(req.sessionID);
        return uuidv4() // use UUIDs for session IDs
    },
    store: new FileStore(),
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false, expires: new Date(253402300000000)}
}));

app.use(passport.initialize());
app.use(passport.session());

webAuth = function(req, res, next){
    if (!req.isAuthenticated()) {
        // req.session.redirectTo = req.originalUrl; //strange bug setting favicon as url, disable until fixed
        res.status(401).redirect('/login');
    } else {
        // userManager.refresh(req.user);
        next();
    }
};

apiAuth = function(req, res, next){
    if (!req.isAuthenticated()) {
        res.status(401).send();
    } else {
        // userManager.refresh(req.user);
        next();
    }
};

// create a write stream (in append mode)
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
app.use(logger('common', { stream: accessLogStream }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//load settings
var settingsService = require('./services/settingsService');
settingsService.initialize();

app.use('/', pushRouter);
app.use('/', loginRouter);


app.use("/api", apiAuth);
app.use('/api/v1/checkin', checkinDataRouter);
app.use('/api/v1/checkout', checkoutDataRouter);
app.use('/api/v1/data/track', trackDataRouter);
app.use('/api/v1/track', trackApiHandler);
app.use('/api/v1/task', taskApiHandler);
app.use('/api/v1/user', userApiHandler);
app.use('/api/v1/devices', deviceApiHandler);
app.use('/api/v1/archive', archiveHandler);
app.use('/api/v1/statistics', statisticsHandler);
app.use('/api/v1/authentication', authenticationHandler);
app.use('/api/v1/role', roleHandler);
app.use("/api", function(req, res, next) {
  next(createError(404));
});
app.use("/api", errorHandler.apiErrorHandler);

app.use('/', webAuth);
app.use('/', indexRouter);


app.use('/user', userRouter);
app.use('/strecke', trackRouter);
app.use('/settings', settingsRouter);

// catch 404 and forward to error handler
app.use("/*", function(req, res, next) {
  next(createError(404));
});
app.use("/", errorHandler.webErrorHandler);


//archive every day at midnight
schedule.scheduleJob('58 23 * * *', () => {
  archiveService.archiveCurrentDay()
      .then(function(result){
        console.log("Day archieved successfully");
        console.log("resetting current day...");
        archiveService.resetCurrentDay()
            .then(function(result){
                console.log("current day reset successful.");
            })
            .catch(function(error){
                console.warn(error.message);
            })

      })
      .catch(function(error){
        console.warn(error.message);
      })
})



// error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};
//
//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

module.exports = app;
