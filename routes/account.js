var express	= require('express');
var config		= require('../config');   
var model		= require('./model');
var auth        = require('./auth');

// declare instance of express router
var router = express.Router();

// apply security measures to protected endpoints
router.use('/secure', auth.checkToken);

/*router.post('/test', function(req, res, next){
	console.log('query:');
	console.log(req.query);
	console.log('body:');
	console.log(req.body);
	res.status(200).json(req.user).send('test done');
});

router.get('/test', function(req, res, next){
	console.log('body:');
	console.log(req.query);
	console.log('body:');
	console.log(req.body);
	res.status(200).send('test done');
});

router.get('/secure/test', function(req, res, next){
	res.status(200).send('hello!')
});*/

/* POST create account */
router.post('/create', function(req, res, next) {
	
	// check for required request parameters
	if(req.body.email && req.body.name && req.body.phone && req.body.pwd){	
	
		// check if email address already exists
		model.User.findOne({ username: req.body.email }, function (err, user) {

			if (err) { return next(err); }
			
			// check if user already exists, otherwise create new account
			if(user) {
				res.status(400).send('A user with that email address already exists');
			} else {
				
				// validate user input
				// TODO
				
				// create new account from form information
				var user = new model.User({
					  name: 	req.body.name
					, username: req.body.email
					, phone:	req.body.phone 
					, password: req.body.pwd
					, shareLocation: 1
					, status: 0
				});
				
				user.save(function(err, user){
					if (err) return next(err);
					res.status(200).send('new user account created successfully');
				});
			}
		});
	} else {
		res.status(400).send('check your request parameters');
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
				res.status(400).send('no user found');
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
					res.status(200).send('user account updated successfully');
				});
			}
		});
	} else {
		res.status(400).send('check your request parameters');
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
				res.status(400).send('no user found');
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
								res.status(200).send('user account deleted successfully');
							});
						} else {
							// delete user account
							user.remove();
							res.status(200).send('user account deleted successfully');
						}
				});
			}
		});
	} else {
		res.status(400).send('check your request parameters');
	}	
});

/* POST reset password */
router.post('/password/reset', function(req, res, next){ 
	// TODO
});

/* POST change password */
router.post('/secure/password/change', function(req, res, next){ 
	// TODO
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
				res.status(400).send('no user found');
			} else {
				
				user.braceletId = req.body.braceletId;
				
				user.save(function(err, user){
					if (err) return next(err);
					res.status(200).send('ONEE paired successfully');
				});
			}
		});
		
	} else {
		res.status(400).send('check your request parameters');
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
				res.status(400).send('no user found');
			} else {
				
				user.braceletId = null;
				
				user.save(function(err, user){
					if (err) return next(err);
					res.status(200).send('ONEE unpaired successfully');
				});
			}
		});
		
	} else {
		res.status(400).send('check your request parameters');
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
				res.status(400).send('no user found');
			} else {
				
				if(req.body.shareLocation == '1'){
					user.shareLocation = 1;
				} else {
					user.shareLocation = 0;
				}
				
				user.save(function(err, user){
					if (err) return next(err);
					res.status(200).send('location sharing preference updated successfully');
				});
			}
		});
		
	} else {
		res.status(400).send('check your request parameters');
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
				res.status(400).send('no user found');
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
					res.status(200).send('location updated successfully');
				});
			}
		});
		
	} else {
		res.status(400).send('check your request parameters');
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
				res.status(400).send('no user found');
			} else {
				
				// send last 10 connections
				// TODO make unique
				var history = user.history;
				if(history.length > 10) {
					history = history.slice(history.length - 10);
				}
				res.status(200).send(history);
				
			}
		});
		
	} else {
		res.status(400).send('check your query parameters');
	}
});

/* GET users for autocomplete */
router.get('/secure/users/find', function(req, res, next){
	/*// check for required request parameters
	if(req.query.search.length >= 3){
		// TODO fix this
		model.User.find({
			$or: [{ 'username' : {$regex: req.query.search }, { 'name' : req.query.search }]
		}, function(err, users){
			if (err) { return next(err); }
			
			res.status(200).send(users);
		}
	
	}else {
		res.status(400).send('check your query parameters');
	}*/
});

module.exports = router;