import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { authenticate, requireLevel } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();
const controller = new CategoryController();

// 公开接口
router.get('/tree', controller.getTree);
router.get('/:id', controller.getById);

// 管理接口（需要管理员权限）
const createSchema = z.object({
  body: z.object({
    parentId: z.number().optional(),
    name: z.string().min(1).max(50),
    slug: z.string().min(1).max(50),
    description: z.string().max(200).optional(),
    icon: z.string().max(200).optional(),
    sort: z.number().default(0),
  }),
});

const updateSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(50).optional(),
    slug: z.string().min(1).max(50).optional(),
    description: z.string().max(200).optional(),
    icon: z.string().max(200).optional(),
    sort: z.number().optional(),
    isActive: z.boolean().optional(),
  }),
});

router.post('/', authenticate, requireLevel(9), validate(createSchema), controller.create);
router.put('/:id', authenticate, requireLevel(9), validate(updateSchema), controller.update);
router.delete('/:id', authenticate, requireLevel(9), controller.deleteCategory);

export default router;
