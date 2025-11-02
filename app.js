import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import jokebookRoutes from './routes/jokebookRoutes.js';
import { pool } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/jokebook', jokebookRoutes);

// Health check
app.get('/health', (req, res) => res.json({ ok: true }));

// Error handler (last)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, async () => {
  try {
    await pool.query('SELECT 1');
    console.log(`DB connected. Server listening on http://localhost:${PORT}`);
  } catch (e) {
    console.error('DB connection failed:', e.message);
  }
});