import { Router } from 'express';
import { locationController } from '../controllers/location.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// IP定位
router.get('/ip-location', locationController.getIpLocation);

// 地理编码
router.post('/geocode', locationController.geocode);

// 逆地理编码
router.post('/reverse-geocode', locationController.reverseGeocode);

// 更新设备位置
router.put('/equipment/:id', authenticate, locationController.updateEquipmentLocation);

// 附近设备搜索
router.get('/nearby', locationController.searchNearby);

// 获取设备周边
router.get('/surroundings/:id', locationController.getEquipmentSurroundings);

// 批量更新位置
router.post('/batch-update', authenticate, locationController.batchUpdateLocations);

export default router;
