const express = require('express');
const cors = require('cors');
const { WebSocketServer } = require('ws');
const http = require('http');
const path = require('path');

const authRoutes = require('./routes/auth');
const configRoutes = require('./routes/configs');
const radarRoutes = require('./routes/radar');
const { initDatabase } = require('./db');

const app = express();
const server = http.createServer(app);

const wss = new WebSocketServer({ server, path: '/ws/radar' });

app.use((req, res, next) => {
    console.log(`[DEBUG] ${req.method} ${req.url}`);
    next();
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

initDatabase();

app.use('/api/auth', authRoutes);
app.use('/api/configs', configRoutes);
app.use('/api/radar', radarRoutes);

// Error handler
app.use((err, req, res, next) => {
    console.error('[SERVER ERROR]', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
});

const radarSessions = new Map();

wss.on('connection', (ws, req) => {
    const sessionId = new URL(req.url, 'http://localhost').searchParams.get('session');

    if (!sessionId) {
        ws.close(1008, 'Session ID required');
        return;
    }

    if (!radarSessions.has(sessionId)) {
        radarSessions.set(sessionId, new Set());
    }
    radarSessions.get(sessionId).add(ws);

    console.log(`Client connected to radar session: ${sessionId}`);

    ws.on('message', (data, isBinary) => {
        try {
            const clients = radarSessions.get(sessionId);
            if (!clients) {
                console.log(`[WS] No clients found for session ${sessionId} to broadcast to.`);
                return;
            }

            if (isBinary) {
                console.log(`[WS] Received binary payload of ${data.length} bytes for session ${sessionId}. Forwarding to ${clients.size - 1} connected peers.`);
                // Forward raw C++ binary payload
                clients.forEach(client => {
                    if (client !== ws && client.readyState === 1) {
                        try {
                            client.send(data, { binary: true });
                        } catch (sendErr) {
                            console.error("WS Send Error:", sendErr);
                        }
                    }
                });
            } else {
                // Fallback for string JSON
                const message = JSON.parse(data);
                if (message.type === 'radar_update' || message.type === 'radar_disconnect') {
                    clients.forEach(client => {
                        if (client !== ws && client.readyState === 1) {
                            client.send(data, { binary: false });
                        }
                    });
                }
            }
        } catch (e) {
            console.error("WS Message Loop Error:", e);
        }
    });

    ws.on('error', (error) => {
        console.error(`WebSocket Error on session ${sessionId}:`, error);
    });

    ws.on('close', () => {
        const clients = radarSessions.get(sessionId);
        if (clients) {
            clients.delete(ws);

            const disconnectMsg = JSON.stringify({ type: 'radar_disconnect' });
            clients.forEach(client => {
                if (client.readyState === 1) {
                    client.send(disconnectMsg);
                }
            });

            if (clients.size === 0) {
                radarSessions.delete(sessionId);
            }
        }
        console.log(`Client disconnected from radar session: ${sessionId}`);
    });
});

app.set('radarSessions', radarSessions);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
