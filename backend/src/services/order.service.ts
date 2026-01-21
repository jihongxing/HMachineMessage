import { prisma } from './prisma';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';
import { notificationService } from './notification.service';

export class OrderService {
  // 价格表：与前端保持一致
  private readonly RANK_PRICES = {
    1: { province: 500, city: 200, county: 100 }, // 推荐位
    2: { province: 800, city: 300, county: 150 }, // 置顶位
  };

  async createOrder(
    userId: bigint,
    equipmentId: bigint,
    rankLevel: number,
    rankRegion: 'province' | 'city' | 'county',
    duration: number
  ) {
    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId },
    });

    if (!equipment) {
      throw new NotFoundError('设备不存在');
    }

    if (equipment.userId !== userId) {
      throw new ForbiddenError('只能为自己的设备购买推广');
    }

    if (equipment.status !== 1) {
      throw new BadRequestError('设备未发布，无法购买推广');
    }

    if (rankLevel !== 1 && rankLevel !== 2) {
      throw new BadRequestError('档位参数错误');
    }

    const pricePerMonth = this.RANK_PRICES[rankLevel as 1 | 2][rankRegion];
    const amount = pricePerMonth * duration;

    const orderNo = `ORD${Date.now()}${Math.random().toString().slice(2, 8)}`;

    const order = await prisma.order.create({
      data: {
        orderNo,
        equipmentId,
        userId,
        rankLevel,
        rankRegion,
        duration,
        amount,
        payAmount: amount,
      },
    });

    return {
      orderId: order.id.toString(),
      orderNo: order.orderNo,
      amount: Number(order.amount),
      payAmount: Number(order.payAmount),
    };
  }

  async payOrder(orderId: bigint, userId: bigint, payMethod: 'wechat' | 'alipay' | 'balance') {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) {
      throw new NotFoundError('订单不存在');
    }

    if (order.userId !== userId) {
      throw new ForbiddenError('无权操作此订单');
    }

    if (order.status !== 0) {
      throw new BadRequestError('订单状态错误');
    }

    if (payMethod === 'balance') {
      // 使用行级锁防止并发修改
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
      
      if (!user || user.balance < order.payAmount) {
        throw new BadRequestError('余额不足');
      }

      const expireDate = new Date();
      expireDate.setMonth(expireDate.getMonth() + order.duration);

      await prisma.$transaction([
        prisma.order.update({
          where: { id: orderId },
          data: {
            status: 1,
            payMethod,
            paidAt: new Date(),
          },
        }),
        prisma.user.update({
          where: { id: userId },
          data: {
            balance: {
              decrement: order.payAmount,
            },
          },
        }),
        prisma.equipment.update({
          where: { id: order.equipmentId },
          data: {
            rankLevel: order.rankLevel,
            rankRegion: order.rankRegion,
            rankExpire: expireDate,
          },
        }),
      ]);

      await notificationService.createNotification(
        userId,
        'payment',
        '推广购买成功',
        `您的设备已成功购买${order.rankLevel === 1 ? '推荐' : '置顶'}位，有效期${order.duration}个月`,
        order.equipmentId
      );

      return { message: '支付成功' };
    }

    return {
      payUrl: `${payMethod}://pay/${order.orderNo}`,
      qrcode: `https://cdn.example.com/qrcode/${order.orderNo}.png`,
    };
  }

  async getMyOrders(userId: bigint, status: number | undefined, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;

    const where: any = { userId };
    if (status !== undefined) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          equipment: {
            select: {
              id: true,
              model: true,
              images: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.order.count({ where }),
    ]);

    return {
      list: orders.map((o) => ({
        id: o.id.toString(),
        orderNo: o.orderNo,
        equipmentId: o.equipmentId.toString(),
        userId: o.userId.toString(),
        rankLevel: o.rankLevel,
        rankRegion: o.rankRegion,
        duration: o.duration,
        amount: Number(o.amount),
        payAmount: Number(o.payAmount),
        payMethod: o.payMethod,
        status: o.status,
        paidAt: o.paidAt?.toISOString() || null,
        refundAt: o.refundAt?.toISOString() || null,
        refundAmount: o.refundAmount ? Number(o.refundAmount) : null,
        createdAt: o.createdAt.toISOString(),
        updatedAt: o.updatedAt.toISOString(),
        equipment: o.equipment
          ? {
              id: o.equipment.id.toString(),
              model: o.equipment.model,
              images: o.equipment.images as string[],
            }
          : undefined,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getOrderDetail(orderId: bigint, userId: bigint) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        equipment: {
          select: {
            id: true,
            model: true,
            images: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundError('订单不存在');
    }

    if (order.userId !== userId) {
      throw new ForbiddenError('无权查看此订单');
    }

    return {
      id: order.id.toString(),
      orderNo: order.orderNo,
      equipmentId: order.equipmentId.toString(),
      userId: order.userId.toString(),
      rankLevel: order.rankLevel,
      rankRegion: order.rankRegion,
      duration: order.duration,
      amount: Number(order.amount),
      payAmount: Number(order.payAmount),
      payMethod: order.payMethod,
      status: order.status,
      paidAt: order.paidAt?.toISOString() || null,
      refundAt: order.refundAt?.toISOString() || null,
      refundAmount: order.refundAmount ? Number(order.refundAmount) : null,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      equipment: order.equipment
        ? {
            id: order.equipment.id.toString(),
            model: order.equipment.model,
            images: order.equipment.images as string[],
          }
        : undefined,
    };
  }

  async refundOrder(orderId: bigint, userId: bigint, reason: string) {
    // 使用行级锁防止并发退款
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundError('订单不存在');
    }

    if (order.userId !== userId) {
      throw new ForbiddenError('无权操作此订单');
    }

    if (order.status !== 1) {
      throw new BadRequestError('订单状态错误');
    }

    await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: {
          status: 2,
          refundAt: new Date(),
          refundAmount: order.payAmount,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          balance: {
            increment: order.payAmount,
          },
        },
      }),
      prisma.equipment.update({
        where: { id: order.equipmentId },
        data: {
          rankLevel: 0,
          rankRegion: null,
          rankExpire: null,
        },
      }),
    ]);

    await notificationService.createNotification(
      userId,
      'payment',
      '退款成功',
      `订单${order.orderNo}已退款，金额已返回账户余额`,
      orderId
    );

    return { message: '退款成功' };
  }

  // 支付回调处理
  async handlePaymentCallback(orderNo: string, paymentData: {
    tradeNo: string;
    payMethod: string;
    amount: number;
    sign: string;
  }) {
    const order = await prisma.order.findUnique({
      where: { orderNo },
      include: { user: true },
    });

    if (!order) {
      throw new NotFoundError('订单不存在');
    }

    if (order.status !== 0) {
      return { message: '订单已处理' };
    }

    // TODO: 验证支付签名
    // const isValidSign = this.verifyPaymentSign(paymentData);
    // if (!isValidSign) {
    //   throw new BadRequestError('签名验证失败');
    // }

    // 验证金额
    if (Math.abs(paymentData.amount - Number(order.payAmount)) > 0.01) {
      throw new BadRequestError('支付金额不匹配');
    }

    const expireDate = new Date();
    expireDate.setMonth(expireDate.getMonth() + order.duration);

    await prisma.$transaction([
      prisma.order.update({
        where: { id: order.id },
        data: {
          status: 1,
          payMethod: paymentData.payMethod,
          paidAt: new Date(),
        },
      }),
      prisma.equipment.update({
        where: { id: order.equipmentId },
        data: {
          rankLevel: order.rankLevel,
          rankRegion: order.rankRegion,
          rankExpire: expireDate,
        },
      }),
    ]);

    await notificationService.createNotification(
      order.userId,
      'payment',
      '推广购买成功',
      `您的设备已成功购买${order.rankLevel === 1 ? '推荐' : '置顶'}位，有效期${order.duration}个月`,
      order.equipmentId
    );

    return { message: '支付成功' };
  }

  // 验证支付签名（示例）
  private verifyPaymentSign(paymentData: any): boolean {
    // TODO: 根据支付平台的签名算法验证
    // 示例：MD5(orderNo + amount + secret)
    return true;
  }
}

export const orderService = new OrderService();
