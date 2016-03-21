var express = require('express');
var router = express.Router();
var model  = require('./model');
var passport = require('passport');
var functions = require('./functions');


/*********** Get Views ***********/

/* GET home page. */
router.get('/', functions.ensureAuthenticated, function(req, res) {
  res.render('index', { title: 'ONEE' });
});

/* GET signin page */
router.get('/signin', function(req, res) {
  res.render('signin', { title: 'ONEE - Sign in please' });
});

/* GET signup page */
router.get('/signup', function(req, res) {
  res.render('signup', { title: 'ONEE - Sign Up!' });
});

/* GET connect page */
router.get('/connect', functions.ensureAuthenticated, function(req, res) {
  res.render('connect', { title: 'ONEE - Connect with a friend' });
});

/* GET connection page */
router.get('/connection', functions.ensureAuthenticated, function(req, res) {
  res.render('connection', { title: 'ONEE - You\'re connected' });
});


/*********** View Functionality ***********/

/* GET users for autocomplete */
router.get('/find/users', functions.ensureAuthenticated, function(req, res, next){
	// TODO
});

/* GET historical connections */
router.get('/find/connections', functions.ensureAuthenticated, function(req, res, next){
	// TODO
});


module.exports = router;