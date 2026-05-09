import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { pool } from './config/database';
import authRoutes from './routes/auth';
import commentRoutes from './routes/comments';
import likeRoutes from './routes/likes';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/comments', likeRoutes);

app.get('/health', (_, res) => res.json({ status: 'ok' }));

io.on('connection', (socket) => {
  console.log('🔌 Client connecté:', socket.id);
  socket.on('new_comment', (comment) => {
    io.emit('comment_added', comment);
  });
  socket.on('like_updated', (data) => {
    io.emit('like_changed', data);
  });
  socket.on('disconnect', () => {
    console.log('🔌 Client déconnecté:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    await pool.query('SELECT 1');
    console.log('✅ Base de données connectée');
    httpServer.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Impossible de connecter la base de données:', err);
    process.exit(1);
  }
};

start();
