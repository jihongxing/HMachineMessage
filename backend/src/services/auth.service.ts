import { prisma } from './prisma';
import { smsService } from './sms.service';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { BadRequestError, UnauthorizedError } from '../utils/errors';

export class AuthService {
  // 注册
  async register(data: {
    phone: string;
    code: string;
    password: string;
    nickname: string;
  }) {
    // 手机号验证
    if (!/^1[3-9]\d{9}$/.test(data.phone)) {
      throw new BadRequestError('手机号格式错误');
    }
    
    // 密码强度验证
    if (data.password.length < 6 || data.password.length > 20) {
      throw new BadRequestError('密码长度必须在6-20位之间');
    }
    
    // 昵称验证
    if (data.nickname.length < 2 || data.nickname.length > 20) {
      throw new BadRequestError('昵称长度必须在2-20位之间');
    }
    
    // 验证验证码
    const isValid = await smsService.verifyCode(data.phone, data.code, 'register');
    if (!isValid) {
      throw new BadRequestError('验证码错误或已过期');
    }

    // 检查手机号是否已注册
    const existingUser = await prisma.user.findUnique({
      where: { phone: data.phone },
    });
    if (existingUser) {
      throw new BadRequestError('手机号已注册');
    }

    // 创建用户
    const hashedPassword = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        phone: data.phone,
        password: hashedPassword,
        nickname: data.nickname,
        lastLogin: new Date(),
      },
    });

    // 生成token
    const token = generateToken({
      userId: user.id.toString(),
      userLevel: user.userLevel,
    });

    return {
      token,
      user: this.formatUser(user),
    };
  }

  // 密码登录
  async login(phone: string, password: string) {
    // 手机号验证
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      throw new BadRequestError('手机号格式错误');
    }
    
    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user || !user.password) {
      throw new UnauthorizedError('手机号或密码错误');
    }

    // 检查用户状态
    if (user.status === 1) {
      throw new UnauthorizedError('账号已被封禁');
    }

    // 验证密码
    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      throw new UnauthorizedError('手机号或密码错误');
    }

    // 更新最后登录时间
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // 生成token
    const token = generateToken({
      userId: user.id.toString(),
      userLevel: user.userLevel,
    });

    return {
      token,
      user: this.formatUser(user),
    };
  }

  // 验证码登录
  async loginWithSms(phone: string, code: string) {
    // 手机号验证
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      throw new BadRequestError('手机号格式错误');
    }
    
    // 验证验证码
    const isValid = await smsService.verifyCode(phone, code, 'login');
    if (!isValid) {
      throw new BadRequestError('验证码错误或已过期');
    }

    let user = await prisma.user.findUnique({
      where: { phone },
    });

    // 验证码登录不自动注册，必须先注册
    if (!user) {
      throw new BadRequestError('手机号未注册，请先注册');
    }

    // 检查用户状态
    if (user.status === 1) {
      throw new UnauthorizedError('账号已被封禁');
    }

    // 更新最后登录时间
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // 生成token
    const token = generateToken({
      userId: user.id.toString(),
      userLevel: user.userLevel,
    });

    return {
      token,
      user: this.formatUser(user),
    };
  }

  // 重置密码
  async resetPassword(phone: string, code: string, newPassword: string) {
    // 手机号验证
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      throw new BadRequestError('手机号格式错误');
    }
    
    // 密码强度验证
    if (newPassword.length < 6 || newPassword.length > 20) {
      throw new BadRequestError('密码长度必须在6-20位之间');
    }
    
    // 验证验证码
    const isValid = await smsService.verifyCode(phone, code, 'reset');
    if (!isValid) {
      throw new BadRequestError('验证码错误或已过期');
    }

    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      throw new BadRequestError('用户不存在');
    }

    // 更新密码
    const hashedPassword = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });
  }

  // 格式化用户信息
  private formatUser(user: any) {
    return {
      id: user.id.toString(),
      phone: user.phone,
      nickname: user.nickname,
      avatar: user.avatar,
      userLevel: user.userLevel,
    };
  }
}

export const authService = new AuthService();
