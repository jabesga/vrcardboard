var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static('static'))

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

playerSockets = {}
playerProperties = {};

io.on('connection', function(socket){
  console.log('a user connected');
  playerSockets[socket.id] = socket;

  playerProperties[socket.id] = {};
  playerProperties[socket.id]["id"] = socket.id;
  playerProperties[socket.id]["position"] = {"x": 0, "y": 0, "z": 0};

  socket.emit('connection_ready', playerProperties);

  socket.broadcast.emit('new_player_connected', {
    "player_id": socket.id,
    "position": playerProperties[socket.id]["position"]
  });
  
  socket.on('update_player_position',function(data){
    if(playerSockets[data.player_id]){
      playerSockets[data.player_id].broadcast.emit('update_object_position', data);  
    }
  });

  socket.on('disconnect', function(){
    console.log('user disconnected');
    delete playerProperties[socket.id]
    delete playerSockets[socket.id]
    io.emit('player_disconnected', socket.id);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});