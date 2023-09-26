var express = require('express');
var app = express();
var expressWs = require('express-ws')(app);

app.get('/', function(req, res){
  res.sendFile('index.html', { root: __dirname });
});

const roomState = {};

app.ws('/', function(ws, req) {
  ws.state = [];
  ws.on('message', function(msg) {
    msg = JSON.parse(msg);
    if (msg.type === 'join') {
      ws.room = msg.room;
      if (!roomState[msg.room]) {
        roomState[msg.room] = [];
      }
      ws.send(JSON.stringify({type: 'state', state: roomState[msg.room] }));
    }
    if (msg.type === 'addState') {
      if (!ws.room) {
        return;
      }
      if (!roomState[ws.room]) {
        roomState[ws.room] = [];
      }
      roomState[ws.room].push(msg.state);
      expressWs.getWss().clients.forEach(function (client) {
        if (client.room === ws.room && ws.id !== client.id) {
          client.send(JSON.stringify({type: 'addState', state: msg.state }));
        }
      });
    }
    if (msg.type === 'clear') {
      if (!ws.room) {
        return;
      }
      roomState[ws.room] = [];
      expressWs.getWss().clients.forEach(function (client) {
        if (client.room === ws.room && ws.id !== client.id) {
          client.state = [];
          client.send(JSON.stringify({type: 'clear' }));
        }
      });
    }
  });
  ws.id = req.headers['sec-websocket-key'];
  console.log('socket', ws.id);
});

app.listen(8080);