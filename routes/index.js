var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/signUp', function(req, res, next) {
	res.render('signUp', {});
});

router.post('/', function(req, res, next) {
	res.render('index', {});
});

module.exports = router;
