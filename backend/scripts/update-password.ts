import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hash = bcrypt.hashSync('123456', 10);
  await prisma.user.update({
    where: { phone: '13736849910' },
    data: { password: hash }
  });
  console.log('密码已更新为123456');
}

main().finally(() => prisma.$disconnect());
