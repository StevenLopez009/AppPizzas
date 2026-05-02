# AppPizzas — Documentación de Arquitectura

## Stack Tecnológico

| Tecnología | Versión | Propósito |
|---|---|---|
| Next.js | 16.1.6 | Framework React con App Router |
| React | 19.2.3 | Biblioteca UI |
| TypeScript | 5.x | Tipado estático |
| **MySQL** | **8.0** | Base de datos relacional |
| **mysql2** | **3.x** | Driver Node.js |
| **bcryptjs** | **3.x** | Hash de contraseñas |
| **jose** | **5.x** | JWT firmados (sesión cookie) |
| **ws** | **8.x** | Servidor WebSocket dedicado |
| **Cloudinary** | (externo) | Storage de imágenes (opcional) |
| **Docker Compose** | — | Orquestación local |
| Tailwind CSS | 4.x | Estilos |
| Shadcn/UI | 4.x | Componentes UI |
| React Hot Toast | 2.x | Notificaciones (todas) |
| React PDF | 4.x | Facturas y comandas |
| Swiper | 12.x | Carrusel de banners |
| Recharts | 3.x | Gráficos del reporte |
| **Vitest** | **4.x** | Testing |
| **Testing Library** | **16.x** | Tests de componentes React |

> Migrado desde Supabase. Ya no se usa `@supabase/*`.

---

## Inicio rápido (desarrollo)

**Recomendado**: infra en Docker + Next.js local (hot reload + dev seed):

```bash
# 1. Configurar variables
cp .env.example .env

# 2. Levantar solo MySQL + WebSocket
docker compose up -d mysql realtime

# 3. Esperar que MySQL esté healthy (~15s primer arranque)
docker inspect -f '{{.State.Health.Status}}' apppizzas-mysql-1

# 4. Next.js local
npm install
npm run dev

# 5. Sembrar datos demo (desde el navegador o curl)
curl -X POST http://localhost:3000/api/dev/seed
```

**Credenciales admin** (sembradas por `db/init/02_seed_admin.sql`):

| Email | Password |
|---|---|
| `lacarretapizzas@gmail.com` | `admin1234` |

URLs:

- http://localhost:3000/dashboard — Menú cliente
- http://localhost:3000/login — Login
- http://localhost:3000/dashboardAdmin/orders — Panel pedidos (admin)

---

## Todo en Docker (producción/staging)

```bash
cp .env.example .env       # ajusta credenciales y SESSION_SECRET
docker compose up --build  # primer arranque
docker compose up -d       # subsiguientes
```

Servicios:

| Servicio | Puerto host | Imagen / origen |
|---|---|---|
| `app` | 3000 | Build local (Dockerfile multi-stage, output standalone) |
| `mysql` | 3306 | `mysql:8.0` con scripts `db/init` montados |
| `realtime` | 3001 | Build local de `realtime-server/` (Node + `ws`) |

Volumen persistente: `mysql_data`. Reset completo:

```bash
docker compose down -v && docker compose up -d
```

---

## Estructura del proyecto

```
AppPizzas/
├── db/
│   └── init/
│       ├── 01_schema.sql          # tablas MySQL
│       └── 02_seed_admin.sql      # usuario admin con bcrypt hash
│
├── realtime-server/
│   ├── server.js                  # WS + endpoint /notify interno
│   ├── package.json
│   └── Dockerfile
│
├── public/
│   └── uploads/                   # fallback local de imágenes
│       └── .gitkeep
│
├── tests/
│   ├── setup.ts                   # Vitest + Testing Library setup
│   ├── helpers/api.ts             # stubFetch para mocks
│   └── views/                     # 11 archivos, 31 tests
│       ├── OrderTrackingTime.test.tsx
│       ├── OrderPageView.test.tsx
│       ├── DevSeedControl.test.tsx
│       ├── BannerCarousel.test.tsx
│       ├── AdminBanner.test.tsx
│       ├── AdditionalsForm.test.tsx
│       ├── CreateProductForm.test.tsx
│       ├── SignInForm.test.tsx
│       ├── SignUpForm.test.tsx
│       ├── LoginPage.test.tsx
│       └── useCheckout.test.tsx
│
├── Dockerfile                     # Next.js standalone
├── docker-compose.yml
├── vitest.config.ts
├── .env.example
│
├── src/app/
│   ├── api/
│   │   ├── auth/{login,signup,logout,me}/route.ts
│   │   ├── products/{route.ts, [id]/route.ts}
│   │   ├── orders/{route.ts, [id]/route.ts, [id]/items/route.ts}
│   │   ├── banners/{route.ts, [id]/route.ts}
│   │   ├── additionals/{route.ts, [id]/route.ts}
│   │   ├── clients/route.ts
│   │   ├── upload/route.ts        # fallback local de imágenes
│   │   └── dev/seed/route.ts
│   ├── dashboard/...              # cliente
│   ├── dashboardAdmin/...         # admin
│   ├── login/page.tsx
│   ├── pedido/...
│   └── pizza/...
│
├── src/features/                  # módulos por dominio (UI + servicios cliente)
│
├── lib/
│   ├── db.ts                      # pool mysql2/promise
│   ├── uuid.ts
│   ├── api.ts                     # fetch helper + ApiError
│   ├── auth/
│   │   ├── password.ts            # bcryptjs
│   │   ├── session.ts             # JWT (jose)
│   │   └── cookies.ts             # set/get/clear/requireAdmin
│   ├── realtime/
│   │   ├── notify.ts              # POST → realtime/notify (server)
│   │   └── client.ts              # useOrdersStream (cliente WS)
│   ├── storage/
│   │   └── cloudinary.ts          # Cloudinary o fallback /api/upload
│   ├── repos/                     # acceso a datos (solo servidor)
│   │   ├── products.ts
│   │   ├── orders.ts
│   │   ├── banners.ts
│   │   ├── additionals.ts
│   │   ├── users.ts
│   │   └── clients.ts
│   └── dev/seedDevData.ts         # seed para modo dev
│
├── components/                    # componentes compartidos (shadcn, etc.)
├── context/
│   ├── CartContext.tsx
│   └── UserContext.tsx            # /api/auth/me
└── proxy.ts                       # middleware Next.js (verifica JWT)
```

