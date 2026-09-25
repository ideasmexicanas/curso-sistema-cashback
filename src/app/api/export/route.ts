import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import ExcelJS from 'exceljs';

export const dynamic = 'force-dynamic';

type Period = 'hora' | 'dia' | 'semana' | 'quincena' | 'mes' | 'anio';
const MX_OFFSET_MS = -6 * 3600 * 1000;

function getStartDate(period: Period): Date {
  const now = new Date();
  switch (period) {
    case 'hora':     return new Date(now.getTime() - 3600000);
    case 'dia': {
      const mx = new Date(now.getTime() + MX_OFFSET_MS);
      mx.setUTCHours(0, 0, 0, 0);
      return new Date(mx.getTime() - MX_OFFSET_MS);
    }
    case 'semana':   return new Date(now.getTime() - 7 * 86400000);
    case 'quincena': return new Date(now.getTime() - 15 * 86400000);
    case 'mes':      return new Date(now.getTime() - 30 * 86400000);
    case 'anio':     return new Date(now.getTime() - 365 * 86400000);
  }
}

const PERIOD_LABELS: Record<string, string> = {
  hora: 'Última Hora', dia: 'Hoy', semana: 'Últimos 7 Días',
  quincena: 'Últimos 15 Días', mes: 'Últimos 30 Días', anio: 'Último Año',
};

function fmtDate(d: Date) { return new Date(d).toLocaleDateString('es-MX'); }
function fmtTime(d: Date) { return new Date(d).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }); }

