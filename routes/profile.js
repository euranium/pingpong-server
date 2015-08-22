/*jshint esnext: true */
// set up ======================================================
var express = require('express');
var app = express();
//var router = express.Router();
var passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');
var bcrypt = require('bcrypt-nodejs');
var cookie = require('cookie-parser');
var bodyParser = require('body-parser');
var sqlite3 = require('sqlite3').verbose();

var util = require('util');
var crypto = require('crypto');

var parse = require('./../scripts/parse.js');
var external = require('./../scripts/external');

// external db
var oio = require('orchestrate');
oio.ApiEndPoint = 'api.ctl-uc1-a.orchestrate.io';
var db = oio(external.orchestrate);


// set up express session with a random id generator which is defined in an external js script

var genUuid = parse.genUuid;
module.exports = genUuid;
app.use(session({
	genid: function(req) {
		return genUuid(); // use UUIDs for session IDs
	},
	resave: true,
	saveUninitialized: true,
	cookie: {
		// cookies are not seen in testing when secure is true for some reason
		secure: false,
		maxAge: 36000000
	},
	secret: 'wwu compsci'
}));
// app set up
app.use(express.static('public'));
app.use(cookie());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());

function isLoggedIn (req, res, next) {
	if (req.isAuthenticated())
		return next();
	return res.redirect('/');
}
function logged (user) {
	// parse the user, if it is undefined it will return false
	return parse.isUser(user || false);
}
// ============================================================================

app.get('/', function(req, res) {
	db.get('collect', 'test')
		.then(function (result) {
			console.log(result);
			res.render('test', {error: '', message: result, user: logged(req.user)});
		})
		.fail(function(err) {
			res.render('error', {error: err, user: logged(req.user)});
		});
});

module.exports = app;
