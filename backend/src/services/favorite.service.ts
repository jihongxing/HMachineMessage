import { prisma } from './prisma';
import { NotFoundError, BadRequestError } from '../utils/errors';

export class FavoriteService {
  async addFavorite(userId: bigint, equipmentId: bigint) {
    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId },
    });

    if (!equipment) {
      throw new NotFoundError('设备不存在');
    }

    if (equipment.status !== 1) {
      throw new BadRequestError('设备未发布，无法收藏');
    }

    const existing = await prisma.favorite.findUnique({
      where: {
        equipmentId_userId: {
          equipmentId,
          userId,
        },
      },
    });

    if (existing) {
      return { message: '已收藏' };
    }

    await prisma.$transaction([
      prisma.favorite.create({
        data: {
          equipmentId,
          userId,
        },
      }),
      prisma.equipment.update({
        where: { id: equipmentId },
        data: {
          favoriteCount: {
            increment: 1,
          },
        },
      }),
    ]);

    return { message: '收藏成功' };
  }

  async removeFavorite(userId: bigint, equipmentId: bigint) {
    const favorite = await prisma.favorite.findUnique({
      where: {
        equipmentId_userId: {
          equipmentId,
          userId,
        },
      },
    });

    if (!favorite) {
      throw new NotFoundError('收藏不存在');
    }

    await prisma.$transaction([
      prisma.favorite.delete({
        where: {
          equipmentId_userId: {
            equipmentId,
            userId,
          },
        },
      }),
      prisma.equipment.update({
        where: { id: equipmentId },
        data: {
          favoriteCount: {
            decrement: 1,
          },
        },
      }),
    ]);

    return { message: '取消收藏成功' };
  }

  async getMyFavorites(userId: bigint, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;

    const [favorites, total] = await Promise.all([
      prisma.favorite.findMany({
        where: { userId },
        include: {
          equipment: {
            include: {
              province: { select: { id: true, name: true } },
              city: { select: { id: true, name: true } },
              county: { select: { id: true, name: true } },
              user: {
                select: {
                  id: true,
                  nickname: true,
                  avatar: true,
                  userLevel: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.favorite.count({
        where: { userId },
      }),
    ]);

    return {
      list: favorites.map((f) => ({
        id: f.id.toString(),
        equipmentId: f.equipmentId.toString(),
        userId: f.userId.toString(),
        createdAt: f.createdAt.toISOString(),
        equipment: f.equipment
          ? {
              id: f.equipment.id.toString(),
              model: f.equipment.model,
              category1: f.equipment.category1,
              category2: f.equipment.category2,
              province: f.equipment.province?.name || '',
              city: f.equipment.city?.name || '',
              county: f.equipment.county?.name || '',
              address: f.equipment.address,
              images: f.equipment.images as string[],
              price: Number(f.equipment.price),
              priceUnit: f.equipment.priceUnit,
              rankLevel: f.equipment.rankLevel,
              rating: Number(f.equipment.rating),
              ratingCount: f.equipment.ratingCount,
              viewCount: f.equipment.viewCount,
              contactCount: f.equipment.contactCount,
              favoriteCount: f.equipment.favoriteCount,
              status: f.equipment.status,
              user: {
                id: f.equipment.user.id.toString(),
                nickname: f.equipment.user.nickname,
                avatar: f.equipment.user.avatar,
                userLevel: f.equipment.user.userLevel,
              },
            }
          : undefined,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async checkFavorite(userId: bigint, equipmentId: bigint) {
    const favorite = await prisma.favorite.findUnique({
      where: {
        equipmentId_userId: {
          equipmentId,
          userId,
        },
      },
    });

    return { isFavorite: !!favorite };
  }
}

export const favoriteService = new FavoriteService();