---

## Variables de entorno

Ver `.env.example`. Mínimo en local:

```env
NODE_ENV=development
NEXT_PUBLIC_ADMIN_EMAIL=lacarretapizzas@gmail.com

DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=app
DATABASE_PASSWORD=app_password
DATABASE_NAME=apppizzas

SESSION_SECRET=dev-only-session-secret-please-change-in-production-32chars

NEXT_PUBLIC_REALTIME_WS_URL=ws://localhost:3001
REALTIME_INTERNAL_URL=http://localhost:3001
REALTIME_INTERNAL_TOKEN=dev-internal-token

# Opcionales - si vacíos, upload de imágenes usa fallback local
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=
```

En `docker-compose.yml` los hosts internos cambian a `mysql` y `realtime` y se inyectan automáticamente.

---

## Tablas (MySQL)

Definidas en `db/init/01_schema.sql`.

| Tabla | Notas |
|---|---|
| `users` | Auth: `email`, `password_hash` (bcrypt), `role` (`user`/`admin`). |
| `clients` | Registro público (sin password). |
| `products` | `prices` JSON `[{label, price}]`. |
| `orders` | Estados, totales, ubicación, descuento. |
| `order_items` | FK a `orders` (CASCADE). `additionals` JSON. |
| `banners` | URL de imagen. |
| `additionals` | Por categoría (`pizza`, `lasagna`, `Com. Rapidas`). |

---

## Auth

- `POST /api/auth/signup` → crea usuario + setea cookie sesión.
- `POST /api/auth/login` → verifica bcrypt + setea cookie sesión.
- `POST /api/auth/logout` → limpia cookie.
- `GET  /api/auth/me` → usuario actual o `null`.

La sesión es un **JWT firmado HS256** (paquete `jose`) en cookie `session` (`httpOnly`, `sameSite=lax`, `secure` en prod). El middleware `proxy.ts` lo verifica para proteger `/dashboard*` y `/dashboardAdmin*`.

El usuario admin se crea automáticamente al inicializar MySQL (`db/init/02_seed_admin.sql`) con password `admin1234` (hash bcrypt precomputado).

---

## Realtime (WebSocket)

Servidor independiente en `realtime-server/server.js`:

- `ws://host:3001/orders` — todos los pedidos (admin).
- `ws://host:3001/orders/:id` — un pedido (tracking cliente).
- `POST /notify` con header `X-Internal-Token` — uso interno.

Las API routes que crean/actualizan/borran pedidos llaman `notifyRealtime(...)` (`lib/realtime/notify.ts`). El servidor WS reenvía a los clientes suscritos.

En el navegador, el hook `useOrdersStream(orderId | null, handler)` (`lib/realtime/client.ts`) reconecta automáticamente.

---

## Storage de imágenes

`lib/storage/cloudinary.ts` exporta `uploadImageToCloudinary(file)` con **doble estrategia**:

1. **Cloudinary** (recomendado en prod): si `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` y `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` están definidos → upload directo a Cloudinary.

2. **Fallback local**: si no están definidos → `POST /api/upload` que guarda en `public/uploads/` y devuelve URL relativa.

```ts
import { uploadImageToCloudinary } from "@/lib/storage/cloudinary";
const url = await uploadImageToCloudinary(file); // transparente
```

El endpoint `/api/upload` requiere sesión admin, valida MIME (png/jpeg/webp/gif) y tamaño (≤5MB).

> En producción multi-instancia **usa Cloudinary** (o S3/R2) porque el filesystem no se comparte entre réplicas.

---

## Notificaciones (react-hot-toast)

**Todas las notificaciones al usuario** usan `react-hot-toast`:

```ts
import toast from "react-hot-toast";

toast.success("Producto creado");
toast.error("Error al guardar");
toast("No tienes pedidos activos", { icon: "📭" });
```

