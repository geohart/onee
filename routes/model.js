var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var config		= require('../config');  
var bcrypt = require('bcrypt-nodejs');

// connect to database
mongoose.connect(config.database);

// setup a database reference variable
var db = mongoose.connection;

// handle connection errors
db.on('error', console.error.bind(console, 'connection error:'));

// handle successful connection
db.once('open', function() {
	
	// define schemas and compile into models:

	// position
	var positionSchema = new mongoose.Schema();
	positionSchema.add({
		time: Number
	  , lat: Number
	  , lon: Number
	});
	var Position = mongoose.model('position', positionSchema);
  
	// user
	var userSchema = new mongoose.Schema();
	userSchema.add({
	    username: String
	  , password: String
	  , name: String
	  , phone: String
	  , photo: String
	  , braceletId: String
	  , location: positionSchema
	  , shareLocation: Number
	  , status: Number
	  , changePassword: String
	});
	userSchema.pre('save', function(callback) {
		
		var user = this;

		// Break out if the password hasn't changed
		if (!user.isModified('password')) return callback();
		
		// Password changed so we need to hash it
		bcrypt.genSalt(5, function(err, salt) {
			if (err) return callback(err);

			bcrypt.hash(user.password, salt, null, function(err, hash) {
				if (err) return callback(err);

				user.password = hash;
				callback();
			});
		});
		
	});
	userSchema.methods.verifyPassword = function(password, callback) {
		bcrypt.compare(password, this.password, function(err, isMatch) {
			if (err) return callback(err);
			callback(null, isMatch);
		});
	};
	var User = mongoose.model('user', userSchema);

	// message
	var messageSchema = new mongoose.Schema();
	messageSchema.add({
		type: Number
	  , sent: Number
	  , received: Number
	  , originUser: String
	  , destinUser: String
	});
	var Message = mongoose.model('message', messageSchema);

	// connection
	var connectionSchema = new mongoose.Schema();
	connectionSchema.add({
		creator: String
	  , buddy: String
	  , created: Number
	  , accepted: Number
	  , ended: Number
	  , creator_safe: Number
	  , buddy_safe: Number
	  , creator_inquire: Number
	  , buddy_inquire: Number
	  , creator_acknowledge: Number
	  , buddy_acknowledge: Number
	  , history: [messageSchema]
	});
	var Connection = mongoose.model('connection', connectionSchema);

	exports.User = User;
	exports.Connection = Connection;
	exports.Message = Message;
	exports.Position = Position;

});

exports.db = db;
