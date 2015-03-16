// set up ======================================================
var util = require('util');
var parse = require('./../scripts/parse.js');
var express = require('express');
var app = express();
var router = express.Router();
var passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');
var flash = require('connect-flash');
var bcrypt = require('bcrypt-nodejs');
var cookie = require('cookie-parser');

// passport set up
app.set('trust proxy', 1);
app.use(session({
	genid: function(req) {
		return genuuid(); // use UUIDs for session IDs
	},
	resave: false,
	saveUninitialized: true,
	cookie: {secure: true},
	secret: 'wwu compsci'
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

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

function isLoggedIn(req, res, next) {
	// if user is autheniticated, carry on
	if (req.isAuthenticated())
		return next();
	// else redirect to home
	res.redirect('/');
}

passport.serializeUser(function (user, done) {
	done(null, user.id);
});
passport.deserializeUser(function (name, done) {
	db = new sqlite3.Database(file);
	var query = uitil.format("Select rowid As name, password Where name = '%s'", name);
	db.run(query, function(err, row) {
		if ((err !== null) || (!row)) {
			return done(null, false);
		}
		else {
			return done(null, row.name);
		}
	});
});

passport.use(new LocalStrategy(
			function(username, password, done) {
				db = new sqlite3.Database(file);
				console.log(username);
				var query = util.format("Select name, password From people Where name = '%s'", username);
				console.log(query);
				db.all(query, function(err, row) {
					console.log(row);
					if ((err !== null) || (!row)) {
						console.log(err);
						return done(null, false);
					}
					var comp = bcrypt.compareSync(password, row[0].password);
					if (comp) {
						return done(null, row[0].name);
					} else {
						return done(null, false);
					}
				});
			}
));

/* GET home page. */
router.get('/', function (req, res, next) {
	db = new sqlite3.Database(file);
	var query = util.format("Select name, password From people Where name = '%s'", 'jon');
	db.all(query, function(err, row) {
		console.log(row);
		if (err !== null) {
			console.log(err);
			res.render('index', {message: err});
		} else {
			console.log(row);
			res.render('index', { message: row });
		}
	});
});

router.get('/signUp', function(req, res, next) {
	res.render('signUp', {error: ''});
});

// profile section
router.get('/profile', isLoggedIn, function(req, res) {
	res.render('profile', {user : req.user});
});

// logout
router.get('/logout', function(req, res) {
	req.logout();
	res.rederiect('/');
});

router.get('/login', function(req, res) {
	res.render('login', {error: ''});
});

router.post('/login', passport.authenticate('local',
			{ successRedirect: '/',
				failureRedirect: '/login',
				failureFlash: false
			})
);
/*
router.post('/login', function(req, res) {
	var pass = req.body.password;
	var name = req.body.name;
	if ((pass === '') || (name === '') || (pass === undefined) || (name === undefined)) {
		res.render('login', {error: 'user name or password Incorect'});
	} else {
		db = new sqlite3.Database(file);
		var query = uitil.format("Select rowid As name, password Where name = '%s'", name);
		console.log(query);
		db.all(query, function (err, row) {
			if (err !== null) {
				console.log(err);
				res.render('login', {error: err});
			} else {
				res.render('login', {error: rowid});
			}
		});
	}
});
*/


router.post('/', function(req, res, next) {
	res.render('index', {message: ''});
});

// user creation
router.post('/signUp', function(req, res, next) {
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
		var query = util.format("Insert Into people Values ('%s', '%s', '%s')", user, email, hash);
		console.log(query);
		db.run(query, function (err, row) {
			if (err !== null) {
				console.log('error ' + err);
				res.render('signUp', {'error': 'user name or password already taken' });
			} else {
				res.redirect('/');
				//res.render('index', {message: 'thank you for signing up'});
			}
		});
	}
});

module.exports = router;
