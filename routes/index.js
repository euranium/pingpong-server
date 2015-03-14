var express = require('express');
var router = express.Router();
var passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy;

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
