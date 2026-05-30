# 🏍️ FosiMotoShop MX

Tienda online de equipamiento de motocross desarrollada como Trabajo Práctico Final para la materia de **Desarrollo Frontend**. Permite explorar y comprar cascos, escapes, indumentaria, botas, protecciones y accesorios para motocross.

---

## 📌 Descripción del proyecto

FosiMotoShop MX es una e-commerce full-stack con las siguientes funcionalidades:

- **Catálogo de productos** con filtros por categoría, precio, talle y marca
- **Carrito de compras** persistente con soporte de variantes (talle / color)
- **Checkout en 2 pasos**: revisión del carrito → datos de envío + cupón de descuento
- **Sistema de autenticación** con JWT (registro, login, perfil)
- **Panel de administración** para gestión de productos, órdenes y cupones
- **Historial de órdenes** por usuario

---

## 🏗️ Arquitectura del sistema

El proyecto está dividido en dos aplicaciones independientes que se comunican a través de una **API REST con autenticación JWT**.

```
┌─────────────────────────────────────────────────────────────┐
│                        USUARIO                              │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTP (HTTPS en producción)
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                FRONTEND  (React + Vite)                     │
│           Desplegado en Vercel (SPA)                        │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Páginas     │  │  Componentes │  │  Contextos       │  │
│  │  Home        │  │  Navbar      │  │  AuthContext     │  │
│  │  Products    │  │  ProductCard │  │  CartContext     │  │
│  │  ProductDet. │  │  Cart        │  │                  │  │
│  │  Login/Reg.  │  │  WhatsApp    │  │                  │  │
│  │  AdminPanel  │  │              │  │                  │  │
│  │  UserOrders  │  │              │  │                  │  │
│  └──────┬───────┘  └──────────────┘  └──────────────────┘  │
│         │                                                   │
│  ┌──────▼──────────────────────────────────────────────┐   │
│  │          src/api/index.js                           │   │
│  │   Módulo centralizado de llamadas HTTP (fetch)      │   │
│  │   Authorization: Bearer <JWT>                       │   │
│  └──────────────────────┬──────────────────────────────┘   │
└─────────────────────────┼───────────────────────────────────┘
                          │ REST API  (/api/...)
                          │ VITE_API_URL
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND  (Node.js + Express)                   │
│           Desplegado en Vercel (Serverless)                 │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │   src/index.js  — Entry point Express                │  │
│  │   CORS · Helmet · Compression · Rate Limiting        │  │
│  └──────────┬───────────────────────────────────────────┘  │
│             │                                               │
│  ┌──────────▼──────────────────────────────────────────┐   │
│  │  Routes                                             │   │
│  │  /api/auth      → auth.js                          │   │
│  │  /api/products  → products.js                      │   │
│  │  /api/orders    → orders.js                        │   │
│  │  /api/coupons   → coupons.js                       │   │
│  └──────────┬───────────────────────────────────────────┘  │
│             │                                               │
│  ┌──────────▼──────────────────────────────────────────┐   │
│  │  Middleware                                         │   │
│  │  verifyToken  →  decodifica JWT                    │   │
│  │  isAdmin      →  verifica rol ADMIN                │   │
│  └──────────┬───────────────────────────────────────────┘  │
│             │  Prisma ORM                                   │
│  ┌──────────▼──────────────────────────────────────────┐   │
│  │  Base de datos PostgreSQL (Supabase)                │   │
│  │  Modelos: User · Product · Order · OrderItem        │   │
│  │           Coupon                                    │   │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Flujo de autenticación

```
1. Usuario hace login/register  →  POST /api/auth/login
2. Backend genera JWT (7 días)  →  { token, user }
3. Frontend guarda token en localStorage
4. Cada request protegido envía  →  Authorization: Bearer <token>
5. Backend verifica y extrae req.user  →  acceso concedido o 401
```

### Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite, React Router v6, CSS vanilla |
| Backend | Node.js, Express 4, Prisma ORM |
| Base de datos | PostgreSQL (Supabase) |
| Autenticación | JWT (`jsonwebtoken`) + bcrypt |
| Deploy Frontend | Vercel (SPA con rewrites) |
| Deploy Backend | Vercel (Serverless Node) |

---

## 🗺️ Rutas URL de la API

**Base URL (producción):** `https://fosimotoshop-backend.vercel.app`  
**Base URL (local):** `http://localhost:4000`

> 🔒 = Requiere token JWT &nbsp;&nbsp; 👑 = Solo ADMIN

---

### Auth — `/api/auth`

