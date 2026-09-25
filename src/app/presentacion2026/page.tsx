'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from '../presentacion/presentacion.module.css';

interface SlideData {
  tag?: string;
  title: string;
  subtitle?: string;
  type: 'cover' | 'problem' | 'solution' | 'workflow' | 'tablet' | 'customer' | 'pro' | 'roi' | 'benefits' | 'pricing' | 'founder' | 'cta' | 'competitor';
  competitorId?: 'natural' | 'starbucks' | 'cinepolis' | 'toks';
}

const slides: SlideData[] = [
  {
    tag: 'Sistema de Cashback B2B',
    title: 'Convierte compradores casuales en clientes frecuentes.',
    subtitle: 'El sistema de lealtad definitivo para negocios locales. Reemplaza las tarjetas de sellos con un Sistema de Cashback sin apps ni descargas, conectado directamente a tu tablet.',
    type: 'cover'
  },
  {
    tag: 'El Problema',
    title: '¿Por qué los negocios locales pierden ingresos a diario?',
    type: 'problem'
  },
  {
    tag: 'La Solución',
    title: 'Presentamos: LoyaltyOS',
    subtitle: 'La evolución tecnológica de la fidelización. Una plataforma que operas fácilmente desde tu tablet en mostrador, acumulando saldo en la billetera digital de tus clientes por cada peso gastado.',
    type: 'solution'
  },
  {
    tag: 'Operación Ágil',
    title: 'Magia en Caja: Flujo de 2 Segundos',
    subtitle: 'Sabemos que en la caja registradora el tiempo es oro. Diseñado para fluir sin fricción:',
    type: 'workflow'
  },
  {
    tag: 'Hardware Simplificado',
    title: 'Operación 100% desde Tablet o iPad',
    subtitle: 'Sin integraciones de software complejas ni cableados. Todo el poder de LoyaltyOS desde cualquier pantalla táctil en tu mostrador.',
    type: 'tablet'
  },
  {
    tag: 'Experiencia de Usuario',
    title: 'Transparencia Total para el Cliente',
    subtitle: 'Cero aplicaciones pesadas, descargas o registros largos. Máxima accesibilidad web.',
    type: 'customer'
  },
  {
    tag: 'Licencia Pro',
    title: 'Herramientas de Marketing Automatizado',
    subtitle: 'No esperes a que los clientes vuelvan por casualidad; tráelos de regreso con tecnología:',
    type: 'pro'
  },
  {
    tag: 'Simulador Financiero',
    title: 'Simula el Retorno de Inversión para tu Negocio',
    subtitle: 'Ajusta los valores reales de tu establecimiento y observa el impacto neto mensual que genera LoyaltyOS.',
    type: 'roi'
  },
  {
    tag: 'Retorno de Inversión',
    title: 'Beneficios Claros para la Empresa',
    subtitle: 'Una plataforma orientada a resultados financieros auditables y seguros.',
    type: 'benefits'
  },
  {
    tag: 'Análisis Competitivo',
    title: '100% Natural vs LoyaltyOS',
    type: 'competitor',
    competitorId: 'natural'
  },
  {
    tag: 'Análisis Competitivo',
    title: 'Starbucks vs LoyaltyOS',
    type: 'competitor',
    competitorId: 'starbucks'
  },
  {
    tag: 'Análisis Competitivo',
    title: 'Cinépolis vs LoyaltyOS',
    type: 'competitor',
    competitorId: 'cinepolis'
  },
  {
    tag: 'Análisis Competitivo',
    title: 'TOKS vs LoyaltyOS',
    type: 'competitor',
    competitorId: 'toks'
  },
  {
    tag: 'Inversión a la Medida',
    title: 'Planes diseñados para el tamaño de tu éxito',
    type: 'pricing'
  },
  {
    tag: 'Programa Fundador',
    title: '💎 Programa Fundador',
    subtitle: 'Solo para los primeros 10 restaurantes que confíen en LoyaltyOS. Construyamos juntos el futuro de la fidelización gastronómica.',
    type: 'founder'
  },
  {
    tag: 'Siguientes Pasos',
    title: 'Comienza a fidelizar hoy mismo',
    subtitle: 'Hagamos una demostración en vivo de 30 minutos directamente en tu sucursal.',
    type: 'cta'
  }
];

