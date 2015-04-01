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
var sqlite3 = require('sqlite3').verbose();
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

/* 
 * CHECK OUT PASSPORT DOCUMENTATION IF YOU HAVE ANY QUESTIONS ON WHAT IS HAPPENING WITH SERIALIZATION AND STRATEGY
 * http://passportjs.org/
 * standard passport user serialization
 */
passport.serializeUser(function (user, done) {
    // make sure done is a function
    done = (typeof done === 'function') ? done : function() {};
	return done(null, user);
});
// standard passport deseriazation
passport.deserializeUser(function (name, done) {
    done = (typeof done === 'function') ? done : function() {};
	login = function () {
		db = new sqlite3.Database(file);
		var query = util.format("Select id, name, password from people Where id = %d", name.id);
		// query the db for a person with their id number
		db.all(query, function(err, row) {
			if (err) {
				// if there is an error, bc there is no user or such, return the call back with a false
				console.log('deserialize error', err);
				return done(null, false);
			}
			// else return the call back with the name of the user
			return done(null, row[0].name);
		});
	};
	process.nextTick(login);
});

// local strategy for checking if someone is an authentic user with their id, username and password
passport.use(new LocalStrategy(
			function(username, password, done) {
				db = new sqlite3.Database(file);
				var query = util.format("Select id, name, password From people Where name = '%s'", username);
				// query the db for a person with their id number
				db.all(query, function(err, row) {
					if (err || row[0] === undefined) {
						console.log('login err', err);
						return done(null, false);
					}
					// check if their password checks out and return with the call back
					var comp = bcrypt.compareSync(password, row[0].password);
					if (comp)
						return done(null, row[0]);
					// if it does not checkout, call back with a false
					return done(null, false);
				});
			}
));
// ============================================================================
/* GET home page. */
app.get('/', function (req, res) {
	// return the index page, check who is logged in with req.user
	res.render('index', {'user': logged(req.user)});
});

app.get('/signUp', function(req, res, next) {
	// return the sign up page
	res.render('signUp', {error: '', user: logged(req.user)});
});

app.get('/games', isLoggedIn, function(req, res) {
	// after checking logged in status, return the games page
	res.render('games', {user: logged(req.user)});
});
app.get('/games/setGame', isLoggedIn, function(req, res) {
	// TODO: set up a system for asking for a game and make such requests on this page
	res.render('setGame', {user: logged(req.user)});
});
app.get('/games/find', isLoggedIn, function(req, res) {
	// TODO: set up a system for asking for a game and checking for such games on this page
	res.render('findGame', {'user': logged(req.user)});
});
app.get('/games/log', isLoggedIn, function(req, res) {
	// page where people make a game request after a game has been completed
	// this is teh get page, there is also a post page for this url which accepts forms
	res.render('addGame', {'user': logged(req.user), error: '', success: ''});
});

// profile section
app.get('/profile', isLoggedIn, function(req, res) {
	// get the user name from req.user
	var user = logged(req.user);
	db = new sqlite3.Database(file);
	// left join on people and requests to get people val always and requests only when there are requests
	var query = util.format("Select name, elo, win, loss, ident, sendTo, winner, loser From people Left Join request Where people.name = '%s'", user);
	db.all(query, function(err, row) {
		if (err) {
			// if there is an error from the db
			console.log('profile error', err);
			res.render('error', {error: err});
			return console.log(err);
		} else {
			// save the results from this query
			var request = row;
			// make another query to history to get the user's match history
			// This could be joined with the previous query but I didn't want to add excess joins and complicate the query
			query = util.format("Select win, loose, time From history where win='%s' or loose='%s'", user, user);
			db.all(query, function(err, row) {
				if (err) {
					res.render('error', {error: err});
					db.close();
					return console.log(err);
				} else {
					// return the profile page with all the user data and history
					// the page is rendered with a form to accept or reject any match requests
					res.render('profile', {'user': user, 'row': request, 'history': row});
					db.close();
				}
			});
		}
	});
});

// logout function
app.get('/logout', function(req, res) {
	// run passports logout function and redirect to the home page
	req.logout();
	res.redirect('/');
});

// login page
app.get('/login', function(req, res) {
	res.render('login', {error: '', user: logged(req.user)});
});

// profile page after accepting or rejecting a game request
app.post('/profile', isLoggedIn, function(req, res) {
	var accept=req.body.accept, reject = req.body.reject, id = req.body.id, user = logged(req.user), query;
	// if the player clicked reject delete the request from the db, use the id provided by the form to find the correct request
	// make sure the value of reject and accept are actually strings they were originaly in the form
	if (reject && reject === 'reject'){
		query = util.format("Delete From request where ident=%d", id);
		write(query);
		// redirect back to the get to handle the profile querying
		res.redirect('/profile');
	}
	// if the plaer hit accept
	else if (accept && accept === 'accept') {
		// find the match in the db from the provided id and the username
		// I didn't want to trust the user and just use hiden input to get the match info
		query = util.format('Select winner, loser from request where ident=%d and sendTo="%s"', id, user);
		db = new sqlite3.Database(file);
		db.all(query, function(err, row) {
			if (err || !row[0].winner){
				// if there is an error, bc the use tried to cheat the system or bc of the db, give them an error page
				res.render('error', {error: err || 'user undefined'});
				db.close();
				return console.log(err);
			} else {
				// update the db with new win, loss values and match history
				// use non blocking io to have all the updates run async
				query = util.format("Update People Set win= win+1 Where name='%s'", row[0].winner);
				db.run(query);
				query = util.format("Update People Set loss= loss+1 Where name='%s'", row[0].loser);
				db.run(query);
				query = util.format("Delete From request where ident=%d", id);
				db.run(query);
				query = util.format("Insert Into history  Values('%s', '%s', '%s')", row[0].winner, row[0].loser, parse.toTime());
				db.run(query);
				// redirect to the profile page again to have that handle user profile info
				res.redirect('/profile');
			}
		});
	} else
		// if there was not accept or reject render and error
		res.render('error', {error: 'reject or accept not defined'});
});

// handle user game request forms
app.post('/games/log', isLoggedIn, function(req, res) {
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
			else if (row[0] === undefined || row[1] === undefined)
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

// use passport the handle use authentication with local strategy
app.post('/login', passport.authenticate('local', {successRedirect: '/', failureRedirect: '/login', failureFlash: false}));

// user creation
app.post('/signUp', function(req, res, next) {
	// get the password, password confirmation, username and email
	var pass0 = req.body.password0, pass1 = req.body.password1, user = req.body.name, email = req.body.email;
	// parse the inputed text
	email = parse.isEmail(email);
	user = parse.isUser(user);
	var check = parse.check(pass0, user, email);
	if (check !== true || pass0 !== pass1)
		// return errors if there is a problem
		res.render('signUp', {error: check});
	else {
		db = new sqlite3.Database(file);
		// hash the user's password with standard bcrypt hashSync
		var hash = bcrypt.hashSync(pass0);
		// make a new column in the db with all their basic info
		var query = util.format("Insert Into people (name, email, password, elo, win, loss) Values ('%s', '%s', '%s', 0, 0, 0)", user, email, hash);
		// not using the standard write() function to be able to know is something when wrong
		db.run(query, function (err, row) {
			if (err) {
				// through a standard error and tell the user the user name is already taken
				// this is most likey the problem, not the db
				res.render('signUp', {'error': 'user name already taken' });
				return console.log('error ', err);
			} else {
				// TODO: log the user in after their account is created
				res.redirect('/login');
			}
		});
	}
});

module.exports = app;
