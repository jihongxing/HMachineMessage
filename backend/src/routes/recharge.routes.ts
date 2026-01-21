import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as rechargeController from '../controllers/recharge.controller';

const router = Router();

router.post('/', authenticate, rechargeController.createRecharge);
router.get('/history', authenticate, rechargeController.getRechargeHistory);

export default router;
