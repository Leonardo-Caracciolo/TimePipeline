from fastapi import APIRouter, Depends
from app.api.deps import get_activity_service, get_current_user
from app.services.activity_service import ActivityService
from app.schemas.activity import DashboardStats
from app.models.user import User

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/", response_model=DashboardStats)
def get_dashboard(
    current_user: User = Depends(get_current_user),
    svc: ActivityService = Depends(get_activity_service),
):
    return svc.get_dashboard(current_user.id)
