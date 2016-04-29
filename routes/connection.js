var express 	= require('express');
var config		= require('../config');   
var model		= require('./model');
var auth        = require('./auth');

// declare instance of express router
var router = express.Router();

// apply security measures to all endpoints
router.use(auth.checkToken);

/* POST create a new connection */
router.post('/create', function(req, res, next){ 

	// check for required request parameters
	if(req.body.email && req.body.buddyemail){
		
		// TODO: validate inputs
		// check to make sure emails do not match
		if(req.body.email == req.body.buddyemail){
			res.status(400).send({'message' : 'Error. You cannot create a connection with yourself.'});
		} else {
		
			// find requesting user
			model.User.findOne({ username: req.body.email }, function (err, user) {
				if (err) return next(err);
				
				// verify requesting user exists
				if(!user) { 
					res.status(400).send({'message' : 'Error. Requesting user not found.'});
				} else {
					
					// verify that buddy exists
					model.User.findOne({ 'username' : req.body.buddyemail }, function(err, buddy){
						if (err) return next(err);
						
						if(!buddy) {
							res.status(400).send({'message' : 'Error. The user you wish to connect to does not exist.'});
						} else {

							// check if a connection exists for initiating user
							model.Connection.
								findOne({ $or: [ { 'creator' : req.body.email }, { 'buddy' : req.body.email } ]	}).
								where('ended').equals(null).
								exec(function(err, conn){
									if (err) return next(err);

									if(conn){
										
										// end existing connection
										conn.ended = Date.now();
										conn.save(function(err, conn){
											
											// create a new connection
											var connection = new model.Connection({
												  creator: req.body.email
												, creatorName: user.name
												, buddy: req.body.buddyemail
												, buddyName: buddy.name
												, created: Date.now()
											});
											
											connection.save(function(err, connection){
												if (err) return next(err);
												
												getConnectionState(req.body.email, 'New connection created successfully.', function(err, cs){
													if (err) return next(err);
													res.status(cs.status).send(cs);
												});
												
											});
										});
								
									} else {
								
								
										// create a new connection
										var connection = new model.Connection({
											  creator: req.body.email
											, creatorName: user.name
											, buddy: req.body.buddyemail
											, buddyName: buddy.name
											, created: Date.now()
										});
										
										connection.save(function(err, connection){
											if (err) return next(err);
											
											getConnectionState(req.body.email, 'New connection created successfully.', function(err, cs){
												if (err) return next(err);
												res.status(cs.status).send(cs);
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
		res.status(400).send({'message' : 'Error. Check your request parameters.'});
	}
	
});

/* GET connection requests 
router.get('/check', function(req, res, next){
	
	// check for required query parameters
	if(req.query.email){
		
		// TODO: validate inputs
		
		// find requesting user
		model.User.findOne({ username: req.query.email }, function (err, user) {
			if (err) return next(err);
			
			// verify requesting user exists
			if(!user) { 
				res.status(400).send({'message' : 'Error. Requesting user not found.'});
			} else {
				
				// find outstanding request
				model.Connection.findOne({ 'buddy' : req.query.email }).where('accepted').equals(null).exec(function(err, conn){
						if (err) return next(err);

						if(conn){
							res.status(200).send({'message' : 'New connection request found.', 'connection' : conn });
						} else {
							res.status(200).send({'message' : 'No new connection requests found.', 'connection' : null });
						}
				});
			}
		});
	} else {
		res.status(400).send({'message' : 'Error. Check your query parameters'});
	}
});*/

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
				res.status(400).send({'message' : 'Error. Requesting user not found.'});
			} else {
				console.log(req.body.connectionId);
				// find connection object
				model.Connection.findOne({ '_id' : req.body.connectionId }, function(err, conn){
					if (err) return next(err);

					if(!conn){
						// connection does not exist
						res.status(400).send({'message' : 'Error. Connection does not exist.'});
					} else {
						// connection exists -- check if the requesting user is the buddy
						if (conn.buddy == req.body.email){
							// yes -- accept
							conn.accepted = Date.now();
							conn.save(function(err, conn){
								if (err) return next(err);
								
								getConnectionState(req.body.email, 'Connection accepted.', function(err, cs){
									if (err) return next(err);
									res.status(cs.status).send(cs);
								});

							});
						} else {
							// no -- reject request
							res.status(400).send({'message' : 'Error. You were not invited to this connection.'});
						}
					}
					
				});
			}
		});
	} else {
		res.status(400).send({'message' : 'Error. Check your request parameters.'});
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
				res.status(400).send({'message' : 'Error. Requesting user not found.'});
			} else {
			
				// check if a connection exists for user
				model.Connection.
					findOne({ $or: [ { 'creator' : req.body.email }, { 'buddy' : req.body.email } ]	}).
					where('ended').equals(null).
					exec(function(err, conn){
						if (err) return next(err);

						if(!conn){
							res.status(400).send({'message' : 'Error. No connection found.'});
						} else {
							
							conn.ended = Date.now();
							conn.save(function(err, conn){
								if (err) return next(err);
								
								getConnectionState(req.body.email, 'Connection ended successfully.', function(err, cs){
									if (err) return next(err);
									res.status(cs.status).send(cs);
								});
								
							});
						}
				});
			}
		});
	} else {
		res.status(400).send({'message' : 'Error. Check your request parameters.'});
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
				res.status(400).send({'message' : 'Error. Connection does not exist.'});
			} else {
				
				// check if passed email matches creator or buddy
				if (!(conn.creator == req.body.email || conn.buddy == req.body.email)){
					res.status(400).send({'message' : 'Error. You are not a part of this connection.'});
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
						
						getConnectionState(req.body.email, 'Status updated successfully.', function(err, cs){
							if (err) return next(err);
							res.status(cs.status).send(cs);
						});
						
					});
				}
			}
		});
	} else {
		res.status(400).send({'message' : 'Error. Check your request parameters.'});
	}
	
});

