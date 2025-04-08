const WebSocket = require('ws');
const http = require('http');

// Create HTTP server
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('WebSocket signaling server is running');
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store active connections by room
const rooms = new Map();

wss.on('connection', (ws, req) => {
    // Get room ID from URL
    const url = new URL(req.url, 'http://localhost');
    const roomId = url.searchParams.get('room');

    if (!roomId) {
        ws.close();
        return;
    }

    // Add connection to room
    if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
    }
    rooms.get(roomId).add(ws);

    console.log(`New connection in room ${roomId}`);

    // Handle messages
    ws.on('message', (message) => {
        // Broadcast message to all other connections in the room
        rooms.get(roomId).forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    // Handle connection close
    ws.on('close', () => {
        if (rooms.has(roomId)) {
            rooms.get(roomId).delete(ws);
            if (rooms.get(roomId).size === 0) {
                rooms.delete(roomId);
            }
        }
        console.log(`Connection closed in room ${roomId}`);
    });

    // Handle errors
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

// Start server with port fallback
const startServer = (port) => {
    server.listen(port, () => {
        console.log(`Signaling server started on ws://localhost:${port}`);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`Port ${port} is in use, trying port ${port + 1}`);
            startServer(port + 1);
        } else {
            console.error('Server error:', err);
        }
    });
};

// Start with initial port
startServer(8001); 