import { NextResponse } from 'next/server';
import { sendWhatsApp } from '@/lib/whatsapp';
import { sendSMS } from '@/lib/sms';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { type, phone } = await req.json();
    
    // Intentamos obtener el tenant de la sesión, si no, el primero (para pruebas rápidas)
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('loyalty_session')?.value;
    
    const tenant = sessionId 
      ? await prisma.tenant.findUnique({ where: { id: sessionId } })
      : await prisma.tenant.findFirst();

    if (!tenant) return NextResponse.json({ error: 'No autorizado o no se encontró el restaurante' }, { status: 404 });

    const settings = await prisma.campaignSettings.findUnique({ where: { tenantId: tenant.id } });

    let messageTemplate = '';
    switch (type) {
      case 'retention':
        messageTemplate = settings?.retentionMsg || `Hola [Nombre] 👋\n\nTe extrañamos en *${tenant.name}*. Tienes $50 MXN de regalo. ¡Te esperamos!`;
        break;
      case 'birthday':
        messageTemplate = settings?.birthdayMsg || `¡Feliz Cumpleaños [Nombre]! 🎂\n\nHoy en *${tenant.name}* te regalamos un postre. ¡Ven a festejar!`;
        break;
      case 'vip':
        messageTemplate = settings?.vipMsg || `¡Hola [Nombre]! 🌟\n\nEres cliente VIP en *${tenant.name}*. Tienes un Upgrade GRATIS en tu visita.`;
        break;
      case 'promo':
        messageTemplate = settings?.promoMsg || `¡Hola [Nombre]! 🌮✨\n\nSolo por hoy tenemos una promoción especial para ti: [Escribe aquí tu promo]. ¡Te esperamos!`;
        break;
      default:
        messageTemplate = 'Prueba de LoyaltyOS 🚀';
    }

    const isPromo = type === 'promo';
    const replaceTags = (text: string) => {
      return text
        .replace(/\[Nombre\]/g, 'Cliente de Prueba')
        .replace(/\[Saldo\]/g, '150.00');
    };
    const finalMessage = isPromo
      ? replaceTags(messageTemplate)
      : `🧪 [SIMULACIÓN]\n\n${replaceTags(messageTemplate)}`;

    const ok = isPromo
      ? await sendSMS(phone, finalMessage)
      : await sendWhatsApp(phone, finalMessage);
    return NextResponse.json({ success: ok });
  } catch (error: any) {
    console.error('Test Campaign Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Error al enviar mensaje' 
    }, { status: 500 });
  }
}
