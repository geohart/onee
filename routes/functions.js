var express = require('express');

// generate random alpha-numeric code
module.exports.getRandomString = function(length, next){
  
	var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
	var code = "";
	
	if (length < 0){
	  return next("Error: cannot issue random code of negative length", null);
	}
	
	for(x=0;x<length;x++){
		i = Math.floor(Math.random() * 62);
		code += chars.charAt(i);
	}
	
	return next(null, code);
	
}

module.exports.getUniqueIndices = function(value, index, self) { 
    return self.indexOf(value) === index;
}
