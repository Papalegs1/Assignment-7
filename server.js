// server.js — Jokebook API + static site (CommonJS)

const path = require('path');
const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// DB pool
const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : new Pool({
      host: process.env.PGHOST || 'localhost',
      port: Number(process.env.PGPORT || 5432),
      database: process.env.PGDATABASE || 'jokebook',
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || ''
    });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Health
app.get('/health', (req, res) => res.json({ ok: true }));

// Helpers
async function getCategoryIdByName(name) {
  const { rows } = await pool.query('SELECT id FROM categories WHERE LOWER(name)=LOWER($1)', [name]);
  return rows[0]?.id || null;
}

// i) GET /jokebook/categories
app.get('/jokebook/categories', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT name FROM categories ORDER BY name ASC');
    res.json({ categories: rows.map(r => r.name) });
  } catch (e) { next(e); }
});

// ii) GET /jokebook/category/:category (?limit=n)
app.get('/jokebook/category/:category', async (req, res, next) => {
  try {
    const { category } = req.params;
    const { limit } = req.query;

    const catId = await getCategoryIdByName(category);
    if (!catId) return res.status(404).json({ error: `Unknown category: '${category}'` });

    const params = [catId];
    let sql = 'SELECT id, setup, delivery, created_at FROM jokes WHERE category_id=$1 ORDER BY id DESC';
    if (limit && Number(limit) > 0) {
      sql += ' LIMIT $2';
      params.push(Number(limit));
    }
    const { rows } = await pool.query(sql, params);
    res.json({ category, count: rows.length, jokes: rows });
  } catch (e) { next(e); }
});

// iii) GET /jokebook/random
app.get('/jokebook/random', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT j.id, c.name AS category, j.setup, j.delivery
       FROM jokes j JOIN categories c ON c.id=j.category_id
       ORDER BY random() LIMIT 1`
    );
    if (!rows[0]) return res.status(404).json({ error: 'No jokes found' });
    res.json(rows[0]);
  } catch (e) { next(e); }
});

// iv) POST /jokebook/joke/add  (alias /jokebook/add)
async function handleAddJoke(req, res, next) {
  try {
    const { category, setup, delivery } = req.body || {};
    if (!category || !setup || !delivery) {
      return res.status(400).json({ error: 'Missing required fields: category, setup, delivery' });
    }

    const { rows: catRows } = await pool.query(
      `INSERT INTO categories(name) VALUES ($1)
       ON CONFLICT(name) DO UPDATE SET name=EXCLUDED.name
       RETURNING id, name`, [category]
    );
    const cat = catRows[0];

    await pool.query(
      'INSERT INTO jokes(category_id, setup, delivery) VALUES ($1, $2, $3)',
      [cat.id, setup, delivery]
    );

    const list = await pool.query(
      'SELECT id, setup, delivery, created_at FROM jokes WHERE category_id=$1 ORDER BY id DESC',
      [cat.id]
    );
    res.status(201).json({ category: cat.name, count: list.rowCount, jokes: list.rows });
  } catch (e) { next(e); }
}
app.post('/jokebook/joke/add', handleAddJoke);
app.post('/jokebook/add', handleAddJoke);

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
