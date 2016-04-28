var express	= require('express');
var config		= require('../config');   
var model		= require('./model');
var auth        = require('./auth');
var mail			= require('./mail');
var func			= require('./functions');

// declare instance of express router
var router = express.Router();

// apply security measures to protected endpoints
router.use('/secure', auth.checkToken);

router.post('/test', function(req, res, next){
	console.log('query:');
	console.log(req.query);
	console.log('body:');
	console.log(req.body);
	res.status(200).json(req.user).send({'message' : 'test done'});
});

router.get('/test', function(req, res, next){
	console.log('body:');
	console.log(req.query);
	console.log('body:');
	console.log(req.body);
	res.status(200).send({'message' : 'test done'});
});

router.get('/secure/test', function(req, res, next){
	res.status(200).send({'message' : 'hello!'})
});

/* POST create account */
router.post('/create', function(req, res, next) {
	
	// check for required request parameters
	if(req.body.email && req.body.name && req.body.phone && req.body.password){	
	
		// check if email address already exists
		model.User.findOne({ username: req.body.email }, function (err, user) {

			if (err) { return next(err); }
			
			// check if user already exists, otherwise create new account
			if(user) {
				res.status(400).send({'message' : 'A user with that email address already exists.'});
			} else {
				
				// validate user input
				// TODO
				
				// get validation code
				func.getRandomString(6, function(err, code){
					if (err) { return next(err); }
					
					// create new account from form information
					var user = new model.User({
						  name: 	req.body.name
						, username: req.body.email.toLowerCase()
						, phone:	req.body.phone 
						, password: req.body.password
						, shareLocation: 1
						, status: 0
						, verifyCode: code
						, verified: 0
					});
					
					user.save(function(err, user){
						if (err) return next(err);
						res.status(200).send({'message' : 'New account created successfully.'});
						// send email
						mail.welcome(req, user.username, user.name, user.verifyCode);
					});
				
				});				
			}
		});
	} else {
		res.status(400).send({'message' : 'Error. Check your request parameters.'});
	}
});

/* GET verify account */
router.get('/verify', function(req, res, next){
	
	// check for required request parameters
	if(req.query.email && req.query.code){	
	
		// check if user address exists
		model.User.findOne({ username: req.query.email }, function (err, user) {

			if (err) { return next(err); }
			
			// check if user already exists, otherwise create new account
			if(!user) {
				res.status(400).send({'message' : 'Error. No matching account found. Please try again.'});
			} else {
				
				// validate user input
				// TODO
				
				// check if code matches saved code
				if (req.query.code != user.verifyCode){
					res.status(400).send({'message' : 'Error. Incorrect verification code. Please try again.'});
				} else {
					user.verified = 1;
					user.save(function(err, user){
						if (err) return next(err);
						res.status(200).send({'message' : 'Your account has been verified.'});
					});
				}
				
			}
		});
	} else {
		res.status(400).send({'message' : 'Error. Check your request parameters.'});
	}
});

/* POST resend verification code */
router.post('/resend', function(req, res, next){
	
	// check for required request parameters
	if(req.body.email){	
	
		// check if user exists
		model.User.findOne({ username: req.body.email }, function (err, user) {

			if (err) { return next(err); }
			
			// check if user already exists, otherwise create new account
			if(!user) {
				res.status(400).send({'message' : 'Error. No matching account found. Please try again.'});
			} else {
			
				// get a new code
				func.getRandomString(6, function(err, code){
					if (err) { return next(err); }
					
					user.verifyCode = code;
					
					user.save(function(err, user){
						if (err) return next(err);
						res.status(200).send({'message' : 'New verification code sent. Check your email.'});
						// send email
						mail.resendVerify(req, user.username, user.name, user.verifyCode);
					});
				});
			}
		});
		
	} else {
		res.status(400).send({'message' : 'Error. Check your request parameters.'});
	}
});




/* POST update to account */
router.post('/secure/update', function(req, res, next){ 

	// check for required request parameters
	if(req.body.email){	

		// find user
		model.User.findOne({ username: req.body.email }, function (err, user) {

			if (err) { return next(err); }
			
			// check to see if user exists
			if(!user) {
				res.status(400).send({'message' : 'Error. Requesting user not found.'});
			} else {
				
				// validate user input
				// TODO
				
				// username/email
				if(req.body.email){
					if(user.username != req.body.email){
						user.username = req.body.email;
					}
				}
				
				// name
				if(req.body.name){
					if(user.name != req.body.name){
						user.name = req.body.name;
					}
				}
				
				// phone
				if(req.body.phone){
					if(user.phone != req.body.phone){
						user.phone = req.body.phone;
					}
				}

				user.save(function(err, user){
					if (err) return next(err);
					res.status(200).send({'message' : 'Account updated successfully.'});
				});
			}
		});
	} else {
		res.status(400).send({'message' : 'Error. Check your request parameters.'});
	}
});

