'use client';

import { useState, useEffect } from 'react';
import styles from './campaigns.module.css';

export default function CampaignsManager({ inactiveCount, birthdayCount, vipCount, hasBalanceCount }: any) {
  const [activeCampaigns, setActiveCampaigns] = useState<Record<string, boolean>>({});
  const [campaignMessages, setCampaignMessages] = useState<Record<string, string>>({
    retention: '',
    birthday: '',
    vip: '',
    promo: ''
  });
  const [vipThreshold, setVipThreshold] = useState<number>(500);
  const [saving, setSaving] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [editingModal, setEditingModal] = useState<string | null>(null);
  const [tempMessage, setTempMessage] = useState('');
  const [tempThreshold, setTempThreshold] = useState<number>(500);
  const [referralRewards, setReferralRewards] = useState({ referrer: 50, referred: 50 });
  const [tempReferrer, setTempReferrer] = useState<number>(50);
  const [tempReferred, setTempReferred] = useState<number>(50);

  const defaultMessages: Record<string, string> = {
    retention: `Hola 👋\n\nTe extrañamos en nuestro restaurante. Para tu próxima visita, te hemos regalado $50 MXN de saldo. ¡Te esperamos pronto!`,
    birthday: '¡Feliz Cumpleaños! 🎂🎉\n\nHoy te regalamos un postre en la compra de cualquier bebida. Muestra este mensaje al llegar.',
    vip: '¡Hola VIP! 🌟\n\nGracias por ser uno de nuestros mejores clientes. Tienes un Upgrade GRATIS en tu próxima visita.',
    promo: '¡Hola [Nombre]! 🌮✨\n\nSolo por hoy tenemos una promoción especial para ti: [Escribe aquí tu promo]. ¡Te esperamos!',
    referral: '¡Felicidades! 🎉\n\nAcabas de ganar saldo en tu billetera gracias al programa Recomienda y Gana. Tu saldo es de $[Saldo].'
  };

  useEffect(() => {
    fetch('/api/campaigns/toggle')
      .then(r => r.json())
      .then(data => {
        if (data) {
          setActiveCampaigns({ 
            retention: !!data.retention, 
            birthday: !!data.birthday, 
            vip: !!data.vip,
            referral: !!data.referral
          });
          setCampaignMessages({
            retention: data.retentionMsg || '',
            birthday: data.birthdayMsg || '',
            vip: data.vipMsg || '',
            promo: data.promoMsg || '',
            referral: data.referralMsg || ''
          });
          const threshold = data.vipThreshold || 500;
          setVipThreshold(threshold);
          setTempThreshold(threshold);
          setReferralRewards({ referrer: data.referralRewardReferrer || 50, referred: data.referralRewardReferred || 50 });
          setTempReferrer(data.referralRewardReferrer || 50);
          setTempReferred(data.referralRewardReferred || 50);
        }
      })
      .catch(console.error);
  }, []);

  const toggleCampaign = async (id: string) => {
    const newValue = !activeCampaigns[id];
    setSaving(id);
    try {
      const res = await fetch('/api/campaigns/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaign: id, active: newValue })
      });
      if (res.ok) {
        setActiveCampaigns(prev => ({ ...prev, [id]: newValue }));
        setToast(newValue ? '✅ Campaña activada' : '⏸️ Campaña desactivada');
        setTimeout(() => setToast(null), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(null);
    }
  };

  const saveMessage = async (id: string) => {
    setSaving(id);
    try {
      const body: any = { 
        campaign: id, 
        message: tempMessage,
        threshold: id === 'vip' ? Number(tempThreshold) : undefined,
        referrer: id === 'referral' ? Number(tempReferrer) : undefined,
        referred: id === 'referral' ? Number(tempReferred) : undefined
      };

      const res = await fetch('/api/campaigns/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok) {
        setCampaignMessages(prev => ({ ...prev, [id]: tempMessage }));
        if (id === 'vip') setVipThreshold(Number(tempThreshold));
        if (id === 'referral') setReferralRewards({ referrer: Number(tempReferrer), referred: Number(tempReferred) });
        setEditingModal(null);
        setToast('💾 Configuración guardada');
        setTimeout(() => setToast(null), 3000);
      } else {
        setToast(`❌ Error: ${data.error}`);
        setTimeout(() => setToast(null), 5000);
      }
    } catch (e) {
      setToast('🚨 Error al guardar');
    } finally {
      setSaving(null);
    }
  };

  const sendBroadcast = async () => {
    const confirmSend = confirm(`¿Estás seguro de enviar esta promoción a TODOS tus clientes? Esto no se puede deshacer.`);
    if (!confirmSend) return;

    setSaving('broadcast');
    setToast('⏳ Enviando masivo... por favor espera');
    try {
      const res = await fetch('/api/campaigns/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: campaignMessages.promo || defaultMessages.promo })
      });
      const data = await res.json();
      if (res.ok) {
        setToast(`🚀 Enviado con éxito a ${data.sent} de ${data.total} clientes.`);
      } else {
        setToast(`❌ Error: ${data.error}`);
      }
    } catch (e) {
      setToast('🚨 Error al realizar el envío masivo');
    } finally {
      setSaving(null);
      setTimeout(() => setToast(null), 6000);
    }
  };

  const simulateCampaign = async (type: string) => {
    const promptText = type === 'promo'
      ? 'Introduce tu número de teléfono (10 dígitos) para la prueba de SMS:'
      : 'Introduce tu número de WhatsApp (10 dígitos) para la prueba:';
    const phone = prompt(promptText);
    if (!phone) return;

    setToast('⏳ Enviando prueba...');
    try {
      const res = await fetch('/api/campaigns/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, phone })
      });
      const data = await res.json();
      if (data.success) {
        setToast('🚀 ¡Prueba enviada con éxito!');
      } else {
        setToast(`❌ Error: ${data.error || 'No se pudo enviar'}`);
      }
    } catch (e) {
      setToast('🚨 Error de conexión');
    }
    setTimeout(() => setToast(null), 4000);
  };

  const campaigns = [
    {
      id: 'retention',
      name: 'Retención a 30 días',
      description: 'Envía un saldo promocional a los clientes que no han visitado en el último mes.',
      target: `${inactiveCount} clientes en riesgo`,
      message: campaignMessages.retention || defaultMessages.retention,
      icon: '🕰️',
      automatic: true
    },
    {
      id: 'birthday',
      name: 'Cumpleañeros del Mes',
      description: 'Felicita automáticamente a tus clientes en su cumpleaños con un regalo.',
      target: `${birthdayCount} cumplen años este mes`,
      message: campaignMessages.birthday || defaultMessages.birthday,
      icon: '🎁',
      automatic: true
    },
    {
      id: 'vip',
      name: 'Recompensa VIP',
      description: `Premia a los clientes que han gastado más de $${vipThreshold} MXN en total.`,
      target: `${vipCount} clientes VIP`,
      message: campaignMessages.vip || defaultMessages.vip,
      icon: '💎',
      automatic: true
    },
    {
      id: 'referral',
      name: 'Recomienda y Gana',
      description: `Premia a tus clientes por invitar a sus amigos. Tú regalas $${referralRewards.referrer} y $${referralRewards.referred}.`,
      target: `Crecimiento viral`,
      message: campaignMessages.referral || defaultMessages.referral,
      icon: '🤝',
      automatic: true
    },
    {
      id: 'promo',
      name: 'Promoción Masiva (SMS)',
      description: 'Anuncio personalizado por SMS para clientes con saldo disponible en su billetera.',
      target: `${hasBalanceCount || 0} clientes con saldo`,
      message: campaignMessages.promo || defaultMessages.promo,
      icon: '💬',
      automatic: false
    }
  ];

  return (
    <div className={styles.container}>
      {toast && <div className={styles.toast}>{toast}</div>}
      
      <div className={styles.header}>
        <div>
          <h1 className="text-gradient">Panel de Marketing</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem' }}>
            Gestiona tus campañas automáticas y envíos masivos inmediatos.
          </p>
        </div>
      </div>

      <div className={styles.grid}>
        {campaigns.map(camp => (
          <div key={camp.id} className={`glass-card ${styles.card}`}>
            <div className={styles.cardHeader}>
              <div className={styles.iconBox}>{camp.icon}</div>
              {camp.automatic && (
                <label className={styles.switch}>
                  <input 
                    type="checkbox" 
                    checked={activeCampaigns[camp.id] || false}
                    onChange={() => saving ? null : toggleCampaign(camp.id)}
                    disabled={saving === camp.id}
                  />
                  <span className={styles.slider}></span>
                </label>
              )}
              {!camp.automatic && <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>MANUAL</span>}
            </div>
            <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>{camp.name}</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '1.5rem', minHeight: '40px' }}>{camp.description}</p>
            
            <div className={styles.targetBadge}>
              🎯 {camp.target}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
              <button 
                className={styles.secondaryBtn}
                style={{ flex: 1 }}
                onClick={() => {
                  setTempMessage(camp.message);
                  if (camp.id === 'vip') setTempThreshold(vipThreshold);
                  if (camp.id === 'referral') {
                    setTempReferrer(referralRewards.referrer);
                    setTempReferred(referralRewards.referred);
                  }
                  setEditingModal(camp.id);
                }}
              >
                📝 Editar
              </button>
              <button 
                className={styles.previewBtn}
                style={{ flex: 1 }}
                onClick={() => setActiveModal(camp.id)}
              >
                👁️ Probar
              </button>
              
              {!camp.automatic && (
                <button 
                  className={styles.runNowBtn}
                  style={{ flex: '1 1 100%', background: '#3b82f6', color: 'white' }}
                  onClick={sendBroadcast}
                  disabled={saving === 'broadcast'}
                >
                  {saving === 'broadcast' ? '⏳ Enviando...' : '🚀 Enviar a Todos Ahora'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modales */}
      {activeModal && (
        <div className={styles.modalOverlay} onClick={() => setActiveModal(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setActiveModal(null)}>×</button>
            <h3 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Vista Previa ({activeModal === 'promo' ? 'SMS' : 'WhatsApp'})</h3>
            <div className={activeModal === 'promo' ? styles.phoneMockupSms : styles.phoneMockup}>
              {activeModal === 'promo' ? (
                <>
                  <div className={styles.smsHeader}>
                    <div className={styles.smsAvatar}>💬</div>
                    <div><div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>LoyaltyOS (SMS)</div></div>
                  </div>
                  <div className={styles.smsBody}>
                    <div className={styles.smsBubble}>
                      {(campaigns.find(c => c.id === activeModal)?.message || '').split('\n').map((line, i) => (
                        <span key={i}>{line}<br/></span>
                      ))}
                      <div className={styles.smsTime}>Ahora · SMS</div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.whatsappHeader}>
                    <div className={styles.avatar}>LO</div>
                    <div><div style={{ fontWeight: 'bold' }}>LoyaltyOS</div></div>
                  </div>
                  <div className={styles.whatsappBody}>
                    <div className={styles.whatsappBubble}>
                      {(campaigns.find(c => c.id === activeModal)?.message || '').split('\n').map((line, i) => (
                        <span key={i}>{line}<br/></span>
                      ))}
                      <div className={styles.messageTime}>Ahora</div>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
              <button className="btn-primary" style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: 'white' }} onClick={() => setActiveModal(null)}>Cerrar</button>
              <button className="btn-primary" style={{ flex: 1.5 }} onClick={() => { const id = activeModal; setActiveModal(null); simulateCampaign(id); }}>Enviar prueba</button>
            </div>
          </div>
        </div>
      )}

      {editingModal && (
        <div className={styles.modalOverlay} onClick={() => setEditingModal(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setEditingModal(null)}>×</button>
            <h3 style={{ marginBottom: '1rem' }}>Personalizar {editingModal === 'promo' ? 'Promoción' : 'Campaña'}</h3>
            
            {editingModal === 'vip' && (
              <div style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', opacity: 0.6 }}>💰 Umbral VIP:</label>
                <input type="number" className={styles.messageEditor} style={{ width: '120px' }} value={tempThreshold} onChange={(e) => setTempThreshold(Number(e.target.value))} />
              </div>
            )}
            {editingModal === 'referral' && (
              <div style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', opacity: 0.6, marginBottom: '0.5rem' }}>🎁 Saldo para el que invita:</label>
                <input type="number" className={styles.messageEditor} style={{ width: '120px', marginBottom: '1rem' }} value={tempReferrer} onChange={(e) => setTempReferrer(Number(e.target.value))} />
                
                <label style={{ display: 'block', fontSize: '0.85rem', opacity: 0.6, marginBottom: '0.5rem' }}>🎁 Saldo para el nuevo cliente:</label>
                <input type="number" className={styles.messageEditor} style={{ width: '120px' }} value={tempReferred} onChange={(e) => setTempReferred(Number(e.target.value))} />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem', opacity: 0.6 }}>
              <span>Etiquetas dinámicas: <strong>[Nombre]</strong>, <strong>[Saldo]</strong></span>
              {editingModal === 'promo' && <span>Límite sugerido: 160 caract.</span>}
            </div>
            <textarea className={styles.messageEditor} value={tempMessage} onChange={(e) => setTempMessage(e.target.value)} rows={6} />

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
              <button className="btn-primary" style={{ flex: 1, background: 'transparent' }} onClick={() => setEditingModal(null)}>Cancelar</button>
              <button className="btn-primary" style={{ flex: 2 }} onClick={() => saveMessage(editingModal)}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
