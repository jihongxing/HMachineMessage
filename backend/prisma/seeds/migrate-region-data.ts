import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import * as path from 'path';

config({ path: path.join(__dirname, '../../.env') });

const prisma = new PrismaClient();

async function migrateRegionData() {
  console.log('开始迁移地区数据...');

  // 获取所有设备
  const equipments = await prisma.equipment.findMany({
    where: {
      OR: [
        { provinceId: null },
        { cityId: null },
        { countyId: null }
      ]
    }
  });

  console.log(`需要迁移 ${equipments.length} 条设备数据`);

  let successCount = 0;
  let failCount = 0;

  for (const equipment of equipments) {
    try {
      // 查找省份ID
      const province = await prisma.region.findFirst({
        where: { name: equipment.province!, level: 1 }
      });

      if (!province) {
        console.log(`未找到省份: ${equipment.province}`);
        failCount++;
        continue;
      }

      // 查找城市ID
      const city = await prisma.region.findFirst({
        where: { name: equipment.city!, level: 2, parentId: province.id }
      });

      if (!city) {
        console.log(`未找到城市: ${equipment.city} (省份: ${equipment.province})`);
        failCount++;
        continue;
      }

      // 查找区县ID
      const county = await prisma.region.findFirst({
        where: { name: equipment.county!, level: 3, parentId: city.id }
      });

      if (!county) {
        console.log(`未找到区县: ${equipment.county} (城市: ${equipment.city})`);
        failCount++;
        continue;
      }

      // 更新设备
      await prisma.equipment.update({
        where: { id: equipment.id },
        data: {
          provinceId: province.id,
          cityId: city.id,
          countyId: county.id
        }
      });

      successCount++;
      if (successCount % 100 === 0) {
        console.log(`已迁移 ${successCount} 条`);
      }
    } catch (error) {
      console.error(`迁移失败 ID: ${equipment.id}`, error);
      failCount++;
    }
  }

  console.log(`迁移完成！成功: ${successCount}, 失败: ${failCount}`);
}

migrateRegionData()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
