# TimePipeline

Mi sistema personal de organización de actividades y calendario inteligente.

Lo construí para centralizar en un solo lugar mis cursadas, parciales, entregas, cursos laborales, cursos propios, reuniones de trabajo y actividades personales.

Cada usuario tiene su propio calendario privado. Los datos persisten en PostgreSQL (Supabase).

---

## Stack

| Capa | Tecnología |
|---|---|
| Backend | FastAPI 0.111 + Python 3.11 |
| ORM | SQLAlchemy 2.0 |
| Validación | Pydantic v2 |
| Base de datos | PostgreSQL (Supabase) |
| Auth | JWT con bcrypt |
| Frontend | React 18 + Vite + TypeScript |
| Estilos | Tailwind CSS |
| State server | React Query v5 |
| State UI | Zustand (con persistencia) |
| Forms | React Hook Form + Zod |
| Animaciones | Framer Motion |
| Deploy | Render (backend + frontend) |

---

## Estructura del proyecto

```
timepipeline/
├── .gitignore
├── README.md
├── render.yaml                         # Configuración de deploy en Render
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py               # Settings con pydantic-settings
│   │   │   ├── database.py             # Engine SQLAlchemy
│   │   │   ├── exceptions.py           # Jerarquía de excepciones de dominio
│   │   │   └── security.py             # bcrypt + JWT
│   │   ├── models/
│   │   │   ├── user.py                 # ORM: User
│   │   │   └── activity.py            # ORM: Activity, Category + Enums
│   │   ├── schemas/
│   │   │   ├── auth.py                 # UserRegister, UserLogin, TokenResponse
│   │   │   └── activity.py            # Pydantic v2: validación + serialización
│   │   ├── repositories/
│   │   │   ├── user_repository.py      # Acceso a datos de usuarios
│   │   │   └── activity_repository.py # Acceso a datos de actividades y categorías
│   │   ├── services/
│   │   │   ├── auth_service.py         # Registro, login, categorías por defecto
│   │   │   └── activity_service.py    # Lógica de negocio
│   │   └── api/v1/
│   │       ├── router.py
│   │       └── endpoints/
│   │           ├── auth.py             # POST /register, POST /login, GET /me
│   │           ├── activities.py       # CRUD + calendar + complete
│   │           ├── categories.py       # CRUD categorías
│   │           └── dashboard.py        # Stats + resumen del día
│   ├── init_db.py                      # Crea tablas si no existen (deploy normal)
│   ├── reset_db.py                     # Borra y recrea tablas (solo para migraciones)
│   └── requirements.txt
│
└── frontend/
    └── src/
        ├── types/
        │   ├── index.ts                # Interfaces del dominio
        │   └── auth.ts                 # User, TokenResponse, LoginForm
        ├── api/index.ts                # Axios client con interceptores JWT
        ├── hooks/
        │   ├── index.ts                # React Query hooks (activities, categories, dashboard)
        │   └── auth.ts                 # useLogin, useRegister, useLogout
        ├── store/
        │   ├── uiStore.ts              # Estado UI: modal, sidebar, filtros
        │   └── authStore.ts            # Token + user con persistencia en localStorage
        ├── components/
        │   ├── ui/                     # Badge, Button, Modal, FormFields
        │   ├── layout/                 # Sidebar, MobileNav, MobileHeader, ProtectedRoute
        │   ├── calendar/               # CalendarGrid, DayEventsModal
        │   ├── activities/             # ActivityCard, ActivityForm, ActivityModal
        │   └── dashboard/              # StatCard
        └── pages/
            ├── Login.tsx
            ├── Register.tsx
            ├── Dashboard.tsx
            ├── Calendar.tsx
            ├── Activities.tsx
            └── Settings.tsx
```

---

## Correr localmente

### Requisitos

- Python 3.11+
- Node.js 18+

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
source .venv/bin/activate     # Mac/Linux

pip install -r requirements.txt
python init_db.py             # Crea las tablas en la DB
uvicorn app.main:app --reload --port 8000
```

- API: `http://localhost:8000`
- Docs: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

- App: `http://localhost:5173`

### Variables de entorno locales

Crear `backend/.env`:
```env
DATABASE_URL=sqlite:///./timepipeline.db
JWT_SECRET_KEY=mi-clave-secreta-local
```

Crear `frontend/.env.local`:
```env
VITE_API_URL=http://localhost:8000
```

---

## Acceso desde iPhone (red local)

```bash
# Backend con host abierto
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Obtener IP local
ipconfig getifaddr en0    # Mac
ipconfig                  # Windows → buscar IPv4

# Frontend con host abierto
cd frontend
npm run dev -- --host
```

Abrir `http://MI_IP:5173` en Safari desde el iPhone.

Para agregar a pantalla de inicio: botón compartir → "Agregar a pantalla de inicio".

---

## Deploy en Render + Supabase

### Base de datos (Supabase)

