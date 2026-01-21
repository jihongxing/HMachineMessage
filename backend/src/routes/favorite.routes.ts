import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as favoriteController from '../controllers/favorite.controller';

const router = Router();

router.post('/', authenticate, favoriteController.addFavorite);
router.delete('/:equipmentId', authenticate, favoriteController.removeFavorite);
router.get('/', authenticate, favoriteController.getMyFavorites);
router.get('/check/:equipmentId', authenticate, favoriteController.checkFavorite);

export default router;
