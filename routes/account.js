var express 	= require('express');
//var passport  = require('passport');
//var BasicStrategy = require('passport-http').BasicStrategy;
var model  	= require('./model');

// declare instance of express router
var router = express.Router();

/* setup authentication for all methods in this router */
//router.use('/secure', passport.authenticate('basic', { session: false }));

//router.get('/', passport.authenticate('basic', { session: false }), function(req, res, next){
//	res.send('hi there');
//});

router.post('/test', function(req, res, next){
	console.log('query:');
	console.log(req.query);
	console.log('body:');
	console.log(req.body);
	res.status(200).send('test done');
});

router.get('/test', function(req, res, next){
	console.log('body:');
	console.log(req.query);
	console.log('body:');
	console.log(req.body);
	res.status(200).send('test done');
});

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

/* POST sign in to account */
router.post('/signin', function(req, res, next){
	// TODO
});

/* POST update to account */
router.post('/update', function(req, res, next){ 

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
router.post('/delete', function(req, res, next){
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
router.post('/onee/unpair', function(req, res, next){ 
	
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
router.post('/location/sharing', function(req, res, next){ 
	
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
router.post('/location/update', function(req, res, next){ 
	
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
router.get('/connections/recent', function(req, res, next){
	
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
router.get('/users/find', function(req, res, next){
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