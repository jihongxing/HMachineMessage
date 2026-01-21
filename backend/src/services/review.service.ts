import { prisma } from './prisma';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';

export class ReviewService {
  async createReview(
    userId: bigint,
    equipmentId: bigint,
    rating: number,
    content: string,
    images?: string[],
    tags?: string[]
  ) {
    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId },
    });

    if (!equipment) {
      throw new NotFoundError('设备不存在');
    }

    const existing = await prisma.review.findFirst({
      where: {
        equipmentId,
        userId,
      },
    });

    if (existing) {
      throw new BadRequestError('您已评价过该设备');
    }

    const review = await prisma.review.create({
      data: {
        equipmentId,
        userId,
        rating,
        content,
        images: images || [],
        tags: tags || [],
      },
    });

    return {
      id: review.id.toString(),
      message: '评价成功，等待审核',
    };
  }

  async updateReview(
    reviewId: bigint,
    userId: bigint,
    rating: number,
    content: string,
    images?: string[],
    tags?: string[]
  ) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundError('评价不存在');
    }

    if (review.userId !== userId) {
      throw new ForbiddenError('无权修改此评价');
    }

    const daysSinceCreated = Math.floor(
      (Date.now() - review.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceCreated > 7) {
      throw new BadRequestError('评价发布超过7天，无法修改');
    }

    const updated = await prisma.review.update({
      where: { id: reviewId },
      data: {
        rating,
        content,
        images: images || [],
        tags: tags || [],
        status: 0,
      },
    });

    return {
      id: updated.id.toString(),
      message: '修改成功，等待审核',
    };
  }

  async getEquipmentReviews(
    equipmentId: bigint,
    page: number,
    pageSize: number,
    sort: 'time' | 'rating' = 'time'
  ) {
    const skip = (page - 1) * pageSize;

    const orderBy =
      sort === 'rating'
        ? [{ rating: 'desc' as const }, { createdAt: 'desc' as const }]
        : [{ createdAt: 'desc' as const }];

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: {
          equipmentId,
          status: 1,
        },
        include: {
          user: {
            select: {
              id: true,
              nickname: true,
              avatar: true,
              userLevel: true,
            },
          },
        },
        orderBy,
        skip,
        take: pageSize,
      }),
      prisma.review.count({
        where: {
          equipmentId,
          status: 1,
        },
      }),
    ]);

    return {
      list: reviews.map((r) => ({
        id: r.id.toString(),
        equipmentId: r.equipmentId.toString(),
        userId: r.userId.toString(),
        rating: r.rating,
        content: r.content,
        images: r.images as string[] | null,
        tags: r.tags as string[] | null,
        status: r.status,
        reportCount: r.reportCount,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
        user: {
          id: r.user.id.toString(),
          nickname: r.user.nickname,
          avatar: r.user.avatar,
          userLevel: r.user.userLevel,
        },
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async reportReview(reviewId: bigint, reporterId: bigint, reason: string, images?: string[]) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundError('评价不存在');
    }

    await prisma.$transaction([
      prisma.report.create({
        data: {
          targetType: 'review',
          targetId: reviewId,
          reporterId,
          reason,
          images: images || [],
        },
      }),
      prisma.review.update({
        where: { id: reviewId },
        data: {
          reportCount: {
            increment: 1,
          },
        },
      }),
    ]);

    return { message: '举报成功' };
  }
}

export const reviewService = new ReviewService();
