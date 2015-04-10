// set up ====================================================
var port = 8000;
var sys = require('sys');
var exec = require('child_process').exec;
var express = require('express');
var path=require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookie = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var local = require('passport-local');
var session = require('express-session');
var sql = require('sqlite3').verbose();
var port = process.env.PORT || 8000;
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');

// ==========================================================
var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookie());
app.use(express.static(path.join(__dirname, 'public')));
var routes = require('./routes/index');
var users = require('./routes/users');
var score = require('./routes/score');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// system call to make sure database is set up
function puts(error, stdout, stderr) { sys.puts(stdout); }
exec("sqlite3 data.db < create.sql", puts);

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));

app.use('/', routes);
app.use('/scores', score);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
			user: false
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
	console.log('error', err);
    res.render('error', {
        message: err.message,
        error: {},
		user: false
    });
});

//app.listen(port);
module.exports = app;
