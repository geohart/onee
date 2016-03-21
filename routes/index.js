var express = require('express');
var router = express.Router();
var model  = require('./model');
var passport = require('passport');
var functions = require('./functions');


/*********** Get Views ***********/

/* GET home page. */
router.get('/', function(req, res) {
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
router.get('/connect', function(req, res) {
  res.render('connect', { title: 'ONEE - Connect with a friend' });
});

/* GET connection page */
router.get('/connection', function(req, res) {
  res.render('connection', { title: 'ONEE - You\'re connected' });
});

module.exports = router;