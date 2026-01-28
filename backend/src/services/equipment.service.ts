import { prisma } from './prisma';
import { cache } from './cache';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/errors';
import { calculateDistance } from '../utils/distance';

export class EquipmentService {
  // 发布设备
  async create(userId: bigint, data: any) {
    // 检查用户发布限制
    await this.checkPublishLimit(userId);

    // 计算风险评分
    const riskScore = await this.calculateRiskScore(data);

    // 清理空日期字段
    const cleanData = { ...data };
    if (!cleanData.availableStart || cleanData.availableStart === '') {
      delete cleanData.availableStart;
    }
    if (!cleanData.availableEnd || cleanData.availableEnd === '') {
      delete cleanData.availableEnd;
    }

    const equipment = await prisma.equipment.create({
      data: {
        userId,
        ...cleanData,
        riskScore,
        status: riskScore < 20 ? 1 : 0, // 低风险自动通过
      },
    });

    // 更新用户发布数
    await prisma.user.update({
      where: { id: userId },
      data: { publishCount: { increment: 1 } },
    });

    // 如果自动通过，更新通过数
    if (equipment.status === 1) {
      await prisma.user.update({
        where: { id: userId },
        data: { passCount: { increment: 1 } },
      });
    }

    // 如果需要审核，创建通知
    if (equipment.status === 0) {
      await prisma.notification.create({
        data: {
          userId,
          type: 'audit',
          title: '设备待审核',
          content: '您的设备信息正在审核中，请耐心等待',
          relatedId: equipment.id,
        },
      });
    }

    return equipment.id.toString();
  }

  // 更新设备
  async update(equipmentId: bigint, userId: bigint, data: any) {
    const equipment = await this.getById(equipmentId);

    if (equipment.userId !== userId) {
      throw new ForbiddenError('无权操作');
    }

    if (equipment.status === 4) {
      throw new BadRequestError('设备已删除');
    }

    // 重新计算风险评分
    const riskScore = await this.calculateRiskScore(data);

    await prisma.equipment.update({
      where: { id: equipmentId },
      data: {
        ...data,
        riskScore,
        status: riskScore < 20 ? 1 : 0,
      },
    });
  }

  // 删除设备
  async delete(equipmentId: bigint, userId: bigint) {
    const equipment = await this.getById(equipmentId);

    if (equipment.userId !== userId) {
      throw new ForbiddenError('无权操作');
    }

    await prisma.equipment.update({
      where: { id: equipmentId },
      data: { status: 4 },
    });
  }

  // 上架/下架
  async updateStatus(equipmentId: bigint, userId: bigint, action: 'online' | 'offline') {
    const equipment = await this.getById(equipmentId);

    if (equipment.userId !== userId) {
      throw new ForbiddenError('无权操作');
    }

    const status = action === 'online' ? 1 : 3;
    await prisma.equipment.update({
      where: { id: equipmentId },
      data: { status },
    });
  }

