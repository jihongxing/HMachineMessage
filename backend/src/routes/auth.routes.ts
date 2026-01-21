import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

// 发送验证码
router.post(
  '/sms/send',
  validate(
    z.object({
      body: z.object({
        phone: z.string().regex(/^1[3-9]\d{9}$/, '手机号格式错误'),
        type: z.enum(['register', 'login', 'reset']),
      }),
    })
  ),
  authController.sendSms
);

// 注册
router.post(
  '/register',
  validate(
    z.object({
      body: z.object({
        phone: z.string().regex(/^1[3-9]\d{9}$/, '手机号格式错误'),
        code: z.string().length(6, '验证码为6位数字'),
        password: z.string().min(6, '密码至少6位').max(20, '密码最多20位'),
        nickname: z.string().min(1, '昵称不能为空').max(50, '昵称最多50字'),
      }),
    })
  ),
  authController.register
);

// 密码登录
router.post(
  '/login',
  validate(
    z.object({
      body: z.object({
        phone: z.string().regex(/^1[3-9]\d{9}$/, '手机号格式错误'),
        password: z.string().min(1, '密码不能为空'),
      }),
    })
  ),
  authController.login
);

// 验证码登录
router.post(
  '/login/sms',
  validate(
    z.object({
      body: z.object({
        phone: z.string().regex(/^1[3-9]\d{9}$/, '手机号格式错误'),
        code: z.string().length(6, '验证码为6位数字'),
      }),
    })
  ),
  authController.loginWithSms
);

// 重置密码
router.post(
  '/password/reset',
  validate(
    z.object({
      body: z.object({
        phone: z.string().regex(/^1[3-9]\d{9}$/, '手机号格式错误'),
        code: z.string().length(6, '验证码为6位数字'),
        newPassword: z.string().min(6, '密码至少6位').max(20, '密码最多20位'),
      }),
    })
  ),
  authController.resetPassword
);

export default router;