export default function Presentacion2026Page() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // State for the ROI Calculator
  const [ticket, setTicket] = useState(250);
  const [dailyCustomers, setDailyCustomers] = useState(80);
  const [increaseRate, setIncreaseRate] = useState(10); // 10% extra retention rate

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  const progress = ((currentSlide + 1) / slides.length) * 100;

  // ROI Calculations
  const monthlyCustomers = dailyCustomers * 30;
  const extraVisits = Math.round(monthlyCustomers * (increaseRate / 100));
  const extraRevenue = extraVisits * ticket;
  const netReturnPro = extraRevenue - 8990;

  return (
    <div className={styles.container}>
      {/* Dynamic Background Glow */}
      <div className={styles.bgGlow}></div>
      <div className={styles.progressBar} style={{ width: `${progress}%` }}></div>

      {/* Slides Container */}
      {slides.map((slide, index) => {
        const isActive = index === currentSlide;
        return (
          <div 
            key={index} 
            className={`${styles.slide} ${isActive ? styles.active : ''}`}
            aria-hidden={!isActive}
          >
            <div className={slide.type === 'cover' || slide.type === 'cta' || slide.type === 'solution' || slide.type === 'roi' || slide.type === 'founder' || slide.type === 'competitor' ? styles.centerContent : styles.contentWrapper}>
              {slide.type === 'cover' && (
                <img src="/logo.png" alt="LoyaltyOS Logo" style={{ height: '90px', width: 'auto', marginBottom: '2.5rem', display: 'block' }} />
              )}
              {slide.tag && <span className={styles.tag}>{slide.tag}</span>}
              <h1 className={styles.title} style={{ textAlign: slide.type === 'cover' || slide.type === 'cta' || slide.type === 'solution' || slide.type === 'roi' || slide.type === 'founder' || slide.type === 'competitor' ? 'center' : 'left' }}>
                {slide.title}
              </h1>
              {slide.subtitle && (
                <p className={styles.subtitle} style={{ textAlign: slide.type === 'cover' || slide.type === 'cta' || slide.type === 'solution' || slide.type === 'roi' || slide.type === 'founder' ? 'center' : 'left' }}>
                  {slide.subtitle}
                </p>
              )}

              {/* Specific Content per slide type */}
              {slide.type === 'problem' && (
                <div className={styles.grid}>
                  <div className={styles.card}>
                    <div className={styles.cardTitle}>⚠️ Falta de Retención</div>
                    <p className={styles.cardText}>
                      Cuesta hasta 7 veces más atraer a un cliente nuevo a través de anuncios que retener a uno que ya te conoce.
                    </p>
                  </div>
                  <div className={styles.card}>
                    <div className={styles.cardTitle}>👻 Cero Datos Reales</div>
                    <p className={styles.cardText}>
                      El 90% de los clientes entran, consumen y se van sin dejar rastro. No sabes quiénes son ni cuándo fue su última visita.
                    </p>
                  </div>
                  <div className={styles.card}>
                    <div className={styles.cardTitle}>🏷️ Medios Obsoletos</div>
                    <p className={styles.cardText}>
                      Las tarjetas de cartón se olvidan, se falsifican y no te generan una base de datos para marketing automatizado.
                    </p>
                  </div>
                </div>
              )}

              {slide.type === 'workflow' && (
                <div className={styles.grid}>
                  <div className={styles.card}>
                    <div className={styles.cardTitle}>1. Consumo Habitual</div>
                    <p className={styles.cardText}>
                      El cliente disfruta de su servicio o realiza su compra regular en tu mostrador.
                    </p>
                  </div>
                  <div className={styles.card} style={{ borderColor: 'rgba(0, 208, 132, 0.4)' }}>
                    <div className={styles.cardTitle}>2. Identificación</div>
                    <p className={styles.cardText}>
                      Escribe el número de Whatsapp. Si es nuevo, registras su nombre y fecha de cumpleaños en solo 2 segundos.
                    </p>
                  </div>
                  <div className={styles.card}>
                    <div className={styles.cardTitle}>3. Magia Instantánea</div>
                    <p className={styles.cardText}>
                      Presionas "Acumular" o "Canjear". El saldo digital del cliente se actualiza de forma inmediata y encriptada.
                    </p>
                  </div>
                </div>
              )}

              {slide.type === 'tablet' && (
                <div className={styles.grid}>
                  <div className={styles.card}>
                    <div className={styles.cardTitle}>🔌 Independencia de tu sistema actual</div>
                    <p className={styles.cardText}>
                      Funciona 100% en la nube y de forma independiente. No interfiere con tu sistema de cobro actual ni requiere desarrollos o integraciones de software invasivas.
                    </p>
                  </div>
                  <div className={styles.card}>
                    <div className={styles.cardTitle}>📱 Portabilidad y Espacio</div>
                    <p className={styles.cardText}>
                      Un iPad o tablet en un soporte elegante en mostrador se ve premium ante tus clientes y no estorba con cables o hardware estorboso en caja.
                    </p>
                  </div>
                  <div className={styles.card}>
                    <div className={styles.cardTitle}>⚡ Curva de Aprendizaje Cero</div>
                    <p className={styles.cardText}>
                      La interfaz táctil es sumamente intuitiva. Tu personal de mostrador sabrá operarla con fluidez en menos de 5 minutos de uso práctico.
                    </p>
                  </div>
                </div>
              )}

              {slide.type === 'customer' && (
                <ul className={styles.list}>
                  <li><strong>Enlace Web Público:</strong> Acceden de forma directa desde cualquier navegador móvil.</li>
                  <li><strong>Identificación Simple:</strong> Solo necesitan escribir su número de teléfono.</li>
                  <li><strong>Saldo en Vivo:</strong> Visualizan al instante su dinero electrónico disponible para su próxima visita.</li>
                  <li><strong>Mayor Motivación:</strong> La claridad de ver su saldo acumulado incrementa la frecuencia de retorno.</li>
                </ul>
              )}

              {slide.type === 'pro' && (
                <div className={styles.grid}>
                  <div className={styles.card}>
                    <div className={styles.cardTitle}>⏰ Retención a 30 días</div>
                    <p className={styles.cardText}>
                      Envía un saldo promocional a los clientes que no han visitado en el último mes.
                    </p>
                  </div>
                  <div className={styles.card}>
                    <div className={styles.cardTitle}>🎁 Cumpleañeros del Mes</div>
                    <p className={styles.cardText}>
                      Felicita automáticamente a tus clientes en su cumpleaños con un regalo.
                    </p>
                  </div>
                  <div className={styles.card}>
                    <div className={styles.cardTitle}>💎 Recompensa VIP</div>
                    <p className={styles.cardText}>
                      Premia a los clientes que han gastado más de $20000 MXN en total.
                    </p>
                  </div>
                  <div className={styles.card}>
                    <div className={styles.cardTitle}>📢 Promoción Masiva</div>
                    <p className={styles.cardText}>
                      Anuncio personalizado para toda tu base de datos de clientes registrados.
                    </p>
                  </div>
                </div>
              )}

              {/* ROI Calculator Slide */}
              {slide.type === 'roi' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', marginTop: '2rem', width: '100%', maxWidth: '900px', textAlign: 'left' }}>
                  {/* Controles del Calculador */}
                  <div className={styles.card} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <div>
                      <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                        <span>💰 Ticket de Consumo Promedio:</span>
                        <strong style={{ color: '#00d084' }}>${ticket} MXN</strong>
                      </label>
                      <input 
                        type="range" 
                        min="50" 
                        max="1500" 
                        step="10" 
                        value={ticket} 
                        onChange={(e) => setTicket(Number(e.target.value))}
                        style={{ width: '100%', accentColor: '#00d084', cursor: 'pointer' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                        <span>👥 Clientes que Atiendes al Día:</span>
                        <strong style={{ color: '#00d084' }}>{dailyCustomers} clientes</strong>
                      </label>
                      <input 
                        type="range" 
                        min="10" 
                        max="500" 
                        step="5" 
                        value={dailyCustomers} 
                        onChange={(e) => setDailyCustomers(Number(e.target.value))}
                        style={{ width: '100%', accentColor: '#00d084', cursor: 'pointer' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                        <span>📈 Tasa de Retención Adicional:</span>
                        <strong style={{ color: '#00d084' }}>{increaseRate}%</strong>
                      </label>
                      <input 
                        type="range" 
                        min="3" 
                        max="30" 
                        step="1" 
                        value={increaseRate} 
                        onChange={(e) => setIncreaseRate(Number(e.target.value))}
                        style={{ width: '100%', accentColor: '#00d084', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '0.75rem', opacity: 0.5, display: 'block', marginTop: '0.3rem' }}>
                        Porcentaje de clientes inactivos o de una sola vez que regresan gracias al marketing automatizado.
                      </span>
                    </div>
                  </div>

                  {/* Resultados Financieros */}
                  <div className={styles.card} style={{ padding: '1.5rem', background: 'rgba(0,208,132,0.03)', border: '1px solid rgba(0,208,132,0.2)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div>
                        <div style={{ fontSize: '0.85rem', opacity: 0.6 }}>Visitas Adicionales al Mes:</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 'bold' }}>+{extraVisits} visitas</div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.85rem', opacity: 0.6 }}>Facturación Adicional Mensual:</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white' }}>${extraRevenue.toLocaleString()} MXN</div>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', marginTop: '1rem' }}>
                      <div style={{ fontSize: '0.85rem', opacity: 0.6 }}>Retorno Neto Estimado (Descontando la Licencia Pro):</div>
                      <div style={{ fontSize: '2.2rem', fontWeight: 'extrabold', color: netReturnPro > 0 ? '#00d084' : '#ff4757' }}>
                        ${netReturnPro > 0 ? `+${netReturnPro.toLocaleString()}` : netReturnPro.toLocaleString()} MXN
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {slide.type === 'benefits' && (
                <ul className={styles.list}>
                  <li><span><strong>Aumento del Ticket Promedio:</strong> Los clientes consumen más para alcanzar sus metas de recompensa.</span></li>
                  <li><span><strong>Base de Datos Propia:</strong> Dejas de depender de algoritmos externos; tienes contacto directo con tus compradores.</span></li>
                  <li><span><strong>Seguridad y Auditoría:</strong> Control antifraude sobre qué cajero emitió o redimió saldo en cada ticket.</span></li>
                  <li><span><strong>Posicionamiento Premium:</strong> Proyectas a tu empresa con tecnología de punta a la par de las grandes cadenas.</span></li>
                  <li><span><strong>Accesibilidad Tecnológica:</strong> Obtén el poder de sistemas a la medida de gigantes como <em>Starbucks Rewards, Toks, McDonald's o Pizza Hut</em>, por una fracción de su costo.</span></li>
                </ul>
              )}

              {slide.type === 'pricing' && (
                <div className={styles.pricingContainer}>
                  <div className={styles.priceCard}>
                    <div className={styles.planName}>LoyaltyOS Growth</div>
                    <div className={styles.planPrice}>$8,900 <span>MXN /mes</span></div>
                    <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Impulsa el crecimiento de tu restaurante desde el primer día.</p>
                    <ul className={styles.list} style={{ fontSize: '0.95rem' }}>
                      <li>Clientes ilimitados</li>
                      <li>1 Cajero</li>
                      <li>Billetera pública para clientes</li>
                      <li>Soporte vía WhatsApp</li>
                      <li>Dashboard con Gráficas Analíticas</li>
                      <li>Mensaje de Bienvenida Automático</li>
                      <li>4 módulos de automatización y marketing</li>
                      <li>Incluye 1000 mensajes mensuales (Bienvenida y Campañas de Marketing).</li>
                    </ul>
                  </div>

                  <div className={`${styles.priceCard} ${styles.featured}`}>
                    <span className={styles.badge}>Recomendado</span>
                    <div className={styles.planName} style={{ color: '#00d084' }}>LoyaltyOS Business</div>
                    <div className={styles.planPrice}>$21,000 <span>MXN /mes</span></div>
                    <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>La plataforma de fidelización para restaurantes que están listos para crecer.</p>
                    <ul className={styles.list} style={{ fontSize: '0.95rem' }}>
                      <li>Clientes ilimitados</li>
                      <li>Hasta 3 Cajeros</li>
                      <li>Billetera pública para clientes</li>
                      <li>Soporte vía WhatsApp</li>
                      <li>Dashboard con Gráficas Analíticas</li>
                      <li>Mensaje de Bienvenida Automático</li>
                      <li>4 módulos de automatización y marketing</li>
                      <li>Incluye 1000 mensajes mensuales (Bienvenida y Campañas de Marketing).</li>
                    </ul>
                  </div>

                  <div className={styles.priceCard}>
                    <div className={styles.planName} style={{ color: '#CBD5E1' }}>LoyaltyOS Enterprise</div>
                    <div className={styles.planPrice}>$35,000 <span>MXN /mes</span></div>
                    <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>La solución empresarial para cadenas que buscan liderar el mercado.</p>
                    <ul className={styles.list} style={{ fontSize: '0.95rem' }}>
                      <li>Clientes ilimitados</li>
                      <li>Hasta 5 Cajeros</li>
                      <li>Billetera pública para clientes</li>
                      <li>Soporte vía WhatsApp</li>
                      <li>Dashboard con Gráficas Analíticas</li>
                      <li>Mensaje de Bienvenida Automático</li>
                      <li>4 módulos de automatización y marketing</li>
                      <li>Incluye 1000 mensajes mensuales (Bienvenida y Campañas de Marketing).</li>
                    </ul>
                  </div>
                </div>
              )}

              {slide.type === 'founder' && (
                <div style={{ marginTop: '2rem' }}>
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', maxWidth: '800px', margin: '0 auto 2.5rem', textAlign: 'center', lineHeight: '1.6' }}>
                    <strong style={{ color: '#00d084' }}>Beneficio por 2 años mientras mantenga su licencia activa.</strong><br/>
                  </p>

                  <div className={styles.pricingContainer}>
                    <div className={styles.priceCard}>
                      <div className={styles.planName}>LoyaltyOS Growth</div>
                      <div className={styles.planPrice}>$6,500 <span>MXN /mes</span></div>
                      <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Impulsa el crecimiento de tu restaurante desde el primer día.</p>
                      <ul className={styles.list} style={{ fontSize: '0.95rem' }}>
                        <li>Clientes ilimitados</li>
                        <li>1 Cajero</li>
                        <li>Billetera pública para clientes</li>
                        <li>Soporte vía WhatsApp</li>
                        <li>Dashboard con Gráficas Analíticas</li>
                        <li>Mensaje de Bienvenida Automático</li>
                        <li>4 módulos de automatización y marketing</li>
                        <li>Incluye 1000 mensajes mensuales (Bienvenida y Campañas de Marketing).</li>
                      </ul>
                    </div>

                    <div className={`${styles.priceCard} ${styles.featured}`}>
                      <span className={styles.badge}>Recomendado</span>
                      <div className={styles.planName} style={{ color: '#00d084' }}>LoyaltyOS Business</div>
                      <div className={styles.planPrice}>$16,000 <span>MXN /mes</span></div>
                      <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>La plataforma de fidelización para restaurantes que están listos para crecer.</p>
                      <ul className={styles.list} style={{ fontSize: '0.95rem' }}>
                        <li>Clientes ilimitados</li>
                        <li>Hasta 3 Cajeros</li>
                        <li>Billetera pública para clientes</li>
                        <li>Soporte vía WhatsApp</li>
                        <li>Dashboard con Gráficas Analíticas</li>
                        <li>Mensaje de Bienvenida Automático</li>
                        <li>4 módulos de automatización y marketing</li>
                        <li>Incluye 1000 mensajes mensuales (Bienvenida y Campañas de Marketing).</li>
                      </ul>
                    </div>

                    <div className={styles.priceCard}>
                      <div className={styles.planName} style={{ color: '#CBD5E1' }}>LoyaltyOS Enterprise</div>
                      <div className={styles.planPrice}>$28,000 <span>MXN /mes</span></div>
                      <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>La solución empresarial para cadenas que buscan liderar el mercado.</p>
                      <ul className={styles.list} style={{ fontSize: '0.95rem' }}>
                        <li>Clientes ilimitados</li>
                        <li>Hasta 5 Cajeros</li>
                        <li>Billetera pública para clientes</li>
                        <li>Soporte vía WhatsApp</li>
                        <li>Dashboard con Gráficas Analíticas</li>
                        <li>Mensaje de Bienvenida Automático</li>
                        <li>4 módulos de automatización y marketing</li>
                        <li>Incluye 1000 mensajes mensuales (Bienvenida y Campañas de Marketing).</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {slide.type === 'cta' && (
                <div style={{ marginTop: '3rem', display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <a 
                    href="https://wa.me/527442584411?text=Hola%2C%20me%20interesa%20agendar%20una%20demostraci%C3%B3n%20en%20vivo%20de%20LoyaltyOS%20para%20mi%20negocio..."
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ background: '#00d084', color: '#000', padding: '1rem 2.5rem', borderRadius: '50px', fontWeight: 'bold', textDecoration: 'none', transition: 'transform 0.2s', display: 'inline-block' }}
                  >
                    Agendar Demo en Vivo
                  </a>
                  <a 
                    href="/"
                    style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '1rem 2.5rem', borderRadius: '50px', fontWeight: 'bold', textDecoration: 'none', transition: 'background 0.2s', display: 'inline-block' }}
                  >
                    Ver Página Web
                  </a>
                </div>
              )}

              {slide.type === 'competitor' && (
                <div className={styles.pricingContainer} style={{ marginTop: '1rem', alignItems: 'stretch' }}>
                  <div className={styles.priceCard} style={{ opacity: 0.8, display: 'flex', flexDirection: 'column' }}>
                    <div className={styles.planName} style={{ color: '#fff', fontSize: '1.4rem', marginBottom: '1.5rem' }}>El modelo tradicional</div>
                    {slide.competitorId === 'natural' && (
                      <div className={styles.cardText} style={{ fontSize: '0.95rem' }}>
                        <p style={{ marginBottom: '1.2rem', fontSize: '1.6rem', fontWeight: '900', color: '#fff' }}>100% Natural</p>
                        <p style={{ marginBottom: '1rem' }}>Te da el 5% en consumo total pagando con tarjeta y el 10% en consumo total pagando en efectivo.</p>
                        <p style={{ marginBottom: '1rem' }}>Requiere que el cliente descargue una App pesada en iOS o Android, creando fricción en el registro.</p>
                        <p>Premios específicos por cumpleaños y al cumplir un año de antigüedad con la tarjeta.</p>
                      </div>
                    )}
                    {slide.competitorId === 'starbucks' && (
                      <div className={styles.cardText} style={{ fontSize: '0.95rem' }}>
                        <p style={{ marginBottom: '1.2rem', fontSize: '1.6rem', fontWeight: '900', color: '#fff' }}>Starbucks Rewards</p>
                        <p style={{ marginBottom: '1rem' }}>Acumulación compleja basada en estrellas y métodos de pago (1 estrella por $10 MXN con su tarjeta, o por $20 MXN en efectivo/tarjeta).</p>
                        <p style={{ marginBottom: '1rem' }}>Niveles Green y Gold que requieren acumular 200 estrellas al año.</p>
                        <p>Exige la descarga de App, registro extenso de cuenta y añadir métodos de pago para máxima eficiencia.</p>
                      </div>
                    )}
                    {slide.competitorId === 'cinepolis' && (
                      <div className={styles.cardText} style={{ fontSize: '0.95rem' }}>
                        <p style={{ marginBottom: '1.2rem', fontSize: '1.6rem', fontWeight: '900', color: '#fff' }}>Club Cinépolis</p>
                        <p style={{ marginBottom: '1rem' }}>Puntos basados en visitas semestrales (niveles FAN, FANÁTICO, SÚPER FANÁTICO) que otorgan 5% o 10%.</p>
                        <p style={{ marginBottom: '1rem' }}>Mecánica compleja condicionada a cantidad de visitas en cortes de 6 meses (Ene-Jun / Jul-Dic).</p>
                        <p>Requiere mostrar tarjeta física o abrir la aplicación móvil en taquilla, entorpeciendo la fila.</p>
                      </div>
                    )}
                    {slide.competitorId === 'toks' && (
                      <div className={styles.cardText} style={{ fontSize: '0.95rem' }}>
                        <p style={{ marginBottom: '1.2rem', fontSize: '1.6rem', fontWeight: '900', color: '#fff' }}>A Comer Club (Toks)</p>
                        <p style={{ marginBottom: '1rem' }}>Acumulación de puntos para canjear por platillos o subir de nivel.</p>
                        <p style={{ marginBottom: '1rem' }}>Requiere descargar la App, crear una cuenta y escanear el ticket con la función PayClub en cada visita.</p>
                        <p>Fricción alta post-consumo al depender de que el cliente no olvide escanear su propio ticket.</p>
                      </div>
                    )}
                  </div>
                  <div className={`${styles.priceCard} ${styles.featured}`} style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className={styles.planName} style={{ color: '#00d084', fontSize: '1.4rem', marginBottom: '1.5rem' }}>La ventaja LoyaltyOS</div>
                    <ul className={styles.list} style={{ fontSize: '1.05rem', margin: '0' }}>
                      <li style={{ marginBottom: '1rem' }}><strong>Sin Apps ni descargas:</strong> El cliente accede a su billetera vía web desde cualquier navegador. Cero fricción.</li>
                      <li style={{ marginBottom: '1rem' }}><strong>Registro en 2 segundos:</strong> Únicamente se necesita el número de WhatsApp en la tablet. Adiós a los formularios largos.</li>
                      <li style={{ marginBottom: '1rem' }}><strong>Mecánica transparente:</strong> Acumulación directa en saldo digital (Cashback) sin sistemas complejos de estrellas o puntos devaluados.</li>
                      <li style={{ marginBottom: '1rem' }}><strong>Operación veloz en mostrador:</strong> El cajero envía el saldo al instante. Las filas avanzan rápido y la experiencia de pago es fluida.</li>
                      <li><strong>Comunicación inteligente:</strong> Envío de SMS y WhatsApp optimizados. Notificamos al cliente solo en su primer registro y a través de campañas automatizadas, evitando saturarlo de alertas de transacción y maximizando el impacto.</li>
                    </ul>
                  </div>
                </div>
              )}

            </div>
          </div>
        );
      })}

      {/* Navigation Footer Controls */}
      <div className={styles.controls}>
        <div className={styles.logoArea}>
          <img src="/logo.png" alt="LoyaltyOS" style={{ height: '35px', width: 'auto' }} />
          <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', marginLeft: '8px' }}>| Desarrollado por Agencia +Brain</span>
        </div>

        <div className={styles.navButtons}>
          <button 
            onClick={prevSlide} 
            disabled={currentSlide === 0} 
            className={styles.btnNav}
            title="Diapositiva Anterior"
            aria-label="Anterior"
          >
            ←
          </button>
          <span className={styles.counter}>
            {currentSlide + 1} / {slides.length}
          </span>
          <button 
            onClick={nextSlide} 
            disabled={currentSlide === slides.length - 1} 
            className={styles.btnNav}
            title="Siguiente Diapositiva"
            aria-label="Siguiente"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
