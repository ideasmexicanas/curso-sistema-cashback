import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const results: string[] = [];

    const fixes = [
      `ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "paymentMethod" TEXT NOT NULL DEFAULT 'CASH'`,
      `ALTER TABLE "CampaignSettings" ADD COLUMN IF NOT EXISTS "retentionMsg" TEXT`,
      `ALTER TABLE "CampaignSettings" ADD COLUMN IF NOT EXISTS "birthdayMsg" TEXT`,
      `ALTER TABLE "CampaignSettings" ADD COLUMN IF NOT EXISTS "vipMsg" TEXT`,
      `ALTER TABLE "CampaignSettings" ADD COLUMN IF NOT EXISTS "promoMsg" TEXT`,
      `ALTER TABLE "CampaignSettings" ADD COLUMN IF NOT EXISTS "vipThreshold" DOUBLE PRECISION DEFAULT 500`,
    ];

    for (const sql of fixes) {
      try {
        await prisma.$executeRawUnsafe(sql);
        results.push(`✅ OK: ${sql.substring(0, 60)}...`);
      } catch (e: any) {
        results.push(`❌ ERROR: ${e.message}`);
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error del servidor' }, { status: 500 });
  }
}
