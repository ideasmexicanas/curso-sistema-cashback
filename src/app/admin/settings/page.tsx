'use client';

import { useState, useEffect } from 'react';
import styles from './settings.module.css';
import QRCode from 'qrcode';

export default function SettingsPage() {

  const [percentageInput, setPercentageInput] = useState('5');
  const [quotaInput, setQuotaInput] = useState('1000');
  const [pinInput, setPinInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [tenantInfo, setTenantInfo] = useState<{ id: string, name: string, email: string, messageQuota: number } | null>(null);
  const [qrUrl, setQrUrl] = useState('');
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings) {
          const val = data.settings.rewardPercentage;
          setPercentageInput((val * 100).toString());
          setQuotaInput(data.settings.messageQuota.toString());
          setTenantInfo({
            id: data.settings.id,
            name: data.settings.name,
            email: data.settings.email,
            messageQuota: data.settings.messageQuota
          });
          
          const registrationUrl = `${window.location.origin}/registro`;
          QRCode.toDataURL(registrationUrl, { width: 300, margin: 2, color: { dark: '#00c864', light: '#ffffff' } })
            .then(url => setQrUrl(url))
            .catch(console.error);
        }
      });
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage('');
    
    const percentageVal = parseFloat(percentageInput) / 100;
    
    try {
      const payload: any = { 
        rewardPercentage: percentageVal,
        name: tenantInfo?.name
      };

      if (quotaInput !== tenantInfo?.messageQuota?.toString()) {
        payload.messageQuota = parseInt(quotaInput, 10);
        payload.masterPin = pinInput;
      }

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (data.success) {
        setMessage('Configuración guardada exitosamente.');
      } else {
        setMessage('Error al guardar.');
      }
    } catch {
      setMessage('Error de conexión.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', marginTop: 0 }}>Configuración de Comercio</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className={styles.settingsCard}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Datos Generales</h3>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Nombre del Comercio</label>
            <input 
              type="text" 
              className={styles.input} 
              value={tenantInfo?.name || ''} 
              onChange={(e) => {
                const val = e.target.value;
                setTenantInfo(prev => ({ 
                  id: prev?.id || '', 
                  email: prev?.email || '', 
                  messageQuota: prev?.messageQuota || 1000,
                  name: val 
                }));
              }}
              placeholder="Escribe el nombre de tu restaurante"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Correo Electrónico (Login)</label>
            <input 
              type="email" 
              className={styles.input} 
              value={tenantInfo?.email || 'Cargando...'} 
              disabled 
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Porcentaje de Recompensa (%)</label>
            <input 
              type="number" 
              className={styles.input} 
              value={percentageInput}
              onChange={(e) => setPercentageInput(e.target.value)}
              min="1"
              max="100"
            />
            <p className={styles.infoText}>
              Porcentaje del consumo total que se regresa como saldo a la billetera del cliente. Ejemplo: 5% en una compra de $200 = $10 de saldo.
            </p>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '1.5rem 0', paddingTop: '1.5rem' }}>
            <h4 style={{ marginBottom: '1rem', color: '#ff4757' }}>Ajustes de Proveedor (Solo Administrador del Sistema)</h4>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Cuota de Mensajes Mensual</label>
              <input 
                type="number" 
                className={styles.input} 
                value={quotaInput}
                onChange={(e) => setQuotaInput(e.target.value)}
                min="0"
              />
            </div>
            
            {quotaInput !== tenantInfo?.messageQuota?.toString() && (
              <div className={styles.formGroup}>
                <label className={styles.label} style={{ color: '#ff4757' }}>PIN Maestro (Requerido para cambiar cuota)</label>
                <input 
                  type="password" 
                  className={styles.input} 
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="****"
                />
              </div>
            )}
          </div>

          {message && <div style={{ color: message.includes('Error') ? '#ff4757' : '#00d084', marginBottom: '1rem', fontSize: '0.9rem' }}>{message}</div>}

          <button 
            onClick={handleSave}
            className="btn-primary" 
            style={{ width: '100%' }}
            disabled={isSaving}
          >
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>

        <div className={styles.settingsCard} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>QR de Auto-Registro</h3>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '2rem' }}>
            Imprime este código y colócalo en tus mesas para que los clientes se registren solos.
          </p>
          
          {qrUrl ? (
            <div style={{ background: 'white', padding: '15px', borderRadius: '15px', marginBottom: '1.5rem' }}>
              <img src={qrUrl} alt="QR Code" style={{ width: '200px', height: '200px' }} />
            </div>
          ) : (
            <div style={{ width: '200px', height: '200px', background: 'rgba(255,255,255,0.05)', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              Generando...
            </div>
          )}

          <a 
            href={qrUrl} 
            download="qr-registro.png"
            className="btn-primary"
            style={{ textDecoration: 'none', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            Descargar Código QR
          </a>
          
          <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'rgba(0,200,100,0.8)' }}>
            URL: {origin}/registro
          </p>
        </div>
      </div>
    </div>
  );
}
