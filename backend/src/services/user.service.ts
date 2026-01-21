import { prisma } from './prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { BadRequestError, NotFoundError } from '../utils/errors';

export class UserService {
  // 获取用户信息
  async getProfile(userId: bigint) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('用户不存在');
    }

    return {
      id: user.id.toString(),
      phone: this.maskPhone(user.phone),
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
    };
  }

  // 更新用户信息
  async updateProfile(userId: bigint, data: { nickname?: string; avatar?: string }) {
    await prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  // 修改密码
  async changePassword(userId: bigint, oldPassword: string, newPassword: string) {
    // 密码强度验证
    if (newPassword.length < 6 || newPassword.length > 20) {
      throw new BadRequestError('密码长度必须在6-20位之间');
    }
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.password) {
      throw new BadRequestError('用户不存在或未设置密码');
    }

    // 验证旧密码
    const isValid = await comparePassword(oldPassword, user.password);
    if (!isValid) {
      throw new BadRequestError('原密码错误');
    }

    // 更新密码
    const hashedPassword = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  // 实名认证
  async verifyRealName(userId: bigint, realName: string, idCard: string) {
    // TODO: 调用实名认证API
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        realName,
        idCard, // 实际应该加密存储
        userLevel: 3,
      },
    });
  }

  // 企业认证
  async verifyCompany(
    userId: bigint,
    data: {
      companyName: string;
      businessLicense: string;
      legalPerson: string;
      licenseImage: string;
    }
  ) {
    // TODO: 调用企业认证API
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        companyName: data.companyName,
        businessLicense: data.businessLicense,
        realName: data.legalPerson,
        userLevel: 3,
      },
    });
  }

  // 手机号脱敏
  private maskPhone(phone: string): string {
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
  }
}

export const userService = new UserService();