El `<Toaster />` está montado en `src/app/layout.tsx`. No se usa `alert()` en ningún lugar del código.

---

## Testing

Suite con **Vitest + Testing Library + jsdom**:

```bash
npm test           # run once
npm run test:watch # watch mode
npm run test:ui    # UI de Vitest
```

Resultado: **11 archivos · 31 tests**.

Tests cubren:
- Componentes: `OrderTrackingTime`, `OrderPageView`, `DevSeedControl`, `BannerCarousel`
- Formularios: `SignInForm`, `SignUpForm`, `AdditionalsForm`, `CreateProductForm`
- Vistas: `LoginPage`, `AdminBanner`
- Hooks: `useCheckout`

Para mockear toasts en tests:

```ts
const { toastSuccess, toastError } = vi.hoisted(() => ({
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock("react-hot-toast", () => ({
  __esModule: true,
  default: Object.assign(vi.fn(), { success: toastSuccess, error: toastError }),
  Toaster: () => null,
}));
```

---

## Modo desarrollo: seed

En `/dashboard` aparece un panel ámbar **"Solo dev"** con botón **"Sembrar productos y pedidos de prueba"**.

Llama `POST /api/dev/seed` (devuelve **403** fuera de `NODE_ENV=development`). Crea:

- **6 productos** con imágenes de [Lorem Picsum](https://picsum.photos/):
  - Pizza Margarita, Pizza Pepperoni (Pizza Sal)
  - Gaseosa 400ml (Bebidas)
  - Hamburguesa clásica (Com. Rapidas)
  - Lasaña bolognesa (Lasaña Spaguetti)
  - Panzerotti jamón y queso (Panzerotti)

- **10 pedidos** cubriendo todos los estados:
  - 4× domicilio: `recibido → cocinando → enviado → entregado`
  - 3× mesa: `recibido → cocinando → entregado`
  - 3× recoger: `recibido → cocinando → listo_para_recoger`

Para resembrar: vuelve a hacer click (purga lo previo y reinserta) o:

```bash
docker compose down -v && docker compose up -d mysql realtime
npm run dev
curl -X POST http://localhost:3000/api/dev/seed
```

---

## Rutas API

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/auth/me` | Sesión actual |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/signup` | Registro |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/products` | Listar productos |
| POST | `/api/products` | Crear (admin) |
| GET/PUT/DELETE | `/api/products/[id]` | Detalle / actualizar / borrar (admin) |
| GET | `/api/orders` | Listar pedidos |
| POST | `/api/orders` | Crear pedido + items |
| GET/PATCH/DELETE | `/api/orders/[id]` | Detalle / cambio de estado / borrar |
| POST | `/api/orders/[id]/items` | Item extra (recalcula total) |
| GET | `/api/banners` | Listar |
| POST | `/api/banners` | Crear (admin) |
| DELETE | `/api/banners/[id]` | Borrar (admin) |
| GET | `/api/additionals` | Listar (`?category=&active=1`) |
| POST | `/api/additionals` | Crear (admin) |
| PUT/DELETE | `/api/additionals/[id]` | Editar / borrar (admin) |
| POST | `/api/clients` | Registro público de cliente |
| POST | `/api/upload` | Subir imagen (admin, fallback local) |
| POST | `/api/dev/seed` | Solo dev: sembrar datos demo |

---

## Comandos

```bash
# Desarrollo (recomendado)
docker compose up -d mysql realtime   # infra
npm run dev                           # Next.js con hot reload

# Testing
npm test                              # Vitest run
npm run test:watch                    # Vitest watch
npm run test:ui                       # Vitest UI

# TypeScript / Lint
npx tsc --noEmit
npm run lint

# Docker completo
npm run docker:build
npm run docker:up:detach
npm run docker:down
npm run docker:reset                  # purga volumen MySQL
```

---

## Diagrama de conexiones

```
┌──────────────────────────────────────────────────────────┐
│                 Navegador (Next.js client)               │
│  · UserContext / CartContext                             │
│  · api.* (/api/...)                                      │
│  · useOrdersStream (WS → realtime:3001)                  │
│  · uploadImageToCloudinary (Cloudinary o /api/upload)    │
└──────────────┬─────────────────────────┬─────────────────┘
               │ HTTP /api/*             │ WS
               ▼                         ▼
        ┌───────────────┐         ┌──────────────┐
        │  Next.js app  │◀────────│ realtime WS  │
        │  (localhost   │         │   :3001      │
        │   o Docker)   │         │ (Docker)     │
        │  · API routes │         └──────────────┘
        │  · proxy.ts   │
        └───────┬───────┘
                │ mysql2/promise (pool)
                ▼
         ┌──────────────┐
         │  MySQL 8.0   │
         │  (Docker)    │
         └──────────────┘

         ┌──────────────┐
         │  Cloudinary  │ ← opcional, fallback a /api/upload
         │   (HTTPS)    │
         └──────────────┘
```
