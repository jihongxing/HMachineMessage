import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as historyController from '../controllers/history.controller';

const router = Router();

router.get('/', authenticate, historyController.getViewHistory);
router.delete('/', authenticate, historyController.clearHistory);

export default router;
