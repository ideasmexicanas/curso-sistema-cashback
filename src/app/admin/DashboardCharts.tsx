'use client';

import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, CartesianAxis
} from 'recharts';
import styles from './admin.module.css';

interface ChartPoint {
  label: string;
  ventas: number;
  recompensas: number;
  transacciones: number;
}

interface DashboardChartsProps {
  data: ChartPoint[];
  period: string;
}

export default function DashboardCharts({ data, period }: DashboardChartsProps) {
  if (!data || data.length === 0) {
    return (
      <div className={styles.chartsGrid}>
        <div className={`glass-card ${styles.chartCard}`}>
          <h3>Ingresos y Recompensas</h3>
          <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: '2rem' }}>No hay datos para mostrar.</p>
        </div>
      </div>
    );
  }

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: 'rgba(20, 20, 20, 0.95)', padding: '12px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
          <p style={{ color: '#fff', marginBottom: '8px', fontWeight: 'bold' }}>{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} style={{ color: entry.color, display: 'flex', justifyContent: 'space-between', gap: '1rem', fontSize: '14px', marginBottom: '4px' }}>
              <span>{entry.name}:</span>
              <span style={{ fontWeight: 'bold' }}>
                {entry.name === 'Transacciones' ? entry.value : `$${entry.value.toFixed(2)}`}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.chartsGrid}>
      {/* ── Line Chart: Ingresos vs Recompensas ── */}
      <div className={`glass-card ${styles.chartCard}`}>
        <h3 className={styles.chartTitle}>Ingresos y Recompensas ({period.toUpperCase()})</h3>
        <div className={styles.chartWrapper}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="label" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} tickLine={false} axisLine={false} dy={10} minTickGap={20} />
              <YAxis yAxisId="left" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} tickLine={false} axisLine={false} dx={-10} tickFormatter={(v) => `$${v}`} />
              <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} tickLine={false} axisLine={false} dx={10} tickFormatter={(v) => `$${v}`} />
              <Tooltip content={customTooltip} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Line yAxisId="left" name="Ventas" type="monotone" dataKey="ventas" stroke="var(--primary)" strokeWidth={3} dot={false} activeDot={{ r: 6, stroke: 'var(--background)', strokeWidth: 2 }} />
              <Line yAxisId="right" name="Recompensas" type="monotone" dataKey="recompensas" stroke="#ff4757" strokeWidth={2} strokeDasharray="5 5" dot={false} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Bar Chart: Transacciones ── */}
      <div className={`glass-card ${styles.chartCard}`}>
        <h3 className={styles.chartTitle}>Volumen de Transacciones</h3>
        <div className={styles.chartWrapper}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="label" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} tickLine={false} axisLine={false} dy={10} minTickGap={20} />
              <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} tickLine={false} axisLine={false} dx={-10} allowDecimals={false} />
              <Tooltip content={customTooltip} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar name="Transacciones" dataKey="transacciones" fill="#4a90e2" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
