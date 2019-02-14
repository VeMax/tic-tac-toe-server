const express = require('express'),
http = require('http'),
app = express(),
server = http.createServer(app),
io = require('socket.io').listen(server);
app.get('/', (req, res) => {
res.send('Server is running on port 2288')
});

var users = [];
var signCreator = 'X';

io.on('connection', (socket) => {

console.log('user connected')

socket.on('join', function(userNickname) {

	users.push({name:userNickname, win:0});

	if(users.length === 1)
		socket.emit("creator", signCreator);
	else if(users.length === 2)
		io.emit('second_user', users[0].name, users[1].name);
	else {
		users.pop();
		socket.emit('max_connections');
	}
});

socket.on('action', function(cell) {
	socket.broadcast.emit('cell', cell);
});

socket.on('win', function(userNickname) {

	var numberOfUser;

	for(var i = 0; i < users.length; i++) {
		if(users[i].name === userNickname) { 
    		users[i].win++;
    		numberOfUser = i;
    	}
	}
	io.emit('userWin', users[numberOfUser].name,
	 	users[0].win, users[1].win);
});

socket.on('no_winner', function() {
	io.emit('cells_full');
});


socket.on('disconnect', function(userNickname) {
    
    for(var i = 0; i < users.length; i++) {
		if(users[i].name === userNickname)
			users.shift();
		else 
			users.pop(); 
    }
	
    socket.broadcast.emit('user_disconnect'); 
});

});
server.listen(2288,()=>{

console.log('Node app is running on port 2288');

});