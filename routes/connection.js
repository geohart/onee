var express 	= require('express');
//var passport  = require('passport');
var model  	= require('./model');
//var auth 		= require('./auth');

// declare instance of express router
var router = express.Router();

/* setup authentication for all methods in this router */
//router.use(auth.isAuthenticated);

/* POST create a new connection */
router.post('/create', function(req, res, next){ 

	// check for required request parameters
	if(req.body.email && req.body.buddyemail){
		
		// TODO: validate inputs
		// check to make sure emails do not match
		if(req.body.email == req.body.buddyemail){
			res.status(400).send('you cannot create a connection with yourself');
		} else {
		
			// find requesting user
			model.User.findOne({ username: req.body.email }, function (err, user) {
				if (err) return next(err);
				
				// verify requesting user exists
				if(!user) { 
					res.status(400).send('requesting user not found');
				} else {

					// check if a connection exists for initiating user
					model.Connection.
						findOne({ $or: [ { 'creator' : req.body.email }, { 'buddy' : req.body.email } ]	}).
						where('ended').equals(null).
						exec(function(err, conn){
							if (err) return next(err);

							if(conn){
								res.status(400).send('you cannot create a new connection without first closing your existing connection');
							} else {
								
								// verify that buddy exists
								model.User.findOne({ 'username' : req.body.buddyemail }, function(err, buddy){
									if (err) return next(err);
									
									if(!buddy) {
										res.status(400).send('the user you wish to connect to does not exist');
									} else {
										// create a new connection
										var connection = new model.Connection({
											  creator: req.body.email
											, buddy: req.body.buddyemail
											, created: Date.now()
										});
										
										connection.save(function(err, connection){
											if (err) return next(err);
											res.status(200).send({ 
												  'msg' : 'new connection created successfully'
												, 'connection' : connection
											});
										});
									}
								});
							}
					});
				}
			});
		}
	} else {
		res.status(400).send('check your request parameters');
	}
	
});

/* GET connection requests */
router.get('/check', function(req, res, next){
	
	// check for required query parameters
	if(req.query.email){
		
		// TODO: validate inputs
		
		// find requesting user
		model.User.findOne({ username: req.query.email }, function (err, user) {
			if (err) return next(err);
			
			// verify requesting user exists
			if(!user) { 
				res.status(400).send('requesting user not found');
			} else {
				
				// find outstanding request
				model.Connection.findOne({ 'buddy' : req.query.email }).where('accepted').equals(null).exec(function(err, conn){
						if (err) return next(err);

						if(conn){
							res.status(200).send({'msg' : 'new connection request found', 'connection' : conn });
						} else {
							res.status(200).send({'msg' : 'no new connection requests found', 'connection' : null });
						}
				});
			}
		});
	} else {
		res.status(400).send('check your query parameters');
	}
});

/* POST to respond to a connection request */
router.post('/accept', function(req, res, next){
	
	// check for required request parameters
	if(req.body.email && req.body.connectionId){
		
		// TODO: validate inputs
		
		// find requesting user
		model.User.findOne({ username: req.body.email }, function (err, user){
			if (err) return next(err);
						
			// verify requesting user exists
			if(!user) { 
				res.status(400).send('requesting user not found');
			} else {
				console.log(req.body.connectionId);
				// find connection object
				model.Connection.findOne({ '_id' : req.body.connectionId }, function(err, conn){
					if (err) return next(err);

					if(!conn){
						// connection does not exist
						res.status(400).send('connection does not exist');
					} else {
						// connection exists -- check if the requesting user is the buddy
						if (conn.buddy == req.body.email){
							// yes -- accept
							conn.accepted = Date.now();
							conn.save(function(err, conn){
								if (err) return next(err);
								res.status(200).send({'msg' : 'connection accepted', 'connection' : conn });
							});
						} else {
							// no -- reject request
							res.status(400).send('you were not invited to this connection');
						}
					}
					
				});
			}
		});
	} else {
		res.status(400).send('check your request parameters');
	}
	
});

/* POST end a connection */
router.post('/end', function(req, res, next){ 
	
	// check for required request parameters
	if(req.body.email){
		
		// TODO: validate inputs
		
		// find requesting user
		model.User.findOne({ username: req.body.email }, function (err, user) {
			if (err) return next(err);
						
			// verify requesting user exists
			if(!user) { 
				res.status(400).send('requesting user not found');
			} else {
			
				// check if a connection exists for user
				model.Connection.
					findOne({ $or: [ { 'creator' : req.body.email }, { 'buddy' : req.body.email } ]	}).
					where('ended').equals(null).
					exec(function(err, conn){
						if (err) return next(err);

						if(!conn){
							res.status(400).send('no connection found');
						} else {
							
							conn.ended = Date.now();
							conn.save(function(err, conn){
								res.status(200).send('connection ended successfully');
							});
						}
				});
			}
		});
	} else {
		res.status(400).send('check your request parameters');
	}
	
});

