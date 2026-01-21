import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

// 所有路由都需要认证
router.use(authenticate);

// 获取用户信息
router.get('/profile', userController.getProfile);

// 更新用户信息
router.put(
  '/profile',
  validate(
    z.object({
      body: z.object({
        nickname: z.string().min(1).max(50).optional(),
        avatar: z.string().url().optional(),
      }),
    })
  ),
  userController.updateProfile
);

// 修改密码
router.put(
  '/password',
  validate(
    z.object({
      body: z.object({
        oldPassword: z.string().min(1),
        newPassword: z.string().min(6).max(20),
      }),
    })
  ),
  userController.changePassword
);

// 实名认证
router.post(
  '/verify/realname',
  validate(
    z.object({
      body: z.object({
        realName: z.string().min(2).max(50),
        idCard: z.string().length(18),
      }),
    })
  ),
  userController.verifyRealName
);

// 企业认证
router.post(
  '/verify/company',
  validate(
    z.object({
      body: z.object({
        companyName: z.string().min(1).max(100),
        businessLicense: z.string().min(1).max(50),
        legalPerson: z.string().min(2).max(50),
        licenseImage: z.string().url(),
      }),
    })
  ),
  userController.verifyCompany
);

export default router;
