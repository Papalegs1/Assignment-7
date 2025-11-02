import { q } from '../db.js';

export async function getCategories() {
  const { rows } = await q('SELECT name FROM categories ORDER BY name ASC');
  return rows.map(r => r.name);
}

export async function getCategoryIdByName(name) {
  const { rows } = await q('SELECT id FROM categories WHERE LOWER(name) = LOWER($1)', [name]);
  return rows[0]?.id || null;
}

export async function getJokesByCategory(name, limit) {
  const categoryId = await getCategoryIdByName(name);
  if (!categoryId) return { categoryId: null, jokes: [] };
  const params = [categoryId];
  let sql = 'SELECT id, setup, delivery, created_at FROM jokes WHERE category_id = $1 ORDER BY id DESC';
  if (limit && Number(limit) > 0) {
    sql += ' LIMIT $2';
    params.push(Number(limit));
  }
  const { rows } = await q(sql, params);
  return { categoryId, jokes: rows };
}

export async function getRandomJoke() {
  const { rows } = await q(
    `SELECT j.id, c.name AS category, j.setup, j.delivery
     FROM jokes j
     JOIN categories c ON c.id = j.category_id
     ORDER BY random()
     LIMIT 1`
  );
  return rows[0] || null;
}

export async function upsertCategory(name) {
  const { rows } = await q(
    `INSERT INTO categories(name) VALUES($1)
     ON CONFLICT(name) DO UPDATE SET name = EXCLUDED.name
     RETURNING id, name`,
    [name]
  );
  return rows[0];
}

export async function addJoke({ category, setup, delivery }) {
  const cat = await upsertCategory(category);
  const { rows } = await q(
    `INSERT INTO jokes(category_id, setup, delivery)
     VALUES($1, $2, $3)
     RETURNING id, setup, delivery, created_at`,
    [cat.id, setup, delivery]
  );
  return { category: cat.name, joke: rows[0] };
}