import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import chatController from './controllers/chatController.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server) or any frontend origin
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      callback(null, true);
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.send('Dev-Buddy Backend is running!');
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

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', socket.id, 'Reason:', reason);
  });
});

const port = process.env.PORT || 4000;
server.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});

