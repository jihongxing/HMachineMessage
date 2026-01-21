import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { UploadService } from '../services/upload.service';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse } from '../utils/response';
import { BadRequestError } from '../utils/errors';

export class UploadController {
  private service = new UploadService();

  getToken = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.userId!;
    const type = req.query.type as string;
    const token = await this.service.generateToken(userId, type);
    res.json(successResponse(token));
  });

  upload = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.file) {
      throw new BadRequestError('请上传文件');
    }
    const userId = req.userId!;
    const result = await this.service.upload(req.file, userId);
    res.json(successResponse(result, '上传成功'));
  });

  deleteFile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { key } = req.params;
    const userId = req.userId!;
    await this.service.delete(key, userId);
    res.json(successResponse(null, '删除成功'));
  });

  getMyImages = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.userId!;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const result = await this.service.getUserImages(userId, { page, pageSize });
    res.json(successResponse(result));
  });
}
