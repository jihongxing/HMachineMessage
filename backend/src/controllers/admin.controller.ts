import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { adminService } from '../services/admin.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/response';

export class AdminController {
  // 审核设备
  auditEquipment = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { action, reason } = req.body;

    await adminService.auditEquipment(req.userId!, BigInt(id), action, reason);

    ApiResponse.success(res, null, action === 'approve' ? '审核通过' : '审核拒绝');
  });

  // 待审核列表
  getPendingList = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { riskScore, page = '1', pageSize = '20' } = req.query;

    let riskScoreMin: number | undefined;
    let riskScoreMax: number | undefined;

    if (riskScore) {
      const [min, max] = (riskScore as string).split('-').map(Number);
      riskScoreMin = min;
      riskScoreMax = max;
    }

    const result = await adminService.getPendingList({
      riskScoreMin,
      riskScoreMax,
      page: parseInt(page as string),
      pageSize: parseInt(pageSize as string),
    });

    ApiResponse.success(res, result);
  });

  // 用户列表
  getUserList = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { keyword, userLevel, status, page = '1', pageSize = '20' } = req.query;

    const result = await adminService.getUserList({
      keyword: keyword as string,
      userLevel: userLevel as string,
      status: status as string,
      page: parseInt(page as string),
      pageSize: parseInt(pageSize as string),
    });

    ApiResponse.success(res, result);
  });

  // 封禁/解封用户
  updateUserStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { action, reason, duration } = req.body;

    await adminService.updateUserStatus(BigInt(id), action, reason, duration);

    ApiResponse.success(res, null, action === 'ban' ? '封禁成功' : '解封成功');
  });

  // 数据统计
  getStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { startDate, endDate } = req.query;

    const result = await adminService.getStats(
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );

    ApiResponse.success(res, result);
  });

  // 举报列表
  getReportList = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { status, page = '1', pageSize = '20' } = req.query;

    const result = await adminService.getReportList(
      status ? parseInt(status as string) : undefined,
      parseInt(page as string),
      parseInt(pageSize as string)
    );

    ApiResponse.success(res, result);
  });

  // 处理举报
  handleReport = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { action, result } = req.body;

    await adminService.handleReport(BigInt(id), action, result);

    ApiResponse.success(res, null, '处理成功');
  });
}

export const adminController = new AdminController();
