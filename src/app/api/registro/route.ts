import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWhatsApp } from '@/lib/whatsapp';

export async function POST(req: Request) {
  try {
    const { tenantId, name, phone, birthDate, referralCode } = await req.json();

    if (!tenantId || !phone) {
      return NextResponse.json({ error: 'Teléfono requerido' }, { status: 400 });
    }

    // Validate tenant exists
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      return NextResponse.json({ error: 'Restaurante no encontrado' }, { status: 404 });
    }

    // Normalize phone
    const normalizedPhone = phone.replace(/\D/g, '');

    // Check if customer already exists
    const existing = await prisma.customer.findUnique({ where: { phone: normalizedPhone } });
    if (existing) {
      return NextResponse.json({ error: 'Este teléfono ya está registrado. ¡Ya eres parte del programa!' }, { status: 409 });
    }

    // Create customer
    const customer = await prisma.customer.create({
      data: {
        phone: normalizedPhone,
        name: name || null,
        birthDate: birthDate ? new Date(birthDate) : null,
        balance: 0,
        totalSpent: 0
      }
    });

    // Check Referral Campaign
    let referrer = null;
    let earnedByNew = 0;
    
    if (referralCode) {
      const settings = await prisma.campaignSettings.findUnique({ where: { tenantId } });
      if (settings && settings.referral) {
        referrer = await prisma.customer.findUnique({ where: { phone: referralCode } });
        
        if (referrer) {
          earnedByNew = settings.referralRewardReferred;
          
          // Add balance to both
          await prisma.customer.update({ where: { id: customer.id }, data: { balance: { increment: earnedByNew } } });
          await prisma.customer.update({ where: { id: referrer.id }, data: { balance: { increment: settings.referralRewardReferrer } } });
          
          // Log transactions
          await prisma.transaction.create({
            data: {
              tenantId, customerId: customer.id, amount: 0, rewardEarned: earnedByNew, type: 'EARN', paymentMethod: 'CASH'
            }
          });
          await prisma.transaction.create({
            data: {
              tenantId, customerId: referrer.id, amount: 0, rewardEarned: settings.referralRewardReferrer, type: 'EARN', paymentMethod: 'CASH'
            }
          });

          // Send message to referrer
          const refMsg = `¡Felicidades! 🎉\n\nTu amigo se acaba de registrar. Has ganado $${settings.referralRewardReferrer} MXN de saldo en ${tenant.name}.`;
          try {
            const { sendSMS } = await import('@/lib/sms');
            await sendWhatsApp(referrer.phone, refMsg, { tenantId, type: 'CAMPAIGN' }).catch(() => {});
            await sendSMS(referrer.phone, refMsg, { tenantId, type: 'CAMPAIGN' }).catch(() => {});
          } catch (e) {}
        }
      }
    }

    // Send Welcome Messages
    let welcomeMsg = `¡Hola${name ? ` ${name}` : ''}! 🎉\n\nYa eres parte del programa de lealtad de *${tenant.name}*.\n\n🏆 Tu saldo inicial: $0 MXN\n\nCada vez que visites, acumulas saldo que puedes canjear en tu próxima compra. ¡Gracias por unirte! 🙌`;
    
    if (earnedByNew > 0) {
      welcomeMsg = `¡Hola${name ? ` ${name}` : ''}! 🎉\n\nGracias por aceptar la invitación. Te hemos regalado $${earnedByNew} MXN de saldo para que lo uses en tu próxima visita a *${tenant.name}*.\n\n🏆 Tu saldo inicial: $${earnedByNew} MXN\n\n¡Te esperamos! 🙌`;
    }
    
    try {
      const { sendSMS } = await import('@/lib/sms');
      
      await sendWhatsApp(normalizedPhone, welcomeMsg, {
        tenantId: tenant.id,
        type: 'WELCOME'
      }).catch(err => console.error('Error WhatsApp en registro:', err));
      
      await sendSMS(normalizedPhone, welcomeMsg, {
        tenantId: tenant.id,
        type: 'WELCOME'
      }).catch(err => console.error('Error SMS en registro:', err));
      
    } catch (msgErr) {
      console.error('Error enviando mensajes de bienvenida:', msgErr);
    }

    return NextResponse.json({ success: true, customerId: customer.id });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Error al registrar. Intenta de nuevo.' }, { status: 500 });
  }
}
