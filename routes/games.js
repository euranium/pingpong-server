/*jshint esnext: true */
// set up ======================================================
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
	console.log('data', data);
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
// ============================================================================
app.get('/', isLoggedIn, function(req, res) {
	// after checking logged in status, return the games page
	res.render('games', {user: logged(req.user)});
});

app.get('/setGame', isLoggedIn, function(req, res) {
	// TODO: set up a system for asking for a game and make such requests on this page
	res.render('setGame', {user: logged(req.user)});
});

app.get('/find', isLoggedIn, function(req, res) {
	// TODO: set up a system for asking for a game and checking for such games on this page
	res.render('findGame', {'user': logged(req.user)});
});

app.get('/log', isLoggedIn, function(req, res) {
	// page where people make a game request after a game has been completed
	// this is teh get page, there is also a post page for this url which accepts forms
	res.render('addGame', {'user': logged(req.user), error: '', success: ''});
});

// handle user game request forms
app.post('/log', isLoggedIn, function(req, res) {
	var sendTo = req.body.sendTo, winner = req.body.winner, loser = req.body.second, user = logged(req.user);
	// data parsing to check validity, eg not sending request to ones self
	var check = parse.check(sendTo, winner, loser);
	var isValid = parse.isValid(sendTo, user, winner, loser);
	// if any data is not valid
	if (check !== true)
		res.render('addGame', {'user': user, success: '', error: 'please correctly enter data in the fields'});
	else if (isValid !== true)
		res.render('addGame', {'user': user, error: isValid, success: ''});
	else {
		db = new sqlite3.Database(file);
		// query to make sure the users are real and in the system
		var query = util.format("Select name From people Where name = '%s' or name = '%s'", winner, loser);
		db.all(query, function(err, row) {
			console.log(row);
			if (err){
				// render the page again with an  error is there was a problem with the db
				res.render('addGame', {'user': user, error: 'error sending request', success: ''});
				return consolel.log('error', err);
			}
			else if (!row[0] || !row[1])
				// render the page if there was a problem finding any of the users
				res.render('addGame', {'user': user, error: 'user not found', success: ''});
			else {
				// write the the db with the new request
				query = util.format("Insert Into request (sendTo, winner, loser) Values ('%s','%s', '%s')", sendTo, winner, loser);
				write(query);
				res.render('addGame', {'user': user, error: '', success: 'success'});
			}
		});
	}
});

module.exports = app;
