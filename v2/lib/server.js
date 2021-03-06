/**
 * 
 * Server related tasks
 * 
 */

// Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./../config');
const fs = require('fs');
const handlers = require('./handlers');
const helpers = require('./helpers');
const path = require('path');

var util = require('util');
var debug = util.debuglog('server')
// Instantiate the server module object
const server = {};

server.httpServer = http.createServer((req, res) => {
  server.unifiedServer(req, res);
});


// Instantiate the HTTPS server
/*server.httpsServerOptions = {
  'key': fs.readFileSync(path.join(__dirname, '/../https/key.pem')),
  'cert': fs.readFileSync(path.join(__dirname , '/../https/cert.pem'))
};*/
server.httpsServer = https.createServer(server.httpsServerOptions, (req, res) => {
  server.unifiedServer(req, res);
});


// All the server logic for both http and https server
server.unifiedServer = function (req, res) {
  // Get the URL and parse it 
  const parsedUrl = url.parse(req.url, true);

  // Get the path 
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/\/+|\/+$/g, '');

  // Get the http method
  const method = req.method.toLowerCase();

  // Get the query string as an object
  const queryStringObj = parsedUrl.query;

  // Get the headers as an object
  const headers = req.headers;

  // Get the payload if any
  const decoder = new StringDecoder('utf-8');
  let buffer = '';
  req.on('data', (chunk) => {
    buffer += decoder.write(chunk);
  });

  req.on('end', () => {
    buffer += decoder.end();

    // Choose the handler this request should go to. If one is not found
    // use the notFound handler
    var chosenHandler = typeof (server.router[trimmedPath]) !== 'undefined' ?
      server.router[trimmedPath] : handlers.notFound;

    // Construct the data object to send to the handler
    var data = {
      'trimmerPath': trimmedPath,
      'queryStringObject': queryStringObj,
      'method': method.toLowerCase(),
      'headers': headers,
      'payload': helpers.parseJsonToObject(buffer)
    };

    // Route the request to the handler specified in the router
    chosenHandler(data, function (statusCode, payload, contentType) {
      // Use the status code called by the handler, or default to 200
      statusCode = typeof (statusCode) === 'number' ? statusCode : 200;

      // Determine the type of response (fallback to JSON)
      contentType = typeof(contentType) === 'string' ? contentType : 'json';


      
      // Convert the payload to a string
      var payloadString = JSON.stringify(payload);



      // Return the response parts that are content specific
      var payloadString = '';
      if(contentType == 'json') {
        res.setHeader('Content-Type', 'application/json');
        payload = typeof(payload) == 'object' ? payload : {};
        payloadString = JSON.stringify(payload);
      }
      if(contentType == 'html') {
        res.setHeader('Content-Type', 'text/html');
        debug(payload);
        payloadString = typeof(payload) === 'string' ? payload : '';
      }

      // REturn the response parts that are common to all content-types
      res.writeHead(statusCode);
      res.end(payloadString);
      
      // Log the request path

      // If the response is 200, print green otherwise print red
      if(statusCode == 200) {
        debug('\x1b[32m%s\x1b[0m', method.toUpperCase() + ' /' + trimmedPath+ ' ' + statusCode);
      } else {
        debug('\x1b[31m%s\x1b[0m', method.toUpperCase() + ' /' + trimmedPath+ ' ' + statusCode);
      }
    });
  });
};

// Define a request router
server.router = {
  '': handlers.index,
  'account/create': handlers.accountCreate,
  'account/edit': handlers.accountEdit,
  'account/deleted': handlers.accountDeleted,
  'session/create': handlers.sessionCreate,
  'session/deleted': handlers.sessionDeleted,
  'checks/all': handlers.checkList,
  'checks/create': handlers.checksCreate,
  'checks/edit': handlers.checksEdit,
  'ping': handlers.ping,
  'users': handlers.users,
  'tokens': handlers.tokens,
  'checks': handlers.checks
};

// Init script
server.init = function () {
  // Start the HTTP server
  server.httpServer.listen(config.httpPort, '192.168.0.104', () => {
    console.log('\x1b[36m%s\x1b[0m', 'Server listening on port ' + config.httpPort +
    ' in ' + config.envName + ' mode ');
  });

  // Start the HTTPS server
  server.httpsServer.listen(config.httpsPort, '192.168.0.104', () => {
    console.log('\x1b[35m%s\x1b[0m', 'Server listening on port ' + config.httpsPort +
      ' in ' + config.envName + ' mode ');
  });
  // Instantiate the HTTP server

};
module.exports = server;