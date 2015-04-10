var express = require('express');
var app = express();
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
// db set up
// file location of the db and app to run it
var file = './data.db';
var db;
// ============================================================

function close () {
	db.close();
}
// write to the db
function enter (data) {
	// run an insertion query with a call back to close the connection
	db.run(data, close);
}
//open a connection to the db
function write (data) {
	// open a database with a call back to enter data
	db = new sqlite3.Database(file, enter(data));
}

function isLoggedIn (req, res, next) {
	if (req.isAuthenticated())
		return next();
	return res.redirect('/');
}
function logged (user) {
	// parse the user, if it is undefined it will return false
	return parse.isUser(user || false);
}

// ============================================================

app.get('/', function (req, res) {
    res.render('games', {user: logged(req.user)});
});

module.exports = app;
