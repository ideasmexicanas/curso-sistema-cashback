import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import RegistroClient from './RegistroClient';

export default async function RegistroPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ tenantId: string }>,
  searchParams: Promise<{ ref?: string }>
}) {
  const { tenantId } = await params;
  const { ref } = await searchParams;
  
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) notFound();

  return <RegistroClient tenantId={tenant.id} tenantName={tenant.name} referralCode={ref} />;
}
