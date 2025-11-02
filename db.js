import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;

// Prefer DATABASE_URL (works on Render/Heroku); fall back to discrete vars
export const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : new Pool({
      host: process.env.PGHOST || 'localhost',
      port: process.env.PGPORT || 3000,
      database: process.env.PGDATABASE || 'jokebook',
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || 'postgres'
    });

// Simple helper for one‑off queries
export const q = (text, params) => pool.query(text, params);