import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const tenantId = cookieStore.get('loyalty_session')?.value;
    if (!tenantId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { campaign, active } = await req.json();
    if (!['retention', 'birthday', 'vip', 'referral'].includes(campaign)) {
      return NextResponse.json({ error: 'Campaña inválida' }, { status: 400 });
    }

    // Upsert campaign settings
    await prisma.campaignSettings.upsert({
      where: { tenantId },
      create: { tenantId, [campaign]: active },
      update: { [campaign]: active }
    });

    return NextResponse.json({ success: true, campaign, active });
  } catch (error) {
    console.error('Campaign toggle error:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const tenantId = cookieStore.get('loyalty_session')?.value;
    if (!tenantId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const settings = await prisma.campaignSettings.findUnique({ where: { tenantId } });
    return NextResponse.json(settings || { 
      retention: false, 
      retentionMsg: null,
      birthday: false, 
      birthdayMsg: null,
      vip: false,
      vipMsg: null
    });
  } catch (error) {
    console.error('Campaign GET error:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
