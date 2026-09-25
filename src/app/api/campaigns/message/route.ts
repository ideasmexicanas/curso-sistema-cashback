import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const tenantId = cookieStore.get('loyalty_session')?.value;
    if (!tenantId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { campaign, message, threshold, referrer, referred } = await req.json();
    
    const fieldMap: Record<string, string> = {
      'retention': 'retentionMsg',
      'birthday': 'birthdayMsg',
      'vip': 'vipMsg',
      'promo': 'promoMsg',
      'referral': 'referralMsg'
    };

    const fieldName = fieldMap[campaign];
    if (!fieldName) return NextResponse.json({ error: 'Campaña inválida' }, { status: 400 });

    const updateData: any = { [fieldName]: message };
    if (campaign === 'vip' && threshold !== undefined) {
      updateData.vipThreshold = Number(threshold);
    }
    if (campaign === 'referral') {
      if (referrer !== undefined) updateData.referralRewardReferrer = Number(referrer);
      if (referred !== undefined) updateData.referralRewardReferred = Number(referred);
    }

    const runUpsert = async (data: any) => {
      return await prisma.campaignSettings.upsert({
        where: { tenantId },
        create: { tenantId, ...data },
        update: data
      });
    };

    try {
      await runUpsert(updateData);
    } catch (error: any) {
      // Auto-reparación ampliada para incluir promociones
      try {
        await prisma.$executeRawUnsafe(`ALTER TABLE "CampaignSettings" ADD COLUMN IF NOT EXISTS "retentionMsg" TEXT`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "CampaignSettings" ADD COLUMN IF NOT EXISTS "birthdayMsg" TEXT`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "CampaignSettings" ADD COLUMN IF NOT EXISTS "vipMsg" TEXT`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "CampaignSettings" ADD COLUMN IF NOT EXISTS "vipThreshold" DOUBLE PRECISION DEFAULT 500`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "CampaignSettings" ADD COLUMN IF NOT EXISTS "promoMsg" TEXT`);
        
        await runUpsert(updateData);
      } catch (retryError: any) {
        return NextResponse.json({ error: 'Error de sincronización de base de datos.' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, campaign, message, threshold });
  } catch (error: any) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
