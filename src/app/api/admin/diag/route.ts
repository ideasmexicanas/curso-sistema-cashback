import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const results: Record<string, any> = {};

  try {
    results.env_database_url = process.env.DATABASE_URL ? 
      process.env.DATABASE_URL.replace(/:([^:@]+)@/, ':***@') : 'NOT SET';
    results.env_direct_url = process.env.DIRECT_URL ? 
      process.env.DIRECT_URL.replace(/:([^:@]+)@/, ':***@') : 'NOT SET';
  } catch (e: any) {
    results.env_error = e.message;
  }

  try {
    const count = await prisma.tenant.count();
    results.tenant_count = count;
  } catch (e: any) {
    results.tenant_error = e.message;
    results.tenant_code = (e as any).code;
  }

  try {
    const count = await prisma.customer.count();
    results.customer_count = count;
  } catch (e: any) {
    results.customer_error = e.message;
    results.customer_code = (e as any).code;
  }

  try {
    const count = await prisma.transaction.count();
    results.transaction_count = count;
  } catch (e: any) {
    results.transaction_error = e.message;
    results.transaction_code = (e as any).code;
  }

  try {
    const agg = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { type: 'EARN' }
    });
    results.transaction_agg = agg;
  } catch (e: any) {
    results.transaction_agg_error = e.message;
    results.transaction_agg_code = (e as any).code;
    results.transaction_agg_meta = (e as any).meta;
  }

  try {
    const txs = await prisma.transaction.findMany({
      take: 1,
      orderBy: { createdAt: 'desc' },
      include: { customer: true }
    });
    results.recent_tx_count = txs.length;
  } catch (e: any) {
    results.recent_tx_error = e.message;
    results.recent_tx_code = (e as any).code;
    results.recent_tx_meta = (e as any).meta;
  }

  return NextResponse.json(results, { status: 200 });
}
