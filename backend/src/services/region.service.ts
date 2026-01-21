import { prisma } from './prisma';
import { cache } from './cache';
import { NotFoundError } from '../utils/errors';

interface RegionData {
  name: string;
  code: string;
  level: number;
  parentId?: number;
  latitude?: number;
  longitude?: number;
  children?: RegionData[];
}

export class RegionService {
  private readonly CACHE_TTL = 86400; // 1天

  async getProvinces() {
    const cacheKey = 'regions:provinces';
    const cached = await cache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const provinces = await prisma.region.findMany({
      where: { level: 1 },
      orderBy: { id: 'asc' },
    });

    await cache.set(cacheKey, JSON.stringify(provinces), this.CACHE_TTL);
    return provinces;
  }

  async getCities(provinceId: number) {
    const cacheKey = `regions:cities:${provinceId}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const cities = await prisma.region.findMany({
      where: { parentId: provinceId, level: 2 },
      orderBy: { id: 'asc' },
    });

    await cache.set(cacheKey, JSON.stringify(cities), this.CACHE_TTL);
    return cities;
  }

  async getCounties(cityId: number) {
    const cacheKey = `regions:counties:${cityId}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const counties = await prisma.region.findMany({
      where: { parentId: cityId, level: 3 },
      orderBy: { id: 'asc' },
    });

    await cache.set(cacheKey, JSON.stringify(counties), this.CACHE_TTL);
    return counties;
  }

  async getByCode(code: string) {
    const region = await prisma.region.findFirst({
      where: { code },
    });

    if (!region) {
      throw new NotFoundError('地区不存在');
    }

    return region;
  }

  async importData(data: RegionData[]) {
    // 清空现有数据
    await prisma.region.deleteMany({});

    // 导入新数据
    for (const province of data) {
      const p = await prisma.region.create({
        data: {
          name: province.name,
          code: province.code,
          level: 1,
          parentId: null,
          latitude: province.latitude || null,
          longitude: province.longitude || null,
        },
      });

      if (province.children) {
        for (const city of province.children) {
          const c = await prisma.region.create({
            data: {
              name: city.name,
              code: city.code,
              level: 2,
              parentId: p.id,
              latitude: city.latitude || null,
              longitude: city.longitude || null,
            },
          });

          if (city.children) {
            for (const county of city.children) {
              await prisma.region.create({
                data: {
                  name: county.name,
                  code: county.code,
                  level: 3,
                  parentId: c.id,
                  latitude: county.latitude || null,
                  longitude: county.longitude || null,
                },
              });
            }
          }
        }
      }
    }

    // 清除所有缓存
    await cache.del('regions:provinces');
  }
}
