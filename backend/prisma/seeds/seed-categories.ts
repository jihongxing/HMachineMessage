import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';

// 加载环境变量
config({ path: path.join(__dirname, '../../.env') });

const prisma = new PrismaClient();

async function seedCategories() {
  console.log('开始导入分类数据...');

  const data = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'categories.json'), 'utf-8')
  );

  for (const cat1 of data.categories) {
    const parent = await prisma.category.create({
      data: {
        name: cat1.name,
        slug: cat1.slug,
        description: cat1.description || null,
        parentId: null,
        sort: cat1.sort || 0,
        isActive: true,
      },
    });

    console.log(`创建一级分类: ${parent.name}`);

    for (const cat2 of cat1.children) {
      const child = await prisma.category.create({
        data: {
          name: cat2.name,
          slug: cat2.slug,
          parentId: parent.id,
          sort: cat2.sort || 0,
          isActive: true,
        },
      });

      console.log(`  创建二级分类: ${child.name}`);
    }
  }

  console.log('分类数据导入完成！');
}

seedCategories()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
