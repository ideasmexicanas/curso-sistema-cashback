'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import PeriodSelector from './PeriodSelector';
import DashboardCharts from './DashboardCharts';
import TopCustomers from './TopCustomers';
import UpcomingBirthdays from './UpcomingBirthdays';
import styles from './admin.module.css';

type Period = 'hora' | 'dia' | 'semana' | 'quincena' | 'mes' | 'anio';

interface Stats {
  totalSales: number; totalRewards: number;
  earnCount: number; redeemCount: number; totalTransactions: number;
  activeCustomers: number; newCustomers: number;
  avgTicket: number; pendingBalance: number;
  cashSales: number; cardSales: number;
  cashCount: number; cardCount: number;
}

interface ChartPoint {
  label: string; ventas: number; recompensas: number; transacciones: number;
}

interface Transaction {
  id: string; date: string; customerName: string;
  customerPhone: string; customerId: string;
  amount: number; rewardEarned: number;
  type: 'EARN' | 'REDEEM'; paymentMethod: 'CASH' | 'CARD';
}

interface TopCustomer {
  id: string; name: string | null; phone: string; totalSpent: number; balance: number;
}

interface Birthday {
  id: string; name: string | null; phone: string; birthDate: string; daysUntil: number;
}

interface DashboardData {
  stats: Stats; chartData: ChartPoint[];
  topCustomers: TopCustomer[]; upcomingBirthdays: Birthday[];
  transactions: {
    data: Transaction[]; total: number;
    page: number; pageSize: number; totalPages: number;
  };
}

const PERIOD_LABELS: Record<Period, string> = {
  hora: 'Última Hora', dia: 'Hoy', semana: 'Últimos 7 Días',
  quincena: 'Últimos 15 Días', mes: 'Últimos 30 Días', anio: 'Último Año',
};

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub: string; accent: string }) {
  return (
    <div className={`glass-card ${styles.statCard}`}>
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statTrend} style={{ color: accent }}>{sub}</div>
    </div>
  );
}

