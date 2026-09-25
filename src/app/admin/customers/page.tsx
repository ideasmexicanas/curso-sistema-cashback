import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import styles from './customers.module.css';
import DeleteCustomerButton from './DeleteCustomerButton';

export const dynamic = 'force-dynamic';

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: 'desc' }
  });

  const totalCustomers = customers.length;
  const totalBalance = customers.reduce((sum, c) => sum + c.balance, 0);

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Directorio de Clientes</h2>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statTitle}>Total Registrados</div>
          <div className={styles.statValue}>{totalCustomers}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statTitle}>Pasivo en Billeteras (Saldo)</div>
          <div className={styles.statValue}>${totalBalance.toFixed(2)}</div>
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Teléfono</th>
                <th>Nombre</th>
                <th>Saldo (Wallet)</th>
                <th>Total Gastado</th>
                <th>Fecha de Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className={styles.emptyState}>
                      No hay clientes registrados aún.
                    </div>
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id}>
                    <td className={styles.phone}>
                      <Link href={`/admin/customers/${customer.id}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                        {customer.phone}
                      </Link>
                    </td>
                    <td>{customer.name || <span style={{ opacity: 0.5 }}>Sin nombre</span>}</td>
                    <td style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
                      ${customer.balance.toFixed(2)}
                    </td>
                    <td>${customer.totalSpent.toFixed(2)}</td>
                    <td style={{ opacity: 0.7 }}>
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <DeleteCustomerButton id={customer.id} name={customer.name} phone={customer.phone} />
                    </td>
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
