var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var passportLocalMongoose = require('passport-local-mongoose');

// connect to database
mongoose.connect('mongodb://localhost/onee');

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
	    password: String
	  , name: String
	  , email: String
	  , phone: String
	  , photo: String
	  , braceletId: String
	  , location: [positionSchema]
	  , shareLocation: Number
	  , history: [String]
	  , status: Number
  });
  userSchema.methods.validPassword = function( pwd ) {
	  return ( this.password === pwd );
  };
  var User = mongoose.model('user', userSchema);
  //User.plugin(passportLocalMongoose); // add authentication plugin
  
  // message
  var messageSchema = new mongoose.Schema();
  messageSchema.add({
	    type: Number
	  , sent: Number
	  , received: Number
	  , origin: Number
	  , destin: Number
  });
  var Message = mongoose.model('message', messageSchema);
  
  // connection
  var connectionSchema = new mongoose.Schema();
  connectionSchema.add({
	    users: [String]
	  , created: Number
	  , ended: Number
	  , history: [messageSchema]
  });
  var Connection = mongoose.model('connection', connectionSchema);
  
  exports.User = User;
  exports.Connection = Connection;
  exports.Message = Message;
  exports.Position = Position;
  
});

exports.db = db;
