// set up ======================================================
var util = require('util');
var express = require('express');
var app = express();
var router = express.Router();
var passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');
var flash = require('connect-flash');
var bcrypt = require('bcrypt-nodejs');

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

function generateHash (password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSunc(8), null);
}
function validPassword (password, hash) {
	return bcrypt.compareSync(password, hash);
}

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

function isLoggedIn(req, res, next) {
	// if user is autheniticated, carry on
	if (req.isAuthenticated())
		return next();
	// else redirect to home
	res.redirect('/');
}

passport.serializeUser(function (user, done) {
	done(null, user._id);
});
passport.deserializeUser(function (id, done) {
	User.findById(id, function (err, user) {
		done(err, user);
	});
});

passport.use('login', new LocalStrategy({
	passReqToCallback : true },
	function (req, username, password, done) {
		// check is username exists
		User.findOne({'username' : username },
			function (err, user) {
				if (err) {
					return done(err);
				}
				if (!user) {
					console.log("user not found");
					return done(null, false, req.flash('message', 'User Not found'));
				}
				if (!isValidPassword(user, password)) {
					console.log('invalid password');
					return done(null, flase, req.flash('message', 'Invalid password'));
				}
				return done(null, user);
			}
			);
	}));

passport.use('signup', new LocalStrategy({
    passReqToCallback : true
  },
  function(req, username, password, done) {
    findOrCreateUser = function(){
      // find a user in Mongo with provided username
      User.findOne({'username':username},function(err, user) {
        // In case of any error return
        if (err){
          console.log('Error in SignUp: '+err);
          return done(err);
        }
        // already exists
        if (user) {
          console.log('User already exists');
          return done(null, false,
             req.flash('message','User Already Exists'));
        } else {
          // if there is no user with that email
          // create the user
          var newUser = new User();
          // set the user's local credentials
          newUser.username = username;
          newUser.password = createHash(password);
          newUser.email = req.param('email');
          newUser.firstName = req.param('firstName');
          newUser.lastName = req.param('lastName');

          // save the user
          newUser.save(function(err) {
            if (err){
              console.log('Error in Saving user: '+err);
              throw err;
            }
            console.log('User Registration succesful');
            return done(null, newUser);
          });
        }
      });
    };
    // Delay the execution of findOrCreateUser and execute
    // the method in the next tick of the event loop
    process.nextTick(findOrCreateUser);
  })
);

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { message: '' });
});

router.get('/signUp', function(req, res, next) {
	res.render('signUp', {error: ''});
});

// profile section
router.get('/profile', isLoggedIn, function(req, res) {
	res.render('profile', {user : req.user});
});

// logout
app.get('/logout', function(req, res) {
	req.logout();
	res.rederiect('/');
});


// user creation
router.post('/', function(req, res, next) {
	var pass0, pass1, user, email;
	pass0 = req.body.password0;
	pass1 = req.body.password1;
	user = req.body.name;
	email = req.body.email;
	if ((pass0 === '') || (pass1 === '') || (pass0 !== pass1)) {
		res.render('signUp', {error: 'passwords did not match'});
	}
	if ((user === '') || (email === '')) {
		res.render('signUp', {error: 'please enter an email address'});
	}
	var hash = bcrypt.hashSync(pass0/*, bcrypt.genSaltSunc(8)*/);
	var data = util.format('Insert Into people (%s, %s, %s)', user, email, hash);
	console.log(data);
	res.render('index', {message: 'thank you for signing up'});
});

module.exports = router;
