var express 	= require('express');
var passport  = require('passport');
var model  	= require('./model');
var auth 		= require('./auth');

// declare instance of express router
var router = express.Router();

/* setup authentication for all methods in this router */
//router.use(auth.isAuthenticated);

/* POST create a new connection */
router.post('/create', function(req, res, next){ 
	res.send('it worked');
});

/* POST end a connection */
router.post('/end', function(req, res, next){ 
	// TODO
});

/* POST send message */
router.post('/message/send', function(req, res, next){ 
	// TODO
});

/* POST reply to message */
router.post('/message/reply', function(req, res, next){ 
	// TODO
});

/* GET buddy location */
router.get('/buddy/location', function(req, res, next){ 
	// TODO
});

module.exports = router;