# TimePipeline

Sistema personal de organización de actividades y calendario inteligente.

Centraliza en un solo lugar tus cursadas, parciales, entregas, cursos, trabajo y actividades personales, con una interfaz moderna pensada para usarse desde el iPhone.

---

## Stack

| Capa | Tecnología |
|---|---|
| Backend | FastAPI 0.111 + Python 3.11 |
| ORM | SQLAlchemy 2.0 |
| Validación | Pydantic v2 |
| Base de datos | SQLite (WAL mode) |
| Frontend | React 18 + Vite + TypeScript |
| Estilos | Tailwind CSS |
| State server | React Query v5 |
| State UI | Zustand |
| Forms | React Hook Form + Zod |
| Animaciones | Framer Motion |

---

## Estructura del proyecto

```
timepipeline/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py          # Settings con pydantic-settings
│   │   │   ├── database.py        # Engine SQLAlchemy + WAL pragma
│   │   │   └── exceptions.py      # Jerarquía de excepciones de dominio
│   │   ├── models/
│   │   │   └── activity.py        # ORM: Activity, Category + Enums
│   │   ├── schemas/
│   │   │   └── activity.py        # Pydantic v2: validación + serialización
│   │   ├── repositories/
│   │   │   └── activity_repository.py  # Data access layer
│   │   ├── services/
│   │   │   └── activity_service.py     # Business logic layer
│   │   └── api/v1/
│   │       ├── router.py
│   │       └── endpoints/
│   │           ├── activities.py
│   │           ├── categories.py
│   │           └── dashboard.py
│   ├── seed.py                    # Datos de ejemplo
│   └── requirements.txt
│
└── frontend/
    └── src/
        ├── types/         # TypeScript interfaces del dominio
        ├── api/           # Axios client tipado
        ├── hooks/         # React Query hooks
        ├── store/         # Zustand UI store
        ├── components/
        │   ├── ui/        # Badge, Button, Modal, FormFields
        │   ├── layout/    # Sidebar, MobileNav, MobileHeader
        │   ├── calendar/  # CalendarGrid
        │   ├── activities/ # ActivityCard, ActivityForm, ActivityModal
        │   └── dashboard/ # StatCard
        └── pages/
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
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

pip install -r requirements.txt
python seed.py                  # Inicializa la DB con datos de ejemplo
uvicorn app.main:app --reload --port 8000
```

API disponible en `http://localhost:8000`
Documentación interactiva en `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App disponible en `http://localhost:5173`

---

## Acceso desde iPhone (red local)

```bash
# Backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Encontrar la IP local de tu compu
ipconfig getifaddr en0          # Mac
ipconfig                        # Windows → buscar IPv4

# Crear frontend/.env.local
echo "VITE_API_URL=http://TU_IP:8000" > frontend/.env.local

# Frontend
cd frontend
npm run dev -- --host
```

Abrí `http://TU_IP:5173` en Safari desde el iPhone.

Para agregar a pantalla de inicio: botón compartir → "Agregar a pantalla de inicio".

---

## Deploy en Render (producción)

### 1. Subir a GitHub

```bash
git init
git add .
git commit -m "feat: initial commit"
git remote add origin https://github.com/TU_USUARIO/timepipeline.git
git push -u origin main
```

### 2. Backend — Web Service

| Campo | Valor |
|---|---|
| Root Directory | `backend` |
| Runtime | Python 3 |
| Build Command | `pip install -r requirements.txt && python seed.py` |
| Start Command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |

### 3. Frontend — Static Site

| Campo | Valor |
|---|---|
| Root Directory | `frontend` |
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |
| Env var | `VITE_API_URL=https://timepipeline-api.onrender.com` |

---

## API — Endpoints principales

```
GET     /api/v1/dashboard/                  Stats + actividades del día
GET     /api/v1/activities/                 Lista con filtros y paginación
POST    /api/v1/activities/                 Crear actividad
PATCH   /api/v1/activities/{id}             Editar actividad
DELETE  /api/v1/activities/{id}             Eliminar actividad
POST    /api/v1/activities/{id}/complete    Marcar como completada
GET     /api/v1/activities/calendar         Eventos por rango de fechas
GET     /api/v1/categories/                 Listar categorías
POST    /api/v1/categories/                 Crear categoría
```

Parámetros de filtro disponibles en `GET /activities/`:

```
category_id, priority, status, date_from, date_to, search, is_deadline, page, page_size
```

---

## Funcionalidades

- **Dashboard** — actividades de hoy, próximos 7 días, vencidas, deadlines urgentes, resumen por categoría
- **Calendario mensual** — grilla navegable, click en día para crear, click en evento para editar
- **Lista de actividades** — búsqueda full-text, filtros por categoría / prioridad / estado / fecha, paginación
- **CRUD completo** — crear, editar, eliminar, marcar como completada
- **Recurrencia** — diaria, semanal, mensual con fecha de fin opcional
- **Categorías** — 5 del sistema + posibilidad de agregar personalizadas con color e ícono
- **Prioridades** — Alta / Media / Baja con indicadores visuales
- **Estados** — Pendiente / En progreso / Completado / Cancelado
- **Deadlines** — marcado especial con alerta en dashboard
- **Mobile-first** — navegación inferior en iOS, bottom sheet modals, touch targets de 44px, safe area support

---

## Categorías por defecto

| Categoría | Color | Uso |
|---|---|---|
| 🎓 Facultad | Indigo | Cursadas, parciales, entregas, fechas importantes |
| 💼 Trabajo | Sky | Reuniones, sprints, deadlines laborales |
| 📚 Cursos Personales | Emerald | Cursos propios, certificaciones |
| 🏢 Cursos Laborales | Amber | Capacitaciones obligatorias de la empresa |
| 🌟 Personal | Pink | Turnos médicos, gym, actividades personales |

---

## Variables de entorno

### Backend (`backend/.env`)

```env
DEBUG=true
DATABASE_URL=sqlite:///./timepipeline.db
```

### Frontend (`frontend/.env.local`)

```env
VITE_API_URL=http://localhost:8000
```

---

## Roadmap personal

- [ ] v1.1 — Push notifications (Web Push API + Service Worker)
- [ ] v1.2 — Integración Google Calendar (OAuth2)
- [ ] v1.3 — Recordatorios por email (FastAPI BackgroundTasks)
- [ ] v2.0 — Sugerencias inteligentes vía Claude API
- [ ] v2.1 — Analytics de productividad (heatmap de actividad)
- [ ] v2.2 — PWA completa con offline support
- [ ] v2.3 — Multi-usuario con JWT Auth
- [ ] v3.0 — Migración a PostgreSQL (un cambio en DATABASE_URL)