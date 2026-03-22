import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const count = await prisma.transaction.count();
  console.log('Total transactions in DB:', count);
}
main().catch(console.error).finally(() => prisma.$disconnect());
