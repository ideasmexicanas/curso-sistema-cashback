'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './pos.module.css';

type PaymentMethod = 'CASH' | 'CARD';

export default function POSPage() {
  const [amount, setAmount] = useState('0');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{text: string, type: 'success'|'error'} | null>(null);
  
  const [mode, setMode] = useState<'EARN' | 'REDEEM'>('EARN');
  const [customerData, setCustomerData] = useState<{name: string, balance: number, birthDate?: string | null} | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');

  // Each payment method has its OWN reward accumulation percentage
  // These are independent — cash might give 10%, card might give 5%
  const [cashRewardPct, setCashRewardPct] = useState<number | string>(5);   // default 5%
  const [cardRewardPct, setCardRewardPct] = useState<number | string>(5);   // default 5%

  const [employees, setEmployees] = useState<{id: string, name: string}[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  
  // New Customer info
  const [customerName, setCustomerName] = useState('');
  const [birthDate, setBirthDate] = useState('');

  useEffect(() => {
    const savedCash = localStorage.getItem('cashRewardPct');
    const savedCard = localStorage.getItem('cardRewardPct');
    if (savedCash) setCashRewardPct(Number(savedCash));
    if (savedCard) setCardRewardPct(Number(savedCard));

    // Fetch global reward setting as default for both methods
    fetch('/api/settings').then(r => r.json()).then(d => {
      if (d.success) {
        const globalPct = Math.min(20, Math.max(1, Math.round(d.settings.rewardPercentage * 100)));
        if (!savedCash) setCashRewardPct(globalPct);
        if (!savedCard) setCardRewardPct(globalPct);
      }
    });
    // Fetch employees
    fetch('/api/employees').then(r => r.json()).then(d => {
      if (d.success) {
        setEmployees(d.employees);
        if (d.employees.length > 0) setSelectedEmployeeId(d.employees[0].id);
      }
    });
  }, []);

  const numericAmount = parseFloat(amount) || 0;

  // Active reward % depends on payment method selected
  const activeRewardPct = paymentMethod === 'CASH' ? cashRewardPct : cardRewardPct;
  const activeRewardDecimal = (Number(activeRewardPct) || 0) / 100;

  // Reward = amount × reward% (NO price reduction, just accumulation)
  const reward = mode === 'EARN'
    ? (numericAmount > 0 ? (numericAmount * activeRewardDecimal).toFixed(2) : '0.00')
    : '0.00';

  useEffect(() => {
    if (customerPhone.length >= 8) {
      setIsSearching(true);
      const timer = setTimeout(async () => {
        try {
          const res = await fetch(`/api/customers?phone=${customerPhone}`);
          const data = await res.json();
          if (data.success && data.customer) {
            setCustomerData(data.customer);
          } else {
            setCustomerData(null);
          }
        } catch {
          setCustomerData(null);
        } finally {
          setIsSearching(false);
        }
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setCustomerData(null);
      setIsSearching(false);
    }
  }, [customerPhone]);

  const handleKeyPress = (val: string) => {
    if (amount === '0' && val !== '.') {
      setAmount(val);
    } else {
      if (val === '.' && amount.includes('.')) return;
      if (amount.includes('.') && amount.split('.')[1].length >= 2) return;
      setAmount(prev => prev + val);
    }
  };

  const handleDelete = () => {
    setAmount(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
  };

  const handleProcess = async () => {
    if (numericAmount <= 0) return;
    if (!customerPhone) {
      setMessage({ text: 'Por favor ingresa el teléfono del cliente', type: 'error' });
      return;
    }

    if (mode === 'REDEEM') {
      if (!customerData) {
        setMessage({ text: 'Cliente no encontrado para canje', type: 'error' });
        return;
      }
      if (customerData.balance <= 0) {
        setMessage({ text: 'El cliente no tiene saldo para canjear', type: 'error' });
        return;
      }
    }

    setIsProcessing(true);
    setMessage(null);

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: customerPhone, 
          amount: numericAmount,          // full amount always — no price reduction
          rewardOverride: activeRewardDecimal, // override global reward with method-specific %
          type: mode,
          employeeId: selectedEmployeeId || undefined,
          customerName: customerName || undefined,
          birthDate: birthDate ? new Date(birthDate).toISOString() : undefined,
          paymentMethod,
        })
      });

      const data = await res.json();

      if (res.ok) {
        if (mode === 'EARN') {
          setMessage({ text: `¡Éxito! Se acumularon $${data.rewardEarned.toFixed(2)} a la billetera del cliente.`, type: 'success' });
        } else {
          const remaining = numericAmount - data.rewardEarned;
          if (remaining > 0) {
            setMessage({ text: `¡Canje exitoso! Se descontaron $${data.rewardEarned.toFixed(2)}. Resta cobrar en caja: $${remaining.toFixed(2)}`, type: 'success' });
          } else {
            setMessage({ text: `¡Canje exitoso! Cuenta pagada en su totalidad con puntos.`, type: 'success' });
          }
        }
        setAmount('0');
        setCustomerPhone('');
        setCustomerData(null);
        setCustomerName('');
        setBirthDate('');
        setTimeout(() => setMessage(null), 4000);
      } else {
        setMessage({ text: data.error || 'Error procesando la transacción', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Error de conexión', type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  const isBirthday = () => {
    if (!customerData || !customerData.birthDate) return false;
    const bDate = new Date(customerData.birthDate);
    const today = new Date();
    return bDate.getDate() === today.getDate() && bDate.getMonth() === today.getMonth();
  };

  return (
    <div className={styles.posContainer}>
      <aside className={styles.sidebar}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <img src="/logo.png" alt="LoyaltyOS Logo" style={{ height: '60px', width: 'auto', display: 'block' }} />
          <Link href="/admin" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '0.9rem' }}>Salir</Link>
        </div>
        
        <div className={styles.customerInfo}>
          <div className={styles.label}>Cajero activo</div>
          <select 
            className={styles.inputField} 
            value={selectedEmployeeId} 
            onChange={(e) => setSelectedEmployeeId(e.target.value)}
            style={{ marginBottom: '1rem', appearance: 'none', background: 'rgba(255,255,255,0.05)' }}
          >
            {employees.length === 0 ? (
              <option value="" style={{ background: '#1a1a1a', color: '#fff' }}>Cajero Default</option>
            ) : (
              employees.map(emp => (
                <option key={emp.id} value={emp.id} style={{ background: '#1a1a1a', color: '#fff' }}>{emp.name}</option>
              ))
            )}
          </select>
          
          <div className={styles.label} style={{ marginTop: '2rem' }}>Cliente (Teléfono o QR)</div>
          <input 
            type="text" 
            className={styles.inputField} 
            placeholder="Ej. 55 1234 5678" 
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            maxLength={10}
          />
          
          {isSearching && <div style={{marginTop: '1rem', color: 'rgba(255,255,255,0.5)'}}>Buscando...</div>}

          {!isSearching && customerData && (
            <div className="glass-card" style={{ padding: '1rem', marginTop: '1rem', background: isBirthday() ? 'rgba(255, 184, 0, 0.2)' : 'rgba(0, 208, 132, 0.1)', borderColor: isBirthday() ? '#ffb800' : 'var(--primary)' }}>
              {isBirthday() && <div style={{ color: '#ffb800', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '0.5rem' }}>🎉 ¡FELIZ CUMPLEAÑOS! 🎉</div>}
              <div style={{ color: isBirthday() ? '#ffb800' : 'var(--primary)', fontWeight: 'bold' }}>Cliente Encontrado</div>
              <div style={{ color: '#fff', fontSize: '1.2rem', marginTop: '0.5rem' }}>{customerData.name || 'Cliente Frecuente'}</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Saldo actual: ${customerData.balance.toFixed(2)}</div>
            </div>
          )}

          {!isSearching && customerPhone.length >= 8 && !customerData && (
            <div className="glass-card" style={{ padding: '1rem', marginTop: '1rem', background: 'rgba(255, 255, 255, 0.05)' }}>
              <div style={{ color: 'rgba(255,255,255,0.7)' }}>Cliente nuevo</div>
              <div style={{ color: 'var(--primary)', fontSize: '0.9rem', marginTop: '0.5rem', marginBottom: '1rem' }}>Se creará una cuenta al cobrar.</div>
              
              <div className={styles.label}>Nombre (Opcional)</div>
              <input 
                type="text" 
                className={styles.inputField}
                style={{ padding: '0.5rem', fontSize: '0.9rem', marginBottom: '1rem' }}
                placeholder="Nombre del cliente"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />

              <div className={styles.label}>Cumpleaños (Opcional)</div>
              <input 
                type="date" 
                className={styles.inputField}
                style={{ padding: '0.5rem', fontSize: '0.9rem' }}
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </div>
          )}
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '2rem', fontSize: '0.75rem', opacity: 0.6 }}>
          Desarrollado por <br/>
          <a href="https://agenciamasbrain.com/" target="_blank" rel="noopener noreferrer" style={{color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold'}}>Agencia +Brain</a> · © 2026
        </div>
      </aside>
      
      <main className={styles.mainContent}>
        <div className={`glass-card ${styles.calculatorCard}`}>
          
          {/* Earn / Redeem Mode */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <button 
              onClick={() => setMode('EARN')}
              style={{ flex: 1, padding: '1rem', borderRadius: '8px', border: 'none', background: mode === 'EARN' ? 'rgba(0, 208, 132, 0.2)' : 'rgba(255,255,255,0.05)', color: mode === 'EARN' ? 'var(--primary)' : '#fff', cursor: 'pointer', transition: 'all 0.3s' }}
            >
              ✨ Acumular
            </button>
            <button 
              onClick={() => setMode('REDEEM')}
              style={{ flex: 1, padding: '1rem', borderRadius: '8px', border: 'none', background: mode === 'REDEEM' ? 'rgba(255, 71, 87, 0.2)' : 'rgba(255,255,255,0.05)', color: mode === 'REDEEM' ? 'var(--danger)' : '#fff', cursor: 'pointer', transition: 'all 0.3s' }}
            >
              🛍️ Canjear
            </button>
          </div>

          {/* Payment Method — each with its OWN accumulation % */}
          {mode === 'EARN' && (
            <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.6rem' }}>
              Método de Pago
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              
              {/* Cash */}
              <button
                onClick={() => setPaymentMethod('CASH')}
                className={styles.paymentBtn}
                style={{
                  background: paymentMethod === 'CASH' ? 'rgba(0, 208, 132, 0.15)' : 'rgba(255,255,255,0.04)',
                  border: paymentMethod === 'CASH' ? '1.5px solid var(--primary)' : '1.5px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '0.85rem 0.75rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>💵</span>
                  <span style={{ color: paymentMethod === 'CASH' ? 'var(--primary)' : '#fff', fontWeight: 600, fontSize: '0.9rem' }}>Efectivo</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>Acumula</span>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    step={1}
                    value={cashRewardPct}
                    onClick={e => e.stopPropagation()}
                    onChange={e => {
                      const val = e.target.value;
                      if (val === '') setCashRewardPct('');
                      else setCashRewardPct(Math.min(100, Math.max(0, parseInt(val) || 0)));
                    }}
                    onBlur={() => {
                      if (cashRewardPct === '') setCashRewardPct(1);
                    }}
                    style={{
                      width: '58px',
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '0.85rem',
                      padding: '2px 8px',
                      outline: 'none',
                      textAlign: 'center',
                    }}
                  />
                  <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>%</span>
                </div>
              </button>

              {/* Card */}
              <button
                onClick={() => setPaymentMethod('CARD')}
                className={styles.paymentBtn}
                style={{
                  background: paymentMethod === 'CARD' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.04)',
                  border: paymentMethod === 'CARD' ? '1.5px solid #6366f1' : '1.5px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '0.85rem 0.75rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>💳</span>
                  <span style={{ color: paymentMethod === 'CARD' ? '#6366f1' : '#fff', fontWeight: 600, fontSize: '0.9rem' }}>Tarjeta</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>Acumula</span>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    step={1}
                    value={cardRewardPct}
                    onClick={e => e.stopPropagation()}
                    onChange={e => {
                      const val = e.target.value;
                      if (val === '') setCardRewardPct('');
                      else setCardRewardPct(Math.min(100, Math.max(0, parseInt(val) || 0)));
                    }}
                    onBlur={() => {
                      if (cardRewardPct === '') setCardRewardPct(1);
                    }}
                    style={{
                      width: '58px',
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '0.85rem',
                      padding: '2px 8px',
                      outline: 'none',
                      textAlign: 'center',
                    }}
                  />
                  <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>%</span>
                </div>
              </button>
            </div>
            
            <button
              onClick={() => {
                localStorage.setItem('cashRewardPct', String(cashRewardPct));
                localStorage.setItem('cardRewardPct', String(cardRewardPct));
                setMessage({ text: 'Porcentajes guardados localmente', type: 'success' });
                setTimeout(() => setMessage(null), 3000);
              }}
              style={{
                width: '100%',
                marginTop: '1rem',
                padding: '0.5rem',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: 'rgba(255,255,255,0.6)',
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              💾 Guardar porcentajes fijos
            </button>
          </div>
          )}

          {/* Amount Display */}
          <div className={styles.display}>
            <div className={styles.amount}>
              <span style={{ opacity: 0.5 }}>$</span>{amount}
            </div>

            <div className={styles.rewardBadge} style={{ color: mode === 'EARN' ? 'var(--primary)' : 'var(--danger)', background: mode === 'EARN' ? 'rgba(0, 208, 132, 0.1)' : 'rgba(255, 71, 87, 0.1)' }}>
              {mode === 'EARN'
                ? `+ $${reward} en recompensas (${activeRewardPct}%)`
                : `- $${Math.min(numericAmount, customerData?.balance || 0).toFixed(2)} de saldo`}
            </div>
          </div>
          
          <div className={styles.keypad}>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'].map(key => (
              <button key={key} className={styles.key} onClick={() => handleKeyPress(key)}>
                {key}
              </button>
            ))}
            <button className={`${styles.key} ${styles.action}`} onClick={handleDelete}>
              ⌫
            </button>
          </div>
          
          <button 
            className="btn-primary" 
            style={{ 
              width: '100%', 
              marginTop: '2rem', 
              padding: '1.2rem', 
              fontSize: '1.2rem', 
              opacity: isProcessing ? 0.7 : 1,
              background: mode === 'EARN' ? 'var(--primary)' : 'var(--danger)',
              color: mode === 'EARN' ? '#000' : '#fff'
            }}
            onClick={handleProcess}
            disabled={isProcessing || (mode === 'REDEEM' && (!customerData || customerData.balance <= 0))}
          >
            {isProcessing ? 'Procesando...' : mode === 'EARN' ? 'Cobrar y Asignar Puntos' : 'Cobrar con Saldo'}
          </button>

          {message && (
            <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '8px', textAlign: 'center', background: message.type === 'success' ? 'rgba(0, 208, 132, 0.2)' : 'rgba(255, 71, 87, 0.2)', color: message.type === 'success' ? 'var(--primary)' : 'var(--danger)' }}>
              {message.text}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
