var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var redisClient = require('redis').createClient();

io.on('connection', function(client) {
  console.log('Client connected...');

  client.on('join', function(name) {
    console.log(`Client ${name} joined!`);

    client.nickname = name;
    client.broadcast.emit('chatter enter', name);

    redisClient.sadd('chatters', name);

    redisClient.smembers('chatters', function(err, chatters) {
      console.log('emit chatters: ' + chatters);
      client.emit('chatters', chatters);
    });

    redisClient.lrange('messages', 0, -1, function(err, messages) {
      console.log('emit messages: ' + messages);
      if (messages !== undefined && messages.length !== undefined && messages.length > 0) {
        var messagesData = messages.reverse();
        client.emit('messages', messagesData);
      }
    });

  });

  client.on('message', function(message) {
    console.log(`client ${client.nickname} sent message ${message}`);

    var messageData = { nickname: client.nickname, message: message };

    client.broadcast.emit('message', messageData);
    client.emit('message', messageData);

    redisClient.lpush('messages', JSON.stringify(messageData), function(err, data) {
      redisClient.ltrim('messages', 0, 9);
    });
  });

   client.on('disconnect', function() {
    console.log(`client ${client.nickname} disconnected`);
    client.broadcast.emit('chatter leave', client.nickname);
    redisClient.srem('chatters', client.nickname);
  });
});

app.get('/', function(req, res) {
  // res.sendFile(__dirname + '/index.html');
  res.render('index.ejs');
});

app.get('/assets/:filename', function(req, res) {
  res.sendFile(__dirname + '/assets/' + req.params.filename);
});

server.listen(8080);
