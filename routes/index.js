/*jshint esnext: true */
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
var genUuid = parse.genUuid;
app.use(session({
	genid: function(req) {
		return genUuid(); // use UUIDs for session IDs
	},
	resave: true,
	saveUninitialized: true,
	cookie: {
		secure: false,
		maxAge: 35000000
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
	db.run(data, close);
}
//open a connection to the db
function write (data) {
	db = new sqlite3.Database(file, enter(data));
}

function isLoggedIn (req, res, next) {
	var user = req.cookies.user;
	if (!user)
		return res.redirect('/login');
	var name = cookie.signedCookie(user, 'wwu compscie');
	if (name)
		return next();
	res.redirect('/');
}
function logged (user) {
	if (user !== undefined)
		return cookie.signedCookie(user, 'wwu compscie');
	return false;
}

passport.serializeUser(function (user, done) {
	return done(null, user);
});
passport.deserializeUser(function (name, done) {
	login = function () {
		db = new sqlite3.Database(file);
		console.log(name.id);
		var id = name.id;
		var query = util.format("Select rowid As id, name, password Where id = '%s'", id);
		console.log('deserialize', query);
		db.run(query, function(err, row) {
			if ((err !== null) || (!row)) {
				console.log(err);
				return done(null, false);
			}
			return done(null, row[0].name);
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
					//console.log('here', row[0]);
					if ((err !== null) || (row[0] === undefined)) {
						console.log('login err', err);
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
// ============================================================================
/* GET home page. */
app.get('/', function (req, res) {
	var user = logged(req.cookies.user);
	console.log('user', req.user);
	res.render('index', {'user': user});
});

app.get('/signUp', function(req, res, next) {
	res.render('signUp', {error: '', user: logged(req.cookies.user)});
});

app.get('/games', isLoggedIn, function(req, res) {
	var user = logged(req.cookies.user);
	res.render('games', {'user': user});
});
app.get('/games/setGame', isLoggedIn, function(req, res) {
	var user = logged(req.cookies.user);
	res.render('setGame', {'user': user});
});
app.get('/games/find', isLoggedIn, function(req, res) {
	var user = logged(req.cookies.user);
	var time = parse.toTime();
	console.log('time', time);
	res.render('findGame', {'user': user});
});
app.get('/games/log', isLoggedIn, function(req, res) {
	var user = logged(req.cookies.user);
	res.render('addGame', {'user': user, error: '', success: ''});
});

// profile section
app.get('/profile', isLoggedIn, function(req, res) {
	var user = logged(req.cookies.user);
	db = new sqlite3.Database(file);
	//var query = util.format("Select name, elo, win, loss From people Where name = '%s'", user);
	var query = util.format("Select name, elo, win, loss, sendTo, winner, looser From people Left Join request Where people.name = '%s'", user);
	db.all(query, function(err, row) {
		if (err) {
			console.log('profile error', err);
			res.render('error', {error: err});
		} else {
			console.log('row', row);
			var win = row[0].win, loss = row[0].loss, elo = row[0].elo;
			res.render('profile', {'user': user, 'win': win, 'loss': loss, 'elo': elo, 'row': row});
		}
	});
});

// logout
app.get('/logout', function(req, res) {
	res.clearCookie('user');
	res.redirect('/');
});

app.get('/login', function(req, res) {
	res.render('login', {error: '', user: logged(req.cookies.user)});
});

app.post('/games/log', isLoggedIn, function(req, res) {
	var sendTo = req.body.sendTo, winner = req.body.winner, looser = req.body.second, user = logged(req.cookies.user);
	if (sendTo === user)
		res.render('addGame', {'user': user, error: 'cannot send request to youself', success: ''});
	else if(winner === looser)
		res.render('addGame', {'user': user, error: 'winner and looser the same person', success: ''});
	else if (winner !== user && looser !== user)
		res.render('addGame', {'user': user, error: 'you must be apart of the game', success: ''});
	else {
		db = new sqlite3.Database(file);
		var query = util.format("Select name From people Where name = '%s' or name = '%s'", winner, looser);
		console.log(query);
		db.all(query, function(err, row) {
			console.log(row);
			if (row[0] === undefined || row[1] === undefined)
				res.render('addGame', {'user': user, error: 'user not found', success: ''});
			else if (err !== null)
				res.render('addGame', {'user': user, error: 'error sending request', success: ''});
			else {
				query = util.format("Insert Into request (sendTo, winner, looser) Values ('%s','%s', '%s')", sendTo, winner, looser);
				write(query);
				res.render('addGame', {'user': user, error: '', success: 'success'});
			}
		});
	}
});

app.post('/login', passport.authenticate('local', {failureRedirect: '/login', failureFlash: false}), function(req, res, next) {
	if (null === req.user) {
		res.redirect('/login');
	}
	else {
		req.secret = 'wwu compscie';
		res.cookie('user', req.user.name, {maxAge: 3600000, secure: false,  signed: true});
		res.redirect('/');
	}
});

// user creation
app.post('/signUp', function(req, res, next) {
	var pass0 = req.body.password0, pass1 = req.body.password1, user = req.body.name, email = req.body.email;
	email = parse.isEmail(email);
	user = parse.isUser(user);
	var check = parse.check(pass0, pass1, user, email);
	if (check !== true)
		res.render('signUp', {error: check});
	else {
		db = new sqlite3.Database(file);
		var hash = bcrypt.hashSync(pass0);
		var query = util.format("Insert Into people (name, email, password, elo, win, loss) Values ('%s', '%s', '%s', 0, 0, 0)", user, email, hash);
		console.log(query);
		db.run(query, function (err, row) {
			if (err !== null) {
				console.log('error ' + err);
				res.render('signUp', {'error': 'user name already taken' });
			} else {
				req.secret = 'wwu compscie';
				res.cookie('user', user, {maxAge: 3600000, secure: false,  signed: true});
				res.redirect('/');
			}
		});
	}
});

module.exports = app;
