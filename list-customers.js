const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const customers = await prisma.customer.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' }
    });
    console.log('Customers in database:', customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
