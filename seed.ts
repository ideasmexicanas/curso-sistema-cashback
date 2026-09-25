import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tenantCount = await prisma.tenant.count();
  console.log(`Current tenants: ${tenantCount}`);

  if (tenantCount === 0) {
    const newTenant = await prisma.tenant.create({
      data: {
        name: 'Administrador Principal',
        email: 'admin@loyaltyos.com',
        password: 'admin123'
      }
    });
    console.log('Created tenant:', newTenant);
  } else {
    // Upsert or update the first one
    const firstTenant = await prisma.tenant.findFirst();
    if (firstTenant) {
      await prisma.tenant.update({
        where: { id: firstTenant.id },
        data: {
          email: 'admin@loyaltyos.com',
          password: 'admin123'
        }
      });
      console.log('Updated existing tenant with default credentials');
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