/* POST delete account */
router.post('/secure/delete', function(req, res, next){
	// check for required request parameters
	if(req.body.email){	

		// find user
		model.User.findOne({ username: req.body.email }, function (err, user) {

			if (err) { return next(err); }
			
			// check to see if user exists
			if(!user) {
				res.status(400).send({'message' : 'Error. Requesting user not found.'});
			} else {
				// end open connection if one exists
				model.Connection.
					findOne({ $or: [ { 'creator' : req.body.email }, { 'buddy' : req.body.email } ]	}).
					where('ended').equals(null).
					exec(function(err, conn){
						if (err) return next(err);

						if(conn){
							conn.ended = Date.now();
							conn.save(function(err, conn){
								if (err) return next(err);
								// delete user account
								user.remove();
								res.status(200).send({'message' : 'Account deleted successfully.'});
							});
						} else {
							// delete user account
							user.remove();
							res.status(200).send({'message' : 'Account deleted successfully.'});
						}
				});
			}
		});
	} else {
		res.status(400).send({'message' : 'Error. Check your request parameters.'});
	}	
});

/* POST reset password */
router.post('/password/reset', function(req, res, next){

	// check for required request parameters
	if(req.body.email){	

		// find user
		model.User.findOne({ username: req.body.email }, function (err, user) {

			if (err) { return next(err); }
			
			// check to see if user exists
			if(!user) {
				res.status(400).send({'message' : 'Error. Requesting user not found.'});
			} else {
				// generate a random character string
				var newpwd = func.getRandomString(10, function(err, code){
					if (err) { return next(err); }
					user.password = code;
					console.log(code);
					user.save(function(err, user){
						if (err) return next(err);
						// TODO send email
						res.status(200).send({'message' : 'Password reset successfully.'});
					});
				});
			}
		});
	} else {
		res.status(400).send({'message' : 'Error. Check your request parameters.'});
	}
	
});

/* GET change password (request change in password)*/
router.get('/secure/password/change', function(req, res, next){ 
	
	// check for required request parameters
	if(req.body.email){	

		// find user
		model.User.findOne({ username: req.body.email }, function (err, user) {

			if (err) { return next(err); }
			
			// check to see if user exists
			if(!user) {
				res.status(400).send({'message' : 'Error. Error. Requesting user not found..'});
			} else {
				// generate unique code
				user.changePassword = func.getRandomString(10, function(err, code){
					user.save(function(err, user){
						if (err) return next(err);
						// TODO send email with code in parameters of link
						res.status(200).send({'message' : 'Password change requested.'});
					});
				});
			}
		});
	} else {
		res.status(400).send({'message' : 'Error. Check your request parameters.'});
	}
	
});

/* POST change password */
router.post('/secure/password/change', function(req, res, next){ 
	
	// check for required request parameters
	if(req.body.email && req.body.password && req.query.code){	

		// find user
		model.User.findOne({ username: req.body.email }, function (err, user) {

			if (err) { return next(err); }
			
			// check to see if user exists
			if(!user) {
				res.status(400).send({'message' : 'Error. Requesting user not found.'});
			} else {
				if(req.body.code == user.changePassword){
					user.password = req.body.password;
					user.changePassword = ""; // reset code
					user.save(function(err, user){
						if (err) return next(err);
						// TODO revoke token used for this request
						res.status(200).send({'message' : 'Password changed successfully.'});
					});
				} else {
					res.status(400).send({'message' : 'Error. You do not have permission to change the password.'});
				}
			}
		});
	} else {
		res.status(400).send({'message' : 'Error. Check your request parameters.'});
	}
	
});

/* POST upload photo */
router.post('/secure/photo/upload', function(req, res, next){ 
	// TODO
});

/* POST delete photo */
router.post('/secure/photo/delete', function(req, res, next){ 
	// TODO
});

/* POST pair ONEE with account */
router.post('/secure/onee/pair', function(req, res, next){

	// check for required request parameters
	if(req.body.email && req.body.braceletId){	
	
		// validate request parameters
		// TODO
		
		// find user
		model.User.findOne({ username: req.body.email }, function (err, user) {
			if (err) { return next(err); }
			
			// check to see if user exists
			if(!user) {
				res.status(400).send({'message' : 'Error. Requesting user not found.'});
			} else {
				
				user.braceletId = req.body.braceletId;
				
				user.save(function(err, user){
					if (err) return next(err);
					res.status(200).send({'message' : 'ONEE paired successfully.'});
				});
			}
		});
		
	} else {
		res.status(400).send({'message' : 'Error. Check your request parameters.'});
	}
	
});