/* GET buddy location 
router.get('/buddy/location', function(req, res, next){ 
	
	// check for required request parameters
	if(req.query.email && req.query.connectionId){
		
		// TODO: validate inputs
		
		// find connection
		model.Connection.findOne({ '_id' : req.query.connectionId }, function(err, conn){
			if (err) return next(err);

			if(!conn){
				// connection does not exist
				res.status(400).send({'message' : 'Error. Connection does not exist.'});
			} else {
				// check if passed email matches creator or buddy
				if (!(conn.creator == req.query.email || conn.buddy == req.query.email)){
					res.status(400).send({'message' : 'Error. You are not a part of this connection.'});
				} else {
					if(conn.creator == req.query.email){
						// look up buddy location
						model.User.findOne({'username' : conn.buddy}, function(err, buddy){
							if(err) return next(err);
							res.status(200).send({'message' : 'Success', 'location' : buddy.location});
						});
					} else {
						// look up creator location
						model.User.findOne({'username' : conn.creator}, function(err, creator){
							if(err) return next(err);
							res.status(200).send({'message' : 'Success', 'location' : creator.location});
						});
					}
				}
			}
		});
		
	} else {
		res.status(400).send({'message' : 'Error. Check your request parameters.'});
	}
	
});*/

/* GET the connection 
router.get('/connection', function(req, res, next){
	
	// check for required request parameters
	if(req.query.email){
		
		// TODO: validate inputs
		
		// find requesting user
		model.User.findOne({ username: req.query.email }, function (err, user) {
			if (err) return next(err);
						
			// verify requesting user exists
			if(!user) { 
				res.status(400).send({'message' : 'Error. Requesting user not found.'});
			} else {
			
				// check if a connection exists for user
				model.Connection.
					findOne({ $or: [ { 'creator' : req.query.email }, { 'buddy' : req.query.email } ]}).
					where('ended').equals(null).
					exec(function(err, conn){
						if (err) return next(err);

						if(!conn){
							res.status(200).send({
								'message': 'No connection found.',
								'connection':null,
							});
						} else {
							res.status(200).send({
								'message': 'Connection found.',
								'connection':conn,
							});
						}
				});
			}
		});
	} else {
		res.status(400).send({'message' : 'Error. Check your request parameters.'});
	}
});*/

