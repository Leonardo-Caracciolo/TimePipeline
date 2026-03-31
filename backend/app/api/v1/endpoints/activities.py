from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, Query, status

from app.api.deps import get_activity_service
from app.services.activity_service import ActivityService
from app.schemas.activity import (
    ActivityCreate, ActivityUpdate, ActivityRead,
    ActivityListResponse, ActivityFilters,
)
from app.models.activity import Priority, Status

router = APIRouter(prefix="/activities", tags=["activities"])


@router.get("/", response_model=ActivityListResponse)
def list_activities(
    category_id: Optional[int] = Query(None),
    priority: Optional[Priority] = Query(None),
    status: Optional[Status] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    search: Optional[str] = Query(None, max_length=200),
    is_deadline: Optional[bool] = Query(None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=200),
    svc: ActivityService = Depends(get_activity_service),
):
    filters = ActivityFilters(
        category_id=category_id,
        priority=priority,
        status=status,
        date_from=date_from,
        date_to=date_to,
        search=search,
        is_deadline=is_deadline,
        page=page,
        page_size=page_size,
    )
    return svc.get_filtered(filters)


@router.get("/calendar", response_model=list[ActivityRead])
def get_calendar_events(
    date_from: date = Query(...),
    date_to: date = Query(...),
    svc: ActivityService = Depends(get_activity_service),
):
    return svc.get_for_calendar(date_from, date_to)


@router.get("/{activity_id}", response_model=ActivityRead)
def get_activity(
    activity_id: int,
    svc: ActivityService = Depends(get_activity_service),
):
    return svc.get_by_id(activity_id)


@router.post("/", response_model=ActivityRead, status_code=status.HTTP_201_CREATED)
def create_activity(
    payload: ActivityCreate,
    svc: ActivityService = Depends(get_activity_service),
):
    return svc.create(payload)


@router.patch("/{activity_id}", response_model=ActivityRead)
def update_activity(
    activity_id: int,
    payload: ActivityUpdate,
    svc: ActivityService = Depends(get_activity_service),
):
    return svc.update(activity_id, payload)


@router.delete("/{activity_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_activity(
    activity_id: int,
    svc: ActivityService = Depends(get_activity_service),
):
    svc.delete(activity_id)


@router.post("/{activity_id}/complete", response_model=ActivityRead)
def complete_activity(
    activity_id: int,
    svc: ActivityService = Depends(get_activity_service),
):
    return svc.mark_completed(activity_id)
