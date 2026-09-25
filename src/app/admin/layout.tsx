import Link from 'next/link';
import styles from './admin.module.css';
import LogoutButton from './LogoutButton';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.adminContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.logo} style={{ padding: '0.5rem 0' }}>
          <img src="/logo.png" alt="LoyaltyOS Logo" style={{ height: '60px', width: 'auto', display: 'block' }} />
        </div>
        <nav className={styles.nav}>
          <Link href="/admin" className={`${styles.navItem} ${styles.active}`}>
            Dashboard
          </Link>
          <Link href="/admin/customers" className={styles.navItem}>
            Clientes
          </Link>
          <Link href="/admin/employees" className={styles.navItem}>
            Empleados
          </Link>
          <Link href="/admin/campaigns" className={styles.navItem}>
            Campañas
          </Link>
          <Link href="/admin/settings" className={styles.navItem}>
            Configuración
          </Link>
          <div style={{ padding: '1rem 0' }}></div>
          <Link href="/pos" className="btn-primary" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
            🏪 Ir a Terminal
          </Link>
        </nav>
        
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '0.9rem' }}>
            ← Volver a inicio
          </Link>
          <LogoutButton />
          
          <div style={{ marginTop: '2rem', fontSize: '0.75rem', opacity: 0.6 }}>
            Desarrollado por <br/>
            <a href="https://agenciamasbrain.com/" target="_blank" rel="noopener noreferrer" style={{color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold'}}>Agencia +Brain</a> · © 2026
          </div>
        </div>
      </aside>
      
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <h1 className={styles.title}>Panel de Control</h1>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>Hola, Admin</span>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary)' }}></div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
