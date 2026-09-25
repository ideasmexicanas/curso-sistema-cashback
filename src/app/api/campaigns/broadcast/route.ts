import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { sendSMS } from '@/lib/sms';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const tenantId = cookieStore.get('loyalty_session')?.value;
    if (!tenantId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { message } = await req.json();
    if (!message) return NextResponse.json({ error: 'Mensaje vacío' }, { status: 400 });

    // 1. Obtener todos los clientes con saldo disponible
    const customers = await prisma.customer.findMany({
      where: {
        balance: { gt: 0 }
      },
      select: { phone: true, name: true, balance: true }
    });

    if (customers.length === 0) {
      return NextResponse.json({ error: 'No hay clientes registrados.' }, { status: 400 });
    }

    console.log(`🚀 Iniciando envío masivo profesional a ${customers.length} clientes por SMS...`);

    let successCount = 0;
    let failCount = 0;

    // 2. Envío secuencial usando la librería oficial de SMS
    for (const customer of customers) {
      try {
        const personalizedMsg = message
          .replace(/\[Nombre\]/g, customer.name || 'Cliente')
          .replace(/\[Saldo\]/g, customer.balance.toFixed(2));
        
        // Usamos la función oficial que envía SMS
        const ok = await sendSMS(customer.phone, personalizedMsg, { tenantId, type: 'CAMPAIGN' });

        if (ok) {
          successCount++;
        } else {
          failCount++;
        }

        // Pausa de seguridad
        await new Promise(resolve => setTimeout(resolve, 300));

      } catch (e) {
        console.error(`Fallo total en ${customer.phone}:`, e);
        failCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      total: customers.length, 
      sent: successCount,
      failed: failCount
    });
  } catch (error: any) {
    console.error('Broadcast error:', error);
    return NextResponse.json({ error: 'Error en el motor de envíos' }, { status: 500 });
  }
}
