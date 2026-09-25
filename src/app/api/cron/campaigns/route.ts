import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWhatsApp } from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  const isCronToken = authHeader === `Bearer ${process.env.CRON_SECRET}`;
  
  // En producción, solo permitimos ejecuciones autorizadas por el cron secret
  if (!isCronToken && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results = { sent: 0, errors: 0, skipped: 0 };
  const debugLog: string[] = [];

  try {
    const tenants = await prisma.tenant.findMany();

    for (const tenant of tenants) {
      const settings = await prisma.campaignSettings.findUnique({
        where: { tenantId: tenant.id }
      });
      if (!settings) continue;

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const replaceTags = (text: string, customer: any) => {
        return text
          .replace(/\[Nombre\]/g, customer.name || 'Cliente')
          .replace(/\[Saldo\]/g, customer.balance.toFixed(2));
      };

      // --- 1. RETENCIÓN (30 DÍAS) ---
      if (settings.retention) {
        const inactive = await prisma.customer.findMany({
          where: {
            transactions: {
              none: { tenantId: tenant.id, createdAt: { gte: thirtyDaysAgo } }
            }
          }
        });
        const defaultMsg = `Hola [Nombre] 👋\n\nTe extrañamos en *${tenant.name}*. Tienes $50 MXN de regalo para tu próxima visita. ¡Te esperamos!`;
        const msgTemplate = settings.retentionMsg || defaultMsg;

        for (const c of inactive) {
          if (!c.phone) continue;
          try {
            await sendWhatsApp(c.phone, replaceTags(msgTemplate, c), { tenantId: tenant.id, type: 'RETENTION' });
            results.sent++;
          } catch (e: any) {
            results.errors++;
            debugLog.push(`Error retención ${c.phone}: ${e.message}`);
          }
        }
      }

      // --- 2. CUMPLEAÑOS ---
      if (settings.birthday) {
        const customers = await prisma.customer.findMany({ where: { birthDate: { not: null } } });
        const defaultMsg = `¡Feliz Cumpleaños [Nombre]! 🎂\n\nHoy en *${tenant.name}* te regalamos un postre. ¡Ven a festejar!`;
        const msgTemplate = settings.birthdayMsg || defaultMsg;

        for (const c of customers) {
          const b = c.birthDate!;
          if (b.getMonth() === now.getMonth() && b.getDate() === now.getDate()) {
            try {
              await sendWhatsApp(c.phone, replaceTags(msgTemplate, c), { tenantId: tenant.id, type: 'BIRTHDAY' });
              results.sent++;
            } catch (e: any) {
              results.errors++;
              debugLog.push(`Error cumple ${c.phone}: ${e.message}`);
            }
          }
        }
      }

      // --- 3. VIP ---
      if (settings.vip) {
        const threshold = settings.vipThreshold || 500;
        const vips = await prisma.customer.findMany({ 
          where: { 
            totalSpent: { gte: threshold },
            vipSent: false 
          } 
        });
        const defaultMsg = `¡Hola [Nombre]! 🌟\n\nEres cliente VIP en *${tenant.name}*. Tienes un Upgrade GRATIS en tu próxima visita.`;
        const msgTemplate = settings.vipMsg || defaultMsg;

        for (const c of vips) {
          try {
            await sendWhatsApp(c.phone, replaceTags(msgTemplate, c), { tenantId: tenant.id, type: 'VIP' });
            
            // Marcar como enviado para que no se repita mañana
            await prisma.customer.update({
              where: { id: c.id },
              data: { vipSent: true }
            });
            
            results.sent++;
          } catch (e: any) {
            results.errors++;
            debugLog.push(`Error VIP ${c.phone}: ${e.message}`);
          }
        }
      }
    }

    return NextResponse.json({ success: true, ...results, debug: debugLog });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
