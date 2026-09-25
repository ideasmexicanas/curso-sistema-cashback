# 💳 Sistema de Cashback y Fidelización
### Curso completo — De cero a producción en un día

> Sistema profesional de lealtad para negocios locales: restaurantes, cafeterías, spas y más. Construido con tecnología moderna y desplegado en la nube de forma 100% gratuita.

---

## 🎯 ¿Qué vas a construir?

Un sistema **completo y funcional** que incluye:

| Módulo | Descripción |
|--------|-------------|
| 🖥️ **Panel de Control** | Dashboard con estadísticas en tiempo real, ventas, tickets y clientes |
| 💰 **Terminal POS** | Pantalla para el cajero: cobra, asigna cashback y canjea saldo |
| 📲 **Billetera Digital** | Página del cliente para ver su saldo con código QR |
| 📢 **Panel de Marketing** | Campañas automáticas: cumpleaños, VIP, retención, referidos |
| 🤝 **Recomienda y Gana** | Sistema viral de referidos con recompensas automáticas |
| 👥 **Gestión de Clientes** | Base de datos, historial de visitas y exportación a Excel |
| 📊 **Presentación de Ventas** | Landing page para vender el sistema a nuevos negocios |

---

## 🚀 Demo en Vivo

👉 **[www.loyaltyos.online](https://www.loyaltyos.online)** — Mira el sistema funcionando en producción

---

## 🛠️ Stack Tecnológico

```
Frontend:    Next.js 16 + React 19 + CSS Modules
Backend:     Next.js API Routes (Serverless Functions)
Base de datos: PostgreSQL via Supabase
ORM:         Prisma 5
Hosting:     Vercel (gratis)
Mensajería:  SMS Masivos (WhatsApp + SMS)
```

---

## 💰 Costo de Operación Mensual

| Servicio | Plan | Costo |
|----------|------|-------|
| Supabase (BD) | Free Tier | **$0 USD** |
| Vercel (Hosting) | Hobby | **$0 USD** |
| SMS Masivos | Por uso | ~$0.15 MXN/SMS |

---

## ⚡ Instalación Rápida

### Pre-requisitos
- [Node.js v18+](https://nodejs.org/)
- [Git](https://git-scm.com/)
- Cuenta en [Supabase](https://supabase.com/) (gratis)
- Cuenta en [Vercel](https://vercel.com/) (gratis)
- Cuenta en [SMS Masivos](https://www.smsmasivos.com.mx/)

### Pasos

```bash
# 1. Clona el repositorio
git clone https://github.com/ideasmexicanas/curso-sistema-cashback.git
cd curso-sistema-cashback

# 2. Instala dependencias
npm install

# 3. Configura tus variables de entorno
copy .env.example .env
# (edita el archivo .env con tus datos)

# 4. Crea las tablas en la base de datos
npx prisma db push

# 5. Arranca el servidor de desarrollo
npm run dev
```

Abre **http://localhost:3000** en tu navegador. ¡Listo!

> 📖 Para la guía completa paso a paso, consulta [GUIA_INSTALACION.md](./GUIA_INSTALACION.md)

---

## 📁 Estructura del Proyecto

```
curso-sistema-cashback/
├── prisma/
│   └── schema.prisma        # Modelos de base de datos
├── src/
│   ├── app/
│   │   ├── admin/           # Panel de administración
│   │   ├── api/             # Endpoints del backend
│   │   ├── pos/             # Terminal del cajero
│   │   ├── wallet/          # Billetera digital del cliente
│   │   ├── mi-saldo/        # Consulta pública de saldo
│   │   ├── r/[tenantId]/    # Registro de nuevos clientes
│   │   └── presentacion/    # Landing de ventas
│   └── lib/
│       ├── prisma.ts        # Conexión a la base de datos
│       ├── whatsapp.ts      # Envío de mensajes WhatsApp
│       └── sms.ts           # Envío de SMS
├── .env.example             # Variables de entorno (plantilla)
├── GUIA_INSTALACION.md      # Guía completa de instalación
└── package.json
```

---

## 🌐 Despliegue en Vercel (Producción)

```bash
npm install -g vercel
vercel login
vercel --prod
```

O con el botón de despliegue automático:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ideasmexicanas/curso-sistema-cashback)

---

## 🗺️ Rutas del Sistema

| Ruta | Descripción | Acceso |
|------|-------------|--------|
| `/` | Página de inicio | Público |
| `/login` | Inicio de sesión | Admin |
| `/admin` | Dashboard principal | Admin |
| `/admin/campaigns` | Panel de marketing | Admin |
| `/admin/customers` | Gestión de clientes | Admin |
| `/admin/settings` | Configuración | Admin |
| `/pos` | Terminal del cajero | Cajero |
| `/mi-saldo` | Consulta de saldo | Cliente |
| `/r/[tenantId]` | Registro de clientes | Cliente |
| `/wallet/[id]` | Billetera digital | Cliente |
| `/presentacion` | Presentación de ventas | Público |

---

## ❓ Preguntas Frecuentes

**¿Necesito saber programar para seguir el curso?**
Conocimientos básicos de JavaScript son suficientes. El curso explica cada línea de código.

**¿Puedo usar este sistema para mis propios clientes?**
Sí. Está diseñado para ser personalizado y vendido como servicio (SaaS) a negocios locales.

**¿Funciona en cualquier tipo de negocio?**
Funciona en restaurantes, cafeterías, spas, salones de belleza, clínicas y cualquier negocio con clientes recurrentes.

**¿Qué pasa si tengo dudas durante la instalación?**
Revisa primero la [Guía de Instalación](./GUIA_INSTALACION.md). Si el problema persiste, abre un Issue en este repositorio.

---

## 📄 Licencia

Este proyecto es material exclusivo del curso. No está permitida su redistribución sin autorización.

---

**Desarrollado por [Agencia +Brain](https://agenciamasbrain.com/) · © 2026**
