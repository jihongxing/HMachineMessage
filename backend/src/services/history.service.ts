import { prisma } from './prisma';

export class HistoryService {
  async addViewHistory(userId: bigint, equipmentId: bigint) {
    await prisma.viewHistory.create({
      data: {
        userId,
        equipmentId,
      },
    });
  }

  async getViewHistory(userId: bigint, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;

    const histories = await prisma.viewHistory.findMany({
      where: { userId },
      select: {
        equipmentId: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
      distinct: ['equipmentId'],
    });

    const equipmentIds = histories.map((h) => h.equipmentId);

    const equipment = await prisma.equipment.findMany({
      where: {
        id: { in: equipmentIds },
        status: 1,
      },
      select: {
        id: true,
        model: true,
        images: true,
        price: true,
        priceUnit: true,
        city: true,
        county: true,
        rankLevel: true,
        rating: true,
        ratingCount: true,
      },
    });

    const equipmentMap = new Map(equipment.map((e) => [e.id.toString(), e]));

    const list = histories
      .map((h) => {
        const eq = equipmentMap.get(h.equipmentId.toString());
        if (!eq) return null;
        return {
          equipmentId: h.equipmentId.toString(),
          viewedAt: h.createdAt.toISOString(),
          equipment: {
            id: eq.id.toString(),
            model: eq.model,
            images: eq.images as string[],
            price: Number(eq.price),
            priceUnit: eq.priceUnit,
            city: eq.city,
            county: eq.county,
            rankLevel: eq.rankLevel,
            rating: Number(eq.rating),
            ratingCount: eq.ratingCount,
          },
        };
      })
      .filter((item) => item !== null);

    const total = await prisma.viewHistory.findMany({
      where: { userId },
      select: { equipmentId: true },
      distinct: ['equipmentId'],
    });

    return {
      list,
      total: total.length,
      page,
      pageSize,
      totalPages: Math.ceil(total.length / pageSize),
    };
  }

  async clearHistory(userId: bigint) {
    await prisma.viewHistory.deleteMany({
      where: { userId },
    });

    return { message: '清空成功' };
  }
}

export const historyService = new HistoryService();
