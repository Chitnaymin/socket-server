const io = require('socket.io')(3000, 
{
    cors: {
        origin: "*", // Allows all origins, adjust this for production environments
    }
});

let players = {};

io.on('connection', socket => {
    console.log('Player connected: ' + socket.id);

    
    
    // When a new player joins
    socket.on('newPlayer', () => {
        players[socket.id] = {
            position: { x: 0, y: 0 } // Initial position of the player
        };
        socket.emit('currentPlayers', players);
        socket.broadcast.emit('newPlayer', { id: socket.id, position: players[socket.id].position });
    });

    // When a player disconnects
    socket.on('disconnect', () => {
        console.log('Player disconnected: ' + socket.id);
        delete players[socket.id];
        io.emit('playerDisconnected', socket.id);
    });

    // When a player moves
    socket.on('move', (data) => {
        if (players[socket.id]) {
            players[socket.id].position = data.position;
            socket.broadcast.emit('playerMoved', { id: socket.id, position: data.position });
        }
    });
});

console.log('Server is running on port 3000');
