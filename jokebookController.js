import {
    getCategories,
    getJokesByCategory,
    getRandomJoke,
    addJoke
  } from '../models/jokeModel.js';
  
  // GET /jokebook/categories
  export async function listCategories(req, res, next) {
    try {
      const cats = await getCategories();
      return res.json({ categories: cats });
    } catch (err) {
      next(err);
    }
  }
  
  // GET /jokebook/category/:category?limit=n
  export async function listJokesInCategory(req, res, next) {
    try {
      const { category } = req.params;
      const { limit } = req.query;
      const { categoryId, jokes } = await getJokesByCategory(category, limit);
      if (!categoryId) {
        return res.status(404).json({ error: `Unknown category: '${category}'` });
      }
      return res.json({ category, count: jokes.length, jokes });
    } catch (err) {
      next(err);
    }
  }
  
  // GET /jokebook/random
  export async function randomJoke(req, res, next) {
    try {
      const joke = await getRandomJoke();
      if (!joke) return res.status(404).json({ error: 'No jokes found' });
      return res.json(joke);
    } catch (err) {
      next(err);
    }
  }
  
  // POST /jokebook/joke/add  (alias supported: /jokebook/add)
  export async function createJoke(req, res, next) {
    try {
      const { category, setup, delivery } = req.body || {};
      if (!category || !setup || !delivery) {
        return res.status(400).json({
          error: 'Missing required fields: category, setup, delivery'
        });
      }
      const { category: normalizedCategory } = await addJoke({ category, setup, delivery });
      const { jokes } = await getJokesByCategory(normalizedCategory);
      return res.status(201).json({ category: normalizedCategory, count: jokes.length, jokes });
    } catch (err) {
      next(err);
    }
  }