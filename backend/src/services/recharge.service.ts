import { prisma } from './prisma';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';
import { notificationService } from './notification.service';

export class RechargeService {
  private readonly BONUS_RULES = [
    { amount: 1000, bonus: 150 },
    { amount: 500, bonus: 50 },
    { amount: 100, bonus: 10 },
  ];

  private calculateBonus(amount: number): number {
    for (const rule of this.BONUS_RULES) {
      if (amount >= rule.amount) {
        return rule.bonus;
      }
    }
    return 0;
  }

  async createRecharge(userId: bigint, amount: number, payMethod: 'wechat' | 'alipay') {
    if (amount < 1 || amount > 10000) {
      throw new BadRequestError('充值金额范围：1-10000元');
    }

    const bonusAmount = this.calculateBonus(amount);
    const orderNo = `RCH${Date.now()}${Math.random().toString().slice(2, 8)}`;

    const recharge = await prisma.recharge.create({
      data: {
        userId,
        orderNo,
        amount,
        bonusAmount,
        payMethod,
      },
    });

    return {
      rechargeId: recharge.id.toString(),
      orderNo: recharge.orderNo,
      amount: Number(recharge.amount),
      bonusAmount: Number(recharge.bonusAmount),
      payUrl: `${payMethod}://pay/${recharge.orderNo}`,
      qrcode: `https://cdn.example.com/qrcode/${recharge.orderNo}.png`,
    };
  }

  async handleRechargeCallback(orderNo: string) {
    const recharge = await prisma.recharge.findUnique({
      where: { orderNo },
    });

    if (!recharge) {
      throw new NotFoundError('充值订单不存在');
    }

    if (recharge.status !== 0) {
      return { message: '订单已处理' };
    }

    const totalAmount = Number(recharge.amount) + Number(recharge.bonusAmount);

    await prisma.$transaction([
      prisma.recharge.update({
        where: { orderNo },
        data: {
          status: 1,
          paidAt: new Date(),
        },
      }),
      prisma.user.update({
        where: { id: recharge.userId },
        data: {
          balance: {
            increment: totalAmount,
          },
        },
      }),
    ]);

    await notificationService.createNotification(
      recharge.userId,
      'payment',
      '充值成功',
      `充值${recharge.amount}元成功，赠送${recharge.bonusAmount}元，已到账`,
      recharge.id
    );

    return { message: '充值成功' };
  }

  async getRechargeHistory(userId: bigint, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;

    const [recharges, total] = await Promise.all([
      prisma.recharge.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.recharge.count({
        where: { userId },
      }),
    ]);

    return {
      list: recharges.map((r) => ({
        id: r.id.toString(),
        userId: r.userId.toString(),
        orderNo: r.orderNo,
        amount: Number(r.amount),
        bonusAmount: Number(r.bonusAmount),
        payMethod: r.payMethod,
        status: r.status,
        paidAt: r.paidAt?.toISOString() || null,
        createdAt: r.createdAt.toISOString(),
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}

export const rechargeService = new RechargeService();
