'use client';

import { useState } from 'react';

export default function ReferralShare({ tenantId, phone, rewardAmount }: { tenantId: string, phone: string, rewardAmount: number }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `https://www.loyaltyos.online/r/${tenantId}?ref=${phone}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`¡Hola! Te regalo $${rewardAmount} MXN de saldo para tu próxima visita. Solo regístrate aquí: ${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div style={{ margin: '2rem 0', width: '100%', background: 'rgba(0, 208, 132, 0.1)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--primary)', textAlign: 'center' }}>
      <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>🎁 Recomienda y Gana</h3>
      <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', marginBottom: '1rem' }}>
        Invita a tus amigos y ambos ganarán saldo extra cuando se registren.
      </p>
      
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <input 
          type="text" 
          value={shareUrl}
          readOnly
          style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.8rem' }}
        />
        <button 
          onClick={copyLink}
          style={{ padding: '0 1rem', background: 'var(--primary)', color: '#000', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {copied ? '✅' : 'Copiar'}
        </button>
      </div>

      <button 
        onClick={shareWhatsApp}
        style={{ width: '100%', padding: '0.75rem', background: '#25D366', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}
      >
        <span style={{ fontSize: '1.2rem' }}>💬</span> Compartir por WhatsApp
      </button>
    </div>
  );
}
