const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Check if tenant already exists
    const existing = await prisma.tenant.findFirst();
    if (existing) {
      console.log('Tenant already exists:', existing.email);
      return;
    }

    // Create the default admin tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Mi Restaurante',
        email: 'admin@loyaltyos.com',
        password: 'admin123',
        rewardPercentage: 0.05,
      }
    });

    console.log('✅ Admin creado exitosamente!');
    console.log('Email:', tenant.email);
    console.log('Password: admin123');
    console.log('ID:', tenant.id);
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
