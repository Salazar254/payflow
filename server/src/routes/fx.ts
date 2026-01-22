import { Router } from 'express';
import { getRates, getQuote } from '../controllers/fx';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/rates', getRates);
router.get('/quote', getQuote); // Public or private? Let's make it public for landing page demo, or auth?
// Prompt says "Public Landing Page... Instant FX quotes". So public.

export default router;
