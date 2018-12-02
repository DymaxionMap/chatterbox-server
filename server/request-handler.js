/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/
var fs = require('fs');
var url = require('url');


var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};

var handleGetRequest = function (response) {
  // console.log('inside handleGetRequest');
  var statusCode = 200;
  var headers = defaultCorsHeaders;
  headers['Content-Type'] = 'application/json';
  // Read file
  fs.readFile('./exampleData.json', (err, data) => {
    if (err) {
      statusCode = 500;
      response.writeHead(statusCode, headers);
      response.end(JSON.stringify(err));
      throw err;
    }
    // console.log(data);
    data = JSON.parse(data);
    // console.log(data);
    response.writeHead(statusCode, headers);
    response.end(JSON.stringify(data));
    console.log(data);
  });
  
};

var handlePostRequest = function (request, response) {
  // initialize header components
  var statusCode = 201;
  var headers = defaultCorsHeaders;
  headers['Content-Type'] = 'application/json';
  // var message = JSON.parse(getRequestBody(request));
  var body = [];
  request.on('data', (chunk) => {
    body.push(chunk);
  }).on('end', () => {
    body = Buffer.concat(body).toString();
    fs.readFile('./exampleData.json', (err, data) => {
      // if error
      if (err) {
        // set status code to 500
        statusCode = 500;
        // write head
        response.writeHead(statusCode, headers);
        // end response
        response.end(JSON.stringify(err));
        throw err;
      // else 
      } else {
        // retrieve exampleData object (convert from JSON)
        data = JSON.parse(data);
        // retrieve message object from request
        var message = JSON.parse(body);
        // add objectId to message object
        message.objectId = data.results.length;
        // push message object into data.results array
        data.results.unshift(message);
        // convert data object back into JSON
        data = JSON.stringify(data);
        // write to exampleData.json
        fs.writeFile('./exampleData.json', data, (err) => {
          // if error
          if (err) {
            // set status code to 500
            statusCode = 500;
            // write head
            response.writeHead(statusCode, headers);
            // end response
            response.end(JSON.stringify(err));
            throw err;
          // else
          } else {
            // write head
            response.writeHead(statusCode, headers);
            // end response
            response.end(data);
          }
        });
      }
    });
  });
};

var handleOptionsRequest = function(request, response) {
  var statusCode = 200;
  var headers = defaultCorsHeaders;
  headers['Content-Type'] = 'application/json';
  var accessControlRequestMethod = request.headers['access-control-request-method'];
  
  if (defaultCorsHeaders['access-control-allow-methods'].includes(accessControlRequestMethod)) {
    response.writeHead(statusCode, headers);
    response.end();
  } else {
    statusCode = 403;
    response.writeHead(statusCode, headers);
    response.end();
  }  
};


var requestHandler = function(request, response) {
  // Request and Response come from node's http module.
  //
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.
  //
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/

  // Do some basic logging.
  //
  // Adding more logging to your server can be an easy way to get passive
  // debugging help, but you should always be careful about leaving stray
  // console.logs in your code.
  console.log('Serving request type ' + request.method + ' for url ' + request.url);
  
  var requestURL = url.parse(request.url);
  if (requestURL.pathname === '/classes/messages') {
    if (request.method === 'OPTIONS' ) {
      handleOptionsRequest(request, response);
    } else if (request.method === 'GET') {
      handleGetRequest(response);
    } else if (request.method === 'POST') {
      handlePostRequest(request, response);
    } else {
      // handleError(response);
    }
  } else {
    var statusCode = 404;
    var headers = defaultCorsHeaders;
    headers['Content-Type'] = 'application/json';
    response.writeHead(statusCode, headers);
    response.end();
  }
};

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.

module.exports.requestHandler = requestHandler;
