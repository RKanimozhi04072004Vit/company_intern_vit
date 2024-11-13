const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const sessionPage = {}; // Store current page per session ID

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('joinRoom', ({ sessionId, isAdmin }) => {
    socket.join(sessionId);

    // Send current page to new user
    const currentPage = sessionPage[sessionId] || 1;
    socket.emit('pageUpdate', currentPage);

    if (isAdmin) {
      // Admin changes page
      socket.on('pageChange', (newPage) => {
        sessionPage[sessionId] = newPage;
        io.to(sessionId).emit('pageUpdate', newPage); // Broadcast to room
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});