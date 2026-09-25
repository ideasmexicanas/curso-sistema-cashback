'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './login.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Use FormData to capture values including browser autofill
    const formData = new FormData(e.currentTarget);
    const email = (formData.get('email') as string) || '';
    const password = (formData.get('password') as string) || '';

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        window.location.href = '/admin';
      } else {
        setError(data.error || 'Credenciales incorrectas');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.glow1}></div>
      <div className={styles.glow2}></div>
      
      <div className={`glass-card ${styles.loginCard}`}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img src="/logo.png" alt="LoyaltyOS Logo" style={{ height: '110px', width: 'auto', marginBottom: '1rem', display: 'inline-block' }} />
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>Ingresa a tu Panel de Administrador</p>
        </div>
        {error && <div className={styles.errorBox}>{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Correo Electrónico</label>
            <input 
              type="email"
              name="email"
              className={styles.input} 
              placeholder="admin@loyaltyos.com"
              defaultValue={email}
              autoComplete="email"
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Contraseña</label>
            <input 
              type="password"
              name="password"
              className={styles.input} 
              placeholder="••••••••"
              defaultValue={password}
              autoComplete="current-password"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className={`btn-primary ${styles.submitBtn}`}
            disabled={isLoading}
          >
            {isLoading ? 'Verificando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <Link href="/" className={styles.backLink}>
          ← Volver a la página principal
        </Link>
      </div>
    </div>
  );
}
