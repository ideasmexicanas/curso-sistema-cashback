'use client';

import { useState } from 'react';
import styles from './portal.module.css';
import ReferralShare from '../wallet/[id]/ReferralShare';

export default function MiSaldoPage() {
  const [phone, setPhone] = useState('');
  const [customer, setCustomer] = useState<{name: string, balance: number, phone: string} | null>(null);
  const [referralConfig, setReferralConfig] = useState<{tenantId: string, rewardAmount: number} | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const checkBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 8) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const res = await fetch(`/api/customers?phone=${phone}&sendSms=true&t=${Date.now()}`);
      const data = await res.json();
      
      if (data.success && data.customer) {
        setCustomer(data.customer);
        if (data.referral) {
          setReferralConfig(data.referral);
        } else {
          setReferralConfig(null);
        }
      } else {
        setError('No encontramos ninguna billetera con este número.');
        setCustomer(null);
        setReferralConfig(null);
      }
    } catch {
      setError('Error de conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.glow1}></div>
      <div className={styles.glow2}></div>
      
      <div className={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <img src="/logo.png" alt="LoyaltyOS Logo" style={{ height: '110px', width: 'auto', display: 'block' }} />
        </div>
        <p className={styles.subtitle}>Consulta tu Billetera Digital</p>
        
        {!customer ? (
          <form onSubmit={checkBalance}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Ingresa tu WhatsApp (10 dígitos)</label>
              <input 
                type="tel" 
                className={styles.input} 
                placeholder="55 1234 5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                maxLength={10}
              />
            </div>
            
            {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}
            
            <button 
              type="submit" 
              className="btn-primary" 
              style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
              disabled={isLoading || phone.length < 10}
            >
              {isLoading ? 'Buscando...' : (phone.length < 10 ? `Faltan ${10 - phone.length} dígitos` : 'Ver mi Saldo')}
            </button>
          </form>
        ) : (
          <div>
            <div className={styles.walletCard}>
              <div className={styles.walletLabel}>Saldo Disponible</div>
              <div className={styles.walletBalance}>${customer.balance.toFixed(2)}</div>
              <div className={styles.walletName}>{customer.name || 'Cliente Frecuente'}</div>
            </div>
            
            {referralConfig && (
              <ReferralShare 
                tenantId={referralConfig.tenantId} 
                phone={customer.phone} 
                rewardAmount={referralConfig.rewardAmount} 
              />
            )}
            
            <button 
              onClick={() => { setCustomer(null); setPhone(''); setReferralConfig(null); }} 
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '0.8rem 2rem', borderRadius: '8px', marginTop: '2rem', cursor: 'pointer' }}
            >
              Consultar otro número
            </button>
          </div>
        )}
        
        <p className={styles.footerText}>Presenta tu número en caja para pagar con tu saldo.</p>
      </div>
    </div>
  );
}
