var express	= require('express');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var bcrypt = require('bcrypt-nodejs');
var config = require('../config');
var model = require('./model');

// declare instance of express router
var router = express.Router();

// route to authenticate a user
router.post('/authenticate', function(req, res, next) {
	
	// check for required request parameters
	if(req.body.email && req.body.password){	

		// find the user
		model.User.findOne({ username: req.body.email }, function(err, user) {
			if (err) throw err;

			if (!user) {
				res.status(401).json({ success: false, message: 'Authentication failed. User not found.', token:null });
			} else if (user) {
				
				// check if account is validated
				if(user.verified == 1){

					// check if password matches
					user.verifyPassword(req.body.password, function(err, isMatch) {
						if (err) { return next(err); }
						
						if (!isMatch) {
							res.status(401).json({ success: false, message: 'Authentication failed. Wrong password.', token: null });
						} else {

							// if user is found and password is right - create a token
							var token = jwt.sign(user, config.secret, {
								expiresIn: 86400 // expires in 24 hours
							});

							// return the information including token as JSON
							res.status(200).json({
								success: true,
								message: 'Enjoy your token!',
								token: token
							});
						}
					});
				} else {
					res.status(401).json({ success: false, message: 'Authentication failed. Account not verified.', token: null });
				}
			}
		});
		
	} else {
		res.status(400).json({ success: false, message: 'Check your request parameters', token: null });
	}
	
});

// function to check for token
router.checkToken = function(req, res, next) {

	// check header or url parameters or post parameters for token
	var token = req.body.token || req.query.token || req.headers['x-access-token'];

	// decode token
	if (token) {
		// verifies secret and checks exp
		jwt.verify(token, config.secret, function(err, decoded) {      
			if (err) {
				return res.json({ success: false, message: 'Failed to authenticate token.' });    
			} else {
				// if everything is good, save to request for use in other routes
				req.decoded = decoded;    
				next();
			}
		});
	} else {
		// if there is no token return an error
		return res.status(403).send({ 
			success: false, 
			message: 'No token provided.' 
		});
	}
	
}

module.exports = router;