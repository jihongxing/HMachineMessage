import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { authService } from '../services/auth.service';
import { smsService } from '../services/sms.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/response';

export class AuthController {
  // 发送验证码
  sendSms = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { phone, type } = req.body;
    const ipAddress = req.ip || req.socket.remoteAddress || '';

    await smsService.sendCode(phone, type, ipAddress);

    ApiResponse.success(res, { expireAt: new Date(Date.now() + 5 * 60 * 1000) }, '验证码已发送');
  });

  // 注册
  register = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { phone, code, password, nickname } = req.body;

    const result = await authService.register({ phone, code, password, nickname });

    ApiResponse.success(res, result, '注册成功');
  });

  // 密码登录
  login = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { phone, password } = req.body;

    const result = await authService.login(phone, password);

    ApiResponse.success(res, result, '登录成功');
  });

  // 验证码登录
  loginWithSms = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { phone, code } = req.body;

    const result = await authService.loginWithSms(phone, code);

    ApiResponse.success(res, result, '登录成功');
  });

  // 重置密码
  resetPassword = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { phone, code, newPassword } = req.body;

    await authService.resetPassword(phone, code, newPassword);

    ApiResponse.success(res, null, '密码重置成功');
  });
}

export const authController = new AuthController();
