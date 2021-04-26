var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
var lessMiddleware = require('less-middleware');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var checkinDataRouter = require('./routes/api/checkinHandler');



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

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api/v1/checkin', checkinDataRouter);
app.use("/api", function(req, res, next) {
  next(createError(404));
});

app.use("/api", errorHandler.apiErrorHandler);
app.use('/', indexRouter);
// catch 404 and forward to error handler
app.use("/*", function(req, res, next) {
  next(createError(404));
});
app.use("/", errorHandler.webErrorHandler);




// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
