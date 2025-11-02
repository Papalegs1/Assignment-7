import { Router } from 'express';
import {
  listCategories,
  listJokesInCategory,
  randomJoke,
  createJoke
} from '../controllers/jokebookController.js';

const router = Router();

router.get('/categories', listCategories);
router.get('/category/:category', listJokesInCategory);
router.get('/random', randomJoke);
router.post('/joke/add', createJoke);

// Alias to match assignment checklist
router.post('/add', createJoke);

export default router;