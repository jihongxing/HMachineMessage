import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.$queryRaw`
    SELECT status, COUNT(*)::int as count FROM equipment GROUP BY status ORDER BY status
  `;
  console.log('设备状态分布:');
  console.log(result);
  
  const total = await prisma.equipment.count();
  console.log('\n总数:', total);
  
  const notDeleted = await prisma.equipment.count({ where: { status: { not: 4 } } });
  console.log('非删除状态总数:', notDeleted);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
