import { Router } from 'express';
import { createPayment, getHistory } from '../controllers/payment';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);
router.post('/', createPayment);
router.get('/', getHistory);

export default router;
