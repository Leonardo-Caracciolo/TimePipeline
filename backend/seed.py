"""
Run: python seed.py
Seeds the database with realistic example data for TimePipeline.
"""
from datetime import date, time, timedelta
from app.core.database import SessionLocal, init_db
from app.models.activity import Category, Activity, Priority, Status, RecurrenceType

CATEGORIES = [
    {"name": "Facultad", "color": "#6366F1", "icon": "🎓", "is_system": True},
    {"name": "Trabajo", "color": "#0EA5E9", "icon": "💼", "is_system": True},
    {"name": "Cursos Personales", "color": "#10B981", "icon": "📚", "is_system": True},
    {"name": "Cursos Laborales", "color": "#F59E0B", "icon": "🏢", "is_system": True},
    {"name": "Personal", "color": "#EC4899", "icon": "🌟", "is_system": True},
]

today = date.today()

def seed():
    init_db()
    db = SessionLocal()

    # Avoid re-seeding
    if db.query(Category).count() > 0:
        print("Database already seeded. Skipping.")
        db.close()
        return

    cats = {}
    for c in CATEGORIES:
        cat = Category(**c)
        db.add(cat)
        db.flush()
        cats[c["name"]] = cat.id

    activities = [
        # ── Facultad ────────────────────────────────────────────────────────
        Activity(
            title="Parcial 1 - Algoritmos",
            description="Primer parcial de la materia Algoritmos y Estructuras de Datos",
            observations="Estudiar árboles y grafos con énfasis en BFS/DFS",
            category_id=cats["Facultad"],
            event_date=today + timedelta(days=5),
            start_time=time(18, 0),
            end_time=time(21, 0),
            priority=Priority.HIGH,
            status=Status.PENDING,
            recurrence=RecurrenceType.NONE,
            is_deadline=True,
        ),
        Activity(
            title="Entrega TP - Base de Datos",
            description="Entrega del trabajo práctico de diseño de base de datos relacional",
            category_id=cats["Facultad"],
            event_date=today + timedelta(days=3),
            priority=Priority.HIGH,
            status=Status.IN_PROGRESS,
            recurrence=RecurrenceType.NONE,
            is_deadline=True,
        ),
        Activity(
            title="Cursada - Sistemas Operativos",
            description="Clase teórica de Sistemas Operativos",
            category_id=cats["Facultad"],
            event_date=today,
            start_time=time(19, 0),
            end_time=time(22, 0),
            priority=Priority.MEDIUM,
            status=Status.PENDING,
            recurrence=RecurrenceType.WEEKLY,
            recurrence_end_date=today + timedelta(days=90),
        ),
        Activity(
            title="Parcial 2 - Análisis Matemático",
            description="Segundo parcial, integrales y series",
            category_id=cats["Facultad"],
            event_date=today + timedelta(days=14),
            start_time=time(16, 0),
            end_time=time(18, 30),
            priority=Priority.HIGH,
            status=Status.PENDING,
            recurrence=RecurrenceType.NONE,
            is_deadline=True,
        ),
        Activity(
            title="Inscripción materias 2do cuatrimestre",
            description="Recordar inscribirse antes del cierre del sistema",
            category_id=cats["Facultad"],
            event_date=today + timedelta(days=21),
            priority=Priority.HIGH,
            status=Status.PENDING,
            is_deadline=True,
        ),

        # ── Trabajo ──────────────────────────────────────────────────────────
        Activity(
            title="Standup diario",
            description="Daily meeting con el equipo de desarrollo",
            category_id=cats["Trabajo"],
            event_date=today,
            start_time=time(9, 30),
            end_time=time(9, 45),
            priority=Priority.MEDIUM,
            status=Status.PENDING,
            recurrence=RecurrenceType.DAILY,
            recurrence_end_date=today + timedelta(days=180),
        ),
        Activity(
            title="Sprint Review Q3",
            description="Revisión del sprint con stakeholders y presentación de avances",
            category_id=cats["Trabajo"],
            event_date=today + timedelta(days=2),
            start_time=time(15, 0),
            end_time=time(17, 0),
            priority=Priority.HIGH,
            status=Status.PENDING,
        ),
        Activity(
            title="Deadline - Feature autenticación",
            description="Entrega del módulo de autenticación con JWT y refresh tokens",
            category_id=cats["Trabajo"],
            event_date=today + timedelta(days=4),
            priority=Priority.HIGH,
            status=Status.IN_PROGRESS,
            is_deadline=True,
        ),
        Activity(
            title="1:1 con Tech Lead",
            description="Reunión semanal de seguimiento y feedback",
            category_id=cats["Trabajo"],
            event_date=today + timedelta(days=1),
            start_time=time(11, 0),
            end_time=time(11, 30),
            priority=Priority.MEDIUM,
            status=Status.PENDING,
            recurrence=RecurrenceType.WEEKLY,
            recurrence_end_date=today + timedelta(days=180),
        ),

        # ── Cursos Personales ────────────────────────────────────────────────
        Activity(
            title="Rust - Capítulo 5: Ownership",
            description="Completar el capítulo sobre ownership y borrowing en The Rust Book",
            category_id=cats["Cursos Personales"],
            event_date=today,
            start_time=time(21, 0),
            end_time=time(22, 30),
            priority=Priority.MEDIUM,
            status=Status.PENDING,
            recurrence=RecurrenceType.NONE,
        ),
        Activity(
            title="Curso AWS Solutions Architect",
            description="Sesión de estudio: módulo IAM y S3",
            category_id=cats["Cursos Personales"],
            event_date=today + timedelta(days=1),
            start_time=time(20, 0),
            end_time=time(22, 0),
            priority=Priority.MEDIUM,
            status=Status.PENDING,
            recurrence=RecurrenceType.WEEKLY,
            recurrence_end_date=today + timedelta(days=60),
        ),
        Activity(
            title="Examen AWS SAA-C03",
            description="Rendir el examen de certificación AWS Solutions Architect Associate",
            category_id=cats["Cursos Personales"],
            event_date=today + timedelta(days=45),
            priority=Priority.HIGH,
            status=Status.PENDING,
            is_deadline=True,
        ),

        # ── Cursos Laborales ─────────────────────────────────────────────────
        Activity(
            title="Capacitación obligatoria - Seguridad de la información",
            description="Curso anual de seguridad corporativa - obligatorio RRHH",
            category_id=cats["Cursos Laborales"],
            event_date=today + timedelta(days=7),
            start_time=time(10, 0),
            end_time=time(12, 0),
            priority=Priority.HIGH,
            status=Status.PENDING,
            is_deadline=True,
        ),
        Activity(
            title="Workshop - Scrum Avanzado",
            description="Taller interno de metodologías ágiles para el equipo",
            category_id=cats["Cursos Laborales"],
            event_date=today + timedelta(days=10),
            start_time=time(14, 0),
            end_time=time(18, 0),
            priority=Priority.MEDIUM,
            status=Status.PENDING,
        ),

        # ── Personal ─────────────────────────────────────────────────────────
        Activity(
            title="Turno médico - Clínica general",
            description="Control anual",
            category_id=cats["Personal"],
            event_date=today + timedelta(days=6),
            start_time=time(9, 0),
            end_time=time(10, 0),
            priority=Priority.MEDIUM,
            status=Status.PENDING,
        ),
        Activity(
            title="Gym",
            description="Entrenamiento de fuerza - piernas",
            category_id=cats["Personal"],
            event_date=today,
            start_time=time(7, 0),
            end_time=time(8, 30),
            priority=Priority.LOW,
            status=Status.COMPLETED,
            recurrence=RecurrenceType.WEEKLY,
            recurrence_end_date=today + timedelta(days=180),
        ),

        # ── Overdue example ──────────────────────────────────────────────────
        Activity(
            title="Leer paper - Transformers Architecture",
            description="Revisar 'Attention is All You Need' y tomar notas",
            category_id=cats["Cursos Personales"],
            event_date=today - timedelta(days=3),
            priority=Priority.LOW,
            status=Status.PENDING,
        ),
    ]

    for a in activities:
        db.add(a)

    db.commit()
    print(f"✅ Seeded {len(CATEGORIES)} categories and {len(activities)} activities.")
    db.close()


if __name__ == "__main__":
    seed()
