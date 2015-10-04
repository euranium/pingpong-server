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

//var db = require('orchestrate')(external.orchestrate);
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

// signin
app.get('/signUp', function(req, res, next) {
	// return the sign up page
	res.render('signUp', {error: '', user: logged(req.user)});
});

// login
app.get('/', function(req, res) {
	res.render('login', {error: '', user: false});
});

// logout function
app.get('/logout', function(req, res) {
	// run passports logout function and redirect to the home page
	req.logout();
	res.redirect('/');
});

// login action
app.post('/', passport.authenticate('local', {successRedirect: '/', failureRedirect: '/account', failureFlash: false}));

// user creation
app.post('/signUp', function(req, res, next) {
    console.log('here');
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
		var query = util.format("Insert Into people (name, email, password, elo, win, loss) Values ('%s', '%s', '%s', 1000, 0, 0)", user, email, hash);
		// not using the standard write() function to be able to know is something when wrong
		db.run(query, function (err, row) {
			if (err) {
				// through a standard error and tell the user the user name is already taken
				// this is most likey the problem, not the db
				res.render('signUp', {'error': 'user name or email already taken', 'user': false });
				console.log('error ', err);
                return;
			} else {
				// TODO: log the user in after their account is created
				res.redirect('/account');
			}
		});
	}
});

module.exports = app;
