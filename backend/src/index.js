import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import chatController from './controllers/chatController.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173'],
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('user_message', async (payload) => {
    try {
      const response = await chatController.handleMessage(payload, (event, data) => {
        socket.emit(event, data);
      });
      socket.emit('assistant_message', response);
    } catch (error) {
      console.error('Chat error:', error);
      socket.emit('assistant_error', { message: error.message || 'Internal error' });
    }
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

const port = process.env.PORT || 4000;
server.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
