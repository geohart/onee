var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'ONEE' });
});

/* GET signin page */
router.get('/signin', function(req, res, next) {
  res.render('signin', { title: 'ONEE - Sign in please' });
});

/* GET signup page */
router.get('/signup', function(req, res, next) {
  res.render('signup', { title: 'ONEE - Sign Up!' });
});

/* GET connect page */
router.get('/connect', function(req, res, next) {
  res.render('connect', { title: 'ONEE - Connect with a friend' });
});

/* GET connection page */
router.get('/connection', function(req, res, next) {
  res.render('connection', { title: 'ONEE - You\'re connected' });
});

module.exports = router;

/* key tasks

create an account
update account
delete account
upload photo
delete photo
update onee paired with account

create a connection
destroy a connection
send message
respond to message
query status
update status
request assistance
acknowledge request
update location
set location sharing
get history
add friend
delete friend
get friends
get partner's status

*/