var express = require('express');
var nodemailer = require('nodemailer');


// setup transporter
var transporter = nodemailer.createTransport({
	service: 'Mailgun',
	auth: {
		user: 'postmaster@mg.wearonee.com',
		pass: '70bcc8860eb23721dd90040c61bfa7a8'
	}
});

// setup various emails

// welcome email
module.exports.welcome = function(req, recipient, name, code){
	
	// setup message
	var message = {
		from: 'no-reply@wearonee.com ',
		to: recipient,
		subject: 'Welcome to ONEE!',
		text: 'Welcome aboard!',
		html: 'Hi ' + name + ',<br/><br/>Welcome to ONEE!<br/><br/><a href="' + req.protocol + '://' + req.get('host') + '/account/verify?email=' + encodeURIComponent(recipient) + '&code=' + code + '">Click here to verify your account</a>, or enter the following code when prompted by the ONEE App: ' + code + '.<br/><br/>Thanks!<br/>The ONEE Team'
	};

	// send message
	transporter.sendMail(message, function(error, info){
		if (error) {
			console.log(error);
		} else {
			console.log('Sent: ' + info.response);
		}
	});
	
};

// resend verify code email
module.exports.resendVerify = function(req, recipient, name, code){
	
	// setup message
	var message = {
		from: 'no-reply@wearonee.com ',
		to: recipient,
		subject: 'Your new ONEE verification code',
		text: 'New verification code',
		html: 'Hi ' + name + ',<br/><br/>Here\'s your new verification code: ' + code + '. Enter this code when prompted by the ONEE App, or click the link below:<br/><br/><a href="' + req.protocol + '://' + req.get('host') + '/account/verify?email=' + encodeURIComponent(recipient) + '&code=' + code + '">Click here to verify your account</a>.<br/><br/>Thanks!<br/>The ONEE Team'
	};

	// send message
	transporter.sendMail(message, function(error, info){
		if (error) {
			console.log(error);
		} else {
			console.log('Sent: ' + info.response);
		}
	});
	
};

// reset password email
module.exports.resetPassword = function(req, recipient, name, pwd){
	
	// setup message
	var message = {
		from: 'no-reply@wearonee.com ',
		to: recipient,
		subject: 'Your ONEE password has been reset',
		text: 'Your new password is: ' + pwd,
		html: 'Hi ' + name + ',<br/><br/>The password for your ONEE account has been reset. Your new password is: <br/><br/>' + pwd + '<br/><br/>Please use this password to log in to ONEE. You can then change your password to something more memorable.<br/><br/>Thanks!<br/>The ONEE Team'
	};

	// send message
	transporter.sendMail(message, function(error, info){
		if (error) {
			console.log(error);
		} else {
			console.log('Sent: ' + info.response);
		}
	});
	
};


// password changed email
module.exports.passwordChanged = function(req, recipient, name){
	
	// setup message
	var message = {
		from: 'no-reply@wearonee.com ',
		to: recipient,
		subject: 'Your ONEE password has been changed',
		text: 'Your ONEE password has been changed.',
		html: 'Hi ' + name + ',<br/><br/>The password for your ONEE account has been changed. If you did not make this change, click the following link to reset your password:<br/><br/><a href="' + req.protocol + '://' + req.get('host') + '/account/password/reset?email=' + encodeURIComponent(recipient) + '">Click here to reset your password</a><br/><br/>Thanks!<br/>The ONEE Team'
	};

	// send message
	transporter.sendMail(message, function(error, info){
		if (error) {
			console.log(error);
		} else {
			console.log('Sent: ' + info.response);
		}
	});
	
};
