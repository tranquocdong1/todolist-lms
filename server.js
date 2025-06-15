import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import todoRoutes from './routes/todos.js';
import authRoutes from './routes/auth.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Đảm bảo đường dẫn đúng

// Kết nối MongoDB
const uri = process.env.MONGO_URI;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/todos', todoRoutes);
app.use('/api/auth', authRoutes);

// Route cơ bản
app.get('/', (req, res) => {
  res.send('Todo List API');
});

// Khởi động server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});