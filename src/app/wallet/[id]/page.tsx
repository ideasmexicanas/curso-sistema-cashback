import { notFound } from 'next/navigation';
import QRCode from 'react-qr-code';
import { prisma } from '@/lib/prisma';
import styles from '../wallet.module.css';
import ReferralShare from './ReferralShare';

export const dynamic = 'force-dynamic';

export default async function WalletPage({ params }: { params: { id: string } }) {
  const { id } = params;

  // Fetch customer and their latest transactions
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      transactions: {
        orderBy: { createdAt: 'desc' },
        take: 5
      }
    }
  });

  if (!customer) {
    notFound();
  }

  // Get tenant and referral settings if applicable
  const tenantId = customer.transactions[0]?.tenantId;
  let showReferral = false;
  let referralReward = 50;

  if (tenantId) {
    const settings = await prisma.campaignSettings.findUnique({ where: { tenantId } });
    if (settings && settings.referral) {
      showReferral = true;
      referralReward = settings.referralRewardReferred; // What their friend gets
    }
  }

  const formatMoney = (amount: number) => 
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.brand}>LoyaltyOS</div>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>VIP Pass</div>
      </header>

      <main style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* The Black Card */}
        <div className={styles.card}>
          <div className={styles.cardContent}>
            <div className={styles.cardTop}>
              <div>
                <div className={styles.balanceLabel}>Saldo Disponible</div>
                <div className={styles.balanceValue}>{formatMoney(customer.balance)}</div>
              </div>
              <div style={{ color: 'var(--primary)', fontSize: '1.5rem' }}>✦</div>
            </div>

            <div style={{ textAlign: 'center', margin: '2rem 0' }}>
              <div className={styles.qrContainer}>
                <QRCode 
                  value={customer.phone} 
                  size={150}
                  level="M"
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
              </div>
              <p style={{ marginTop: '1rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
                Muestra este código al cajero
              </p>
            </div>

            <div className={styles.cardBottom}>
              <div className={styles.customerName}>
                {customer.name !== 'Cliente Nuevo' ? customer.name : 'Miembro Valioso'}
              </div>
              <div className={styles.cardNumber}>
                ••• {customer.phone.slice(-4)}
              </div>
            </div>
          </div>
        </div>

        {showReferral && tenantId && (
          <ReferralShare tenantId={tenantId} phone={customer.phone} rewardAmount={referralReward} />
        )}

        {/* History Section */}
        <section className={styles.historySection}>
          <h3 className={styles.historyTitle}>Últimos Movimientos</h3>
          
          {customer.transactions.length === 0 ? (
            <div className={styles.emptyState}>No tienes movimientos recientes.</div>
          ) : (
            <div className={styles.transactionList}>
              {customer.transactions.map(tx => (
                <div key={tx.id} className={styles.transactionItem}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div className={`${styles.txIcon} ${tx.type === 'EARN' ? styles.earn : styles.redeem}`}>
                      {tx.type === 'EARN' ? '✨' : '🛍️'}
                    </div>
                    <div className={styles.txDetails}>
                      <div className={styles.txTitle}>
                        {tx.type === 'EARN' ? 'Recompensa ganada' : 'Saldo canjeado'}
                      </div>
                      <div className={styles.txDate}>
                        {new Date(tx.createdAt).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })} • {new Date(tx.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                  </div>
                  <div className={`${styles.txAmount} ${tx.type === 'EARN' ? styles.earn : styles.redeem}`}>
                    {tx.type === 'EARN' ? '+' : '-'}{formatMoney(tx.rewardEarned)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
