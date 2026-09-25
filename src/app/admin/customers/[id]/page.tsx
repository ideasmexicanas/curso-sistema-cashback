import { prisma } from '@/lib/prisma';
import styles from '../customers.module.css';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function CustomerHistoryPage({ params }: { params: { id: string } }) {
  const customer = await prisma.customer.findUnique({
    where: { id: params.id },
    include: {
      transactions: {
        orderBy: { createdAt: 'desc' },
        include: { employee: true }
      }
    }
  });

  if (!customer) {
    return <div>Cliente no encontrado</div>;
  }

  return (
    <div className={styles.container}>
      <Link href="/admin/customers" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '0.9rem', marginBottom: '1rem', display: 'inline-block' }}>
        ← Volver al directorio
      </Link>
      
      <div className={styles.headerRow} style={{ marginTop: '1rem' }}>
        <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Expediente del Cliente</h2>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statTitle}>WhatsApp</div>
          <div className={styles.statValue} style={{ fontSize: '1.5rem' }}>{customer.phone}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statTitle}>Cumpleaños</div>
          <div className={styles.statValue} style={{ fontSize: '1.5rem', color: customer.birthDate ? 'white' : 'rgba(255,255,255,0.3)' }}>
            {customer.birthDate ? new Date(customer.birthDate).toLocaleDateString() : 'No registrado'}
          </div>
        </div>
        <div className={styles.statCard} style={{ background: 'rgba(0, 208, 132, 0.05)', borderColor: 'rgba(0, 208, 132, 0.2)' }}>
          <div className={styles.statTitle}>Saldo Disponible</div>
          <div className={styles.statValue} style={{ color: 'var(--primary)' }}>${customer.balance.toFixed(2)}</div>
        </div>
      </div>

      <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'rgba(255,255,255,0.8)' }}>Historial de Movimientos</h3>

      <div className={styles.tableCard}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Fecha y Hora</th>
                <th>Tipo</th>
                <th>Monto de Cuenta</th>
                <th>Puntos/Saldo Involucrado</th>
                <th>Atendido por</th>
              </tr>
            </thead>
            <tbody>
              {customer.transactions.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className={styles.emptyState}>
                      No hay transacciones registradas.
                    </div>
                  </td>
                </tr>
              ) : (
                customer.transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td style={{ opacity: 0.7 }}>
                      {new Date(tx.createdAt).toLocaleString()}
                    </td>
                    <td>
                      {tx.type === 'EARN' ? (
                        <span style={{ color: 'var(--primary)', background: 'rgba(0, 208, 132, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>Acumulación</span>
                      ) : (
                        <span style={{ color: 'var(--danger)', background: 'rgba(255, 71, 87, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>Canje</span>
                      )}
                    </td>
                    <td>${tx.amount.toFixed(2)}</td>
                    <td style={{ fontWeight: 'bold', color: tx.type === 'EARN' ? 'var(--primary)' : 'var(--danger)' }}>
                      {tx.type === 'EARN' ? '+' : '-'}${tx.rewardEarned.toFixed(2)}
                    </td>
                    <td style={{ opacity: 0.7 }}>{tx.employee?.name || 'Cajero Default'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
