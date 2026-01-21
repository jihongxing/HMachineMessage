import { prisma } from './prisma';
import { cache } from './cache';
import { BadRequestError } from '../utils/errors';

export class SmsService {
  // 发送验证码
  async sendCode(phone: string, type: string, ipAddress: string): Promise<void> {
    // 检查频率限制
    await this.checkRateLimit(phone, ipAddress);

    // 生成6位验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expireAt = new Date(Date.now() + 5 * 60 * 1000); // 5分钟有效期

    // 保存到数据库
    await prisma.smsCode.create({
      data: {
        phone,
        code,
        type,
        ipAddress,
        expireAt,
      },
    });

    // 缓存验证码（用于快速验证）
    await cache.set(`sms:${phone}:${type}`, code, 300);

    // TODO: 调用短信服务商API发送验证码
    console.log(`发送验证码到 ${phone}: ${code}`);
  }

  // 验证验证码
  async verifyCode(phone: string, code: string, type: string): Promise<boolean> {
    // 先从缓存查询
    const cachedCode = await cache.get(`sms:${phone}:${type}`);
    if (cachedCode === code) {
      // 标记为已使用
      await cache.del(`sms:${phone}:${type}`);
      return true;
    }

    // 从数据库查询
    const smsCode = await prisma.smsCode.findFirst({
      where: {
        phone,
        code,
        type,
        isUsed: false,
        expireAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!smsCode) {
      return false;
    }

    // 标记为已使用
    await prisma.smsCode.update({
      where: { id: smsCode.id },
      data: { isUsed: true },
    });

    return true;
  }

  // 检查频率限制
  private async checkRateLimit(phone: string, ipAddress: string): Promise<void> {
    // 开发环境跳过频率限制
    if (process.env.NODE_ENV === 'development') {
      return;
    }

    const now = Date.now();
    const oneMinute = 60 * 1000;
    const oneDay = 24 * 60 * 60 * 1000;

    // 检查60秒内是否发送过
    const lastSendTime = await cache.get(`sms:limit:${phone}:last`);
    if (lastSendTime && now - parseInt(lastSendTime) < oneMinute) {
      throw new BadRequestError('发送过于频繁，请稍后再试');
    }

    // 检查今日发送次数（手机号）
    const phoneCount = await cache.get(`sms:limit:${phone}:count`);
    if (phoneCount && parseInt(phoneCount) >= 10) {
      throw new BadRequestError('今日发送次数已达上限');
    }

    // 检查今日发送次数（IP）
    const ipCount = await cache.get(`sms:limit:${ipAddress}:count`);
    if (ipCount && parseInt(ipCount) >= 50) {
      throw new BadRequestError('今日发送次数已达上限');
    }

    // 更新限制
    await cache.set(`sms:limit:${phone}:last`, now.toString(), 60);
    await cache.incr(`sms:limit:${phone}:count`, oneDay / 1000);
    await cache.incr(`sms:limit:${ipAddress}:count`, oneDay / 1000);
  }
}

export const smsService = new SmsService();
