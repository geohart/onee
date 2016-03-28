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

module.exports = router;