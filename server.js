const io = require('socket.io')(3000, {
    cors: {
        origin: "*", // Allows all origins, adjust this for production environments
    }
});

let players = {}; // Object to store player information
let playerCount = 0; // Variable to track the number of connected players

io.on('connection', (socket) => {
    console.log('A player connected:', socket.id);

    // Increment the player count
    playerCount++;
    
    // Assign initial position for the new player
    let initialPosition = { x: 0, y: 0, z: 0 };
    if (playerCount > 1) {
        // Offset new player's position to avoid overlap
        initialPosition.z = playerCount * 10; // Adjust the factor as needed
    }

    // Add new player to players object
    players[socket.id] = {
        position: initialPosition,
        playerId: socket.id
    };

    // Emit current players and player count to the new player
    socket.emit('currentPlayers', players);
    socket.emit('playerCount', playerCount);

    // Broadcast new player to all other players
    if(playerCount > 1){
        players[socket.id].position.z += 10;
    }
    socket.broadcast.emit('newPlayer', players[socket.id]);
    io.emit('playerCount', playerCount);

    // Handle player movements
    socket.on('playerMoved', (movementData) => {
        if (players[socket.id]) {
            players[socket.id].position = movementData.position;
            
            // Broadcast movement to other players
            socket.broadcast.emit('playerMoved', { playerId: socket.id, position: movementData.position });
            console.log(players[socket.id].playerId, players[socket.id].position);
        }
    });

    // Handle player disconnection
    socket.on('disconnect', () => {
        console.log('A player disconnected:', socket.id);
        delete players[socket.id];

        // Decrement the player count
        playerCount--;
        // Broadcast disconnection to other players
        io.emit('playerDisconnected', socket.id);
        io.emit('playerCount', playerCount);
    });
});

console.log('Socket.IO server running at http://localhost:3000/');