export default function DashboardClient() {
  const [period, setPeriod] = useState<Period>('mes');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<DashboardData | null>(null);
  const [msgStats, setMsgStats] = useState<{ month: number; quota: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const fetchData = useCallback(async (p: Period, pg: number) => {
    setLoading(true);
    try {
      const [res, msgRes] = await Promise.all([
        fetch(`/api/stats?period=${p}&page=${pg}`),
        fetch(`/api/stats/messages`)
      ]);
      const json = await res.json();
      const msgJson = await msgRes.json();
      if (json.success) setData(json);
      if (msgJson.success) setMsgStats(msgJson.stats);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(period, page); }, [period, page, fetchData]);

  const handlePeriodChange = (p: Period) => { setPeriod(p); setPage(1); };

  const handleDownload = () => {
    setDownloading(true);
    window.location.href = `/api/export?period=${period}`;
    setTimeout(() => setDownloading(false), 3000);
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);

  const fmtDate = (s: string) =>
    new Date(s).toLocaleString('es-MX', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const stats = data?.stats;
  const cashTotal = (stats?.cashSales || 0) + (stats?.cardSales || 0);
  const cashPct = cashTotal > 0 ? ((stats?.cashSales || 0) / cashTotal) * 100 : 50;

  return (
    <>
      {/* ── Period bar ───────────────────────────────── */}
      <div className={styles.periodBar}>
        <PeriodSelector value={period} onChange={handlePeriodChange} />
        <button onClick={handleDownload} disabled={downloading} className={styles.downloadBtn}>
          {downloading ? '⏳ Generando...' : '⬇ Descargar Excel'}
        </button>
      </div>

      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: '1rem' }}>Cargando datos...</p>
        </div>
      ) : (
        <>
          {/* ── 6 Stat cards ──────────────────────────── */}
          <div className={styles.statsGrid}>
            <StatCard label="💰 Ventas Totales"       value={fmt(stats?.totalSales || 0)}   sub={`${stats?.earnCount || 0} tickets`}              accent="var(--primary)" />
            <StatCard label="🎁 Recompensas"          value={fmt(stats?.totalRewards || 0)} sub={`${stats?.redeemCount || 0} redenciones`}         accent="var(--primary)" />
            <StatCard label="👥 Clientes"             value={String(stats?.activeCustomers || 0)} sub={`+${stats?.newCustomers || 0} nuevos en período`} accent="var(--primary)" />
            <StatCard label="🎟️ Ticket Promedio"     value={fmt(stats?.avgTicket || 0)}    sub="Por visita"                                       accent="var(--primary)" />
            <StatCard label="💵 Efectivo"             value={fmt(stats?.cashSales || 0)}    sub={`${stats?.cashCount || 0} tickets`}               accent="#f7b731" />
            <StatCard label="💳 Tarjeta"              value={fmt(stats?.cardSales || 0)}    sub={`${stats?.cardCount || 0} tickets`}               accent="#4a90e2" />
          </div>

          {/* ── Message Quota Widget ─────────────────── */}
          {msgStats && (
            <div className={`glass-card ${styles.paymentBreakdown}`} style={{ marginTop: '1.5rem' }}>
              <div className={styles.paymentLabels}>
                <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>📱 Consumo de Mensajes (Mes Actual)</span>
                <span style={{ fontWeight: 600, color: (msgStats.month / msgStats.quota) > 0.9 ? '#ff4757' : 'var(--text)' }}>
                  {msgStats.month} / {msgStats.quota}
                </span>
              </div>
              <div className={styles.paymentTrack} style={{ height: '12px', background: 'rgba(255,255,255,0.1)' }}>
                <div 
                  className={styles.fillCash} 
                  style={{ 
                    width: `${Math.min((msgStats.month / msgStats.quota) * 100, 100)}%`,
                    background: (msgStats.month / msgStats.quota) > 0.9 ? '#ff4757' : '#00c864'
                  }} 
                />
              </div>
            </div>
          )}

          {/* ── Payment breakdown bar ─────────────────── */}
          {cashTotal > 0 && (
            <div className={`glass-card ${styles.paymentBreakdown}`}>
              <div className={styles.paymentLabels}>
                <span><span className={styles.dotCash} />Efectivo: {fmt(stats?.cashSales || 0)} ({cashPct.toFixed(0)}%)</span>
                <span><span className={styles.dotCard} />Tarjeta: {fmt(stats?.cardSales || 0)} ({(100 - cashPct).toFixed(0)}%)</span>
              </div>
              <div className={styles.paymentTrack}>
                <div className={styles.fillCash} style={{ width: `${cashPct}%` }} />
                <div className={styles.fillCard} style={{ width: `${100 - cashPct}%` }} />
              </div>
            </div>
          )}

          {/* ── Charts ────────────────────────────────── */}
          <DashboardCharts data={data?.chartData || []} period={period} />

          {/* ── Top customers + Birthdays ─────────────── */}
          <div className={styles.sideGrid}>
            <TopCustomers customers={data?.topCustomers || []} />
            <UpcomingBirthdays birthdays={(data?.upcomingBirthdays || []).map(b => ({
              ...b, birthDate: new Date(b.birthDate)
            }))} />
          </div>

          {/* ── Full transaction table ────────────────── */}
          <div className={`glass-card ${styles.tableCard}`}>
            <div className={styles.tableHeaderRow}>
              <h2 className={styles.sectionTitle}>📋 Historial — {PERIOD_LABELS[period]}</h2>
              <span className={styles.tableCount}>{data?.transactions.total || 0} registros</span>
            </div>

            {!data?.transactions.data.length ? (
              <p style={{ color: 'rgba(255,255,255,0.4)', padding: '1rem 0' }}>
                No hay transacciones en este período.
              </p>
            ) : (
              <>
                <div style={{ overflowX: 'auto' }}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Fecha y Hora</th>
                        <th>Cliente</th>
                        <th>Teléfono</th>
                        <th>Monto por Visita</th>
                        <th>Recompensa</th>
                        <th>Método</th>
                        <th>Tipo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.transactions.data.map(tx => (
                        <tr key={tx.id}>
                          <td className={styles.tdMuted}>{fmtDate(tx.date)}</td>
                          <td>
                            <Link href={`/admin/customers/${tx.customerId}`} className={styles.tdLink}>
                              {tx.customerName} ↗
                            </Link>
                          </td>
                          <td className={styles.tdMuted}>{tx.customerPhone}</td>
                          <td style={{ fontWeight: 700 }}>{fmt(tx.amount)}</td>
                          <td style={{ color: tx.type === 'EARN' ? 'var(--primary)' : '#ff4757', fontWeight: 600 }}>
                            {tx.type === 'EARN' ? '+' : '-'}{fmt(tx.rewardEarned)}
                          </td>
                          <td>
                            <span className={tx.paymentMethod === 'CASH' ? styles.badgeCash : styles.badgeCard}>
                              {tx.paymentMethod === 'CASH' ? '💵 Efectivo' : '💳 Tarjeta'}
                            </span>
                          </td>
                          <td>
                            <span className={tx.type === 'EARN' ? styles.badgeEarn : styles.badgeRedeem}>
                              {tx.type === 'EARN' ? 'Compra' : 'Redención'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {(data?.transactions.totalPages || 0) > 1 && (
                  <div className={styles.pagination}>
                    <button className={styles.pageBtn} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>
                      ← Anterior
                    </button>
                    <span className={styles.pageInfo}>
                      Página {data?.transactions.page} de {data?.transactions.totalPages}
                    </span>
                    <button className={styles.pageBtn} onClick={() => setPage(p => p + 1)} disabled={page >= (data?.transactions.totalPages || 1)}>
                      Siguiente →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}
