from fastapi import APIRouter, Depends
from app.api.deps import get_activity_service
from app.services.activity_service import ActivityService
from app.schemas.activity import DashboardStats

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/", response_model=DashboardStats)
def get_dashboard(svc: ActivityService = Depends(get_activity_service)):
    return svc.get_dashboard()
