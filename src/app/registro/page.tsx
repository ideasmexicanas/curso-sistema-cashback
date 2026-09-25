import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import RegistroClient from '../r/[tenantId]/RegistroClient';

export const dynamic = 'force-dynamic';

export default async function RegistroSimplificadoPage() {
  // Buscamos el primer tenant (tu restaurante)
  const tenant = await prisma.tenant.findFirst();
  
  if (!tenant) notFound();

  return <RegistroClient tenantId={tenant.id} tenantName={tenant.name} />;
}
