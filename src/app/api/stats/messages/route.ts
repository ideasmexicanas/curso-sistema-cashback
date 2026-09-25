import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const tenantId = cookieStore.get('loyalty_session')?.value;
    if (!tenantId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

    const now = new Date();
    
    // Inicio de Hoy
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Inicio de Semana (Domingo)
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    
    // Inicio de Mes
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Inicio de Año
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [todayCount, weekCount, monthCount, yearCount, totalCount] = await Promise.all([
      prisma.messageLog.count({ where: { tenantId, createdAt: { gte: startOfToday } } }),
      prisma.messageLog.count({ where: { tenantId, createdAt: { gte: startOfWeek } } }),
      prisma.messageLog.count({ where: { tenantId, createdAt: { gte: startOfMonth } } }),
      prisma.messageLog.count({ where: { tenantId, createdAt: { gte: startOfYear } } }),
      prisma.messageLog.count({ where: { tenantId } })
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        today: todayCount,
        week: weekCount,
        month: monthCount,
        year: yearCount,
        total: totalCount,
        quota: tenant.messageQuota // Límite mensual dinámico
      }
    });

  } catch (error) {
    console.error('Error obteniendo stats de mensajes:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
