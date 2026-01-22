import { Router } from 'express';
import { createBeneficiary, getBeneficiaries } from '../controllers/beneficiary';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);
router.post('/', createBeneficiary);
router.get('/', getBeneficiaries);

export default router;
