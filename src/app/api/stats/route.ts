import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

type Period = 'hora' | 'dia' | 'semana' | 'quincena' | 'mes' | 'anio';
const MX_OFFSET_MS = -6 * 3600 * 1000; // UTC-6

function getStartDate(period: Period): Date {
  const now = new Date();
  switch (period) {
    case 'hora':      return new Date(now.getTime() - 3600 * 1000);
    case 'dia': {
      const mxNow = new Date(now.getTime() + MX_OFFSET_MS);
      mxNow.setUTCHours(0, 0, 0, 0);
      return new Date(mxNow.getTime() - MX_OFFSET_MS);
    }
    case 'semana':     return new Date(now.getTime() - 7 * 86400 * 1000);
    case 'quincena':   return new Date(now.getTime() - 15 * 86400 * 1000);
    case 'mes':        return new Date(now.getTime() - 30 * 86400 * 1000);
    case 'anio':       return new Date(now.getTime() - 365 * 86400 * 1000);
  }
}

function toMx(utcDate: Date): Date {
  return new Date(utcDate.getTime() + MX_OFFSET_MS);
}

function getSlotKey(utcDate: Date, period: Period): string {
  const d = toMx(utcDate);
  switch (period) {
    case 'hora': {
      const min = Math.floor(d.getUTCMinutes() / 5) * 5;
      return `${String(d.getUTCHours()).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
    }
    case 'dia':
      return `${String(d.getUTCHours()).padStart(2, '0')}:00`;
    case 'semana':
    case 'quincena':
    case 'mes':
      return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
    case 'anio':
      return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
  }
}

const MONTHS = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
function formatSlotKey(key: string, period: Period): string {
  if (period === 'hora' || period === 'dia') return key;
  if (period === 'semana' || period === 'quincena' || period === 'mes') {
    const [, m, d] = key.split('-').map(Number);
    return `${d} ${MONTHS[m]}`;
  }
  const [y, m] = key.split('-').map(Number);
  return `${MONTHS[m]} '${String(y).slice(2)}`;
}

type SlotData = { ventas: number; recompensas: number; transacciones: number };

function initSlots(startDate: Date, period: Period): Map<string, SlotData> {
  const map = new Map<string, SlotData>();
  const nowMx = toMx(new Date());
  const startMx = toMx(startDate);

  if (period === 'hora') {
    const d = new Date(startMx);
    d.setUTCMinutes(Math.floor(d.getUTCMinutes() / 5) * 5, 0, 0);
    while (d <= nowMx) {
      const key = `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
      if (!map.has(key)) map.set(key, { ventas: 0, recompensas: 0, transacciones: 0 });
      d.setUTCMinutes(d.getUTCMinutes() + 5);
    }
  } else if (period === 'dia') {
    const d = new Date(startMx);
    d.setUTCHours(0, 0, 0, 0);
    while (d <= nowMx) {
      const key = `${String(d.getUTCHours()).padStart(2, '0')}:00`;
      if (!map.has(key)) map.set(key, { ventas: 0, recompensas: 0, transacciones: 0 });
      d.setUTCHours(d.getUTCHours() + 1);
    }
  } else if (period === 'semana' || period === 'quincena' || period === 'mes') {
    const d = new Date(startMx);
    d.setUTCHours(0, 0, 0, 0);
    while (d <= nowMx) {
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
      if (!map.has(key)) map.set(key, { ventas: 0, recompensas: 0, transacciones: 0 });
      d.setUTCDate(d.getUTCDate() + 1);
    }
  } else {
    const d = new Date(startMx);
    d.setUTCDate(1);
    d.setUTCHours(0, 0, 0, 0);
    while (d <= nowMx) {
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
      if (!map.has(key)) map.set(key, { ventas: 0, recompensas: 0, transacciones: 0 });
      d.setUTCMonth(d.getUTCMonth() + 1);
    }
  }
  return map;
}

export async function GET(req: NextRequest) {
  try {
    const period = (req.nextUrl.searchParams.get('period') || 'mes') as Period;
    const page   = parseInt(req.nextUrl.searchParams.get('page') || '1');
    const pageSize = 20;
    const startDate = getStartDate(period);

    const [
      earnAgg, redeemAgg, cashAgg, cardAgg,
      totalCustomers, newCustomers, pendingBalance,
      allTransactions, topCustomers, birthdayCustomers,
    ] = await Promise.all([
      prisma.transaction.aggregate({
        _sum: { amount: true, rewardEarned: true }, _count: { id: true },
        where: { type: 'EARN', createdAt: { gte: startDate } },
      }),
      prisma.transaction.aggregate({
        _sum: { rewardEarned: true }, _count: { id: true },
        where: { type: 'REDEEM', createdAt: { gte: startDate } },
      }),
      prisma.transaction.aggregate({
        _sum: { amount: true }, _count: { id: true },
        where: { type: 'EARN', paymentMethod: 'CASH', createdAt: { gte: startDate } },
      }),
      prisma.transaction.aggregate({
        _sum: { amount: true }, _count: { id: true },
        where: { type: 'EARN', paymentMethod: 'CARD', createdAt: { gte: startDate } },
      }),
      prisma.customer.count(),
      prisma.customer.count({ where: { createdAt: { gte: startDate } } }),
      prisma.customer.aggregate({ _sum: { balance: true } }),
      prisma.transaction.findMany({
        where: { createdAt: { gte: startDate } },
        include: { customer: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.customer.findMany({
        take: 5, orderBy: { totalSpent: 'desc' },
        where: { totalSpent: { gt: 0 } },
        select: { id: true, name: true, phone: true, totalSpent: true, balance: true },
      }),
      prisma.customer.findMany({
        where: { birthDate: { not: null } },
        select: { id: true, name: true, phone: true, birthDate: true },
      }),
    ]);

    const totalSales  = earnAgg._sum.amount || 0;
    const totalRewards = earnAgg._sum.rewardEarned || 0;
    const earnCount   = earnAgg._count.id || 0;
    const redeemCount = redeemAgg._count.id || 0;
    const cashSales   = cashAgg._sum.amount || 0;
    const cardSales   = cardAgg._sum.amount || 0;

    // Chart data
    const slots = initSlots(startDate, period);
    for (const tx of allTransactions) {
      if (tx.type !== 'EARN') continue;
      const key = getSlotKey(tx.createdAt, period);
      const slot = slots.get(key);
      if (slot) { slot.ventas += tx.amount; slot.recompensas += tx.rewardEarned; slot.transacciones += 1; }
    }
    const chartData = Array.from(slots.entries()).map(([key, data]) => ({
      label: formatSlotKey(key, period), ...data,
    }));

    // Upcoming birthdays
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const upcomingBirthdays = birthdayCustomers
      .map(c => {
        const bd = new Date(c.birthDate!);
        const next = new Date(today.getFullYear(), bd.getMonth(), bd.getDate());
        if (next < today) next.setFullYear(today.getFullYear() + 1);
        const daysUntil = Math.ceil((next.getTime() - today.getTime()) / 86400000);
        return { ...c, birthDate: bd.toISOString(), daysUntil };
      })
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 5);

    const totalTx = allTransactions.length;
    const paginated = allTransactions.slice((page - 1) * pageSize, page * pageSize);

    return NextResponse.json({
      success: true, period,
      stats: {
        totalSales, totalRewards, earnCount, redeemCount,
        totalTransactions: earnCount + redeemCount,
        activeCustomers: totalCustomers, newCustomers,
        avgTicket: earnCount > 0 ? totalSales / earnCount : 0,
        pendingBalance: pendingBalance._sum.balance || 0,
        cashSales, cardSales,
        cashCount: cashAgg._count.id || 0,
        cardCount: cardAgg._count.id || 0,
      },
      chartData, topCustomers, upcomingBirthdays,
      transactions: {
        data: paginated.map(tx => ({
          id: tx.id, date: tx.createdAt.toISOString(),
          customerName: tx.customer.name || 'Sin nombre',
          customerPhone: tx.customer.phone, customerId: tx.customer.id,
          amount: tx.amount, rewardEarned: tx.rewardEarned,
          type: tx.type, paymentMethod: tx.paymentMethod,
        })),
        total: totalTx, page, pageSize,
        totalPages: Math.ceil(totalTx / pageSize),
      },
    });
  } catch (err: any) {
    console.error('Stats API error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
