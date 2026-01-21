import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { equipmentService } from '../services/equipment.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/response';

export class EquipmentController {
  // 发布设备
  create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = await equipmentService.create(req.userId!, req.body);
    ApiResponse.success(res, { id }, '发布成功，等待审核');
  });

  // 更新设备
  update = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    await equipmentService.update(BigInt(id), req.userId!, req.body);
    ApiResponse.success(res, null, '更新成功');
  });

  // 删除设备
  delete = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    await equipmentService.delete(BigInt(id), req.userId!);
    ApiResponse.success(res, null, '删除成功');
  });

  // 上架/下架
  updateStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { action } = req.body;
    await equipmentService.updateStatus(BigInt(id), req.userId!, action);
    ApiResponse.success(res, null, action === 'online' ? '上架成功' : '下架成功');
  });

  // 获取设备详情
  getDetail = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { latitude, longitude } = req.query;

    const detail = await equipmentService.getDetail(
      BigInt(id),
      req.userId,
      latitude ? parseFloat(latitude as string) : undefined,
      longitude ? parseFloat(longitude as string) : undefined
    );

    ApiResponse.success(res, detail);
  });

  // 设备列表
  list = asyncHandler(async (req: AuthRequest, res: Response) => {
    const {
      category1,
      category2,
      provinceId,
      cityId,
      countyId,
      keyword,
      priceMin,
      priceMax,
      rankLevel,
      sort,
      page = '1',
      pageSize = '20',
      latitude,
      longitude,
    } = req.query;

    const result = await equipmentService.list({
      category1: category1 as string,
      category2: category2 as string,
      provinceId: provinceId ? parseInt(provinceId as string) : undefined,
      cityId: cityId ? parseInt(cityId as string) : undefined,
      countyId: countyId ? parseInt(countyId as string) : undefined,
      keyword: keyword as string,
      priceMin: priceMin ? parseFloat(priceMin as string) : undefined,
      priceMax: priceMax ? parseFloat(priceMax as string) : undefined,
      rankLevel: rankLevel as string,
      sort: sort as string,
      page: parseInt(page as string),
      pageSize: parseInt(pageSize as string),
      latitude: latitude ? parseFloat(latitude as string) : undefined,
      longitude: longitude ? parseFloat(longitude as string) : undefined,
    });

    ApiResponse.success(res, result);
  });

  // 我的设备列表
  myList = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { status, page = '1', pageSize = '20' } = req.query;

    const result = await equipmentService.myList(
      req.userId!,
      status ? parseInt(status as string) : undefined,
      parseInt(page as string),
      parseInt(pageSize as string)
    );

    ApiResponse.success(res, result);
  });

  // 查看联系方式
  viewContact = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { type } = req.body;
    const ipAddress = req.ip || req.socket.remoteAddress || '';

    const contact = await equipmentService.viewContact(
      BigInt(id),
      req.userId!,
      type,
      ipAddress
    );

    ApiResponse.success(res, contact);
  });
}

export const equipmentController = new EquipmentController();
