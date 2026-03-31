# TimePipeline

Mi sistema personal de organización de actividades y calendario inteligente.

Lo construí para centralizar en un solo lugar mis cursadas, parciales, entregas, cursos, trabajo y actividades personales, con una interfaz moderna pensada para usarse desde el iPhone.

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
├── .gitignore
├── README.md
├── render.yaml                    # Configuración de deploy en Render
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
│   │   │   └── activity_repository.py  # Capa de acceso a datos
│   │   ├── services/
│   │   │   └── activity_service.py     # Lógica de negocio
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
        ├── types/         # Interfaces TypeScript del dominio
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

- API: `http://localhost:8000`
- Docs interactivos: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

- App: `http://localhost:5173`

---

## Acceso desde iPhone (red local)

```bash
# Backend con host abierto
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Obtener IP local de mi compu
ipconfig getifaddr en0          # Mac
ipconfig                        # Windows → buscar IPv4

# Crear frontend/.env.local
echo "VITE_API_URL=http://MI_IP:8000" > frontend/.env.local

# Frontend con host abierto
cd frontend
npm run dev -- --host
```

Abrir `http://MI_IP:5173` en Safari desde el iPhone.

Para agregar a pantalla de inicio: botón compartir → "Agregar a pantalla de inicio".

---

## Deploy en Render

### 1. Hacer push a GitHub

```bash
git add .
git commit -m "chore: production config"
git push
```

### 2. Crear cuenta en Render

Ir a [render.com](https://render.com) y registrarse con GitHub.

### 3. Deployar con render.yaml

Render detecta automáticamente el `render.yaml` en la raíz y configura los dos servicios solo.

1. Dashboard de Render → **New** → **Blueprint**
2. Conectar el repo de GitHub
3. Confirmar y deployar

Render crea automáticamente:
- `timepipeline-api` → Web Service (FastAPI)
- `timepipeline-frontend` → Static Site (React)

### 4. URLs finales

| Servicio | URL |
|---|---|
| Frontend | `https://timepipeline-frontend.onrender.com` |
| API | `https://timepipeline-api.onrender.com` |
| Docs API | `https://timepipeline-api.onrender.com/docs` |

> **Nota:** En el free tier de Render, el backend se duerme después de 15 minutos de inactividad. La primera request tarda ~30 segundos en despertar. Para uso personal está bien.

---

## Variables de entorno

### Backend

| Variable | Descripción | Default |
|---|---|---|
| `DATABASE_URL` | URL de conexión a la DB | SQLite local |
| `CORS_ORIGINS_JSON` | Orígenes CORS permitidos (JSON array) | localhost |

### Frontend

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL base del backend |

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

- **Dashboard** — actividades de hoy, próximos 7 días, vencidas, deadlines urgentes, barras por categoría
- **Calendario mensual** — grilla navegable, click en día para crear, click en evento para editar
- **Lista de actividades** — búsqueda full-text, filtros combinables, paginación server-side
- **CRUD completo** — crear, editar, eliminar, marcar como completada
- **Recurrencia** — diaria, semanal, mensual con fecha de fin opcional
- **Categorías** — 5 del sistema + puedo agregar las mías con color e ícono
- **Prioridades** — Alta / Media / Baja con indicadores visuales por color
- **Estados** — Pendiente / En progreso / Completado / Cancelado
- **Deadlines** — marcado especial con alerta en el dashboard
- **Mobile-first** — navegación inferior en iOS, modals como bottom sheet, touch targets 44px, safe-area support

---

## Categorías por defecto

| Categoría | Color | Para qué la uso |
|---|---|---|
| 🎓 Facultad | Indigo | Cursadas, parciales, entregas, fechas importantes |
| 💼 Trabajo | Sky | Reuniones, sprints, deadlines laborales |
| 📚 Cursos Personales | Emerald | Cursos propios, certificaciones |
| 🏢 Cursos Laborales | Amber | Capacitaciones obligatorias de la empresa |
| 🌟 Personal | Pink | Turnos médicos, gym, actividades personales |

---

## Roadmap

- [ ] v1.1 — Push notifications (Web Push API + Service Worker)
- [ ] v1.2 — Integración Google Calendar (OAuth2)
- [ ] v1.3 — Recordatorios por email (FastAPI BackgroundTasks)
- [ ] v2.0 — Sugerencias inteligentes vía Claude API
- [ ] v2.1 — Analytics de productividad (heatmap de actividad)
- [ ] v2.2 — PWA completa con soporte offline
- [ ] v2.3 — Multi-usuario con JWT Auth
- [ ] v3.0 — Migración a PostgreSQL (un cambio en `DATABASE_URL`)
