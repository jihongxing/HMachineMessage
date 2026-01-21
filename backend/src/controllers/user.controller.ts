import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { userService } from '../services/user.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/response';

export class UserController {
  // 获取用户信息
  getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const profile = await userService.getProfile(req.userId!);
    ApiResponse.success(res, profile);
  });

  // 更新用户信息
  updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { nickname, avatar } = req.body;
    await userService.updateProfile(req.userId!, { nickname, avatar });
    ApiResponse.success(res, null, '更新成功');
  });

  // 修改密码
  changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { oldPassword, newPassword } = req.body;
    await userService.changePassword(req.userId!, oldPassword, newPassword);
    ApiResponse.success(res, null, '密码修改成功');
  });

  // 实名认证
  verifyRealName = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { realName, idCard } = req.body;
    await userService.verifyRealName(req.userId!, realName, idCard);
    ApiResponse.success(res, null, '实名认证成功');
  });

  // 企业认证
  verifyCompany = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { companyName, businessLicense, legalPerson, licenseImage } = req.body;
    await userService.verifyCompany(req.userId!, {
      companyName,
      businessLicense,
      legalPerson,
      licenseImage,
    });
    ApiResponse.success(res, null, '企业认证成功');
  });
}

export const userController = new UserController();
