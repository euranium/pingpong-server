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
