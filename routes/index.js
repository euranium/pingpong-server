// set up ======================================================
var util = require('util');
var crypto = require('crypto');
var parse = require('./../scripts/parse.js');
var express = require('express');
var app = express();
//var router = express.Router();
var passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');
var bcrypt = require('bcrypt-nodejs');
var cookie = require('cookie-parser');
var bodyParser = require('body-parser');

module.exports = genUuid;
function genUuid(callback) {
	if (typeof(callback) !== 'function') {
		return uuidFromBytes(crypto.randomBytes(16));
	}

	crypto.randomBytes(16, function(err, rnd) {
		if (err) return callback(err);
		callback(null, uuidFromBytes(rnd));
	});
}

function uuidFromBytes(rnd) {
  rnd[6] = (rnd[6] & 0x0f) | 0x40;
  rnd[8] = (rnd[8] & 0x3f) | 0x80;
  rnd = rnd.toString('hex').match(/(.{8})(.{4})(.{4})(.{4})(.{12})/);
  rnd.shift();
  return rnd.join('-');
}
app.use(session({
	genid: function(req) {
		return genUuid(); // use UUIDs for session IDs
	},
	resave: true,
	saveUninitialized: true,
	cookie: {secure: true},
	secret: 'wwu compsci'
}));
// app set up
app.use(express.static('public'));
app.use(cookie());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());
//app.set('trust proxy', 1);

// db set up
// file location of the db and app to run it
var file = './data.db';
var sqlite3 = require('sqlite3').verbose();
var db;
// ============================================================

function validPassword (password, hash) {
	return bcrypt.compareSync(password, hash);
}

function close () {
	db.close();
}
// write to the db
function enter (data) {
	db.run(data, close);
}
//open a connection to the db
function write (data) {
	db = new sqlite3.Database(file, enter(data));
}

function isLoggedIn (req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	} else {
		res.redirect('/');
	}
}

passport.serializeUser(function (user, done) {
	return done(null, user);
});
passport.deserializeUser(function (name, done) {
	login = function () {
		db = new sqlite3.Database(file);
		var query = util.format("Select rowid As id, name, password Where id = '%s'", id);
		console.log(query);
		db.run(query, function(err, row) {
			if ((err !== null) || (!row)) {
				console.log(err);
				return done(null, false);
			}
			console.log(row[0].id);
			return done(null, row[0].id);
		});
	};
	process.nextTick(login);
});

passport.use(new LocalStrategy(
			function(username, password, done) {
				db = new sqlite3.Database(file);
				var query = util.format("Select id, name, password From people Where name = '%s'", username);
				//console.log(query);
				db.all(query, function(err, row) {
					//console.log(row);
					if ((err !== null) || (row[0].password === undefined)) {
						console.log(err);
						return done(null, false);
					}
					var comp = bcrypt.compareSync(password, row[0].password);
					if (comp) {
						return done(null, row[0]);
					} else {
						return done(null, false);
					}
				});
			}
));

/* GET home page. */
app.get('/', function (req, res, next) {
	console.log("index ", req.session);
	res.render('index', {message: req.isAuthenticated()});
});

app.get('/signUp', function(req, res, next) {
	res.render('signUp', {error: ''});
});

// profile section
app.get('/profile', isLoggedIn, function(req, res) {
	res.render('profile', {user : req.user});
});

// logout
app.get('/logout', function(req, res) {
	req.logout();
	res.rederiect('/');
});

app.get('/login', function(req, res) {
	res.render('login', {error: ''});
});

app.post('/login', passport.authenticate('local',
			{ successRedirect: '/',
				failureRedirect: '/login',
				failureFlash: false
			}),
		function(req, res) {
			//req.session.user = req.user;
			console.log('session');
		}
);

app.post('/', function(req, res, next) {
	res.render('index', {message: ''});
});

// user creation
app.post('/signUp', function(req, res, next) {
	var pass0, pass1, user, email;
	pass0 = req.body.password0;
	pass1 = req.body.password1;
	user = req.body.name;
	email = req.body.email;
	email = parse.isEmail(email);
	if ((pass0 === '') || (pass1 === '') || (pass0 !== pass1)) {
		res.render('signUp', {error: 'passwords did not match'});
	}
	else if (user === '') {
		res.render('signUp', {error: 'please enter a user name'});
	}
	else if (email === false) {
		res.render('signUp', {error: 'please enter a valid email address'});
	}
	else {
		db = new sqlite3.Database(file);
		var hash = bcrypt.hashSync(pass0/*, bcrypt.genSaltSunc(8)*/);
		var query = util.format("Insert Into people (name, email, password) Values ('%s', '%s', '%s')", user, email, hash);
		console.log(query);
		db.run(query, function (err, row) {
			if (err !== null) {
				console.log('error ' + err);
				res.render('signUp', {'error': 'user name already taken' });
			} else {
				res.redirect('/');
				//res.render('index', {message: 'thank you for signing up'});
			}
		});
	}
});

module.exports = app;
