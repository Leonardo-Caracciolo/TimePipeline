from datetime import date, time, datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator, model_validator
from app.models.activity import Priority, Status, RecurrenceType


# ── Category Schemas ──────────────────────────────────────────────────────────

class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    color: str = Field(default="#6366F1", pattern=r"^#[0-9A-Fa-f]{6}$")
    icon: Optional[str] = Field(default=None, max_length=50)


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    color: Optional[str] = Field(default=None, pattern=r"^#[0-9A-Fa-f]{6}$")
    icon: Optional[str] = None


class CategoryRead(CategoryBase):
    id: int
    is_system: bool
    created_at: datetime
    activity_count: int = 0

    model_config = {"from_attributes": True}


# ── Activity Schemas ──────────────────────────────────────────────────────────

class ActivityBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    observations: Optional[str] = None
    category_id: int
    event_date: date
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    priority: Priority = Priority.MEDIUM
    status: Status = Status.PENDING
    recurrence: RecurrenceType = RecurrenceType.NONE
    recurrence_end_date: Optional[date] = None
    is_deadline: bool = False
    is_all_day: bool = False

    @model_validator(mode="after")
    def validate_time_range(self) -> "ActivityBase":
        if self.start_time and self.end_time:
            if self.start_time >= self.end_time:
                raise ValueError("end_time must be after start_time")
        return self

    @model_validator(mode="after")
    def validate_recurrence_end(self) -> "ActivityBase":
        if self.recurrence != RecurrenceType.NONE and self.recurrence_end_date:
            if self.recurrence_end_date <= self.event_date:
                raise ValueError("recurrence_end_date must be after event_date")
        return self


class ActivityCreate(ActivityBase):
    pass


class ActivityUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = None
    observations: Optional[str] = None
    category_id: Optional[int] = None
    event_date: Optional[date] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    priority: Optional[Priority] = None
    status: Optional[Status] = None
    recurrence: Optional[RecurrenceType] = None
    recurrence_end_date: Optional[date] = None
    is_deadline: Optional[bool] = None
    is_all_day: Optional[bool] = None


class ActivityRead(ActivityBase):
    id: int
    created_at: datetime
    updated_at: datetime
    category: CategoryRead

    model_config = {"from_attributes": True}


class ActivityListResponse(BaseModel):
    items: list[ActivityRead]
    total: int
    page: int
    page_size: int
    total_pages: int


# ── Filter / Query Schemas ────────────────────────────────────────────────────

class ActivityFilters(BaseModel):
    category_id: Optional[int] = None
    priority: Optional[Priority] = None
    status: Optional[Status] = None
    date_from: Optional[date] = None
    date_to: Optional[date] = None
    search: Optional[str] = None
    is_deadline: Optional[bool] = None
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=50, ge=1, le=200)


# ── Dashboard Schema ──────────────────────────────────────────────────────────

class DashboardStats(BaseModel):
    today_count: int
    upcoming_count: int
    overdue_count: int
    deadline_soon_count: int
    by_category: list[dict]
    by_priority: dict
    by_status: dict
    today_activities: list[ActivityRead]
    upcoming_activities: list[ActivityRead]
    overdue_activities: list[ActivityRead]
    deadlines_soon: list[ActivityRead]
