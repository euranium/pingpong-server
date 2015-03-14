var express = require('express');
var router = express.Router();
var passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');
var url = require('url');
var app = express();
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

// file location of the db and app to run it
var file = './data.db';
var sqlite3 = require('sqlite3').verbose();
var db;

function close () {
	db.close();
}
// write to the db
function write (data) {
	db.run(data, close);
}
//open a connection to the db
function read (data) {
	db = new sqlite3.Database(file);
}

passport.use(new LocalStrategy(
			function(username, password, done) {
				User.findOne({ username: username }, function (err, user) {
					if (err) { return done(err); }
					if (!user) {
						return done(null, false, { message: 'Incorrect username.' });
					}
					if (!user.validPassword(password)) {
						return done(null, false, { message: 'Incorrect password.' });
					}
					return done(null, user);
				});
			}
			));

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/signUp', function(req, res, next) {
	res.render('signUp', {});
});

router.post('/', function(req, res, next) {
	var pass0, pass1, user, email;
	pass0 = req.body.password0;
	pass1 = req.body.password1;
	user = req.body.name;
	email = req.body.email;
	if ((pass0 === '') || (pass1 === '') || (pass0 !== pass1)) {
		res.render('signUp', {});
	}
	if ((user === '') || (email === '')) {
		res.render('signUp', {});
	}
	res.render('index', {});
});

module.exports = router;
