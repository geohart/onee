var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

// setup paths to custom-defined routes/endpoints
var index			= require('./routes/index');
var users			= require('./routes/users');
var model			= require('./routes/model');
var account		= require('./routes/account');
var connection	= require('./routes/connection')
var functions		= require('./routes/functions');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static('public'));
app.use(require('express-session')({
    secret: 'oneeisformee',
    resave: false,
    saveUninitialized: false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/account', account); // setup pathways for account-related actions (see account.js for details)
app.use('/connection', connection); // setup pathways for connection-related actions (see connection.js for details)
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

// authentication with passport
passport.use(new LocalStrategy({
		usernameField: 'email',
		passwordField: 'pwd'
	},
	function(email, password, done) {
		model.User.findOne({ email: email }, function(err, user) {
			console.log(user);
			if (err) { return done(err); }
			if (!user) {
				return done(null, false, { message: 'Incorrect email address.' });
			}
			if (!user.validPassword(password)) {
				return done(null, false, { message: 'Incorrect password.' });
			}
			return done(null, user);
		});
	}
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  model.User.findById(id, function(err, user) {
    done(err, user);
  });
});

module.exports = app;
