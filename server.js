var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , https = require('https')
  , events = require("events")
  , fs = require('fs')

app.listen(8080);

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}


var tweet_emitter = new events.EventEmitter();

// Twitter stream options
var options = {
  host: 'stream.twitter.com',
  port: 443,
  path: '/1/statuses/filter.json?track=[topic]',  // ### topic to stream
  method: 'GET',
  auth: '[user]:[pass]'	// ### twitter user:pass
};

// Twitter stream request
var req = https.request(options, function(res) {
	res.on('data', function(response) {
		var datos = response.toString('utf8');
		tweet_emitter.emit("tweets", datos);			//socket.emit('yeyy',datos);
	});
});
req.end();


// Sockets
io.configure(function () {
  io.set('log level', 0);
});

io.sockets.on('connection', function (socket) {
	tweet_emitter.addListener("tweets", function(tweet) {
		socket.volatile.emit('new tweet', tweet);
	});
});