/* POST unpair ONEE with account */
router.post('/secure/onee/unpair', function(req, res, next){ 
	
	// check for required request parameters
	if(req.body.email){	
	
		// validate request parameters
		// TODO
		
		// find user
		model.User.findOne({ username: req.body.email }, function (err, user) {
			if (err) { return next(err); }
			
			// check to see if user exists
			if(!user) {
				res.status(400).send({'message' : 'Error. Requesting user not found.'});
			} else {
				
				user.braceletId = null;
				
				user.save(function(err, user){
					if (err) return next(err);
					res.status(200).send({'message' : 'ONEE unpaired successfully'});
				});
			}
		});
		
	} else {
		res.status(400).send({'message' : 'Error. Check your request parameters.'});
	}
	
});

/* POST location sharing preference */
router.post('/secure/location/sharing', function(req, res, next){ 
	
	// check for required request parameters
	if(req.body.email && req.body.shareLocation){	
	
		// validate request parameters
		// TODO
		
		// find user
		model.User.findOne({ username: req.body.email }, function (err, user) {
			if (err) { return next(err); }
			
			// check to see if user exists
			if(!user) {
				res.status(400).send({'message' : 'Error. Requesting user not found.'});
			} else {
				
				if(req.body.shareLocation == '1'){
					user.shareLocation = 1;
				} else {
					user.shareLocation = 0;
				}
				
				user.save(function(err, user){
					if (err) return next(err);
					res.status(200).send({'message' : 'Location sharing preference updated successfully.'});
				});
			}
		});
		
	} else {
		res.status(400).send({'message' : 'Error. Check your request parameters.'});
	}
	
});

/* POST current location */
router.post('/secure/location/update', function(req, res, next){ 
	
	// check for required request parameters
	if(req.body.email && req.body.lat && req.body.lon){	
	
		// validate request parameters
		// TODO
		
		// find user
		model.User.findOne({ username: req.body.email }, function (err, user) {
			if (err) { return next(err); }
			
			// check to see if user exists
			if(!user) {
				res.status(400).send({'message' : 'Error. Requesting user not found.'});
			} else {
				
				// set user position
				user.location = new model.Position({
					  lat: req.body.lat
					, lon: req.body.lon
					, time: Date.now()
				});

				// save updated user
				user.save(function(err, user){
					if (err) return next(err);
					res.status(200).send({'message' : 'Location updated successfully.'});
				});
			}
		});
		
	} else {
		res.status(400).send({'message' : 'Error. Check your request parameters.'});
	}
	
});

/* GET historical connections */
router.get('/secure/connections/recent', function(req, res, next){
	
	// check for required request parameters
	if(req.query.email){	
	
		// validate request parameters
		// TODO
		
		// find user
		model.User.findOne({ username: req.query.email }, function (err, user) {
			if (err) { return next(err); }
			
			// check to see if user exists
			if(!user) {
				res.status(400).send({'message' : 'Error. Requesting user not found.'});
			} else {
				
				// query connections where user or buddy matches email, make unique, sort descending by time
				model.Connection.find({ $or: [{ 'creator' : req.query.email }, { 'buddy' : req.query.email }] }).
					limit(30).
					sort({ created: -1 }).
					exec(function(err, conns){
						
						if (err) { return next(err); }
						
						// array to hold emails
						var emails = [];
						
						// grab emails from connections
						for(i = 0; i < conns.length; i++){
							if(conns[i].creator != req.query.email){
								emails.push(conns[i].creator);
							} else {
								emails.push(conns[i].buddy);
							}
						}
						
						// select unique email addresses
						var unq_emails = emails.filter(func.getUniqueIndices);
							
						// find matching users
						model.User.find({ username: { $in: unq_emails } }).
							select({ name: 1, username: 1, phone: 1, photo: 1 }).
							exec(function(err, users){
								if (err) { return next(err); }
								res.status(200).send({ 'message' : 'Success', 'results': users });
							});					
					});
			}
		});
		
	} else {
		res.status(400).send({'message' : 'Error. Check your query parameters'});
	}
});

/* GET users for autocomplete */
router.get('/secure/users/find', function(req, res, next){
	// check for required request parameters
	if(req.query.search.length >= 3){
		// create regex
		var pattern = new RegExp('.*(' + req.query.search + ').*');
		
		console.log(pattern);

		// search username and name fields
		model.User.find({ $or: [{ 'username' : {$regex: pattern, $options: 'i'}}, { 'name' : {$regex: pattern, $options: 'i' }}] }).
			limit(10).
			sort({ username: 1 }).
			select({ name: 1, username: 1, phone: 1, photo: 1 }).
			exec(function(err, users){
				if (err) { return next(err); }
				res.status(200).send({ 'message' : 'success', 'results': users });
			});

	}else {
		res.status(400).send({'message' : 'Error. Check your query parameters'});
	}
});

module.exports = router;