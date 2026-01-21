import { Request, Response } from 'express';
import { locationService } from '../services/location.service';
import { prisma } from '../services/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/errors';
import { ApiResponse } from '../utils/response';
import { z } from 'zod';

const geocodeSchema = z.object({
  address: z.string().min(1, '地址不能为空'),
});

const reverseGeocodeSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

const updateLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

const searchNearbySchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radius: z.number().min(1).max(500).optional(),
  category1: z.string().optional(),
  category2: z.string().optional(),
  priceMin: z.number().optional(),
  priceMax: z.number().optional(),
  page: z.number().min(1).optional(),
  pageSize: z.number().min(1).max(100).optional(),
});

export class LocationController {
  /**
   * 根据IP获取位置
   */
  getIpLocation = asyncHandler(async (req: Request, res: Response) => {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
                req.socket.remoteAddress || 
                '127.0.0.1';

    // 开发环境返回默认城市
    if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.')) {
      ApiResponse.success(res, {
        province: '北京市',
        city: '北京市',
        ip,
      });
      return;
    }

    try {
      const location = await locationService.getLocationByIp(ip);
      ApiResponse.success(res, location);
    } catch (error) {
      // IP定位失败返回默认
      ApiResponse.success(res, {
        province: '北京市',
        city: '北京市',
        ip,
      });
    }
  });

  /**
   * 地理编码
   */
  geocode = asyncHandler(async (req: Request, res: Response) => {
    const { address } = geocodeSchema.parse(req.body);

    const coords = await locationService.geocode(address);

    if (!coords) {
      throw new AppError('无法解析地址坐标', 404);
    }

    ApiResponse.success(res, coords);
  });

  /**
   * 逆地理编码
   */
  reverseGeocode = asyncHandler(async (req: Request, res: Response) => {
    const { latitude, longitude } = reverseGeocodeSchema.parse(req.body);

    const address = await locationService.reverseGeocode(latitude, longitude);

    if (!address) {
      throw new AppError('无法解析坐标地址', 404);
    }

    ApiResponse.success(res, { address });
  });

  /**
   * 更新设备位置
   */
  updateEquipmentLocation = asyncHandler(async (req: Request & { user?: any }, res: Response) => {
    const equipmentId = BigInt(req.params.id);
    const userId = req.user!.id;
    const { latitude, longitude } = updateLocationSchema.parse(req.body);

    // 验证权限
    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId },
    });

    if (!equipment) {
      throw new AppError('设备不存在', 404);
    }

    if (equipment.userId !== userId) {
      throw new AppError('无权操作此设备', 403);
    }

    await locationService.updateEquipmentLocation(equipmentId, latitude, longitude);

    ApiResponse.success(res, { message: '位置更新成功' });
  });

  /**
   * 附近设备搜索
   */
  searchNearby = asyncHandler(async (req: Request, res: Response) => {
    const {
      latitude,
      longitude,
      radius = 50,
      category1,
      category2,
      priceMin,
      priceMax,
      page = 1,
      pageSize = 20,
    } = searchNearbySchema.parse({
      ...req.query,
      latitude: Number(req.query.latitude),
      longitude: Number(req.query.longitude),
      radius: req.query.radius ? Number(req.query.radius) : undefined,
      priceMin: req.query.priceMin ? Number(req.query.priceMin) : undefined,
      priceMax: req.query.priceMax ? Number(req.query.priceMax) : undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
    });

    const results = await locationService.searchNearby(latitude, longitude, radius, {
      category1,
      category2,
      priceMin,
      priceMax,
    });

    // 分页
    const total = results.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const items = results.slice(start, end);

    ApiResponse.success(res, {
      items: items.map(item => ({
        id: item.id.toString(),
        category1: item.category1,
        category2: item.category2,
        model: item.model,
        province: item.province?.name || '',
        city: item.city?.name || '',
        county: item.county?.name || '',
        address: item.address,
        latitude: item.latitude,
        longitude: item.longitude,
        distance: Math.round(item.distance * 10) / 10,
        price: item.price,
        priceUnit: item.priceUnit,
        images: item.images,
        viewCount: item.viewCount,
        contactCount: item.contactCount,
        favoriteCount: item.favoriteCount,
        rating: item.rating,
        ratingCount: item.ratingCount,
        rankLevel: item.rankLevel,
        user: {
          id: item.user.id.toString(),
          nickname: item.user.nickname,
          avatar: item.user.avatar,
          userLevel: item.user.userLevel,
        },
        createdAt: item.createdAt,
      })),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  });

  /**
   * 获取设备周边
   */
  getEquipmentSurroundings = asyncHandler(async (req: Request, res: Response) => {
    const equipmentId = BigInt(req.params.id);
    const radius = req.query.radius ? Number(req.query.radius) : 10;

    const results = await locationService.getEquipmentSurroundings(equipmentId, radius);

    ApiResponse.success(res, {
      items: results.map(item => ({
        id: item.id.toString(),
        model: item.model,
        distance: Math.round(item.distance * 10) / 10,
        price: item.price,
        priceUnit: item.priceUnit,
        images: item.images,
        rating: item.rating,
      })),
    });
  });

  /**
   * 批量更新位置
   */
  batchUpdateLocations = asyncHandler(async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user!.id;

    const updated = await locationService.batchUpdateLocations(userId);

    ApiResponse.success(res, {
      message: `成功更新${updated}个设备的位置信息`,
      count: updated,
    });
  });
}

export const locationController = new LocationController();
