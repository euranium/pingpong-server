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
var file = './data.db';

// external db
//var oio = require('orchestrate');
//oio.ApiEndPoint = 'api.ctl-uc1-a.orchestrate.io';
//var db = oio(external.orchestrate);


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

app.get('/', isLoggedIn, function(req, res) {
    var user = logged(req.user);
    var db = new sqlite3.Database(file);
    console.log(db);
    var query = util.format("Select name, elo, win, loss, ident, sendTo, winner, loser From people Left Join request Where people.name = '%s'", user);
    console.log(query);
    db.all(query, function(err, row) {
        if (err) {
            // if there is an error from the db
            console.log('profile error', err);
            res.render('error', {error: err});
            return console.log(err);
        } else {
            // save the results from this query
            var request = row;
            console.log(row);
            request[0].elo = Math.round(request[0].elo);
            // make another query to history to get the user's match history
            // This could be joined with the previous query but I didn't want to add excess joins and complicate the query
            query = util.format("Select win, lose, time From history where win='%s' or lose='%s'", user, user);
            db.all(query, function(err, row) {
                if (err) {
                    res.render('error', {error: err});
                    db.close();
                    return console.log(err);
                } else {
                    // return the profile page with all the user data and history
                    // the page is rendered with a form to accept or reject any match requests
                    console.log(user);
                    res.render('profile', {'user': user, 'row': request, 'history': row});
                    db.close();
                }
            });
        }
    });
});

// profile page after accepting or rejecting a game request
app.post('/', isLoggedIn, function(req, res) {
    var accept=req.body.accept, reject = req.body.reject, id = req.body.id, user = logged(req.user), query, player=req.body.player;
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
        query = util.format('Select winner, loser, elo, name from request left join people where ident=%d and sendTo="%s" and (name="%s" or name="%s")', id, user, user, player);
        console.log('query', query);
        db = new sqlite3.Database(file);
        db.all(query, function(err, row) {
            if (err || !row[0].winner || !row[1].winner){
                // if there is an error, bc the use tried to cheat the system or bc of the db, give them an error page
                res.render('error', {error: err || 'user undefined'});
                db.close();
                return console.log(err);
            } else {
                // set win and lose objects for the players and determine the player elo difference
                var win = {}, lose = {}, dif = Math.abs(parseInt(row[0].elo, 10) - parseInt(row[1].elo, 10));
                win.name = row[0].winner;
                lose.name = row[0].loser;
                // if the winner if the first player the query returns
                if (row[0].winner === row[0].name) {
                    win.pre = row[0].elo;
                    lose.pre = row[1].elo;
                } else {
                    win.pre = row[1].elo;
                    lose.pre = row[0].elo;
                }
                // get the expected score
                win.ex = 1 / (Math.pow(10, (parseInt(lose.pre, 10) - parseInt(win.pre, 10)) / 400) +1);
                lose.ex = 1 / (Math.pow(10, (parseInt(win.pre, 10) - parseInt(lose.pre, 10)) / 400) +1);
                // set the new elo
                win.score = win.pre + 32 * (1 - win.ex);
                lose.score = lose.pre + 32 * (0 - lose.ex);
                console.log('new elo winner', win.name, win.score);
                console.log('new elo loser', lose.name, lose.score);
                // update the db with new win, loss values and match history
                // use non blocking io to have all the updates run async
                query = util.format("Update People Set win = win+1, elo=%d Where name='%s'", win.score, row[0].winner);
                db.run(query);
                query = util.format("Update People Set loss = loss+1, elo=%d Where name='%s'", lose.score, row[0].loser);
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

module.exports = app;
