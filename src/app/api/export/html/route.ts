import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

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

const PERIOD_LABELS: Record<string, string> = {
  hora: 'Última Hora',
  dia: 'Hoy',
  semana: 'Últimos 7 Días',
  quincena: 'Últimos 15 Días',
  mes: 'Mes Actual (30 Días)',
  anio: 'Último Año',
};

export async function GET(req: NextRequest) {
  try {
    const period = (req.nextUrl.searchParams.get('period') || 'mes') as Period;
    const viewInline = req.nextUrl.searchParams.get('view') === 'true';
    const startDate = getStartDate(period);

    // Identificar el tenant
    const cookieStore = await cookies();
    const sessionTenantId = cookieStore.get('loyalty_session')?.value;
    const tenant = sessionTenantId
      ? await prisma.tenant.findUnique({ where: { id: sessionTenantId } })
      : await prisma.tenant.findFirst();

    const tenantId = tenant?.id;

    // Consultas a la base de datos
    const [
      allTransactions,
      earnAgg,
      cashAgg,
      cardAgg,
      redeemAgg,
      totalCustomers,
      newCustomers,
      topCustomers,
      birthdayCustomers,
      pendingBalance,
      campaignSettings,
      monthMessageCount
    ] = await Promise.all([
      prisma.transaction.findMany({
        where: { createdAt: { gte: startDate } },
        include: { customer: true, employee: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.transaction.aggregate({
        _sum: { amount: true, rewardEarned: true },
        _count: { id: true },
        where: { type: 'EARN', createdAt: { gte: startDate } },
      }),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        _count: { id: true },
        where: { type: 'EARN', paymentMethod: 'CASH', createdAt: { gte: startDate } },
      }),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        _count: { id: true },
        where: { type: 'EARN', paymentMethod: 'CARD', createdAt: { gte: startDate } },
      }),
      prisma.transaction.aggregate({
        _sum: { rewardEarned: true },
        _count: { id: true },
        where: { type: 'REDEEM', createdAt: { gte: startDate } },
      }),
      prisma.customer.count(),
      prisma.customer.count({ where: { createdAt: { gte: startDate } } }),
      prisma.customer.findMany({
        orderBy: { totalSpent: 'desc' },
        take: 8,
      }),
      prisma.customer.findMany({
        where: { birthDate: { not: null } },
      }),
      prisma.customer.aggregate({
        _sum: { balance: true },
      }),
      tenantId ? prisma.campaignSettings.findUnique({ where: { tenantId } }) : null,
      tenantId ? prisma.messageLog.count({
        where: {
          tenantId,
          createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
        }
      }) : 0
    ]);

    // Métricas calculadas
    const totalSales = earnAgg._sum.amount || 0;
    const totalRewardsEarned = earnAgg._sum.rewardEarned || 0;
    const totalRewardsRedeemed = redeemAgg._sum.rewardEarned || 0;
    const earnCount = earnAgg._count.id || 0;
    const redeemCount = redeemAgg._count.id || 0;
    const cashSales = cashAgg._sum.amount || 0;
    const cardSales = cardAgg._sum.amount || 0;
    const cashCount = cashAgg._count.id || 0;
    const cardCount = cardAgg._count.id || 0;
    const avgTicket = earnCount > 0 ? totalSales / earnCount : 0;
    const totalBalance = pendingBalance._sum.balance || 0;
    const messageQuota = tenant?.messageQuota || 1000;

    // Chart Slots
    const slots = initSlots(startDate, period);
    for (const tx of allTransactions) {
      if (tx.type !== 'EARN') continue;
      const key = getSlotKey(tx.createdAt, period);
      const slot = slots.get(key);
      if (slot) {
        slot.ventas += tx.amount;
        slot.recompensas += tx.rewardEarned;
        slot.transacciones += 1;
      }
    }

    const chartLabels: string[] = [];
    const chartVentas: number[] = [];
    const chartRecompensas: number[] = [];
    const chartTickets: number[] = [];

    slots.forEach((data, key) => {
      chartLabels.push(formatSlotKey(key, period));
      chartVentas.push(Math.round(data.ventas * 100) / 100);
      chartRecompensas.push(Math.round(data.recompensas * 100) / 100);
      chartTickets.push(data.transacciones);
    });

    // Próximos Cumpleañeros
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcomingBirthdays = birthdayCustomers
      .map(c => {
        const bd = new Date(c.birthDate!);
        const next = new Date(today.getFullYear(), bd.getMonth(), bd.getDate());
        if (next < today) next.setFullYear(today.getFullYear() + 1);
        const daysUntil = Math.ceil((next.getTime() - today.getTime()) / 86400000);
        return {
          name: c.name || 'Cliente sin nombre',
          phone: c.phone,
          balance: c.balance,
          birthDateStr: `${bd.getDate()} de ${MONTHS[bd.getMonth() + 1]}`,
          daysUntil
        };
      })
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 5);

    // Formateadores
    const fmtMoney = (n: number) =>
      new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);

    const nowFormatted = new Date().toLocaleString('es-MX', {
      timeZone: 'America/Mexico_City',
      dateStyle: 'full',
      timeStyle: 'medium'
    });

    const fileDateStr = new Date().toISOString().slice(0, 10);
    const periodName = PERIOD_LABELS[period] || period;
    const businessName = tenant?.name || 'LoyaltyOS Rest';

    // Generar el código HTML interactivo
    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reporte Ejecutivo - ${businessName} (${periodName})</title>
  <!-- Chart.js para visualizaciones fluidas y animadas -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
  <style>
    :root {
      --bg: #0b0f0e;
      --card-bg: rgba(23, 31, 28, 0.7);
      --card-border: rgba(255, 255, 255, 0.08);
      --accent: #00d084;
      --accent-soft: rgba(0, 208, 132, 0.12);
      --accent-gradient: linear-gradient(135deg, #00d084 0%, #38ef7d 100%);
      --sage: #96af98;
      --sage-light: #cde0d0;
      --text: #f0fdf4;
      --text-muted: #8e9f94;
      --cash: #f7b731;
      --card: #4a90e2;
      --danger: #ff4757;
      --font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }

    /* Tema Claro Inspirado en la imagen de referencia */
    body.theme-light {
      --bg: #1c2a22;
      --card-bg: #ffffff;
      --card-border: rgba(0, 0, 0, 0.06);
      --text: #1a221e;
      --text-muted: #627267;
      --accent-soft: rgba(0, 208, 132, 0.15);
    }
    body.theme-light .glass {
      background: #ffffff;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
    }
    body.theme-light .hero-banner {
      background: #e3ebd8;
      color: #1a221e;
    }
    body.theme-light .hero-banner p {
      color: #4f5f54;
    }
    body.theme-light .table th {
      background: #f4f7f4;
      color: #4b5a50;
    }
    body.theme-light .table td {
      border-color: #eef2ee;
      color: #243028;
    }
    body.theme-light .search-input {
      background: #f4f7f4;
      border-color: #d8e2d9;
      color: #1a221e;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background: var(--bg);
      color: var(--text);
      font-family: var(--font);
      line-height: 1.5;
      padding: 2.5rem 1.5rem 5rem 1.5rem;
      min-height: 100vh;
      transition: background 0.3s ease, color 0.3s ease;
    }

    .container {
      max-width: 1280px;
      margin: 0 auto;
    }

    /* Barra Superior */
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1.5rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid var(--card-border);
      margin-bottom: 2.5rem;
    }

    .brand-block {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .brand-logo {
      width: 48px;
      height: 48px;
      background: var(--accent-gradient);
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.6rem;
      box-shadow: 0 4px 18px rgba(0, 208, 132, 0.35);
    }

    .brand-title {
      font-size: 1.6rem;
      font-weight: 800;
      letter-spacing: -0.5px;
    }

    .brand-subtitle {
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    .action-controls {
      display: flex;
      align-items: center;
      gap: 0.8rem;
    }

    .btn {
      background: rgba(255, 255, 255, 0.08);
      color: var(--text);
      border: 1px solid var(--card-border);
      padding: 0.65rem 1.25rem;
      border-radius: 50px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s ease;
      text-decoration: none;
    }
    .btn:hover {
      background: rgba(255, 255, 255, 0.15);
      transform: translateY(-1px);
    }
    .btn-primary {
      background: var(--accent);
      color: #000;
      border: none;
      box-shadow: 0 4px 15px rgba(0, 208, 132, 0.3);
    }
    .btn-primary:hover {
      background: #00b975;
    }

    .badge {
      background: var(--accent-soft);
      color: var(--accent);
      border: 1px solid rgba(0, 208, 132, 0.3);
      padding: 0.35rem 0.9rem;
      border-radius: 50px;
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
    }

    /* Hero / Insights Card inspirado en la imagen */
    .hero-grid {
      display: grid;
      grid-template-columns: 1.15fr 1fr;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    @media (max-width: 900px) {
      .hero-grid {
        grid-template-columns: 1fr;
      }
    }

    .glass {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 24px;
      padding: 2rem;
      backdrop-filter: blur(14px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
    }

    .hero-banner {
      background: linear-gradient(135deg, #233428 0%, #152219 100%);
      border: 1px solid rgba(0, 208, 132, 0.25);
      border-radius: 24px;
      padding: 2.2rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
    }
    .hero-banner::after {
      content: "✦";
      position: absolute;
      right: 1.5rem;
      bottom: -1rem;
      font-size: 9rem;
      color: rgba(0, 208, 132, 0.05);
      pointer-events: none;
    }

    .hero-tag {
      font-size: 0.8rem;
      font-weight: 800;
      color: var(--accent);
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 0.5rem;
    }

    .hero-title {
      font-size: 2.1rem;
      font-weight: 800;
      line-height: 1.2;
      margin-bottom: 0.8rem;
    }

    .hero-desc {
      color: var(--text-muted);
      font-size: 0.95rem;
      max-width: 480px;
      margin-bottom: 1.5rem;
    }

    /* KPI Cards Grid */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.2rem;
      margin-bottom: 2rem;
    }

    .kpi-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 20px;
      padding: 1.4rem;
      transition: transform 0.2s ease, border-color 0.2s ease;
    }
    .kpi-card:hover {
      transform: translateY(-2px);
      border-color: rgba(0, 208, 132, 0.3);
    }

    .kpi-label {
      color: var(--text-muted);
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      font-weight: 700;
      margin-bottom: 0.4rem;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .kpi-value {
      font-size: 1.85rem;
      font-weight: 800;
      color: var(--text);
      letter-spacing: -0.5px;
    }

    .kpi-sub {
      font-size: 0.82rem;
      color: var(--text-muted);
      margin-top: 0.35rem;
    }

    /* Gráficos Grid (Inspirados en la imagen) */
    .charts-grid {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    @media (max-width: 950px) {
      .charts-grid {
        grid-template-columns: 1fr;
      }
    }

    .chart-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 24px;
      padding: 1.8rem;
      display: flex;
      flex-direction: column;
    }

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
    }

    .chart-title {
      font-size: 1.15rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .chart-canvas-wrap {
      position: relative;
      height: 280px;
      width: 100%;
    }

    /* Canales y Barras de Progreso */
    .channel-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 0;
      border-bottom: 1px solid var(--card-border);
      font-size: 0.9rem;
    }
    .channel-item:last-child {
      border-bottom: none;
    }

    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      display: inline-block;
      margin-right: 0.5rem;
    }

    /* Tablas de Top Clientes y Cumpleaños */
    .tables-split {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    @media (max-width: 900px) {
      .tables-split {
        grid-template-columns: 1fr;
      }
    }

    .table-responsive {
      width: 100%;
      overflow-x: auto;
    }

    .table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.88rem;
      text-align: left;
    }

    .table th {
      padding: 0.85rem 1rem;
      background: rgba(255, 255, 255, 0.03);
      color: var(--text-muted);
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      font-weight: 700;
    }

    .table td {
      padding: 0.85rem 1rem;
      border-bottom: 1px solid var(--card-border);
      color: var(--text);
    }

    .table tr:last-child td {
      border-bottom: none;
    }

    .search-input {
      background: rgba(0, 0, 0, 0.25);
      border: 1px solid var(--card-border);
      color: var(--text);
      padding: 0.6rem 1rem;
      border-radius: 10px;
      font-size: 0.85rem;
      width: 100%;
      max-width: 260px;
      outline: none;
    }
    .search-input:focus {
      border-color: var(--accent);
    }

    /* Footer */
    .report-footer {
      text-align: center;
      margin-top: 4rem;
      padding-top: 2rem;
      border-top: 1px solid var(--card-border);
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    /* Modo de Impresión Limpio */
    @media print {
      body {
        background: #ffffff !important;
        color: #000000 !important;
        padding: 0 !important;
      }
      .btn, .action-controls, .search-input {
        display: none !important;
      }
      .glass, .kpi-card, .chart-card, .hero-banner {
        background: #ffffff !important;
        border: 1px solid #cccccc !important;
        color: #000000 !important;
        box-shadow: none !important;
        page-break-inside: avoid;
      }
      .kpi-value, .hero-title, .brand-title, .chart-title {
        color: #000000 !important;
      }
      .kpi-label, .hero-desc, .kpi-sub, .brand-subtitle, .table th {
        color: #555555 !important;
      }
      .table td {
        border-color: #dddddd !important;
        color: #000000 !important;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Barra Superior -->
    <header class="header-bar">
      <div class="brand-block">
        <div class="brand-logo">⚡</div>
        <div>
          <div class="brand-title">${businessName}</div>
          <div class="brand-subtitle">Reporte Ejecutivo de Lealtad · ${periodName}</div>
        </div>
      </div>

      <div class="action-controls">
        <span class="badge">● Datos en Vivo</span>
        <button onclick="toggleTheme()" class="btn" title="Alternar entre modo oscuro y claro">
          🌓 <span id="theme-btn-text">Modo Claro</span>
        </button>
        <button onclick="window.print()" class="btn btn-primary" title="Imprimir o guardar en PDF">
          🖨️ Imprimir / Guardar PDF
        </button>
      </div>
    </header>

    <!-- Hero Insights Card (Inspirado en la imagen de referencia) -->
    <div class="hero-grid">
      <div class="hero-banner">
        <div>
          <div class="hero-tag">Real-Time Performance</div>
          <h1 class="hero-title">Reporte Ejecutivo del Panel de Control</h1>
          <p class="hero-desc">
            Visualización integral de ingresos, comportamiento de comensales, saldo circulante y canales de cobro para el período <strong>${periodName}</strong>.
          </p>
        </div>

        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <div class="badge" style="background: rgba(0,0,0,0.3); border-color: rgba(255,255,255,0.1); color: #fff;">
            📅 Generado: ${nowFormatted}
          </div>
          <div class="badge" style="background: rgba(0,0,0,0.3); border-color: rgba(255,255,255,0.1); color: #fff;">
            🎟️ ${earnCount} tickets generados
          </div>
        </div>
      </div>

      <!-- Métricas Rápidas de Rendimiento -->
      <div class="glass" style="display: flex; flex-direction: column; justify-content: space-between;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <span style="font-weight: 700; font-size: 1.1rem;">Resumen de Fidelización</span>
          <span class="badge">LoyaltyOS v2.0</span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.9rem;">
          <div class="channel-item">
            <span><span class="dot" style="background: var(--accent);"></span>Recompensas Otorgadas:</span>
            <strong style="color: var(--accent);">${fmtMoney(totalRewardsEarned)}</strong>
          </div>
          <div class="channel-item">
            <span><span class="dot" style="background: var(--cash);"></span>Saldo Redimido por Clientes:</span>
            <strong>${fmtMoney(totalRewardsRedeemed)}</strong>
          </div>
          <div class="channel-item">
            <span><span class="dot" style="background: var(--card);"></span>Saldo Pendiente en Billeteras:</span>
            <strong>${fmtMoney(totalBalance)}</strong>
          </div>
          <div class="channel-item">
            <span><span class="dot" style="background: #96af98;"></span>Mensajes WhatsApp Enviados (Mes):</span>
            <strong>${monthMessageCount} / ${messageQuota}</strong>
          </div>
        </div>

        <div style="margin-top: 1rem; padding-top: 0.8rem; border-top: 1px solid var(--card-border); font-size: 0.8rem; color: var(--text-muted);">
          💡 <em>El saldo en billetera representa visitas futuras ya aseguradas por tus comensales.</em>
        </div>
      </div>
    </div>

    <!-- 6 KPIs Principales (Tarjetas de Control) -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-label">💰 Ventas Totales</div>
        <div class="kpi-value" data-counter="${totalSales}">${fmtMoney(totalSales)}</div>
        <div class="kpi-sub">${earnCount} tickets registrados</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-label">🎁 Recompensas</div>
        <div class="kpi-value" data-counter="${totalRewardsEarned}">${fmtMoney(totalRewardsEarned)}</div>
        <div class="kpi-sub">${redeemCount} canjes de saldo</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-label">👥 Clientes Totales</div>
        <div class="kpi-value">${totalCustomers}</div>
        <div class="kpi-sub" style="color: var(--accent);">+${newCustomers} nuevos en período</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-label">🎟️ Ticket Promedio</div>
        <div class="kpi-value" data-counter="${avgTicket}">${fmtMoney(avgTicket)}</div>
        <div class="kpi-sub">Por visita de cliente</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-label">💵 Efectivo</div>
        <div class="kpi-value" style="color: var(--cash);" data-counter="${cashSales}">${fmtMoney(cashSales)}</div>
        <div class="kpi-sub">${cashCount} tickets en efectivo</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-label">💳 Tarjeta</div>
        <div class="kpi-value" style="color: var(--card);" data-counter="${cardSales}">${fmtMoney(cardSales)}</div>
        <div class="kpi-sub">${cardCount} tickets con tarjeta</div>
      </div>
    </div>

    <!-- Gráficos Animados (Estilo Total Revenue & Total Sales de la referencia) -->
    <div class="charts-grid">
      <!-- Gráfico 1: Evolución de Ventas (Area Curva Suave con Gradiente) -->
      <div class="chart-card">
        <div class="chart-header">
          <div>
            <div class="chart-title">📈 Evolución de Ventas ($ MXN)</div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">Comportamiento acumulado durante el período</div>
          </div>
          <div class="badge">${periodName}</div>
        </div>
        <div class="chart-canvas-wrap">
          <canvas id="revenueChart"></canvas>
        </div>
      </div>

      <!-- Gráfico 2: Canales de Pago (Donut Moderno) -->
      <div class="chart-card">
        <div class="chart-header">
          <div>
            <div class="chart-title">🍩 Canales de Cobro</div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">Distribución Efectivo vs Tarjeta</div>
          </div>
          <div style="font-size: 0.85rem; font-weight: 700; color: var(--accent);">
            ${cashSales + cardSales > 0 ? ((cashSales / (cashSales + cardSales)) * 100).toFixed(0) : 0}% Efectivo
          </div>
        </div>
        <div class="chart-canvas-wrap">
          <canvas id="channelChart"></canvas>
        </div>
      </div>
    </div>

    <!-- Gráfico 3: Volumen de Transacciones (Barras Redondeadas estilo Imagen de Referencia) -->
    <div class="chart-card" style="margin-bottom: 2rem;">
      <div class="chart-header">
        <div>
          <div class="chart-title">📊 Frecuencia de Transacciones por Tramo</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">Número de tickets emitidos a lo largo del período</div>
        </div>
        <div class="badge" style="background: rgba(150, 175, 152, 0.15); color: var(--sage); border-color: rgba(150, 175, 152, 0.3);">
          ${earnCount} Tickets Totales
        </div>
      </div>
      <div class="chart-canvas-wrap" style="height: 240px;">
        <canvas id="salesBarChart"></canvas>
      </div>
    </div>

    <!-- Tablas Split: Top Clientes VIP y Próximos Cumpleaños -->
    <div class="tables-split">
      <!-- Top Clientes -->
      <div class="glass" style="padding: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.2rem;">
          <div style="font-weight: 700; font-size: 1.1rem;">🏆 Top Clientes VIP</div>
          <span style="font-size: 0.8rem; color: var(--text-muted);">Mayores Consumidores</span>
        </div>

        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Teléfono</th>
                <th>Total Gastado</th>
                <th>Saldo Billetera</th>
              </tr>
            </thead>
            <tbody>
              ${topCustomers.length === 0 ? '<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">No hay clientes registrados en este período.</td></tr>' : ''}
              ${topCustomers.map(c => `
                <tr>
                  <td><strong>${c.name || 'Sin nombre'}</strong></td>
                  <td style="color: var(--text-muted);">${c.phone}</td>
                  <td><strong>${fmtMoney(c.totalSpent)}</strong></td>
                  <td style="color: var(--accent); font-weight: 700;">${fmtMoney(c.balance)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Próximos Cumpleañeros -->
      <div class="glass" style="padding: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.2rem;">
          <div style="font-weight: 700; font-size: 1.1rem;">🎂 Próximos Cumpleañeros</div>
          <span style="font-size: 0.8rem; color: var(--accent);">Marketing Activo</span>
        </div>

        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Fecha</th>
                <th>Días Faltantes</th>
              </tr>
            </thead>
            <tbody>
              ${upcomingBirthdays.length === 0 ? '<tr><td colspan="3" style="text-align: center; color: var(--text-muted);">No hay cumpleaños próximos registrados.</td></tr>' : ''}
              ${upcomingBirthdays.map(b => `
                <tr>
                  <td><strong>${b.name}</strong></td>
                  <td style="color: var(--text-muted);">${b.birthDateStr}</td>
                  <td>
                    <span class="badge" style="font-size: 0.72rem; padding: 0.2rem 0.6rem;">
                      ${b.daysUntil === 0 ? '¡Hoy! 🎉' : `En ${b.daysUntil} días`}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Tabla Completa de Transacciones con Buscador en Vivo -->
    <div class="glass" style="padding: 1.8rem; margin-bottom: 2.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.25rem;">
        <div>
          <div style="font-weight: 700; font-size: 1.15rem;">📋 Registro Detallado de Transacciones</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">Todas las operaciones realizadas en ${periodName} (${allTransactions.length} movimientos)</div>
        </div>

        <input 
          type="text" 
          id="txSearch" 
          onkeyup="filterTransactions()" 
          placeholder="🔍 Buscar cliente, teléfono..." 
          class="search-input"
        />
      </div>

      <div class="table-responsive">
        <table class="table" id="transactionsTable">
          <thead>
            <tr>
              <th>Fecha y Hora</th>
              <th>Cliente</th>
              <th>Cajero / Empleado</th>
              <th>Tipo</th>
              <th>Método</th>
              <th>Consumo</th>
              <th>Cashback (+ / -)</th>
            </tr>
          </thead>
          <tbody>
            ${allTransactions.length === 0 ? '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-muted);">No se registraron transacciones en este período.</td></tr>' : ''}
            ${allTransactions.map(tx => {
              const dateStr = new Date(tx.createdAt).toLocaleString('es-MX', {
                timeZone: 'America/Mexico_City',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });
              const isEarn = tx.type === 'EARN';
              return `
                <tr>
                  <td style="color: var(--text-muted); white-space: nowrap;">${dateStr}</td>
                  <td>
                    <strong>${tx.customer?.name || 'Cliente'}</strong><br/>
                    <small style="color: var(--text-muted);">${tx.customer?.phone || ''}</small>
                  </td>
                  <td style="color: var(--text-muted);">${tx.employee?.name || 'Caja Principal'}</td>
                  <td>
                    <span class="badge" style="font-size: 0.72rem; padding: 0.2rem 0.6rem; background: ${isEarn ? 'rgba(0,208,132,0.1)' : 'rgba(255,71,87,0.1)'}; color: ${isEarn ? 'var(--accent)' : 'var(--danger)'}; border-color: ${isEarn ? 'rgba(0,208,132,0.3)' : 'rgba(255,71,87,0.3)'};">
                      ${isEarn ? '✨ Acumulación' : '🛍️ Canje'}
                    </span>
                  </td>
                  <td>
                    ${tx.paymentMethod === 'CARD' ? '💳 Tarjeta' : '💵 Efectivo'}
                  </td>
                  <td><strong>${fmtMoney(tx.amount)}</strong></td>
                  <td style="font-weight: 700; color: ${isEarn ? 'var(--accent)' : 'var(--danger)'};">
                    ${isEarn ? '+' : '-'}${fmtMoney(tx.rewardEarned)}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pie de Reporte -->
    <footer class="report-footer">
      <p>Generado automáticamente por el Panel de Control de <strong>LoyaltyOS</strong></p>
      <p style="margin-top: 0.3rem;">Desarrollado por <a href="https://agenciamasbrain.com/" target="_blank" style="color: var(--accent); text-decoration: none;">Agencia +Brain</a> · © 2026</p>
    </footer>
  </div>

  <!-- Scripts para Renderizar Gráficos y Animaciones -->
  <script>
    // Datos inyectados desde el servidor
    const chartLabels = ${JSON.stringify(chartLabels)};
    const chartVentas = ${JSON.stringify(chartVentas)};
    const chartTickets = ${JSON.stringify(chartTickets)};
    const cashTotal = ${cashSales};
    const cardTotal = ${cardSales};

    // Inicializar Gráficos con Chart.js
    document.addEventListener('DOMContentLoaded', () => {
      // 1. Gráfico de Evolución de Ventas (Curva suave con gradiente)
      const ctxRev = document.getElementById('revenueChart');
      if (ctxRev && window.Chart) {
        const revCtx = ctxRev.getContext('2d');
        const grad = revCtx.createLinearGradient(0, 0, 0, 260);
        grad.addColorStop(0, 'rgba(0, 208, 132, 0.35)');
        grad.addColorStop(1, 'rgba(0, 208, 132, 0.0)');

        new Chart(ctxRev, {
          type: 'line',
          data: {
            labels: chartLabels,
            datasets: [{
              label: 'Ventas ($ MXN)',
              data: chartVentas,
              borderColor: '#00d084',
              backgroundColor: grad,
              borderWidth: 3,
              fill: true,
              tension: 0.4,
              pointBackgroundColor: '#00d084',
              pointRadius: 4,
              pointHoverRadius: 6,
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
              duration: 1500,
              easing: 'easeOutQuart'
            },
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: 'rgba(10, 15, 12, 0.9)',
                titleColor: '#fff',
                bodyColor: '#00d084',
                borderColor: 'rgba(0, 208, 132, 0.3)',
                borderWidth: 1,
                callbacks: {
                  label: function(ctx) {
                    return ' Ventas: $' + ctx.parsed.y.toLocaleString('es-MX', { minimumFractionDigits: 2 });
                  }
                }
              }
            },
            scales: {
              x: {
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: '#8e9f94', font: { size: 11 } }
              },
              y: {
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: {
                  color: '#8e9f94',
                  font: { size: 11 },
                  callback: function(val) { return '$' + val; }
                }
              }
            }
          }
        });
      }

      // 2. Gráfico Donut de Canales de Pago
      const ctxChan = document.getElementById('channelChart');
      if (ctxChan && window.Chart) {
        new Chart(ctxChan, {
          type: 'doughnut',
          data: {
            labels: ['Efectivo', 'Tarjeta'],
            datasets: [{
              data: [cashTotal, cardTotal],
              backgroundColor: ['#f7b731', '#4a90e2'],
              borderWidth: 0,
              hoverOffset: 6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%',
            animation: {
              animateScale: true,
              animateRotate: true,
              duration: 1400
            },
            plugins: {
              legend: {
                position: 'bottom',
                labels: { color: '#8e9f94', padding: 15, font: { size: 12, weight: 600 } }
              },
              tooltip: {
                callbacks: {
                  label: function(ctx) {
                    const total = cashTotal + cardTotal;
                    const pct = total > 0 ? ((ctx.parsed / total) * 100).toFixed(1) : 0;
                    return ' ' + ctx.label + ': $' + ctx.parsed.toLocaleString() + ' (' + pct + '%)';
                  }
                }
              }
            }
          }
        });
      }

      // 3. Gráfico de Barras Redondeadas Modernas (Tickets / Transacciones)
      const ctxBar = document.getElementById('salesBarChart');
      if (ctxBar && window.Chart) {
        new Chart(ctxBar, {
          type: 'bar',
          data: {
            labels: chartLabels,
            datasets: [{
              label: 'Tickets',
              data: chartTickets,
              backgroundColor: '#96af98',
              hoverBackgroundColor: '#00d084',
              borderRadius: 14,
              borderSkipped: false,
              barThickness: chartLabels.length > 15 ? 12 : 24,
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
              duration: 1200,
              easing: 'easeOutBounce'
            },
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: function(ctx) {
                    return ' ' + ctx.parsed.y + ' tickets registrados';
                  }
                }
              }
            },
            scales: {
              x: {
                grid: { display: false },
                ticks: { color: '#8e9f94', font: { size: 11 } }
              },
              y: {
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: '#8e9f94', stepSize: 1, font: { size: 11 } }
              }
            }
          }
        });
      }
    });

    // Filtro interactivo de transacciones
    function filterTransactions() {
      const input = document.getElementById('txSearch');
      const filter = input.value.toLowerCase();
      const table = document.getElementById('transactionsTable');
      const tr = table.getElementsByTagName('tr');

      for (let i = 1; i < tr.length; i++) {
        const text = tr[i].textContent || tr[i].innerText;
        if (text.toLowerCase().indexOf(filter) > -1) {
          tr[i].style.display = '';
        } else {
          tr[i].style.display = 'none';
        }
      }
    }

    // Alternador de Modo Claro / Modo Oscuro
    function toggleTheme() {
      const isLight = document.body.classList.toggle('theme-light');
      const btnText = document.getElementById('theme-btn-text');
      if (btnText) {
        btnText.textContent = isLight ? 'Modo Oscuro' : 'Modo Claro';
      }
    }
  </script>
</body>
</html>`;

    // Retornar archivo descargable
    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': viewInline
          ? 'inline'
          : `attachment; filename="reporte-loyaltyos-${period}-${fileDateStr}.html"`,
      },
    });
  } catch (error: any) {
    console.error('HTML Export error:', error);
    return NextResponse.json({ error: 'Error generando reporte HTML' }, { status: 500 });
  }
}
