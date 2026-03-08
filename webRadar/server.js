const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ noServer: true });

const PORT = process.env.PORT || 3000;

// Rooms storage: sessionId -> Set of web clients
const rooms = new Map();

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Mapping of /radar/:sessionId to the same index.html
app.get('/radar/:sessionId', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// WebSocket handling
server.on('upgrade', (request, socket, head) => {
    const { pathname, searchParams } = new URL(request.url, `http://${request.headers.host}`);
    const sessionId = searchParams.get('session');

    if (pathname === '/ws/radar' && sessionId) {
        wss.handleUpgrade(request, socket, head, (ws) => {
            ws.sessionId = sessionId;
            wss.emit('connection', ws, request);
        });
    } else {
        socket.destroy();
    }
});

wss.on('connection', (ws, request) => {
    const sessionId = ws.sessionId;
    const isCheat = !request.headers['user-agent'] || !request.headers['user-agent'].includes('Mozilla');

    console.log(`New connection for session: ${sessionId} (Cheat: ${isCheat})`);

    if (!rooms.has(sessionId)) {
        rooms.set(sessionId, new Set());
    }

    if (!isCheat) {
        // Web client - add to room
        rooms.get(sessionId).add(ws);
    }

    ws.on('message', (message) => {
        // Only broadcast if message is from cheat
        if (isCheat) {
            const clients = rooms.get(sessionId);
            if (clients) {
                clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(message);
                    }
                });
            }
        }
    });

    ws.on('close', () => {
        console.log(`Connection closed for session: ${sessionId}`);
        if (!isCheat) {
            const clients = rooms.get(sessionId);
            if (clients) {
                clients.delete(ws);
                if (clients.size === 0 && !isCheat) {
                    // Optional: Clean up room if no web clients? 
                    // Better leave it for the cheat to reconnect
                }
            }
        }
    });
});

server.listen(PORT, () => {
    console.log(`WebRadar server running on port ${PORT}`);
});
