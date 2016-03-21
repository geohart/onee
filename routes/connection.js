var express = require('express');
var router = express.Router();
var model  = require('./model');
var passport = require('passport');
var functions = require('./functions');

/* POST create a new connection */
router.post('/create', function(req, res, next){ 
	// TODO
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