export async function GET(req: NextRequest) {
  try {
    const period = (req.nextUrl.searchParams.get('period') || 'mes') as Period;
    const startDate = getStartDate(period);

    const [transactions, customers, earnAgg, cashAgg, cardAgg, redeemAgg] = await Promise.all([
      prisma.transaction.findMany({
        where: { createdAt: { gte: startDate } },
        include: { customer: true, employee: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.customer.findMany({ orderBy: { totalSpent: 'desc' } }),
      prisma.transaction.aggregate({
        _sum: { amount: true, rewardEarned: true }, _count: { id: true },
        where: { type: 'EARN', createdAt: { gte: startDate } },
      }),
      prisma.transaction.aggregate({
        _sum: { amount: true }, _count: { id: true },
        where: { type: 'EARN', paymentMethod: 'CASH', createdAt: { gte: startDate } },
      }),
      prisma.transaction.aggregate({
        _sum: { amount: true }, _count: { id: true },
        where: { type: 'EARN', paymentMethod: 'CARD', createdAt: { gte: startDate } },
      }),
      prisma.transaction.aggregate({
        _count: { id: true },
        where: { type: 'REDEEM', createdAt: { gte: startDate } },
      }),
    ]);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'LoyaltyOS';
    workbook.lastModifiedBy = 'LoyaltyOS';
    workbook.created = new Date();
    workbook.modified = new Date();

    const totalSales = earnAgg._sum.amount || 0;
    const earnCount  = earnAgg._count.id || 0;
    const totalRewards = earnAgg._sum.rewardEarned || 0;
    const cashTotal = cashAgg._sum.amount || 0;
    const cardTotal = cardAgg._sum.amount || 0;
    const cashCount = cashAgg._count.id || 0;
    const cardCount = cardAgg._count.id || 0;
    const avgTicket = earnCount ? totalSales / earnCount : 0;

    // ─── HOJA 1: RESUMEN EJECUTIVO ──────────────────────────────────────────────
    const ws1 = workbook.addWorksheet('Resumen', { views: [{ showGridLines: false }] });
    
    // Título
    ws1.mergeCells('A1:C2');
    const titleCell = ws1.getCell('A1');
    titleCell.value = 'Reporte Dinámico: ' + (PERIOD_LABELS[period] || period);
    titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000000' } };
    
    ws1.getCell('A3').value = `Generado el: ${new Date().toLocaleString('es-MX')}`;
    ws1.getCell('A3').font = { italic: true, color: { argb: 'FF555555' } };
    
    // Tarjetas de Métricas (Simuladas en Excel)
    const metricsStart = 5;
    const drawCard = (row: number, col: number, label: string, value: any, color: string, isCurrency = false) => {
      const cellLabel = ws1.getCell(row, col);
      const cellValue = ws1.getCell(row + 1, col);
      
      cellLabel.value = label;
      cellLabel.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cellLabel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
      cellLabel.alignment = { horizontal: 'center' };
      
      cellValue.value = value;
      cellValue.font = { bold: true, size: 14 };
      cellValue.alignment = { horizontal: 'center', vertical: 'middle' };
      if (isCurrency) cellValue.numFmt = '"$"#,##0.00';
      
      ws1.getColumn(col).width = 25;
    };

    drawCard(metricsStart, 1, '💰 Ventas Totales', totalSales, 'FF00D084', true);
    drawCard(metricsStart, 2, '🎁 Recompensas Entregadas', totalRewards, 'FFFF4757', true);
    drawCard(metricsStart, 3, '🛍️ Total Tickets', earnCount, 'FF4A90E2', false);
    
    drawCard(metricsStart + 3, 1, '🎟️ Ticket Promedio', avgTicket, 'FF6C5CE7', true);
    drawCard(metricsStart + 3, 2, '💵 Efectivo (Total)', cashTotal, 'FFF7B731', true);
    drawCard(metricsStart + 3, 3, '💳 Tarjeta (Total)', cardTotal, 'FF00B894', true);

    // ─── HOJA 2: TRANSACCIONES ──────────────────────────────────────────────────
    const ws2 = workbook.addWorksheet('Transacciones');
    ws2.columns = [
      { header: 'Fecha', key: 'fecha', width: 12 },
      { header: 'Hora', key: 'hora', width: 10 },
      { header: 'Cliente', key: 'cliente', width: 25 },
      { header: 'Teléfono', key: 'telefono', width: 15 },
      { header: 'Monto (MXN)', key: 'monto', width: 18, style: { numFmt: '"$"#,##0.00' } },
      { header: 'Recompensa (MXN)', key: 'recompensa', width: 20, style: { numFmt: '"$"#,##0.00' } },
      { header: 'Método', key: 'metodo', width: 15 },
      { header: 'Tipo', key: 'tipo', width: 15 },
      { header: 'Empleado', key: 'empleado', width: 20 }
    ];

    // Estilo de Cabecera
    ws2.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    ws2.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF333333' } };
    ws2.getRow(1).alignment = { horizontal: 'center' };

    transactions.forEach(tx => {
      const isEarn = tx.type === 'EARN';
      const row = ws2.addRow({
        fecha: fmtDate(tx.createdAt),
        hora: fmtTime(tx.createdAt),
        cliente: tx.customer.name || 'Sin nombre',
        telefono: tx.customer.phone,
        monto: tx.amount,
        recompensa: tx.rewardEarned,
        metodo: tx.paymentMethod === 'CASH' ? 'Efectivo' : 'Tarjeta',
        tipo: isEarn ? 'Compra' : 'Redención',
        empleado: tx.employee?.name || 'N/A'
      });

      // Dar color verde a compras y rojo a redenciones en la columna Tipo
      const typeCell = row.getCell('tipo');
      typeCell.font = { color: { argb: isEarn ? 'FF00AA00' : 'FFFF0000' }, bold: true };
    });

    // Filtros auto aplicados
    ws2.autoFilter = 'A1:I1';

    // ─── HOJA 3: CLIENTES ───────────────────────────────────────────────────────
    const ws3 = workbook.addWorksheet('Clientes');
    ws3.columns = [
      { header: 'Nombre', key: 'nombre', width: 25 },
      { header: 'Teléfono', key: 'telefono', width: 15 },
      { header: 'Balance Disponible (MXN)', key: 'balance', width: 25, style: { numFmt: '"$"#,##0.00' } },
      { header: 'Total Gastado (MXN)', key: 'gastado', width: 22, style: { numFmt: '"$"#,##0.00' } },
      { header: 'Fecha de Registro', key: 'registro', width: 18 },
      { header: 'Cumpleaños', key: 'cumpleanos', width: 15 }
    ];

    ws3.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    ws3.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF333333' } };

    customers.forEach(c => {
      ws3.addRow({
        nombre: c.name || 'Sin nombre',
        telefono: c.phone,
        balance: c.balance,
        gastado: c.totalSpent,
        registro: fmtDate(c.createdAt),
        cumpleanos: c.birthDate ? fmtDate(c.birthDate) : 'N/A'
      });
    });

    ws3.autoFilter = 'A1:F1';

    // ─── EXPORTAR BUFFER ────────────────────────────────────────────────────────
    const buffer = await workbook.xlsx.writeBuffer();
    const filename = `loyalty-reporte-${period}-${new Date().toISOString().split('T')[0]}.xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err: any) {
    console.error('Export error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
