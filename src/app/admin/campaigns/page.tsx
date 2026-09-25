import { prisma } from '@/lib/prisma';
import CampaignsManager from './CampaignsManager';

export const dynamic = 'force-dynamic';

export default async function CampaignsPage() {
  // Obtener conteos básicos para mostrar en las tarjetas
  const inactiveCustomers = await prisma.customer.count({
    where: {
      transactions: {
        none: {
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      }
    }
  });

  const birthdayCustomers = await prisma.customer.count({
    where: {
      birthDate: { not: null } // Simplificado para el conteo inicial
    }
  });

  const vipCustomers = await prisma.customer.count({
    where: { totalSpent: { gte: 500 } }
  });

  const hasBalanceCustomers = await prisma.customer.count({
    where: { balance: { gt: 0 } }
  });

  return (
    <CampaignsManager 
      inactiveCount={inactiveCustomers}
      birthdayCount={birthdayCustomers}
      vipCount={vipCustomers}
      hasBalanceCount={hasBalanceCustomers}
    />
  );
}
