import { prisma } from './prisma';
import { calculateDistance } from '../utils/distance';
import { logger } from '../utils/logger';
import { amapService } from './amap.service';

export class LocationService {
  /**
   * 根据IP获取位置
   */
  async getLocationByIp(ip: string): Promise<{ province: string; city: string; ip: string }> {
    try {
      const result = await amapService.getLocationByIp(ip);
      return result || { province: '北京市', city: '北京市', ip };
    } catch (error) {
      logger.error('IP location error:', error);
      return { province: '北京市', city: '北京市', ip };
    }
  }

  /**
   * 地理编码：地址转坐标
   */
  async geocode(address: string): Promise<{ latitude: number; longitude: number } | null> {
    try {
      // 优先使用高德API
      const amapResult = await amapService.geocode(address);
      if (amapResult) {
        return amapResult;
      }

      // 降级：从数据库查询地区坐标
      const parts = address.split(/[省市县区]/);
      
      const region = await prisma.region.findFirst({
        where: {
          OR: parts.map(part => ({
            name: { contains: part.trim() },
          })),
        },
        orderBy: { level: 'desc' },
      });

      if (region?.latitude && region?.longitude) {
        return {
          latitude: Number(region.latitude),
          longitude: Number(region.longitude),
        };
      }

      return null;
    } catch (error) {
      logger.error('Geocode error:', error);
      return null;
    }
  }

  /**
   * 逆地理编码：坐标转地址
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
    try {
      // 优先使用高德API
      const amapResult = await amapService.reverseGeocode(latitude, longitude);
      if (amapResult) {
        return amapResult;
      }

      // 降级：查找最近的地区
      const regions = await prisma.region.findMany({
        where: {
          latitude: { not: null },
          longitude: { not: null },
        },
      });

      let minDistance = Infinity;
      let closestRegion = null;

      for (const region of regions) {
        if (!region.latitude || !region.longitude) continue;
        
        const distance = calculateDistance(
          latitude,
          longitude,
          Number(region.latitude),
          Number(region.longitude)
        );

        if (distance < minDistance) {
          minDistance = distance;
          closestRegion = region;
        }
      }

      return closestRegion?.name || null;
    } catch (error) {
      logger.error('Reverse geocode error:', error);
      return null;
    }
  }

  /**
   * 更新设备坐标
   */
  async updateEquipmentLocation(
    equipmentId: bigint,
    latitude: number,
    longitude: number
  ): Promise<void> {
    await prisma.equipment.update({
      where: { id: equipmentId },
      data: { latitude, longitude },
    });
  }

  /**
   * 按距离搜索设备
   */
  async searchNearby(
    latitude: number,
    longitude: number,
    radius: number = 50, // 默认50公里
    filters?: {
      category1?: string;
      category2?: string;
      priceMin?: number;
      priceMax?: number;
    }
  ) {
    // 获取所有已发布的设备
    const equipments = await prisma.equipment.findMany({
      where: {
        status: 1,
        latitude: { not: null },
        longitude: { not: null },
        ...(filters?.category1 && { category1: filters.category1 }),
        ...(filters?.category2 && { category2: filters.category2 }),
        ...(filters?.priceMin && { price: { gte: filters.priceMin } }),
        ...(filters?.priceMax && { price: { lte: filters.priceMax } }),
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
        province: { select: { id: true, name: true } },
        city: { select: { id: true, name: true } },
        county: { select: { id: true, name: true } },
      },
    });

    // 计算距离并筛选
    const results = equipments
      .map(equipment => {
        const distance = calculateDistance(
          latitude,
          longitude,
          Number(equipment.latitude!),
          Number(equipment.longitude!)
        );

        return {
          ...equipment,
          distance,
        };
      })
      .filter(item => item.distance <= radius)
      .sort((a, b) => a.distance - b.distance);

    return results;
  }

  /**
   * 获取设备周边信息
   */
  async getEquipmentSurroundings(equipmentId: bigint, radius: number = 10) {
    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId },
    });

    if (!equipment?.latitude || !equipment?.longitude) {
      return [];
    }

    return this.searchNearby(
      Number(equipment.latitude),
      Number(equipment.longitude),
      radius
    );
  }

  /**
   * 批量更新设备坐标
   */
  async batchUpdateLocations(userId: bigint): Promise<number> {
    const equipments = await prisma.equipment.findMany({
      where: {
        userId,
        latitude: null,
      },
      select: {
        id: true,
        province: { select: { name: true } },
        city: { select: { name: true } },
        county: { select: { name: true } },
        address: true,
      },
    });

    let updated = 0;

    for (const equipment of equipments) {
      const fullAddress = `${equipment.province?.name || ''}${equipment.city?.name || ''}${equipment.county?.name || ''}${equipment.address}`;
      const coords = await this.geocode(fullAddress);

      if (coords) {
        await this.updateEquipmentLocation(
          equipment.id,
          coords.latitude,
          coords.longitude
        );
        updated++;
      }
    }

    return updated;
  }
}

export const locationService = new LocationService();
