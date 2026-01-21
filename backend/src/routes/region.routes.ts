import { Router } from 'express';
import { RegionController } from '../controllers/region.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const controller = new RegionController();

// 公开接口
router.get('/provinces', controller.getProvinces);
router.get('/cities/:provinceId', controller.getCities);
router.get('/counties/:cityId', controller.getCounties);
router.get('/code/:code', controller.getByCode);

// 管理接口
router.post('/import', authenticate, controller.importData);

export default router;
