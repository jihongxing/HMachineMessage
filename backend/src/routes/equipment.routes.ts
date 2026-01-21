import { Router } from 'express';
import { equipmentController } from '../controllers/equipment.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

// 设备列表（公开）
router.get('/', equipmentController.list);

// 以下路由需要认证

// 我的设备列表 - 必须在 /:id 之前
router.get('/my', authenticate, equipmentController.myList);

// 设备详情（公开）
router.get('/:id', equipmentController.getDetail);

// 发布设备
router.post(
  '/',
  authenticate,
  validate(
    z.object({
      body: z.object({
        category1: z.string().min(1),
        category2: z.string().min(1),
        model: z.string().min(1).max(100),
        provinceId: z.number().int().positive(),
        cityId: z.number().int().positive(),
        countyId: z.number().int().positive(),
        address: z.string().min(1).max(200),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        price: z.number().positive(),
        priceUnit: z.string().min(1).max(20),
        phone: z.string().regex(/^1[3-9]\d{9}$/),
        wechat: z.string().max(50).optional(),
        images: z.array(z.string().url()).min(1),
        description: z.string().max(2000).optional(),
        capacity: z.string().max(100).optional(),
        availableStart: z.string().optional(),
        availableEnd: z.string().optional(),
      }),
    })
  ),
  equipmentController.create
);

// 更新设备
router.put('/:id', authenticate, equipmentController.update);

// 删除设备
router.delete('/:id', authenticate, equipmentController.delete);

// 上架/下架
router.put(
  '/:id/status',
  authenticate,
  validate(
    z.object({
      body: z.object({
        action: z.enum(['online', 'offline']),
      }),
    })
  ),
  equipmentController.updateStatus
);

// 查看联系方式
router.post(
  '/:id/contact',
  authenticate,
  validate(
    z.object({
      body: z.object({
        type: z.enum(['phone', 'wechat']),
      }),
    })
  ),
  equipmentController.viewContact
);

export default router;