| Método | URL | Descripción | Auth |
|--------|-----|-------------|------|
| `POST` | `/api/auth/register` | Registrar nuevo usuario | — |
| `POST` | `/api/auth/login` | Iniciar sesión y obtener JWT | — |
| `GET` | `/api/auth/me` | Obtener perfil del usuario autenticado | 🔒 |

---

### Productos — `/api/products`

| Método | URL | Descripción | Auth |
|--------|-----|-------------|------|
| `GET` | `/api/products` | Listar productos activos (con filtros por query) | — |
| `GET` | `/api/products/brands` | Listar marcas únicas disponibles | — |
| `GET` | `/api/products/:id` | Obtener producto por ID | — |
| `POST` | `/api/products` | Crear producto | 🔒 👑 |
| `PUT` | `/api/products/:id` | Actualizar producto (parcial) | 🔒 👑 |
| `DELETE` | `/api/products/:id` | Desactivar producto (soft delete) | 🔒 👑 |

**Query params disponibles en `GET /api/products`:**

| Parámetro | Ejemplo | Descripción |
|-----------|---------|-------------|
| `category` | `cascos` | Filtrar por categoría |
| `search` | `fox` | Búsqueda por nombre |
| `brand` | `Alpinestars` | Filtrar por marca |
| `minPrice` | `100` | Precio mínimo |
| `maxPrice` | `500` | Precio máximo |
| `size` | `L` | Filtrar por talle |
| `sort` | `price_asc` | Ordenar: `newest`, `price_asc`, `price_desc` |

---

### Órdenes — `/api/orders`

| Método | URL | Descripción | Auth |
|--------|-----|-------------|------|
| `POST` | `/api/orders` | Crear nueva orden (checkout) | 🔒 |
| `GET` | `/api/orders/my` | Listar órdenes del usuario autenticado | 🔒 |
| `GET` | `/api/orders` | Listar todas las órdenes del sistema | 🔒 👑 |
| `PUT` | `/api/orders/:id` | Actualizar estado de una orden | 🔒 👑 |

**Estados válidos de orden:** `pendiente` → `confirmado` → `enviado` → `entregado` → `cancelado`

---

### Cupones — `/api/coupons`

| Método | URL | Descripción | Auth |
|--------|-----|-------------|------|
| `POST` | `/api/coupons/validate` | Validar cupón antes del checkout | 🔒 |
| `GET` | `/api/coupons` | Listar todos los cupones | 🔒 👑 |
| `POST` | `/api/coupons` | Crear cupón | 🔒 👑 |
| `PUT` | `/api/coupons/:id` | Activar / desactivar cupón | 🔒 👑 |
| `DELETE` | `/api/coupons/:id` | Eliminar cupón permanentemente | 🔒 👑 |

---

## 📁 Estructura del proyecto

```
Pagina-webMX/
├── frontend/                  ← React + Vite
│   ├── src/
│   │   ├── api/index.js       ← Módulo centralizado de llamadas HTTP
│   │   ├── components/        ← Navbar, Cart, ProductCard, WhatsAppButton
│   │   ├── context/           ← AuthContext, CartContext
│   │   ├── data/products.js   ← Catálogo local (referencia/seed)
│   │   ├── pages/             ← Home, Products, ProductDetail, Login,
│   │   │                         Register, AdminPanel, UserOrders
│   │   ├── index.css          ← Estilos globales y sistema de diseño
│   │   └── App.jsx            ← Rutas y providers
│   ├── .env                   ← VITE_API_URL
│   └── vercel.json            ← SPA rewrites
│
└── backend/                   ← Node.js + Express + Prisma
    ├── src/
    │   ├── index.js           ← Entry point, middlewares globales
    │   ├── middleware/auth.js  ← verifyToken, isAdmin
    │   └── routes/            ← auth.js, products.js, orders.js, coupons.js
    ├── prisma/
    │   ├── schema.prisma      ← Modelos de datos
    │   └── seed.js            ← Datos iniciales (37 productos + 2 usuarios)
    ├── .env                   ← DATABASE_URL, JWT_SECRET, FRONTEND_URL
    └── vercel.json            ← Serverless Node config
```

---

## ⚡ Cómo correr el proyecto localmente

### Backend

```bash
cd backend
npm install
npx prisma db push    # Aplica el schema a la base de datos
node prisma/seed.js   # Carga los productos y usuarios de prueba
npm run dev           # Corre en http://localhost:4000
```

### Frontend

```bash
cd frontend
npm install
npm run dev           # Corre en http://localhost:5173
```

> Asegurate de que `frontend/.env` tenga `VITE_API_URL=http://localhost:4000`

---

## 👤 Usuarios de prueba

| Email | Contraseña | Rol |
|-------|-----------|-----|
| admin@motoshop.com | admin123 | ADMIN |
| cliente@motoshop.com | cliente123 | CLIENTE |
