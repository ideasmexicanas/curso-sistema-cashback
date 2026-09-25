import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request) {
  try {
    const { rewardPercentage, name, messageQuota, masterPin } = await req.json();
    
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

    const updateData: any = {};
    if (rewardPercentage !== undefined) {
      if (rewardPercentage < 0 || rewardPercentage > 1) {
        return NextResponse.json({ success: false, error: 'Porcentaje inválido' }, { status: 400 });
      }
      updateData.rewardPercentage = rewardPercentage;
    }
    
    if (name) {
      updateData.name = name;
    }

    if (messageQuota !== undefined) {
      const EXPECTED_PIN = process.env.MASTER_PIN || '7777'; // Fallback a 7777 si no hay env
      if (masterPin !== EXPECTED_PIN) {
        return NextResponse.json({ success: false, error: 'PIN Maestro incorrecto' }, { status: 403 });
      }
      if (messageQuota < 0) {
        return NextResponse.json({ success: false, error: 'Cuota inválida' }, { status: 400 });
      }
      updateData.messageQuota = messageQuota;
    }

    await prisma.tenant.update({
      where: { id: tenant.id },
      data: updateData
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json({ success: false, error: 'Error actualizando configuración' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    return NextResponse.json({ 
      success: true, 
      settings: { 
        id: tenant.id,
        name: tenant.name,
        email: tenant.email,
        rewardPercentage: tenant.rewardPercentage,
        messageQuota: tenant.messageQuota
      } 
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Error al obtener configuración' }, { status: 500 });
  }
}
