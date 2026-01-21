import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

// 所有路由都需要管理员权限
router.use(authenticate);
// TODO: 添加管理员权限检查中间件

// 审核设备
router.put(
  '/equipment/:id/audit',
  validate(
    z.object({
      body: z.object({
        action: z.enum(['approve', 'reject']),
        reason: z.string().max(200).optional(),
      }),
    })
  ),
  adminController.auditEquipment
);

// 待审核列表
router.get('/equipment/pending', adminController.getPendingList);

// 用户列表
router.get('/users', adminController.getUserList);

// 封禁/解封用户
router.put(
  '/users/:id/status',
  validate(
    z.object({
      body: z.object({
        action: z.enum(['ban', 'unban']),
        reason: z.string().max(200).optional(),
        duration: z.number().int().positive().optional(),
      }),
    })
  ),
  adminController.updateUserStatus
);

// 数据统计
router.get('/stats', adminController.getStats);

// 举报列表
router.get('/reports', adminController.getReportList);

// 处理举报
router.put(
  '/reports/:id/handle',
  validate(
    z.object({
      body: z.object({
        action: z.enum(['approve', 'reject']),
        result: z.string().min(1).max(200),
      }),
    })
  ),
  adminController.handleReport
);

export default router;
