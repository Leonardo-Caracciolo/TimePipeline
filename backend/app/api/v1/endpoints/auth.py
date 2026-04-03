from fastapi import APIRouter, Depends
from app.api.deps import get_auth_service, get_current_user
from app.services.auth_service import AuthService
from app.schemas.auth import UserRegister, UserLogin, TokenResponse, UserRead
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(payload: UserRegister, svc: AuthService = Depends(get_auth_service)):
    return svc.register(payload)


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, svc: AuthService = Depends(get_auth_service)):
    return svc.login(payload)


@router.get("/me", response_model=UserRead)
def me(current_user: User = Depends(get_current_user)):
    return current_user
