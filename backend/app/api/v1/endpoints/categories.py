from fastapi import APIRouter, Depends, status
from app.api.deps import get_category_service, get_current_user
from app.services.activity_service import CategoryService
from app.schemas.activity import CategoryCreate, CategoryUpdate, CategoryRead
from app.models.user import User

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("/", response_model=list[CategoryRead])
def list_categories(
    current_user: User = Depends(get_current_user),
    svc: CategoryService = Depends(get_category_service),
):
    return svc.get_all(current_user.id)


@router.get("/{category_id}", response_model=CategoryRead)
def get_category(
    category_id: int,
    current_user: User = Depends(get_current_user),
    svc: CategoryService = Depends(get_category_service),
):
    return svc.get_by_id(category_id, current_user.id)


@router.post("/", response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
def create_category(
    payload: CategoryCreate,
    current_user: User = Depends(get_current_user),
    svc: CategoryService = Depends(get_category_service),
):
    return svc.create(payload, current_user.id)


@router.patch("/{category_id}", response_model=CategoryRead)
def update_category(
    category_id: int,
    payload: CategoryUpdate,
    current_user: User = Depends(get_current_user),
    svc: CategoryService = Depends(get_category_service),
):
    return svc.update(category_id, payload, current_user.id)


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    current_user: User = Depends(get_current_user),
    svc: CategoryService = Depends(get_category_service),
):
    svc.delete(category_id, current_user.id)
