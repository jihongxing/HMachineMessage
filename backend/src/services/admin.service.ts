import { prisma } from './prisma';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/errors';

export class AdminService {
  // 审核设备
  async auditEquipment(
    auditorId: bigint,
    equipmentId: bigint,
    action: 'approve' | 'reject',
    reason?: string
  ) {
    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId },
    });

    if (!equipment) {
      throw new NotFoundError('设备不存在');
    }

    if (equipment.status !== 0) {
      throw new BadRequestError('设备不在待审核状态');
    }

    const newStatus = action === 'approve' ? 1 : 2;

    // 更新设备状态
    await prisma.equipment.update({
      where: { id: equipmentId },
      data: {
        status: newStatus,
        rejectReason: action === 'reject' ? reason : null,
      },
    });

    // 记录审核日志
    await prisma.auditLog.create({
      data: {
        equipmentId,
        auditorId,
        action,
        reason,
        riskScore: equipment.riskScore,
      },
    });

    // 创建通知
    await prisma.notification.create({
      data: {
        userId: equipment.userId,
        type: 'audit',
        title: action === 'approve' ? '设备审核通过' : '设备审核未通过',
        content:
          action === 'approve'
            ? '您的设备信息已通过审核，现已发布'
            : `您的设备信息未通过审核，原因：${reason}`,
        relatedId: equipmentId,
      },
    });

    // 如果通过，更新用户统计
    if (action === 'approve') {
      await prisma.user.update({
        where: { id: equipment.userId },
        data: {
          passCount: { increment: 1 },
        },
      });
    }
  }

  // 待审核列表
  async getPendingList(params: {
    riskScoreMin?: number;
    riskScoreMax?: number;
    page: number;
    pageSize: number;
  }) {
    const { page, pageSize, riskScoreMin, riskScoreMax } = params;
    const skip = (page - 1) * pageSize;

    const where: any = {
      status: 0,
    };

    if (riskScoreMin !== undefined || riskScoreMax !== undefined) {
      where.riskScore = {};
      if (riskScoreMin !== undefined) where.riskScore.gte = riskScoreMin;
      if (riskScoreMax !== undefined) where.riskScore.lte = riskScoreMax;
    }

    const [list, total] = await Promise.all([
      prisma.equipment.findMany({
        where,
        orderBy: [{ riskScore: 'desc' }, { createdAt: 'asc' }],
        skip,
        take: pageSize,
        include: {
          user: {
            select: {
              id: true,
              nickname: true,
              phone: true,
              userLevel: true,
              violationCount: true,
            },
          },
        },
      }),
      prisma.equipment.count({ where }),
    ]);

    return {
      list: list.map((item: any) => ({
        id: item.id.toString(),
        userId: item.userId.toString(),
        model: item.model,
        images: item.images,
        description: item.description,
        riskScore: item.riskScore,
        user: {
          id: item.user.id.toString(),
          nickname: item.user.nickname,
          phone: item.user.phone,
          userLevel: item.user.userLevel,
          violationCount: item.user.violationCount,
        },
        createdAt: item.createdAt.toISOString(),
      })),
      total,
      page,
      pageSize,
    };
  }

  // 用户列表
  async getUserList(params: {
    keyword?: string;
    userLevel?: string;
    status?: string;
    page: number;
    pageSize: number;
  }) {
    const { page, pageSize, keyword, userLevel, status } = params;
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (keyword) {
      where.OR = [
        { phone: { contains: keyword } },
        { nickname: { contains: keyword } },
      ];
    }

    if (userLevel) {
      const levels = userLevel.split(',').map(Number);
      where.userLevel = { in: levels };
    }

    if (status) {
      const statuses = status.split(',').map(Number);
      where.status = { in: statuses };
    }

    const [list, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      list: list.map((user: any) => ({
        id: user.id.toString(),
        phone: user.phone,
        nickname: user.nickname,
        avatar: user.avatar,
        userLevel: user.userLevel,
        realName: user.realName,
        companyName: user.companyName,
        balance: parseFloat(user.balance.toString()),
        publishCount: user.publishCount,
        passCount: user.passCount,
        violationCount: user.violationCount,
        status: user.status,
        lastLogin: user.lastLogin?.toISOString(),
        createdAt: user.createdAt.toISOString(),
      })),
      total,
      page,
      pageSize,
    };
  }

  // 封禁/解封用户
  async updateUserStatus(
    userId: bigint,
    action: 'ban' | 'unban',
    reason?: string,
    duration?: number
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('用户不存在');
    }

    const newStatus = action === 'ban' ? 1 : 0;

    await prisma.user.update({
      where: { id: userId },
      data: { status: newStatus },
    });

    // 创建通知
    await prisma.notification.create({
      data: {
        userId,
        type: 'system',
        title: action === 'ban' ? '账号已被封禁' : '账号已解封',
        content:
          action === 'ban'
            ? `您的账号已被封禁${duration ? `${duration}天` : ''}，原因：${reason}`
            : '您的账号已解封，可以正常使用',
      },
    });

    // 如果封禁，下架所有设备
    if (action === 'ban') {
      await prisma.equipment.updateMany({
        where: {
          userId,
          status: 1,
        },
        data: { status: 3 },
      });
    }
  }

  // 数据统计
  async getStats(startDate?: Date, endDate?: Date) {
    const dateFilter = startDate && endDate ? {
      gte: startDate,
      lte: endDate,
    } : undefined;

    // 用户统计
    const [totalUsers, newUsers, activeUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: dateFilter ? { createdAt: dateFilter } : undefined,
      }),
      prisma.user.count({
        where: dateFilter ? { lastLogin: dateFilter } : { lastLogin: { not: null } },
      }),
    ]);

    // 设备统计
    const [totalEquipment, newEquipment, pendingEquipment] = await Promise.all([
      prisma.equipment.count({ where: { status: { not: 4 } } }),
      prisma.equipment.count({
        where: {
          status: { not: 4 },
          ...(dateFilter ? { createdAt: dateFilter } : {}),
        },
      }),
      prisma.equipment.count({ where: { status: 0 } }),
    ]);

    // 订单统计
    const orders = await prisma.order.aggregate({
      where: {
        status: 1, // 只统计已支付订单
        ...(dateFilter ? { paidAt: dateFilter } : {}),
      },
      _count: true,
      _sum: { amount: true },
    });

    const paidOrders = await prisma.order.count({
      where: {
        status: 1,
        ...(dateFilter ? { paidAt: dateFilter } : {}),
      },
    });

    // 审核统计
    const [totalAudits, autoAudits, manualAudits] = await Promise.all([
      prisma.auditLog.count({
        where: dateFilter ? { createdAt: dateFilter } : undefined,
      }),
      prisma.auditLog.count({
        where: {
          auditorId: null,
          ...(dateFilter ? { createdAt: dateFilter } : {}),
        },
      }),
      prisma.auditLog.count({
        where: {
          auditorId: { not: null },
          ...(dateFilter ? { createdAt: dateFilter } : {}),
        },
      }),
    ]);

    return {
      users: {
        total: totalUsers,
        new: newUsers,
        active: activeUsers,
      },
      equipment: {
        total: totalEquipment,
        new: newEquipment,
        pending: pendingEquipment,
      },
      orders: {
        total: orders._count,
        amount: parseFloat(orders._sum.amount?.toString() || '0'),
        paid: paidOrders,
      },
      audit: {
        total: totalAudits,
        auto: autoAudits,
        manual: manualAudits,
        avgTime: 300, // TODO: 计算平均审核时间
      },
    };
  }

  // 设备管理列表（所有状态）
  async getEquipmentList(params: {
    status?: number;
    keyword?: string;
    page: number;
    pageSize: number;
  }) {
    const { page, pageSize, status, keyword } = params;
    const skip = (page - 1) * pageSize;

    const where: any = {
      status: { not: 4 }, // 排除已删除
    };

    if (status !== undefined) {
      where.status = status;
    }

    if (keyword) {
      where.OR = [
        { model: { contains: keyword } },
        { description: { contains: keyword } },
      ];
    }

    const [list, total] = await Promise.all([
      prisma.equipment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        include: {
          user: {
            select: {
              id: true,
              nickname: true,
              phone: true,
            },
          },
          province: { select: { name: true } },
          city: { select: { name: true } },
          county: { select: { name: true } },
        },
      }),
      prisma.equipment.count({ where }),
    ]);

    return {
      list: list.map((item: any) => ({
        id: item.id.toString(),
        userId: item.userId.toString(),
        model: item.model,
        category1: item.category1,
        category2: item.category2,
        province: item.province?.name || '',
        city: item.city?.name || '',
        county: item.county?.name || '',
        price: parseFloat(item.price.toString()),
        priceUnit: item.priceUnit,
        images: item.images,
        status: item.status,
        viewCount: item.viewCount,
        user: {
          id: item.user.id.toString(),
          nickname: item.user.nickname,
          phone: item.user.phone,
        },
        createdAt: item.createdAt.toISOString(),
      })),
      total,
      page,
      pageSize,
    };
  }

  // 更新设备状态（管理员）
  async updateEquipmentStatus(equipmentId: bigint, status: number) {
    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId },
    });

    if (!equipment) {
      throw new NotFoundError('设备不存在');
    }

    if (equipment.status === 4) {
      throw new BadRequestError('设备已删除');
    }

    await prisma.equipment.update({
      where: { id: equipmentId },
      data: { status },
    });

    // 创建通知
    const statusText: Record<number, string> = {
      0: '待审核',
      1: '已发布',
      2: '审核拒绝',
      3: '已下架',
    };

    await prisma.notification.create({
      data: {
        userId: equipment.userId,
        type: 'system',
        title: '设备状态变更',
        content: `您的设备"${equipment.model}"状态已变更为：${statusText[status] || '未知'}`,
        relatedId: equipmentId,
      },
    });
  }

  // 批量更新设备状态
  async batchUpdateEquipmentStatus(ids: bigint[], status: number) {
    await prisma.equipment.updateMany({
      where: {
        id: { in: ids },
        status: { not: 4 },
      },
      data: { status },
    });
  }

  // 举报列表
  async getReportList(status?: number, page = 1, pageSize = 20) {
    const skip = (page - 1) * pageSize;
    const where: any = {};

    if (status !== undefined) {
      where.status = status;
    }

    const [list, total] = await Promise.all([
      prisma.report.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.report.count({ where }),
    ]);

    return {
      list: list.map((item: any) => ({
        id: item.id.toString(),
        targetType: item.targetType,
        targetId: item.targetId.toString(),
        reporterId: item.reporterId.toString(),
        reason: item.reason,
        images: item.images,
        status: item.status,
        handleResult: item.handleResult,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      })),
      total,
      page,
      pageSize,
    };
  }

  // 处理举报
  async handleReport(reportId: bigint, action: 'approve' | 'reject', result: string) {
    const report = await prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      throw new NotFoundError('举报不存在');
    }

    if (report.status !== 0) {
      throw new BadRequestError('举报已处理');
    }

    const newStatus = action === 'approve' ? 1 : 2;

    await prisma.report.update({
      where: { id: reportId },
      data: {
        status: newStatus,
        handleResult: result,
      },
    });

    // 如果举报成立，处理被举报对象
    if (action === 'approve') {
      if (report.targetType === 'equipment') {
        await prisma.equipment.update({
          where: { id: report.targetId },
          data: { status: 3 }, // 下架
        });
      } else if (report.targetType === 'review') {
        await prisma.review.update({
          where: { id: report.targetId },
          data: { status: 2 }, // 拒绝
        });
      }
    }
  }
}

export const adminService = new AdminService();
