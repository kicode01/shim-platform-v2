const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const c = await prisma.certificate.findFirst();
  console.log(c.id);
  await prisma.$disconnect();
}
run();
