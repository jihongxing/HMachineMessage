import { prisma } from './prisma';

export class NotificationService {
  async createNotification(
    userId: bigint,
    type: 'audit' | 'payment' | 'interaction' | 'system',
    title: string,
    content: string,
    relatedId?: bigint
  ) {
    await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        content,
        relatedId,
      },
    });
  }

  async getNotifications(
    userId: bigint,
    type: string | undefined,
    isRead: boolean | undefined,
    page: number,
    pageSize: number
  ) {
    const skip = (page - 1) * pageSize;

    const where: any = { userId };
    if (type) where.type = type;
    if (isRead !== undefined) where.isRead = isRead;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.notification.count({ where }),
    ]);

    return {
      list: notifications.map((n) => ({
        id: n.id.toString(),
        userId: n.userId.toString(),
        type: n.type,
        title: n.title,
        content: n.content,
        relatedId: n.relatedId?.toString() || null,
        isRead: n.isRead,
        createdAt: n.createdAt.toISOString(),
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async markAsRead(notificationId: bigint, userId: bigint) {
    await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        isRead: true,
      },
    });

    return { message: '已标记为已读' };
  }

  async markAllAsRead(userId: bigint) {
    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return { message: '全部标记为已读' };
  }

  async getUnreadCount(userId: bigint) {
    const [total, audit, payment, interaction, system] = await Promise.all([
      prisma.notification.count({
        where: { userId, isRead: false },
      }),
      prisma.notification.count({
        where: { userId, isRead: false, type: 'audit' },
      }),
      prisma.notification.count({
        where: { userId, isRead: false, type: 'payment' },
      }),
      prisma.notification.count({
        where: { userId, isRead: false, type: 'interaction' },
      }),
      prisma.notification.count({
        where: { userId, isRead: false, type: 'system' },
      }),
    ]);

    return {
      total,
      audit,
      payment,
      interaction,
      system,
    };
  }
}

export const notificationService = new NotificationService();