/* POST send message */
router.post('/message', function(req, res, next){ 
	
	// check for required request parameters
	if(req.body.email && req.body.connectionId && req.body.message){
		
		// TODO: validate inputs
		
		// find connection
		model.Connection.findOne({ '_id' : req.body.connectionId }, function(err, conn){
			if (err) return next(err);

			if(!conn){
				// connection does not exist
				res.status(400).send('connection does not exist');
			} else {
				
				// check if passed email matches creator or buddy
				if (!(conn.creator == req.body.email || conn.buddy == req.body.email)){
					res.status(400).send('you are not a part of this connection');
				} else {
				
					// check if user is creator or buddy
					if(conn.creator == req.body.email){
						if(req.body.message == 'safe'){
							conn.creator_safe = 1;
							conn.buddy_inquire = 0; // always reset other_inquire after state change
						} else if (req.body.message == 'unsafe'){
							conn.creator_safe = 0;
							conn.buddy_inquire = 0; // always reset other_inquire after state change
							conn.buddy_acknowledge = 0; // automatically reset other acknowledge status when reporting unsafe
						} else if (req.body.message == 'inquire'){
							conn.creator_inquire = 1;
						} else if (req.body.message == 'acknowledge'){
							conn.creator_acknowledge = 1;
						}
					} else {
						if(req.body.message == 'safe'){
							conn.buddy_safe = 1;
							conn.creator_inquire = 0; // always reset other_inquire after state change
						} else if (req.body.message == 'unsafe'){
							conn.buddy_safe = 0;
							conn.creator_inquire = 0; // always reset other_inquire after state change
							conn.creator_acknowledge = 0; // automatically reset other acknowledge status when reporting unsafe
						} else if (req.body.message == 'inquire'){
							conn.buddy_inquire = 1;
						} else if (req.body.message == 'acknowledge'){
							conn.buddy_acknowledge = 1;
						}
					}
								
					conn.save(function(err, conn){
						if (err) return next(err);
						res.status(200).send({'message' : 'status updated successfully', 'connection' : conn });
					});
				}
			}
		});
	} else {
		res.status(400).send('check your request parameters');
	}
	
});

/* GET buddy location */
router.get('/buddy/location', function(req, res, next){ 
	
	// check for required request parameters
	if(req.query.email && req.query.connectionId){
		
		// TODO: validate inputs
		
		// find connection
		model.Connection.findOne({ '_id' : req.query.connectionId }, function(err, conn){
			if (err) return next(err);

			if(!conn){
				// connection does not exist
				res.status(400).send('connection does not exist');
			} else {
				// check if passed email matches creator or buddy
				if (!(conn.creator == req.query.email || conn.buddy == req.query.email)){
					res.status(400).send('you are not a part of this connection');
				} else {
					if(conn.creator == req.query.email){
						// look up buddy location
						model.User.findOne({'username' : conn.buddy}, function(err, buddy){
							if(err) return next(err);
							res.status(200).send({'message' : 'success', 'location' : buddy.location});
						});
					} else {
						// look up creator location
						model.User.findOne({'username' : conn.creator}, function(err, creator){
							if(err) return next(err);
							res.status(200).send({'message' : 'success', 'location' : creator.location});
						});
					}
				}
			}
		});
		
	} else {
		res.status(400).send('check your request parameters');
	}
	
});

/* GET get updated state of connection */
router.get('/update', function(req, res, next){
	
	// check for required request parameters
	if(req.query.email && req.query.connectionId){
		
		// TODO: validate inputs
		
		// find connection
		model.Connection.findOne({ '_id' : req.query.connectionId }, function(err, conn){
			if (err) return next(err);

			if(!conn){
				// connection does not exist
				res.status(400).send('connection does not exist');
			} else {
				
				// check if passed email matches creator or buddy
				if (!(conn.creator == req.query.email || conn.buddy == req.query.email)){
					res.status(400).send('you are not a part of this connection');
				} else {
					res.status(200).send({'message' : 'success', 'connection' : conn});
				}
			}
		});
	} else {
		res.status(400).send('check your request parameters');
	}
	
});

module.exports = router;