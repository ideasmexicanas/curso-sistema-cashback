'use client';

import { useState } from 'react';
import styles from './registro.module.css';

export default function RegistroClient({ tenantId, tenantName, referralCode }: { tenantId: string, tenantName: string, referralCode?: string }) {
  const [formData, setFormData] = useState({ name: '', phone: '', birthDate: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      const res = await fetch('/api/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, tenantId, referralCode })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setStatus('success');
      } else {
        setStatus('error');
        setMessage(data.error || 'Algo salió mal');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Error de conexión');
    }
  };

  if (status === 'success') {
    return (
      <div className={styles.container}>
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
          <h2 className="text-gradient" style={{ marginBottom: '1rem' }}>¡Bienvenido/a!</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: '1.6' }}>
            Ya estás registrado en el programa de lealtad de <strong>{tenantName}</strong>.<br/><br/>
            Te acabamos de enviar un mensaje por WhatsApp con los detalles. ¡Nos vemos pronto!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '450px', padding: '2.5rem' }}>
        <h1 className="text-gradient" style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '1.8rem' }}>
          Únete a {tenantName}
        </h1>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: '2.5rem', fontSize: '0.9rem' }}>
          Regístrate y empieza a acumular recompensas en cada visita.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="input-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>Nombre Completo</label>
            <input
              type="text"
              required
              placeholder="Ej: Juan Pérez"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white' }}
            />
          </div>

          <div className="input-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>WhatsApp (10 dígitos)</label>
            <input
              type="tel"
              required
              pattern="[0-9]{10}"
              placeholder="Ej: 5512345678"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white' }}
            />
          </div>

          <div className="input-group" style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>Fecha de Nacimiento (Opcional)</label>
            <input
              type="date"
              value={formData.birthDate}
              onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white' }}
            />
          </div>

          {status === 'error' && (
            <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,50,50,0.1)', border: '1px solid rgba(255,50,50,0.3)', color: '#ff5a5a', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
              {message}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={status === 'loading'}
            style={{ width: '100%', padding: '14px', fontSize: '1rem', fontWeight: 'bold' }}
          >
            {status === 'loading' ? 'Registrando...' : 'Registrarme ahora'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
          Desarrollado por LoyaltyOS
        </p>
      </div>
    </div>
  );
}
