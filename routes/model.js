var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

// connect to database
mongoose.connect('mongodb://localhost/onee');

// setup a database reference variable
var db = mongoose.connection;

// handle connection errors
db.on('error', console.error.bind(console, 'connection error:'));

// handle successful connection
db.once('open', function() {
	
  // define schemas and compile into models:
  
  // user
  var userSchema = mongoose.Schema({
	    username: String
	  , password: String
	  , firstName: String
	  , lastName: String
	  , email: String
	  , phone: String
	  , photo: String
	  , braceletId: String
	  , shareLocation: Number
	  , location: [positionSchema]
	  , history: [userSchema]
	  , status: Number
  });
  var User = mongoose.model('user', userSchema);
  
  // connection
  var connectionSchema = mongoose.Schema({
	    users: [String]
	  , created: Number
	  , ended: Number
	  , history: [messageSchema]
  });
  var Connection = mongoose.model('connection', connectionSchema);
  
  // message
  var messageSchema = mongoose.Schema({
	    type: Number
	  , sent: Number
	  , received: Number
	  , origin: Number
	  , destin: Number
  });
  var Message = mongoose.model('message', messageSchema);
  
  // position
  var positionSchema = mongoose.Schema({
	    time: Number
	  , lat: Number
	  , lon: Number
  });
  var Position = mongoose.model('position', positionSchema);
  
  exports.User = User;
  exports.Connection = Connection;
  exports.Message = Message;
  exports.Position = Position;
  
});

exports.db = db;
