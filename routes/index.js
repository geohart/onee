var express 		= require('express');
var router 			= express.Router();

/*********** Setup Other Routes ***********/

router.use('/auth', require('./auth')); // setup pathways to authentication actions (see auth.js for details)
router.use('/account', require('./account')); // setup pathways for account-related actions (see account.js for details)
router.use('/connection', require('./connection')); // setup pathways for connection-related actions (see connection.js for details)

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
router.get('/view', function(req, res) {
  res.render('connection', { title: 'ONEE - You\'re connected' });
});

module.exports = router;