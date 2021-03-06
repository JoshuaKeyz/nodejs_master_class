/**
 * Helpers for various tasks
 */

// Dependencies
const crypto = require('crypto');
const config = require('../config');
const querystring = require('querystring');
const https = require('https');
const path = require('path');
const fs = require('fs');
var util = require('util');
var debug = util.debuglog('helpers')

// Container for all the helpers
const helpers = {};

// Create a SHA256 hash
helpers.hash = function(str) {
  if(typeof(str) === 'string' && str.length> 0) {
    var hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
    return hash;
  }else {
    return false;
  }
};

// Parse a JSON string to an object in all cases, without throwing
helpers.parseJsonToObject = function(str) {
  try {
    const obj = JSON.parse(str);
    return obj;
  }catch(e){
    return {};
  }
};

// Create a string of random alphnumeric characters of a given length 
helpers.createRandomString = function(strLength) {
  strLength = typeof(strLength) === 'number' &&
    strLength > 0 ? strLength : false;
  
  if(strLength) {
    // Define all the possible characters that could go into a string
    const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

    // Start the final string
    var str = '';
    for(let i = 1; i <= strLength; i++) {
      // Get a random character from the possible characters string
      const randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
      // Append this character to the final string
      str += randomCharacter;
    }
    // Return the final string
    return str;
  }else {
    return false;
  }
};

// Send an SMS message via Twilio
helpers.sendTwilioSms = function(phone, msg, callback) {
  // Validate parameters
  
  phone = typeof(phone) === 'string' && phone.trim().length === 10 ? phone.trim() : false;
  msg = typeof(msg) === 'string' && msg.trim().length > 0 && msg.trim().length <= 1600 ? msg.trim() : false;
  
  if(phone && msg) {
    // Configure the request payload 
    const payload = {
      'from': config.twilio.fromPhone, 
      'to': '+38'+ phone, 
      'body': msg
    };
    
    // Stringify the payload
    const stringPayload = querystring.stringify(payload);

    // Configure the request details 
    const requestDetails = {
      'protocol' : 'https:', 
      'hostname' : 'api.twilio.com', 
      'method': 'POST', 
      'path': '/2010-04-01/Accounts/' + config.twilio.accountSid + '/Messages.json',
      'auth': config.twilio.accountSid+ ':' + config.twilio.authToken, 
      'headers': {
        'Content-Type': 'application/json', 
        'Content-Length': Buffer.byteLength(stringPayload)
      }
    };

/*
    // Instantiate the request object
    var req = https.request(requestDetails, function(res){
      // Grab the status of the sent request
      const status = res.statusCode;

      // Callback successfully if the request went through
      if(status === 200 || status === 201) {
        callback(false);
      } else {
        console.log(res.headers)
        callback('Status code returned was ' + status);
      }
    });

    // Bind the to the error event so it doesn't get thrown
    req.on('error', function(e){
      callback(e);
    });

    // Add the payload
    req.write(stringPayload);

    // End the request
    req.end();*/
    const client = require('twilio')(config.twilio.accountSid, config.twilio.authToken);
    client.messages
      .create(payload)
      .then(message => callback())
      .catch(err=> callback(err));
  }else {
    callback('Given paramenters were missing or invalid');
  }
};


// Get the string content of a template
helpers.getTemplate = (templateName, callback) =>{
  templateName = typeof(templateName) === 'string' && templateName.length > 0 ? templateName: false;

  if(templateName) {
    const templateDir = path.join(__dirname, '/../templates/');
    
    fs.readFile(templateDir + templateName + '.html', 'utf8', (err, str)=>{
      if(!err && str && str.length > 0) {
        callback(false, str);
      }else {
        debug(err);
        callback('No template could be found');
      }
    })
  } else {
    callback('A valid template name was not specified');
  }
}
module.exports = helpers;