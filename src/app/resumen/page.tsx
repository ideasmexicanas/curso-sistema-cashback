'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './resumen.module.css';

export default function ResumenPage() {
  // ROI Calculator interactive state
  const [ticket, setTicket] = useState(250);
  const [dailyCustomers, setDailyCustomers] = useState(80);
  const [increaseRate, setIncreaseRate] = useState(10); // 10% retention boost

  const monthlyCustomers = dailyCustomers * 30;
  const extraVisits = Math.round(monthlyCustomers * (increaseRate / 100));
  const extraRevenue = extraVisits * ticket;

  // Competitor Analysis state & data (the 4 examples)
  const [activeCompetitor, setActiveCompetitor] = useState<'natural' | 'starbucks' | 'cinepolis' | 'toks'>('natural');

  const competitorsData = [
    {
      id: 'natural' as const,
      name: '100% Natural',
      icon: '🌿',
      category: 'Restaurantes',
      bullets: [
        'Te da el 5% en consumo total pagando con tarjeta y el 10% en consumo total pagando en efectivo.',
        'Requiere que el cliente descargue una App pesada en iOS o Android, creando fricción en el registro.',
        'Premios específicos por cumpleaños y al cumplir un año de antigüedad con la tarjeta.'
      ]
    },
    {
      id: 'starbucks' as const,
      name: 'Starbucks Rewards',
      icon: '☕',
      category: 'Cafeterías',
      bullets: [
        'Acumulación compleja basada en estrellas y métodos de pago (1 estrella por $10 MXN con su tarjeta, o por $20 MXN en efectivo/tarjeta).',
        'Niveles Green y Gold que requieren acumular 200 estrellas al año.',
        'Exige la descarga de App, registro extenso de cuenta y añadir métodos de pago para máxima eficiencia.'
      ]
    },
    {
      id: 'cinepolis' as const,
      name: 'Club Cinépolis',
      icon: '🎬',
      category: 'Entretenimiento',
      bullets: [
        'Puntos basados en visitas semestrales (niveles FAN, FANÁTICO, SÚPER FANÁTICO) que otorgan 5% o 10%.',
        'Mecánica compleja condicionada a cantidad de visitas en cortes de 6 meses (Ene-Jun / Jul-Dic).',
        'Requiere mostrar tarjeta física o abrir la aplicación móvil en taquilla, entorpeciendo la fila.'
      ]
    },
    {
      id: 'toks' as const,
      name: 'A Comer Club (Toks)',
      icon: '🍽️',
      category: 'Cadenas Familiares',
      bullets: [
        'Acumulación de puntos para canjear por platillos o subir de nivel.',
        'Requiere descargar la App, crear una cuenta y escanear el ticket con la función PayClub en cada visita.',
        'Fricción alta post-consumo al depender de que el cliente no olvide escanear su propio ticket.'
      ]
    }
  ];

  const currentComp = competitorsData.find(c => c.id === activeCompetitor) || competitorsData[0];

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.bgGlow} aria-hidden="true"></div>

      <main className={styles.container}>
        {/* Navigation / Header */}
        <header className={styles.nav}>
          <div className={styles.logoArea}>
            <Link href="/">
              <img src="/logo.png" alt="LoyaltyOS" className={styles.logo} />
            </Link>
            <span className={styles.badge}>📄 Ficha Ejecutiva One-Pager</span>
          </div>

          <div className={styles.navLinks}>
            <button 
              onClick={handlePrint} 
              className={styles.btnSecondary} 
              style={{ fontSize: '0.85rem', padding: '0.6rem 1rem' }}
              title="Imprimir o Guardar en PDF"
            >
              🖨️ Imprimir / Guardar PDF
            </button>
            <Link 
              href="/presentacion" 
              className={styles.btnSecondary}
              style={{ fontSize: '0.85rem', padding: '0.6rem 1rem' }}
            >
              📊 Ver Diapositivas
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <section className={styles.hero}>
          <span className={styles.sectionTag}>Sistema de Fidelización y Cashback para Restaurantes</span>
          <h1 className={styles.heroTitle}>
            Convierte comensales casuales en <br />
            <span className={styles.highlight}>clientes frecuentes en piloto automático</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Reemplaza las tarjetas de sellos con un sistema de Cashback digital que opera en <strong>2 segundos desde cualquier tablet o celular</strong>. Sin apps, sin descargas y con campañas inteligentes de WhatsApp que traen a tus clientes de vuelta.
          </p>

          <div className={styles.pillGrid}>
            <div className={styles.pill}>⚡ <strong>2 Segundos</strong> por transacción</div>
            <div className={styles.pill}>📱 <strong>Cero Descargas</strong> (100% Web)</div>
            <div className={styles.pill}>💵 <strong>Cashback Real</strong> en dinero ($)</div>
            <div className={styles.pill}>🤖 <strong>WhatsApp</strong> 100% automatizado</div>
            <div className={styles.pill}>🔌 <strong>Independiente</strong> de tu software actual</div>
          </div>

          <div className={styles.heroCta}>
            <a 
              href="https://wa.me/527442584411?text=Hola%2C%20le%C3%AD%20el%20resumen%20ejecutivo%20de%20LoyaltyOS%20y%20me%20gustar%C3%ADa%20agendar%20una%20demostraci%C3%B3n%20en%20vivo%20para%20mi%20restaurante..."
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.btnPrimary}
            >
              📲 Agendar Demo en Vivo (20 min)
            </a>
            <a 
              href="#simulador" 
              className={styles.btnSecondary}
            >
              💰 Ver Simulador de Ganancias
            </a>
          </div>
        </section>

        {/* 1. El Problema */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>El Diagnóstico</span>
            <h2 className={styles.sectionTitle}>¿Por qué los restaurantes pierden ingresos a diario?</h2>
          </div>

          <div className={styles.cardGrid}>
            <div className={styles.card}>
              <span className={styles.cardIcon}>⚠️</span>
              <h3 className={styles.cardTitle}>Falta de Retención</h3>
              <p className={styles.cardText}>
                Atraer a un cliente nuevo a través de anuncios cuesta hasta <strong>7 veces más</strong> que hacer que un comensal que ya te conoce regrese a consumir.
              </p>
            </div>

            <div className={styles.card}>
              <span className={styles.cardIcon}>👻</span>
              <h3 className={styles.cardTitle}>Cero Datos Reales</h3>
              <p className={styles.cardText}>
                El <strong>90% de los clientes</strong> entran, pagan y se marchan sin dejar rastro. No sabes quiénes son, cuándo fue su última visita ni cómo contactarlos.
              </p>
            </div>

            <div className={styles.card}>
              <span className={styles.cardIcon}>🏷️</span>
              <h3 className={styles.cardTitle}>Medios Obsoletos</h3>
              <p className={styles.cardText}>
                Las tarjetas de cartón y sellos se pierden, se olvidan, no son auditables y no te permiten hacer marketing automatizado.
              </p>
            </div>
          </div>
        </section>

        {/* 2. La Solución y Flujo */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>Operación Ágil</span>
            <h2 className={styles.sectionTitle}>Magia en Caja: Flujo en 2 Segundos</h2>
          </div>

          <div className={styles.cardGrid}>
            <div className={styles.card}>
              <div className={styles.stepNumber}>1</div>
              <h3 className={styles.cardTitle}>Consumo Regular</h3>
              <p className={styles.cardText}>
                El cliente disfruta de sus alimentos y paga su cuenta en caja de forma habitual (efectivo o tarjeta).
              </p>
            </div>

            <div className={styles.card} style={{ borderColor: 'rgba(0, 208, 132, 0.4)' }}>
              <div className={styles.stepNumber}>2</div>
              <h3 className={styles.cardTitle}>Ingreso del Celular</h3>
              <p className={styles.cardText}>
                El cajero teclea el número de WhatsApp del cliente en la tablet. Si es nuevo, se registra en solo 2 segundos.
              </p>
            </div>

            <div className={styles.card}>
              <div className={styles.stepNumber}>3</div>
              <h3 className={styles.cardTitle}>Cashback Inmediato</h3>
              <p className={styles.cardText}>
                Presionas <em>"Acumular"</em> o <em>"Canjear"</em>. El saldo digital se abona al instante en pesos y queda listo para su próxima visita.
              </p>
            </div>

            <div className={styles.card}>
              <div className={styles.stepNumber}>4</div>
              <h3 className={styles.cardTitle}>Billetera Digital Web</h3>
              <p className={styles.cardText}>
                El cliente consulta su saldo en su celular mediante un enlace web o código QR. <strong>Cero aplicaciones que descargar.</strong>
              </p>
            </div>
          </div>
        </section>

        {/* 3. Marketing Automatizado */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>Piloto Automático 24/7</span>
            <h2 className={styles.sectionTitle}>Marketing Inteligente que Llena Mesas</h2>
          </div>

          <div className={styles.cardGrid}>
            <div className={styles.card}>
              <span className={styles.cardIcon}>🎂</span>
              <h3 className={styles.cardTitle}>Cumpleañeros del Mes</h3>
              <p className={styles.cardText}>
                Felicita automáticamente a tus clientes en su fecha especial con un saldo de regalo o cortesía que los motiva a celebrar en tu restaurante.
              </p>
            </div>

            <div className={styles.card}>
              <span className={styles.cardIcon}>⏰</span>
              <h3 className={styles.cardTitle}>Rescate a 30 Días</h3>
              <p className={styles.cardText}>
                Detecta de forma automática a comensales que no han vuelto en el último mes y les envía un incentivo para reactivarlos antes de perderlos.
              </p>
            </div>

            <div className={styles.card}>
              <span className={styles.cardIcon}>💎</span>
              <h3 className={styles.cardTitle}>Recompensas VIP</h3>
              <p className={styles.cardText}>
                Identifica a tus clientes de más alto consumo y activa beneficios exclusivos para garantizar su lealtad a largo plazo.
              </p>
            </div>

            <div className={styles.card}>
              <span className={styles.cardIcon}>🤝</span>
              <h3 className={styles.cardTitle}>Recomienda y Gana</h3>
              <p className={styles.cardText}>
                Cada comensal tiene su enlace personal para invitar amigos por WhatsApp. Al registrarse el nuevo amigo, ambos ganan saldo automáticamente.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Simulador Financiero */}
        <section id="simulador" className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>Impacto Económico</span>
            <h2 className={styles.sectionTitle}>Simula el Retorno de Inversión para tu Negocio</h2>
          </div>

          <div className={styles.roiContainer}>
            {/* Controles interactivos */}
            <div>
              <div className={styles.sliderGroup}>
                <div className={styles.sliderLabel}>
                  <span>💰 Ticket Promedio de Consumo:</span>
                  <span className={styles.sliderValue}>${ticket.toLocaleString()} MXN</span>
                </div>
                <input 
                  type="range" 
                  min="50" 
                  max="1500" 
                  step="10" 
                  value={ticket} 
                  onChange={(e) => setTicket(Number(e.target.value))}
                  className={styles.rangeInput}
                />
              </div>

              <div className={styles.sliderGroup}>
                <div className={styles.sliderLabel}>
                  <span>👥 Clientes Atendidos por Día:</span>
                  <span className={styles.sliderValue}>{dailyCustomers} comensales</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="500" 
                  step="5" 
                  value={dailyCustomers} 
                  onChange={(e) => setDailyCustomers(Number(e.target.value))}
                  className={styles.rangeInput}
                />
              </div>

              <div className={styles.sliderGroup}>
                <div className={styles.sliderLabel}>
                  <span>📈 Tasa de Retorno Estimada (+):</span>
                  <span className={styles.sliderValue}>{increaseRate}%</span>
                </div>
                <input 
                  type="range" 
                  min="3" 
                  max="30" 
                  step="1" 
                  value={increaseRate} 
                  onChange={(e) => setIncreaseRate(Number(e.target.value))}
                  className={styles.rangeInput}
                />
                <small className={styles.sliderNote}>
                  Porcentaje conservador de clientes ocasionales que regresan gracias al cashback y marketing automatizado.
                </small>
              </div>
            </div>

            {/* Resultados en tiempo real */}
            <div className={styles.roiResults}>
              <div className={styles.statBlock}>
                <span className={styles.statLabel}>Visitas adicionales al mes</span>
                <span className={styles.statValue}>+{extraVisits} visitas</span>
              </div>

              <div className={styles.statBlock}>
                <span className={styles.statLabel}>Facturación Adicional Mensual</span>
                <span className={styles.statHighlight}>+${extraRevenue.toLocaleString()} MXN</span>
              </div>

              <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.8rem', margin: 0 }}>
                💡 <em>El sistema no representa un gasto; se paga a sí mismo múltiples veces desde el primer mes de operación.</em>
              </p>
            </div>
          </div>
        </section>

        {/* 5. Análisis Competitivo (Los 4 Ejemplos) */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>ANÁLISIS COMPETITIVO</span>
            <h2 className={styles.sectionTitle}>{currentComp.name} vs LoyaltyOS</h2>
          </div>

          {/* Selector de marcas */}
          <div className={styles.compTabs}>
            {competitorsData.map(comp => (
              <button
                key={comp.id}
                onClick={() => setActiveCompetitor(comp.id)}
                className={`${styles.compTabBtn} ${activeCompetitor === comp.id ? styles.activeTab : ''}`}
              >
                {comp.icon} {comp.name}
              </button>
            ))}
          </div>

          {/* Comparativa Frente a Frente (Identico a la presentación) */}
          <div className={styles.compGrid}>
            {/* Tarjeta Tradicional */}
            <div className={styles.compCardTrad}>
              <div className={styles.compHeaderTrad}>El modelo tradicional</div>
              <div className={styles.compBrandTitle}>{currentComp.name}</div>
              <div className={styles.compBulletList}>
                {currentComp.bullets.map((bullet, idx) => (
                  <p key={idx} className={styles.compBulletItemTrad}>{bullet}</p>
                ))}
              </div>
            </div>

            {/* Tarjeta LoyaltyOS */}
            <div className={styles.compCardLoyalty}>
              <div className={styles.compHeaderLoyalty}>La ventaja LoyaltyOS</div>
              <div className={styles.compBulletList}>
                <div className={styles.compBulletItemLoyalty}>
                  <span className={styles.checkIcon}>✓</span>
                  <div>
                    <strong>Sin Apps ni descargas:</strong> El cliente accede a su billetera vía web desde cualquier navegador. Cero fricción.
                  </div>
                </div>
                <div className={styles.compBulletItemLoyalty}>
                  <span className={styles.checkIcon}>✓</span>
                  <div>
                    <strong>Registro en 2 segundos:</strong> Únicamente se necesita el número de WhatsApp en la tablet. Adiós a los formularios largos.
                  </div>
                </div>
                <div className={styles.compBulletItemLoyalty}>
                  <span className={styles.checkIcon}>✓</span>
                  <div>
                    <strong>Mecánica transparente:</strong> Acumulación directa en saldo digital (Cashback) sin sistemas complejos de estrellas o puntos devaluados.
                  </div>
                </div>
                <div className={styles.compBulletItemLoyalty}>
                  <span className={styles.checkIcon}>✓</span>
                  <div>
                    <strong>Operación veloz en mostrador:</strong> El cajero envía el saldo al instante. Las filas avanzan rápido y la experiencia de pago es fluida.
                  </div>
                </div>
                <div className={styles.compBulletItemLoyalty}>
                  <span className={styles.checkIcon}>✓</span>
                  <div>
                    <strong>Comunicación inteligente:</strong> Envío de SMS y WhatsApp optimizados. Notificamos al cliente solo en su primer registro y a través de campañas automatizadas, evitando saturarlo de alertas y maximizando el impacto.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabla Resumen */}
          <div className={styles.tableWrapper} style={{ marginTop: '2rem' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Criterio</th>
                  <th>Cadenas Tradicionales (Starbucks, Toks, etc.)</th>
                  <th>LoyaltyOS para tu Restaurante</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Acceso del Cliente</strong></td>
                  <td>Exigen descargar Apps pesadas de 100MB y crear cuentas extensas.</td>
                  <td className={styles.tableLoyalty}>100% Web sin apps. Cero descargas, acceso inmediato.</td>
                </tr>
                <tr>
                  <td><strong>Registro en Caja</strong></td>
                  <td>Lento y con fricción. Retrasa la fila de cobro.</td>
                  <td className={styles.tableLoyalty}>Registro en 2 segundos solo con número de WhatsApp.</td>
                </tr>
                <tr>
                  <td><strong>Tipo de Beneficio</strong></td>
                  <td>Puntos o estrellas confusas sujetas a devaluación.</td>
                  <td className={styles.tableLoyalty}>Cashback transparente en dinero real ($ MXN).</td>
                </tr>
                <tr>
                  <td><strong>Costo de Implementación</strong></td>
                  <td>Cientos de miles de pesos en desarrollo a la medida.</td>
                  <td className={styles.tableLoyalty}>Fracción mínima de costo, listo para usar en 5 minutos.</td>
                </tr>
                <tr>
                  <td><strong>Independencia</strong></td>
                  <td>Requiere integración profunda al sistema POS.</td>
                  <td className={styles.tableLoyalty}>Opera independiente en cualquier iPad o tablet.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 6. CTA / Cierre */}
        <section className={styles.ctaCard}>
          <span className={styles.sectionTag}>Siguiente Paso</span>
          <h2 className={styles.ctaTitle}>Comienza a fidelizar a tus clientes hoy mismo</h2>
          <p className={styles.ctaText}>
            Hagamos una demostración en vivo de 20 a 30 minutos directamente en tu sucursal o por videollamada para que veas la plataforma funcionando con tus propios números.
          </p>

          <div className={styles.heroCta}>
            <a 
              href="https://wa.me/527442584411?text=Hola%2C%20le%C3%AD%20el%20resumen%20ejecutivo%20de%20LoyaltyOS%20y%20quiero%20agendar%20una%20demostraci%C3%B3n%20en%20vivo..."
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.btnPrimary}
              style={{ fontSize: '1.05rem', padding: '1.1rem 2.4rem' }}
            >
              📲 Agendar Demostración por WhatsApp
            </a>
            <button 
              onClick={handlePrint} 
              className={styles.btnSecondary}
              style={{ fontSize: '1.05rem', padding: '1.1rem 2rem' }}
            >
              🖨️ Descargar / Imprimir Ficha
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className={styles.footer}>
          <p>LoyaltyOS · Desarrollado por <a href="https://agenciamasbrain.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#00d084', textDecoration: 'underline' }}>Agencia +Brain</a> · © 2026</p>
          <p style={{ marginTop: '0.4rem' }}>Taxco de Alarcón · Acapulco · Todo México</p>
        </footer>
      </main>
    </div>
  );
}
