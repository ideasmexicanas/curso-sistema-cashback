# 🚀 LoyaltyOS — Guía de Instalación Paso a Paso

Sistema de Cashback y Fidelización para negocios locales.  
**Tecnologías:** Next.js · Prisma · PostgreSQL (Supabase) · Vercel · SMS Masivos

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

| Herramienta | Versión Mínima | Descarga |
|---|---|---|
| **Node.js** | v18 o superior | [nodejs.org](https://nodejs.org/) |
| **Git** | Cualquiera | [git-scm.com](https://git-scm.com/) |
| **VS Code** (o tu editor preferido) | - | [code.visualstudio.com](https://code.visualstudio.com/) |

Y crear cuentas gratuitas en:
- ☁️ [Supabase](https://supabase.com/) — Base de datos PostgreSQL en la nube
- 🌐 [Vercel](https://vercel.com/) — Hosting y despliegue automático
- 📲 [SMS Masivos](https://www.smsmasivos.com.mx/) — Envío de WhatsApp y SMS

---

## 📦 Paso 1: Clonar el Proyecto

Abre una terminal (CMD, PowerShell o Terminal de VS Code) y ejecuta:

```bash
git clone https://github.com/TU_USUARIO/loyalty-os.git
cd loyalty-os
```

---

## 📥 Paso 2: Instalar Dependencias

```bash
npm install
```

Esto descargará todas las librerías necesarias (~2 minutos).

---

## 🗄️ Paso 3: Crear tu Base de Datos en Supabase

1. Entra a [supabase.com](https://supabase.com/) y crea una cuenta gratuita.
2. Haz clic en **"New Project"**.
3. Ponle un nombre (ej: `loyalty-mi-negocio`), elige una contraseña segura y la región **East US**.
4. Espera ~2 minutos a que se cree el proyecto.
5. Ve a **Settings → Database → Connection String**.
6. Copia las dos URLs que necesitas:
   - **Transaction Pooler** (puerto `6543`) → esta va en `DATABASE_URL`
   - **Session Pooler** (puerto `5432`) → esta va en `DIRECT_URL`

---

## 🔑 Paso 4: Configurar Variables de Entorno

1. En la raíz del proyecto, copia el archivo de ejemplo:

```bash
# Windows:
copy .env.example .env

# Mac/Linux:
cp .env.example .env
```

2. Abre el archivo `.env` con tu editor y reemplaza los valores con tus datos reales:

```env
DATABASE_URL="postgresql://postgres.TU_PROYECTO:TU_PASSWORD@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&prepared_statements=false"
DIRECT_URL="postgresql://postgres.TU_PROYECTO:TU_PASSWORD@aws-1-us-east-1.pooler.supabase.com:5432/postgres"
SMS_MASIVOS_API_KEY="tu_api_key_aqui"
CRON_SECRET="loyaltyos-cron-2026"
MASTER_PIN="7777"
```

---

## 🏗️ Paso 5: Crear las Tablas en la Base de Datos

```bash
npx prisma db push
```

Esto creará automáticamente todas las tablas (Tenant, Customer, Transaction, etc.) en tu base de datos de Supabase.

---

## ▶️ Paso 6: Ejecutar en Modo Desarrollo

```bash
npm run dev
```

Abre tu navegador en **http://localhost:3000** y verás la página de LoyaltyOS funcionando.

### Rutas principales:
| Ruta | Descripción |
|---|---|
| `/` | Página de inicio |
| `/login` | Inicio de sesión del administrador |
| `/admin` | Panel de control (Dashboard) |
| `/pos` | Terminal punto de venta (Cajero) |
| `/mi-saldo` | Consulta de saldo del cliente |
| `/admin/campaigns` | Panel de marketing |
| `/admin/settings` | Configuración del sistema |
| `/presentacion` | Presentación de ventas |

---

## 📲 Paso 7: Configurar SMS Masivos (WhatsApp y SMS)

1. Entra a [smsmasivos.com.mx](https://www.smsmasivos.com.mx/) y crea tu cuenta.
2. Ve a **Panel → API** y copia tu **API Key**.
3. Pega la API Key en tu archivo `.env` en la variable `SMS_MASIVOS_API_KEY`.
4. Para WhatsApp: ve a **Panel → WhatsApp → Vincular Instancia** y vincula tu número.

---

## 🚀 Paso 8: Desplegar en Vercel (Producción)

### Opción A: Desde la terminal (rápido)

```bash
npm install -g vercel
vercel login
vercel --prod
```

### Opción B: Desde la web (visual)

1. Entra a [vercel.com](https://vercel.com/) e inicia sesión con GitHub.
2. Haz clic en **"Import Project"**.
3. Selecciona tu repositorio de `loyalty-os`.
4. En **"Environment Variables"**, agrega todas las variables de tu `.env`.
5. Haz clic en **Deploy**.

¡En ~1 minuto tendrás tu sistema en vivo con un dominio `.vercel.app`!

---

## 🌐 Paso 9 (Opcional): Conectar tu Dominio Personalizado

1. En Vercel, ve a **Settings → Domains**.
2. Agrega tu dominio (ej: `www.mi-negocio.com`).
3. Sigue las instrucciones de Vercel para configurar los DNS.

---

## 🧑‍💼 Primeros Pasos Después de Instalar

1. **Crear tu cuenta de administrador:**
   - Al entrar a `/login`, usa el email y contraseña por defecto: `admin@loyaltyos.com` / `admin123`
   - Cámbialos inmediatamente desde la base de datos o `/admin/settings`

2. **Agregar cajeros:** Ve a `/admin/employees` y registra a tus cajeros.

3. **Configurar el % de cashback:** Ve a la Terminal (`/pos`) y ajusta el porcentaje de recompensa para efectivo y tarjeta.

4. **Activar campañas de marketing:** Ve a `/admin/campaigns` y enciende las campañas que desees (Retención, Cumpleaños, VIP, Recomienda y Gana).

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|---|---|
| **Frontend** | Next.js 16 (React 19) + CSS Modules |
| **Backend / API** | Next.js API Routes (Serverless) |
| **Base de Datos** | PostgreSQL (Supabase) |
| **ORM** | Prisma 5 |
| **Hosting** | Vercel (Serverless) |
| **Mensajería** | SMS Masivos API (WhatsApp + SMS) |
| **Gráficas** | Recharts |
| **Exportación** | ExcelJS |
| **QR Codes** | react-qr-code |

---

## ❓ Preguntas Frecuentes

**¿Cuánto cuesta mantener el sistema en producción?**  
- Supabase (Free Tier): $0 USD/mes  
- Vercel (Hobby): $0 USD/mes  
- SMS Masivos: Depende del volumen de mensajes (~$0.15 MXN por SMS)

**¿Puedo usar otra base de datos que no sea Supabase?**  
Sí, cualquier base de datos PostgreSQL funciona. Solo cambia las URLs en `.env`.

**¿Necesito saber programar para usarlo?**  
Para **usarlo** no. Para **modificarlo y personalizarlo** necesitas conocimientos básicos de JavaScript/React.

---

**Desarrollado por [Agencia +Brain](https://agenciamasbrain.com/) · © 2026**
