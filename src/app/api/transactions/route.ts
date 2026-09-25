import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, amount, type = 'EARN', employeeId, customerName, birthDate, rewardOverride, paymentMethod } = body;

    if (!phone || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Teléfono y monto son requeridos' }, { status: 400 });
    }

    if (type !== 'EARN' && type !== 'REDEEM') {
      return NextResponse.json({ error: 'Tipo de transacción inválido' }, { status: 400 });
    }

    // Para el MVP, usaremos el primer Tenant (Negocio) o crearemos uno por defecto
    let tenant = await prisma.tenant.findFirst();
    if (!tenant) {
      tenant = await prisma.tenant.create({
        data: { name: 'Cafetería Central', rewardPercentage: 0.05 },
      });
    }

    // Buscar o crear al cliente
    let customer = await prisma.customer.findUnique({ where: { phone } });
    if (!customer) {
      if (type === 'REDEEM') {
        return NextResponse.json({ error: 'Cliente no encontrado para canjear saldo' }, { status: 404 });
      }
      customer = await prisma.customer.create({
        data: { 
          phone, 
          name: customerName || 'Cliente Nuevo',
          birthDate: birthDate ? new Date(birthDate) : null
        },
      });
    }

    let rewardEarned = 0;

    if (type === 'EARN') {
      // Use rewardOverride if provided (per payment method %), otherwise use global setting
      const rateToUse = (rewardOverride !== undefined && rewardOverride !== null)
        ? rewardOverride
        : tenant.rewardPercentage;
      rewardEarned = amount * rateToUse;
    } else if (type === 'REDEEM') {
      if (customer.balance <= 0) {
        return NextResponse.json({ error: 'El cliente no tiene saldo para canjear' }, { status: 400 });
      }
      rewardEarned = Math.min(amount, customer.balance); // Canjear máximo el saldo disponible
    }

    // Crear la transacción
    const transaction = await prisma.transaction.create({
      data: {
        tenantId: tenant.id,
        customerId: customer.id,
        employeeId: employeeId || null,
        amount: type === 'EARN' ? amount : 0,
        rewardEarned: rewardEarned,
        type: type,
        paymentMethod: paymentMethod || 'CASH',
      },
    });

    // Actualizar saldos del cliente
    const updatedCustomer = await prisma.customer.update({
      where: { id: customer.id },
      data: {
        balance: type === 'EARN' ? { increment: rewardEarned } : { decrement: rewardEarned },
        totalSpent: type === 'EARN' ? { increment: amount } : undefined,
      },
    });



    return NextResponse.json({ success: true, transaction, rewardEarned, type }, { status: 201 });
  } catch (error) {
    console.error('Error procesando transacción:', error);
    return NextResponse.json({ error: 'Error procesando transacción' }, { status: 500 });
  }
}
