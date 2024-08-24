const express = require('express');
const app = express();
const expressWs = require('express-ws')(app);
const rateLimit = require('express-rate-limit');

const roomState = {};

// Utility function to generate a random 4-digit room number
function generateRoomNumber() {
  return Math.floor(Math.random() * 9000 + 1000);
}

// Configure the rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (15 minutes)
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply the rate limiter to all requests
app.use(limiter);

// Route to redirect to a random room
app.get('/', (req, res) => {
  res.redirect(`/r/${generateRoomNumber()}`);
});

// Route to serve the main page for a room
app.get('/r/:room', (req, res) => {
  res.sendFile('index.html', { root: __dirname });
});

// WebSocket handling
app.ws('/', (ws, req) => {
  ws.state = [];
  ws.id = req.headers['sec-websocket-key'];
  console.log('WebSocket connected:', ws.id);

  ws.on('message', (msg) => {
    handleWebSocketMessage(ws, JSON.parse(msg));
  });
});

// Handle incoming WebSocket messages
function handleWebSocketMessage(ws, msg) {
  switch (msg.type) {
    case 'join':
      handleJoin(ws, msg);
      break;
    case 'addState':
      handleAddState(ws, msg);
      break;
    case 'clear':
      handleClear(ws);
      break;
  }
}

// Handle 'join' message
function handleJoin(ws, msg) {
  ws.room = msg.room;
  if (!roomState[ws.room]) {
    roomState[ws.room] = [];
  }
  ws.send(JSON.stringify({ type: 'state', state: roomState[ws.room] }));
}

// Handle 'addState' message
function handleAddState(ws, msg) {
  if (!ws.room) return;
  if (!roomState[ws.room]) roomState[ws.room] = [];

  roomState[ws.room].push(msg.state);
  broadcastToRoom(ws, { type: 'addState', state: msg.state });
}

// Handle 'clear' message
function handleClear(ws) {
  if (!ws.room) return;

  roomState[ws.room] = [];
  broadcastToRoom(ws, { type: 'clear' });
}

// Broadcast message to all clients in the same room
function broadcastToRoom(ws, msg) {
  const clients = expressWs.getWss().clients;
  clients.forEach((client) => {
    if (client.room === ws.room && ws.id !== client.id) {
      client.send(JSON.stringify(msg));
    }
  });
}

// Cleanup empty rooms every hour
setInterval(cleanupRooms, 1000 * 60 * 60);

function cleanupRooms() {
  const clients = expressWs.getWss().clients;
  const activeRooms = Array.from(clients).reduce((rooms, client) => {
    if (client.room) {
      rooms[client.room] = true;
    }
    return rooms;
  }, {});

  Object.keys(roomState).forEach((room) => {
    if (!activeRooms[room]) {
      delete roomState[room];
    }
  });
}

// Start the server
const server = app.listen(process.env.PORT || 8080, () => {
  console.log(`Server started on port ${server.address().port}`);
});

// Graceful shutdown
function gracefulShutdown() {
  console.log('Received SIGINT. Shutting down gracefully...');
  server.close(() => {
    console.log('Closed out remaining connections.');
    process.exit(0);
  });

  // If after 5 seconds, force shutdown
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 5000);
}

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