/* GET get updated state of connection */
router.get('/update', function(req, res, next){
	
	// check for required request parameters
	if(req.query.email){
		
		// get connection state and send result
		getConnectionState(req.query.email, 'Updated state found.', function(err, cs){
			if (err) return next(err);
			res.status(cs.status).send(cs);
		});

	} else {
		res.status(400).send({'message' : 'Error. Check your request parameters.'});
	}
	
});

function getConnectionState(userEmail, msg, next){
	
	// declare result variable
	var result = {
		'status' : 400,
		'message' : 'Something wen\'t wrong'
	};
	
	// find requesting user
	model.User.findOne({ username: userEmail }).select({ name: 1, username: 1, phone: 1, photo: 1, verified: 1 }).exec(function (err, user) {
		if (err) return next(err, null);
					
		// verify requesting user exists
		if(!user) { 
		
			result = {
				'status' : 400,
				'message' : 'Error. Requesting user not found.',
				'user' : user,
				'active' : null,
				'requested' : null,
				'requests ': null,
				'buddy' : null
			};
			
			// return result
			return next(null, result);
			
		} else {
			
			// check for existing connections and connection requests
			model.Connection.
				find({ $or: [ { 'creator' : userEmail }, { 'buddy' : userEmail } ]	}).
				where('ended').equals(null).
				exec(function(err, conns){
					if (err) return next(err, null);

					if(conns.length == 0){
						result = {
							'status' : 200,
							'message' : 'No connection or connection requests found.',
							'user' : user,
							'active' : null,
							'requested' : null,
							'requests ': null,
							'buddy' : null
						};
						
						// return result
						return next(null, result);
						
					} else {
						
						// connections exist --> assign active, requested, and requests appropriately
						
						// cycle through connnections and find active one
						var active = -1;
						for(i = 0; i < conns.length; i++){
							if(conns[i].accepted > 0){
								active = i;
							}
						}
						
						if(active >= 0){
							
							// there is an active connection --> therefore requested is null
							
							// check if requesting user is connection's creator or buddy
							var email;
							if(userEmail == conns[active].buddy){
								email = conns[active].creator;
							} else {
								email = conns[active].buddy;
							}
							
							// get other user
							model.User.findOne({ username: email }).select({ name: 1, username: 1, phone: 1, photo: 1 }).exec(function (err, buddy) {
								
								if (err) return next(err, null);
								
								result = {
									'status' : 200,
									'message' : msg,
									'user' : user,
									'active' : conns[active],
									'requested' : null,
									'requests ': conns,
									'buddy' : buddy
								};
								
								// return result
								return next(null, result);
								
							});
							
						} else {
							
							// there is no active connection --> look for connection initiated by user
							
							// cycle through connnections and find one requested by user (there should be at most 1)
							var requested = -1;
							for(i = 0; i < conns.length; i++){
								if(conns[i].creator == user.username){
									requested = i;
								}
							}
							
							if(requested >= 0){
								
								// user has created a connection request
								result = {
									'status' : 200,
									'message' : msg,
									'user' : user,
									'active' : null,
									'requested' : conns[requested],
									'requests ': conns,
									'buddy' : null
								};
								
								// return result
								return next(null, result);
								
							} else {
								
								// only requests for connections exist
								result = {
									'status' : 200,
									'message' : msg,
									'user' : user,
									'active' : null,
									'requested' : null,
									'requests ': conns,
									'buddy' : null
								};
								
								// return result
								return next(null, result);
								
							}
						}
					}
			});
		}
	});
}

module.exports = router;