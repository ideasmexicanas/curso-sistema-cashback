import Link from 'next/link';
import styles from './landing.module.css';
import WhatsAppBubble from '@/components/WhatsAppBubble';

export default function LandingPage() {
  return (
    <div className={styles.page}>
      {/* Navbar */}
      <nav className={styles.nav}>
        <div style={{ fontWeight: 'bold' }}>
          <img src="/logo.png" alt="LoyaltyOS Logo" style={{ height: '70px', width: 'auto', display: 'block' }} />
        </div>
        <div className={styles.navLinks}>
          <a href="#features">Características</a>
          <a href="#how-it-works">Cómo Funciona</a>
          <a href="#pricing">Planes</a>
        </div>
        <Link href="/admin" className={styles.btnPrimary} style={{ padding: '0.5rem 1.5rem', fontSize: '0.9rem' }}>
          Ingresar al Sistema
        </Link>
      </nav>

      {/* Hero Section */}
      <header className={styles.hero}>
        <div className={styles.glowOrb1}></div>
        <div className={styles.glowOrb2}></div>
        
        <h1 className={styles.heroTitle}>
          Convierte compradores <br/>
          <span className="text-gradient">en clientes frecuentes.</span>
        </h1>
        <p className={styles.heroSubtitle}>
          El sistema de lealtad definitivo para negocios locales. Reemplaza las tarjetas de sellos con un Sistema de Cashback sin apps ni descargas, conectado directamente a tu tablet.
        </p>
        
        <div className={styles.heroButtons}>
          <Link href="/admin" className={styles.btnPrimary}>
            Comenzar Gratis
          </Link>
          <Link href="/pos" className={styles.btnSecondary}>
            Ver Demo de Caja
          </Link>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className={styles.section}>
        <h2 className={styles.sectionTitle}>Todo lo que necesitas para crecer</h2>
        <p className={styles.sectionSubtitle}>Diseñado específicamente para restaurantes, cafeterías y negocios de retail que buscan escalar.</p>
        
        <div className={styles.featuresGrid}>
          <div className={`glass-card ${styles.featureCard}`}>
            <span className={styles.featureIcon}>📲</span>
            <h3 className={styles.featureTitle}>Sistema de Cashback sin apps</h3>
            <p className={styles.featureText}>
              Tus clientes no descargan nada. Acceden a su saldo y recompensas desde un portal web optimizado ingresando únicamente su número de teléfono.
            </p>
          </div>
          <div className={`glass-card ${styles.featureCard}`}>
            <span className={styles.featureIcon}>💳</span>
            <h3 className={styles.featureTitle}>Multi-Cajero</h3>
            <p className={styles.featureText}>
              Control total en tu sucursal. Asigna puntos, canjea saldos y rastrea qué empleado realizó cada transacción con nuestro sistema inteligente.
            </p>
          </div>
          <div className={`glass-card ${styles.featureCard}`}>
            <span className={styles.featureIcon}>📊</span>
            <h3 className={styles.featureTitle}>Dashboard Analítico</h3>
            <p className={styles.featureText}>
              Toma decisiones basadas en datos. Visualiza gráficos de retención, ranking de mejores clientes y audita historiales individuales en tiempo real.
            </p>
          </div>
          <div className={`glass-card ${styles.featureCard}`}>
            <span className={styles.featureIcon}>⚙️</span>
            <h3 className={styles.featureTitle}>Configuración Dinámica</h3>
            <p className={styles.featureText}>
              Tú decides las reglas del juego. Ajusta el porcentaje de retorno (cashback) desde tu panel de administrador de forma instantánea.
            </p>
          </div>
          <div className={`glass-card ${styles.featureCard}`}>
            <span className={styles.featureIcon}>🎂</span>
            <h3 className={styles.featureTitle}>Alertas de Cumpleaños</h3>
            <p className={styles.featureText}>
              Sorprende a tus clientes. El sistema detecta y emite alertas visuales cuando un cliente te visita en su mes de cumpleaños para que lo consientas.
            </p>
          </div>
          <div className={`glass-card ${styles.featureCard}`}>
            <span className={styles.featureIcon}>🔗</span>
            <h3 className={styles.featureTitle}>Historial Personalizado</h3>
            <p className={styles.featureText}>
              Conoce a quién le vendes. Cada cliente tiene un expediente detallado con todas sus visitas, ticket promedio y dinero total invertido en tu negocio.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className={styles.section} style={{ background: 'rgba(255,255,255,0.02)' }}>
        <h2 className={styles.sectionTitle}>Tan simple como cobrar</h2>
        <p className={styles.sectionSubtitle}>Un flujo optimizado para no generar filas en tu negocio.</p>

        <div className={styles.stepsContainer}>
          <div className={`glass-card ${styles.stepRow}`}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>El cliente consume</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)' }}>Realiza su compra normal en tu establecimiento.</p>
            </div>
          </div>
          
          <div className={`glass-card ${styles.stepRow}`} style={{ marginLeft: '10%' }}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>Tecleas su teléfono</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)' }}>El cajero ingresa el número o escanea el código. Si es cliente nuevo, le puede registrar nombre y cumpleaños en 2 segundos.</p>
            </div>
          </div>

          <div className={`glass-card ${styles.stepRow}`} style={{ marginLeft: '20%' }}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Magia Instantánea</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)' }}>Presionas "Acumular" o "Canjear" según lo que el cliente desee. El saldo se actualiza y la fidelidad está garantizada.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className={styles.section}>
        <h2 className={styles.sectionTitle}>Planes desde:</h2>
        <p className={styles.sectionSubtitle}>Comienza hoy y transforma tus ventas.</p>

        <div className={styles.pricingGrid}>
          <div className={`glass-card ${styles.pricingCard}`}>
            <h3 style={{ fontSize: '1.5rem' }}>LoyaltyOS Growth</h3>
            <div className={styles.price}>$8,900 <span>MXN/mes</span></div>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem' }}>Impulsa el crecimiento de tu restaurante desde el primer día.</p>
            
            <ul className={styles.featuresList}>
              <li>Clientes ilimitados</li>
              <li>1 Cajero</li>
              <li>Billetera pública para clientes</li>
              <li>Soporte vía WhatsApp</li>
              <li>Dashboard con Gráficas Analíticas</li>
              <li>Alertas de Recompensas</li>
              <li>4 módulos de automatización y marketing</li>
              <li>Incluye 1000 mensajes por cada restaurante, bar o café, después del mensaje 1001 tiene un cargo adicional.</li>
            </ul>
            
            <a href="https://wa.me/527442584411?text=Me%20interesa%20LoyaltyOS%20Growth%2C%20dame%20detalles..." target="_blank" rel="noopener noreferrer" className={styles.btnSecondary} style={{ display: 'block', marginTop: '2rem' }}>
              Contratar plan
            </a>
          </div>

          <div className={`glass-card ${styles.pricingCard} ${styles.pro}`}>
            <div className={styles.popularBadge}>POPULAR</div>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>LoyaltyOS Business</h3>
            <div className={styles.price}>$21,000 <span>MXN/mes</span></div>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem' }}>La plataforma de fidelización para restaurantes que están listos para crecer.</p>
            
            <ul className={styles.featuresList}>
              <li>Clientes ilimitados</li>
              <li>Hasta 3 Cajeros</li>
              <li>Billetera pública para clientes</li>
              <li>Soporte vía WhatsApp</li>
              <li>Dashboard con Gráficas Analíticas</li>
              <li>Alertas de Recompensas</li>
              <li>4 módulos de automatización y marketing</li>
              <li>Incluye 1000 mensajes por cada restaurante, bar o café, después del mensaje 1001 tiene un cargo adicional.</li>
            </ul>
            
            <a href="https://wa.me/527442584411?text=Me%20interesa%20LoyaltyOS%20Business%2C%20dame%20detalles..." target="_blank" rel="noopener noreferrer" className={styles.btnPrimary} style={{ display: 'block', marginTop: '2rem' }}>
              Contratar plan
            </a>
          </div>

          <div className={`glass-card ${styles.pricingCard}`}>
            <h3 style={{ fontSize: '1.5rem', color: '#CBD5E1' }}>LoyaltyOS Enterprise</h3>
            <div className={styles.price}>$35,000 <span>MXN/mes</span></div>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem' }}>La solución empresarial para cadenas que buscan liderar el mercado.</p>
            
            <ul className={styles.featuresList}>
              <li>Clientes ilimitados</li>
              <li>Hasta 5 Cajeros</li>
              <li>Billetera pública para clientes</li>
              <li>Soporte vía WhatsApp</li>
              <li>Dashboard con Gráficas Analíticas</li>
              <li>Alertas de Recompensas</li>
              <li>4 módulos de automatización y marketing</li>
              <li>Incluye 1000 mensajes por cada restaurante, bar o café, después del mensaje 1001 tiene un cargo adicional.</li>
            </ul>
            
            <a href="https://wa.me/527442584411?text=Me%20interesa%20LoyaltyOS%20Enterprise%2C%20dame%20detalles..." target="_blank" rel="noopener noreferrer" className={styles.btnSecondary} style={{ display: 'block', marginTop: '2rem' }}>
              Contratar plan
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <img src="/logo.png" alt="LoyaltyOS Logo" style={{ height: '100px', width: 'auto', marginBottom: '1rem' }} />
        <p style={{ marginBottom: '2rem' }}>El sistema de lealtad que convierte compradores casuales en clientes frecuentes.</p>
        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <Link href="/admin">Dashboard Admin</Link>
          <Link href="/pos">Terminal Multi-Cajero</Link>
          <Link href="/registro">Registro</Link>
          <Link href="/mi-saldo">Saldo</Link>
        </div>
        <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>
          Desarrollado por <a href="https://agenciamasbrain.com/" target="_blank" rel="noopener noreferrer" style={{color: 'var(--primary)', textDecoration: 'none'}}>Agencia +Brain</a> · © 2026
        </p>
      </footer>

      {/* WhatsApp Chat Bubble */}
      <WhatsAppBubble />
    </div>
  );
}
