import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';

// 加载环境变量
config({ path: path.join(__dirname, '../../.env') });

const prisma = new PrismaClient();

async function seedRegions() {
  console.log('开始导入地区数据...');

  const data = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'regions.json'), 'utf-8')
  );

  for (const province of data.provinces) {
    const p = await prisma.region.create({
      data: {
        name: province.name,
        code: province.code,
        level: 1,
        parentId: null,
      },
    });

    console.log(`创建省份: ${p.name}`);

    for (const city of province.children) {
      const c = await prisma.region.create({
        data: {
          name: city.name,
          code: city.code,
          level: 2,
          parentId: p.id,
        },
      });

      console.log(`  创建城市: ${c.name}`);

      if (city.children && Array.isArray(city.children)) {
        for (const county of city.children) {
          // county可能是对象，其name字段也可能是对象
          let countyName = '';
          let countyCode = '';
          
          if (typeof county === 'string') {
            countyName = county;
          } else if (typeof county === 'object') {
            // 如果county.name是对象（包含街道数据），跳过
            if (typeof county.name === 'object' && county.name.name) {
              countyName = county.name.name;
              countyCode = county.name.code || county.code || '';
            } else if (typeof county.name === 'string') {
              countyName = county.name;
              countyCode = county.code || '';
            }
          }
          
          if (!countyName) continue;
          
          const co = await prisma.region.create({
            data: {
              name: countyName,
              code: countyCode,
              level: 3,
              parentId: c.id,
            },
          });

          console.log(`    创建区县: ${co.name}`);
        }
      }
    }
  }

  console.log('地区数据导入完成！');
}

seedRegions()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
