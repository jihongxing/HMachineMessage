import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as reviewController from '../controllers/review.controller';

const router = Router();

router.post('/', authenticate, reviewController.createReview);
router.put('/:id', authenticate, reviewController.updateReview);
router.get('/equipment/:equipmentId', reviewController.getEquipmentReviews);
router.post('/:id/report', authenticate, reviewController.reportReview);

export default router;
