// Load required packages
var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var model = require('./model');

passport.use(new BasicStrategy(
	function(username, password, callback) {
		model.User.findOne({ email: username }, function (err, user) {
			if (err) { return done(err); }
			if (!user) { return done(null, false); }
			if (!user.validPassword(password)) { return done(null, false); }
			return done(null, user);
		});
	}
));