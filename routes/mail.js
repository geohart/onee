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
		html: 'Hi ' + name + ',<br/><br/>Welcome aboard!<br/><br/><a href="' + req.protocol + '://' + req.get('host') + '/account/verify?email=' + encodeURIComponent(recipient) + '&code=' + code + '">Click here to verify your account.</a>'
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