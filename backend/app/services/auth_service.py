from sqlalchemy.orm import Session
from app.models.user import User
from app.models.activity import Category
from app.repositories.user_repository import UserRepository
from app.core.security import hash_password, verify_password, create_access_token
from app.core.exceptions import bad_request, conflict
from app.schemas.auth import UserRegister, UserLogin, TokenResponse, UserRead

# Default categories created for every new user
SYSTEM_CATEGORIES = [
    {"name": "Facultad",          "color": "#6366F1", "icon": "🎓"},
    {"name": "Trabajo",           "color": "#0EA5E9", "icon": "💼"},
    {"name": "Cursos Personales", "color": "#10B981", "icon": "📚"},
    {"name": "Cursos Laborales",  "color": "#F59E0B", "icon": "🏢"},
    {"name": "Personal",          "color": "#EC4899", "icon": "🌟"},
]


class AuthService:
    def __init__(self, db: Session):
        self.repo = UserRepository(db)
        self.db = db

    def _create_default_categories(self, user_id: int) -> None:
        for cat in SYSTEM_CATEGORIES:
            category = Category(
                user_id=user_id,
                name=cat["name"],
                color=cat["color"],
                icon=cat["icon"],
                is_system=True,
            )
            self.db.add(category)
        self.db.commit()

    def register(self, payload: UserRegister) -> TokenResponse:
        existing = self.repo.get_by_email(payload.email)
        if existing:
            raise conflict("Ya existe una cuenta con ese email.")

        user = self.repo.create(
            name=payload.name,
            email=payload.email,
            hashed_password=hash_password(payload.password),
        )
        self._create_default_categories(user.id)

        token = create_access_token(user.id)
        return TokenResponse(access_token=token, user=UserRead.model_validate(user))

    def login(self, payload: UserLogin) -> TokenResponse:
        user = self.repo.get_by_email(payload.email)
        if not user or not verify_password(payload.password, user.hashed_password):
            raise bad_request("Email o contraseña incorrectos.")

        token = create_access_token(user.id)
        return TokenResponse(access_token=token, user=UserRead.model_validate(user))

    def get_me(self, user_id: int) -> User:
        user = self.repo.get_by_id(user_id)
        if not user:
            raise bad_request("Usuario no encontrado.")
        return user
