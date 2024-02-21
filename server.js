const express = require('express');
const WebSocket = require('ws');

const app = express();

const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

let gameState = [
    [null, null, null],
    [null, null, null],
    [null, null, null]

];


function checkWin(gameState) {

    // Check rows
    for (let i = 0; i < 3; i++) {
        if (gameState[i][0] && gameState[i][0] === gameState[i][1] && gameState[i][0] === gameState[i][2]) {
            return gameState[i][0];
        }
    }

    // Check columns
    for (let i = 0; i < 3; i++) {
        if (gameState[0][i] && gameState[0][i] === gameState[1][i] && gameState[0][i] === gameState[2][i]) {
            return gameState[0][i];
        }
    }

    // Check diagonals
    if (gameState[0][0] && gameState[0][0] === gameState[1][1] && gameState[0][0] === gameState[2][2]) {
        return gameState[0][0];
    }
    if (gameState[0][2] && gameState[0][2] === gameState[1][1] && gameState[0][2] === gameState[2][0]) {
        return gameState[0][2];
    }


    return null;
}



// When a connection is established
wss.on('connection', (ws) => {
    console.log('New client connected');

    // When a message is received from a client
    ws.on('message', (message) => {
        console.log('Received: ' + message);

        let move = JSON.parse(message);
        gameState[move.row][move.col] = move.symbol;

        let winner = checkWin(gameState);
        if(winner){
            console.log("Winner:"+ winner);
            gameState = [
                [null, null, null],
                [null, null, null],
                [null, null, null]
            ];
        }
      // Broadcast the updated game state to all clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({winner:winner,gameState:gameState}));
        }
    });



    });

    // When a client disconnects
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

server.listen(3000, () => {
    console.log('Server started on port 3000');
});