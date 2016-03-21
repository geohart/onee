var express = require('express');
var router = express.Router();
var model  = require('./model');
var passport = require('passport');
var functions = require('./functions');

/* POST create account */
router.post('/create', function(req, res, next) {
	
	// check if email address already exists
	
	// create new account from form information
	var user = new model.User({
		  name: 	req.body.name
		, email: req.body.email
		, phone:	req.body.phone 
	    , password: req.body.pwd
	    , shareLocation: 1
	    , status: 0
	});
	
	user.save(function(err, user){
		
		if (err) return console.error(err);
		
		// use passport function login() to sign in newly registered user
		req.login(user, function(err) {
			if (err) { return next(err); }
			return res.redirect('/');
		});		
	});
});

/* POST sign in to account */
router.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), function(req, res, next){
	console.log('here comes the authenticated');
	console.log(req.user);		
	res.redirect('/');
});

/* POST update to account */
router.post('/update', function(req, res, next){ 
	// TODO
});

/* POST reset password */
router.post('/password/reset', function(req, res, next){ 
	// TODO
});

/* POST change password */
router.post('/password/change', function(req, res, next){ 
	// TODO
});

/* POST upload photo */
router.post('/photo/upload', function(req, res, next){ 
	// TODO
});

/* POST delete photo */
router.post('/photo/delete', function(req, res, next){ 
	// TODO
});

/* POST pair ONEE with account */
router.post('/onee/pair', function(req, res, next){ 
	// TODO
});

/* POST unpair ONEE with account */
router.post('/onee/unpair', function(req, res, next){ 
	// TODO
});

/* POST location sharing preference */
router.post('/location/sharing', function(req, res, next){ 
	// TODO
});

/* POST current location */
router.post('/location/update', function(req, res, next){ 
	// TODO
});

module.exports = router;