1. Crear cuenta en [supabase.com](https://supabase.com) con GitHub
2. Crear proyecto → Region: South America (São Paulo)
3. Ir a **Connect** → **Direct** → copiar la connection string URI
4. Reemplazar `[YOUR-PASSWORD]` con la contraseña del proyecto

### Render

Los dos servicios se configuran automáticamente con el `render.yaml`.

1. Ir a [render.com](https://render.com) → **New** → **Blueprint**
2. Conectar el repo de GitHub
3. Confirmar el deploy

Variables de entorno que Render necesita en el backend:

| Variable | Valor |
|---|---|
| `DATABASE_URL` | Connection string de Supabase |
| `CORS_ORIGINS_JSON` | `["https://timepipeline-frontend.onrender.com"]` |
| `JWT_SECRET_KEY` | Clave secreta larga y aleatoria |

### URLs de producción

| Servicio | URL |
|---|---|
| Frontend | `https://timepipeline-frontend.onrender.com` |
| API | `https://timepipeline-api.onrender.com` |
| Docs API | `https://timepipeline-api.onrender.com/docs` |

---

## API — Endpoints

```
POST    /api/v1/auth/register               Crear cuenta
POST    /api/v1/auth/login                  Iniciar sesión
GET     /api/v1/auth/me                     Usuario actual

GET     /api/v1/dashboard/                  Stats + actividades del día
GET     /api/v1/activities/                 Lista con filtros y paginación
POST    /api/v1/activities/                 Crear actividad
PATCH   /api/v1/activities/{id}             Editar actividad
DELETE  /api/v1/activities/{id}             Eliminar actividad
POST    /api/v1/activities/{id}/complete    Marcar como completada
GET     /api/v1/activities/calendar         Eventos por rango de fechas

GET     /api/v1/categories/                 Listar categorías del usuario
POST    /api/v1/categories/                 Crear categoría
DELETE  /api/v1/categories/{id}             Eliminar categoría (si está vacía)

GET     /health                             Health check
```

### Filtros disponibles en `GET /activities/`

```
category_id   ID de categoría
priority      high | medium | low
status        pending | in_progress | completed | cancelled
date_from     YYYY-MM-DD
date_to       YYYY-MM-DD
search        texto libre (busca en título y descripción)
is_deadline   true | false
page          número de página (default: 1)
page_size     resultados por página (default: 50, máx: 200)
```

---

## Funcionalidades

- **Registro y login** — JWT, sesión persistente en localStorage, 7 días de validez
- **Multi-usuario** — cada usuario ve solo sus propios datos, aislamiento total
- **Dashboard** — actividades de hoy, próximos 7 días, vencidas, deadlines urgentes, barras por categoría, saludo dinámico por hora del día
- **Calendario mensual** — grilla navegable, click en día con eventos muestra el detalle, click en día vacío abre el formulario
- **Conflicto de horario** — aviso antes de guardar si hay superposición, con opción de guardar igual
- **Lista de actividades** — búsqueda full-text, filtros combinables, paginación server-side
- **CRUD completo** — crear, editar, eliminar, marcar como completada
- **Recurrencia** — diaria, semanal, mensual con fecha de fin opcional
- **Categorías** — 5 preconfiguradas al registrarse + agregar personalizadas con emoji picker y color
- **Validación de categorías** — no permite duplicados (case-insensitive)
- **Prioridades** — Alta / Media / Baja con indicadores visuales
- **Estados** — Pendiente / En progreso / Completado / Cancelado
- **Deadlines** — marcado especial con alerta en el dashboard
- **Mobile-first** — navegación inferior en iOS, modals como bottom sheet, touch targets 44px, safe-area support

---

## Categorías preconfiguradas

Al registrarse, cada usuario recibe automáticamente:

| Categoría | Color | Uso |
|---|---|---|
| 🎓 Facultad | Indigo | Cursadas, parciales, entregas, fechas importantes |
| 💼 Trabajo | Sky | Reuniones, sprints, deadlines laborales |
| 📚 Cursos Personales | Emerald | Cursos propios, certificaciones |
| 🏢 Cursos Laborales | Amber | Capacitaciones obligatorias de la empresa |
| 🌟 Personal | Pink | Turnos médicos, gym, actividades personales |

---

## Persistencia de datos

Los datos se guardan en **PostgreSQL hosteado en Supabase**. A diferencia de SQLite en el servidor, los datos persisten aunque el backend de Render se duerma o se reinicie.

Para migrar el esquema en producción:
```bash
# Solo cuando cambia el modelo de datos
# Editar render.yaml: buildCommand → python reset_db.py
# Hacer push, esperar deploy, volver a init_db.py y pushear de nuevo
```

---

## Roadmap

- [ ] v1.1 — Login con Google OAuth2 y Microsoft OAuth2
- [ ] v1.2 — Push notifications (Web Push API + Service Worker)
- [ ] v1.3 — Integración Google Calendar (OAuth2 + sync)
- [ ] v1.4 — Recordatorios por email (FastAPI BackgroundTasks)
- [ ] v2.0 — Sugerencias inteligentes vía Claude API
- [ ] v2.1 — Analytics de productividad (heatmap de actividad)
- [ ] v2.2 — PWA completa con soporte offline
- [ ] v2.3 — Vista semanal y vista diaria detallada