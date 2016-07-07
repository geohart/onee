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
					
					// check if user submitted an alias
					if(req.body.alias){
						user.alias = req.body.alias;
					}
					
					// check if user submitted a gender
					if(req.body.gender){
						user.gender = req.body.gender;
					}
					
					// check if user submitted a date of birth
					if(req.body.dob){
						user.dob = req.body.dob;
					}				
					
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
				if(req.body.newemail){
					if(user.username != req.body.newemail){
						user.username = req.body.newemail;
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
				
				// alias
				if(req.body.alias){
					if(user.alias != req.body.alias){
						user.alias = req.body.alias;
					}
				}
				
				// gender
				if(req.body.gender){
					if(user.gender != req.body.gender){
						user.gender = req.body.gender;
					}
				}
				
				// dob
				if(req.body.dob){
					if(user.dob != req.body.dob){
						user.dob = req.body.dob;
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

/* GET reset password */
router.get('/password/reset', function(req, res, next){

	// check for required request parameters
	if(req.query.email){	

		// find user
		model.User.findOne({ username: req.query.email }, function (err, user) {

			if (err) { return next(err); }
			
			// check to see if user exists
			if(!user) {
				res.status(400).send({'message' : 'Error. Requesting user not found.'});
			} else {
				// generate a random character string
				var newpwd = func.getRandomString(10, function(err, code){
					if (err) { return next(err); }
					user.password = code;
					user.changePassword = 1;
					user.save(function(err, user){
						if (err) return next(err);
						res.status(200).send({'message' : 'Password reset successfully.'});
						mail.resetPassword(req, user.username, user.name, code);
					});
				});
			}
		});
	} else {
		res.status(400).send({'message' : 'Error. Check your request parameters.'});
	}
	
});

/* POST set password */
router.post('/secure/password/set', function(req, res, next){ 
	
	// check for required request parameters
	if(req.body.email && req.body.password){	

		// find user
		model.User.findOne({ username: req.body.email }, function (err, user) {

			if (err) { return next(err); }
			
			// check to see if user exists
			if(!user) {
				res.status(400).send({'message' : 'Error. Requesting user not found.'});
			} else {
				user.password = req.body.password;
				user.changePassword = 0;
				user.save(function(err, user){
					if (err) return next(err);
					// TODO revoke token used for this request
					res.status(200).send({'message' : 'Password changed successfully.'});
					mail.passwordChanged(req, user.username, user.name);
				});
			}
		});
	} else {
		res.status(400).send({'message' : 'Error. Check your request parameters.'});
	}
	
});

/* POST upload photo */
router.post('/secure/photo/change', function(req, res, next){ 
	
	// check for required request parameters
	if(req.body.email && req.body.photourl){
		
		// find user
		model.User.findOne({ username: req.body.email }, function (err, user) {

			if (err) { return next(err); }
			
			// check to see if user exists
			if(!user) {
				res.status(400).send({'message' : 'Error. Requesting user not found.'});
			} else {
				user.photo = req.body.photourl;
				user.save(function(err, user){
					if (err) return next(err);
					res.status(200).send({'message' : 'Photo changed successfully.'});
				});
			}
		});
			
	} else {
		res.status(400).send({'message' : 'Error. Check your request parameters.'});
	}
	
});

/* POST delete photo */
router.post('/secure/photo/delete', function(req, res, next){ 
	
	// check for required request parameters
	if(req.body.email){
		
		// find user
		model.User.findOne({ username: req.body.email }, function (err, user) {

			if (err) { return next(err); }
			
			// check to see if user exists
			if(!user) {
				res.status(400).send({'message' : 'Error. Requesting user not found.'});
			} else {
				user.photo = "";
				user.save(function(err, user){
					if (err) return next(err);
					res.status(200).send({'message' : 'Photo deleted.'});
				});
			}
		});
			
	} else {
		res.status(400).send({'message' : 'Error. Check your request parameters.'});
	}
	
});

/* POST pair ONEE with account */
router.post('/secure/onee/pair', function(req, res, next){

	// check for required request parameters
	if(req.body.email && req.body.deviceid){	
	
		// validate request parameters
		// TODO
		
		// find user
		model.User.findOne({ username: req.body.email }, function (err, user) {
			if (err) { return next(err); }
			
			// check to see if user exists
			if(!user) {
				res.status(400).send({'message' : 'Error. Requesting user not found.'});
			} else {
				
				// check if bracelet already associated with user
				if(user.devices != null && user.devices.length > 0){
					for(i=0; i < user.devices.length; i++){
						if(user.devices[i].deviceCode == req.body.deviceid){
							res.status(200).send({'message' : 'ONEE already paired.'});
						}
					}
				} 
				
				// otherwise, create a new device object
				device = new model.Device({
					deviceCode: req.body.deviceid					
				});
				
				// set bracelet as object in user's collection of bracelet
				user.devices.push(device);
				
				// save user object
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

/* GET list of paired devices */
router.get('/secure/onee/devices', function(req, res, next){
	
	// check for required request parameters
	if(req.query.email){
		
		// find user
		model.User.findOne({ username: req.query.email }, function (err, user) {
			if (err) { return next(err); }
			
			// check to see if user exists
			if(!user) {
				res.status(400).send({'message' : 'Error. Requesting user not found.'});
			} else {
				
				// return list of devices
				res.status(200).send({'message' : 'Success', 'results' : user.devices });
				
			}
			
		});
			
	} else {
		res.status(400).send({'message' : 'Error. Check your request parameters.'});
	}	
	
});

/* POST unpair ONEE with account */
/*router.post('/secure/onee/unpair', function(req, res, next){ 
	
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
	
});*/

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
		model.User.find({ $or: [{ 'username' : {$regex: pattern, $options: 'i'}}, { 'name' : {$regex: pattern, $options: 'i' }}, { 'alias' : {$regex: pattern, $options: 'i' }}] }).
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