  // 获取设备详情
  async getDetail(equipmentId: bigint, userId?: bigint, latitude?: number, longitude?: number) {
    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
            userLevel: true,
          },
        },
        province: { select: { id: true, name: true } },
        city: { select: { id: true, name: true } },
        county: { select: { id: true, name: true } },
      },
    });

    if (!equipment || equipment.status === 4) {
      throw new NotFoundError('设备不存在');
    }

    // 增加浏览量
    await prisma.equipment.update({
      where: { id: equipmentId },
      data: { viewCount: { increment: 1 } },
    });

    // 记录浏览历史
    if (userId) {
      await prisma.viewHistory.create({
        data: {
          userId,
          equipmentId,
        },
      });
    }

    // 计算距离
    let distance: number | undefined;
    if (latitude && longitude && equipment.latitude && equipment.longitude) {
      distance = calculateDistance(
        latitude,
        longitude,
        parseFloat(equipment.latitude.toString()),
        parseFloat(equipment.longitude.toString())
      );
    }

    return this.formatEquipment(equipment, distance);
  }

  // 设备列表
  async list(params: {
    category1?: string;
    category2?: string;
    provinceId?: number;
    cityId?: number;
    countyId?: number;
    keyword?: string;
    priceMin?: number;
    priceMax?: number;
    rankLevel?: string;
    sort?: string;
    page: number;
    pageSize: number;
    latitude?: number;
    longitude?: number;
  }) {
    const { page, pageSize, sort = 'time', latitude, longitude, ...filters } = params;
    const skip = (page - 1) * pageSize;

    // 构建查询条件
    const where: any = {
      status: 1, // 只显示已发布的
    };

    if (filters.category1) where.category1 = filters.category1;
    if (filters.category2) where.category2 = filters.category2;
    if (filters.provinceId) where.provinceId = filters.provinceId;
    if (filters.cityId) where.cityId = filters.cityId;
    if (filters.countyId) where.countyId = filters.countyId;

    // 获取当前筛选的区域信息，用于推广排序
    const currentRegion = {
      provinceId: filters.provinceId,
      cityId: filters.cityId,
      countyId: filters.countyId,
    };

    if (filters.keyword) {
      where.OR = [
        { model: { contains: filters.keyword } },
        { description: { contains: filters.keyword } },
      ];
    }

    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      where.price = {};
      if (filters.priceMin !== undefined) where.price.gte = filters.priceMin;
      if (filters.priceMax !== undefined) where.price.lte = filters.priceMax;
    }

    if (filters.rankLevel) {
      const levels = filters.rankLevel.split(',').map(Number);
      where.rankLevel = { in: levels };
    }

    // 排序
    let orderBy: any = {};
    if (sort === 'latest' || sort === 'time') {
      orderBy = [
        { rankLevel: 'desc' },
        { createdAt: 'desc' },
      ];
    } else if (sort === 'views' || sort === 'hot') {
      orderBy = [
        { rankLevel: 'desc' },
        { viewCount: 'desc' },
      ];
    } else if (sort === 'price_asc') {
      orderBy = { price: 'asc' };
    } else if (sort === 'price_desc') {
      orderBy = { price: 'desc' };
    } else if (sort === 'rank') {
      orderBy = { rankLevel: 'desc' };
    }

    // 查询
    const [list, total] = await Promise.all([
      prisma.equipment.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        include: {
          user: {
            select: {
              id: true,
              nickname: true,
              avatar: true,
              userLevel: true,
            },
          },
          province: { select: { id: true, name: true } },
          city: { select: { id: true, name: true } },
          county: { select: { id: true, name: true } },
        },
      }),
      prisma.equipment.count({ where }),
    ]);

    // 计算距离
    const items = list.map((item: any) => {
      let distance: number | undefined;
      if (latitude && longitude && item.latitude && item.longitude) {
        distance = calculateDistance(
          latitude,
          longitude,
          parseFloat(item.latitude.toString()),
          parseFloat(item.longitude.toString())
        );
      }
      
      // 计算有效推广分数（根据区域匹配度）
      const rankScore = this.calculateRankScore(item, currentRegion);
      
      return {
        ...this.formatEquipmentListItem(item, distance),
        _rankScore: rankScore,
      };
    });

    // 按推广分数重新排序（推广分数 > 原排序）
    if (sort !== 'price_asc' && sort !== 'price_desc') {
      items.sort((a: any, b: any) => {
        // 先按推广分数排序
        if (b._rankScore !== a._rankScore) {
          return b._rankScore - a._rankScore;
        }
        // 推广分数相同时，按原排序规则
        if (sort === 'latest' || sort === 'time') {
          return 0; // 保持原顺序（已按createdAt排序）
        }
        if (sort === 'views' || sort === 'hot') {
          return (b.viewCount || 0) - (a.viewCount || 0);
        }
        return 0;
      });
    }

    // 移除内部排序字段
    const result = items.map(({ _rankScore, ...rest }: any) => rest);

    // 如果按距离排序，重新排序
    if (sort === 'distance' && latitude && longitude) {
      result.sort((a: any, b: any) => (a.distance || Infinity) - (b.distance || Infinity));
    }

    return {
      list: result,
      total,
      page,
      pageSize,
    };
  }

  // 计算推广分数（根据区域匹配度）
  private calculateRankScore(
    equipment: any,
    currentRegion: { provinceId?: number; cityId?: number; countyId?: number }
  ): number {
    // 未推广或已过期
    if (!equipment.rankLevel || equipment.rankLevel === 0) return 0;
    if (equipment.rankExpire && new Date(equipment.rankExpire) < new Date()) return 0;

    const rankRegion = equipment.rankRegion; // province/city/county
    if (!rankRegion) return 0;

    // 基础分数：置顶(2) > 推荐(1)
    const baseScore = equipment.rankLevel === 2 ? 200 : 100;

    // 区域匹配检查
    // 省级推广：在该省下的所有市县都有效
    if (rankRegion === 'province') {
      if (currentRegion.provinceId && equipment.provinceId === currentRegion.provinceId) {
        return baseScore + 30; // 省级推广，区域匹配
      }
      if (!currentRegion.provinceId) {
        return baseScore + 10; // 省级推广，无区域筛选时也有效但分数较低
      }
    }

    // 市级推广：在该市下的所有县都有效
    if (rankRegion === 'city') {
      if (currentRegion.cityId && equipment.cityId === currentRegion.cityId) {
        return baseScore + 20; // 市级推广，区域匹配
      }
      if (currentRegion.provinceId && equipment.provinceId === currentRegion.provinceId && !currentRegion.cityId) {
        return baseScore + 5; // 市级推广，省级筛选时部分有效
      }
    }

    // 县级推广：仅在该县有效
    if (rankRegion === 'county') {
      if (currentRegion.countyId && equipment.countyId === currentRegion.countyId) {
        return baseScore + 10; // 县级推广，区域匹配
      }
      if (currentRegion.cityId && equipment.cityId === currentRegion.cityId && !currentRegion.countyId) {
        return baseScore + 3; // 县级推广，市级筛选时部分有效
      }
    }

    return 0; // 区域不匹配，不应用推广
  }

  // 我的设备列表
  async myList(userId: bigint, status?: number, page = 1, pageSize = 20) {
    const skip = (page - 1) * pageSize;
    const where: any = {
      userId,
      status: { not: 4 }, // 不包括已删除
    };

    if (status !== undefined) {
      where.status = status;
    }

    const [list, total] = await Promise.all([
      prisma.equipment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.equipment.count({ where }),
    ]);

    return {
      list: list.map((item: any) => this.formatEquipmentListItem(item)),
      total,
      page,
      pageSize,
    };
  }

  // 查看联系方式
  async viewContact(equipmentId: bigint, userId: bigint, type: string, ipAddress: string) {
    const equipment = await this.getById(equipmentId);

    if (equipment.status !== 1) {
      throw new BadRequestError('设备未发布');
    }

    // 检查是否已查看过
    const existingView = await prisma.contactView.findFirst({
      where: {
        equipmentId,
        userId,
      },
    });

    if (!existingView) {
      // 检查查看限制
      await this.checkContactLimit(userId);

      // 记录查看
      await prisma.contactView.create({
        data: {
          equipmentId,
          userId,
          viewType: type,
          ipAddress,
        },
      });

      // 增加联系次数
      await prisma.equipment.update({
        where: { id: equipmentId },
        data: { contactCount: { increment: 1 } },
      });
    }

    return {
      phone: type === 'phone' ? equipment.phone : undefined,
      wechat: type === 'wechat' ? equipment.wechat : undefined,
    };
  }

  // 检查发布限制
  private async checkPublishLimit(userId: bigint) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('用户不存在');
    }

    // 新用户：10次/天
    if (user.userLevel === 0) {
      const todayCount = await this.getTodayPublishCount(userId);
      if (todayCount >= 10) {
        throw new BadRequestError('今日发布次数已达上限');
      }
    }

    // 普通用户：50次/天
    if (user.userLevel === 1) {
      const todayCount = await this.getTodayPublishCount(userId);
      if (todayCount >= 50) {
        throw new BadRequestError('今日发布次数已达上限');
      }
    }
  }

  // 检查联系方式查看限制
  private async checkContactLimit(userId: bigint) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('用户不存在');
    }

    const todayCount = await this.getTodayContactCount(userId);

    let limit = 50; // 普通用户
    if (user.userLevel === 2) limit = 100; // 优质用户
    if (user.userLevel === 3) limit = 200; // 认证用户

    if (todayCount >= limit) {
      throw new BadRequestError('今日查看次数已达上限');
    }
  }

  // 获取今日发布数量
  private async getTodayPublishCount(userId: bigint): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return prisma.equipment.count({
      where: {
        userId,
        createdAt: { gte: today },
      },
    });
  }

  // 获取今日联系查看数量
  private async getTodayContactCount(userId: bigint): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return prisma.contactView.count({
      where: {
        userId,
        createdAt: { gte: today },
      },
    });
  }

  // 计算风险评分
  private async calculateRiskScore(data: any): Promise<number> {
    let score = 0;

    // 敏感词检测
    const sensitiveWords = ['假', '骗', '黑'];
    const text = `${data.model} ${data.description || ''}`;
    if (sensitiveWords.some((word) => text.includes(word))) {
      score += 20;
    }

    // 价格异常
    if (data.price < 10 || data.price > 10000) {
      score += 20;
    }

    // 信息不完整
    if (!data.description || data.description.length < 10) {
      score += 15;
    }

    if (!data.images || data.images.length === 0) {
      score += 10;
    }

    return Math.min(score, 100);
  }

  // 获取设备（内部使用）
  private async getById(id: bigint) {
    const equipment = await prisma.equipment.findUnique({
      where: { id },
    });

    if (!equipment) {
      throw new NotFoundError('设备不存在');
    }

    return equipment;
  }

  // 格式化设备详情
  private formatEquipment(equipment: any, distance?: number) {
    return {
      id: equipment.id.toString(),
      userId: equipment.userId.toString(),
      category1: equipment.category1,
      category2: equipment.category2,
      model: equipment.model,
      provinceId: equipment.provinceId,
      cityId: equipment.cityId,
      countyId: equipment.countyId,
      province: equipment.province?.name || '',
      city: equipment.city?.name || '',
      county: equipment.county?.name || '',
      address: equipment.address,
      latitude: equipment.latitude ? parseFloat(equipment.latitude.toString()) : null,
      longitude: equipment.longitude ? parseFloat(equipment.longitude.toString()) : null,
      price: parseFloat(equipment.price.toString()),
      priceUnit: equipment.priceUnit,
      phone: equipment.phone,
      wechat: equipment.wechat,
      images: equipment.images,
      description: equipment.description,
      capacity: equipment.capacity,
      availableStart: equipment.availableStart?.toISOString(),
      availableEnd: equipment.availableEnd?.toISOString(),
      status: equipment.status,
      rejectReason: equipment.rejectReason,
      rankLevel: equipment.rankLevel,
      rankExpire: equipment.rankExpire?.toISOString(),
      rankRegion: equipment.rankRegion,
      viewCount: equipment.viewCount,
      contactCount: equipment.contactCount,
      favoriteCount: equipment.favoriteCount,
      scanCount: equipment.scanCount,
      rating: parseFloat(equipment.rating.toString()),
      ratingCount: equipment.ratingCount,
      qrcodeUrl: equipment.qrcodeUrl,
      distance,
      user: equipment.user
        ? {
            id: equipment.user.id.toString(),
            nickname: equipment.user.nickname,
            avatar: equipment.user.avatar,
            userLevel: equipment.user.userLevel,
          }
        : undefined,
      createdAt: equipment.createdAt.toISOString(),
      updatedAt: equipment.updatedAt.toISOString(),
    };
  }

  // 格式化列表项
  private formatEquipmentListItem(equipment: any, distance?: number) {
    return {
      id: equipment.id.toString(),
      model: equipment.model,
      category1: equipment.category1,
      category2: equipment.category2,
      images: equipment.images,
      price: parseFloat(equipment.price.toString()),
      priceUnit: equipment.priceUnit,
      province: equipment.province?.name || '',
      city: equipment.city?.name || '',
      county: equipment.county?.name || '',
      rankLevel: equipment.rankLevel,
      rating: parseFloat(equipment.rating.toString()),
      ratingCount: equipment.ratingCount,
      distance,
      viewCount: equipment.viewCount,
      status: equipment.status,
      user: equipment.user
        ? {
            id: equipment.user.id.toString(),
            nickname: equipment.user.nickname,
            avatar: equipment.user.avatar,
            userLevel: equipment.user.userLevel,
          }
        : undefined,
    };
  }
}

export const equipmentService = new EquipmentService();
