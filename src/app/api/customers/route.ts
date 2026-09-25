import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get('phone');

  if (!phone) {
    return NextResponse.json({ error: 'Teléfono es requerido' }, { status: 400 });
  }

  try {
    const customer = await prisma.customer.findUnique({
      where: { phone },
    });

    if (!customer) {
      return NextResponse.json({ success: false, message: 'Cliente no encontrado' }, { status: 404 });
    }

    let smsDebug = null;
    const sendSms = searchParams.get('sendSms');
    const tenant = await prisma.tenant.findFirst();

    if (sendSms === 'true' && process.env.SMS_MASIVOS_API_KEY) {
      const firstName = (customer.name || 'Cliente').split(' ')[0];
      const mensaje = `Hola ${firstName}, tu saldo actual es de $${customer.balance.toFixed(2)} gracias por visitarnos en Cabo Wabo.`;
      
      try {
        const { sendWhatsApp } = await import('@/lib/whatsapp');
        const success = await sendWhatsApp(customer.phone, mensaje, {
          tenantId: tenant?.id || '',
          type: 'TRANSACTION'
        });
        smsDebug = { success, method: 'whatsapp' };
      } catch (err: any) {
        smsDebug = { error: err.message };
      }
    } else if (sendSms === 'true') {
      smsDebug = { error: 'No SMS API KEY in environment' };
    }

    let referralConfig = null;
    if (tenant) {
      const settings = await prisma.campaignSettings.findUnique({ where: { tenantId: tenant.id } });
      if (settings && settings.referral) {
        referralConfig = {
          tenantId: tenant.id,
          rewardAmount: settings.referralRewardReferred
        };
      }
    }

    return NextResponse.json({
      success: true,
      smsDebug,
      referral: referralConfig,
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        balance: customer.balance,
        birthDate: customer.birthDate
      }
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 });
    }

    // 1. Delete all transactions associated with the customer
    await prisma.transaction.deleteMany({
      where: { customerId: id }
    });

    // 2. Delete the customer
    await prisma.customer.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Error al eliminar el cliente' }, { status: 500 });
  }
}
