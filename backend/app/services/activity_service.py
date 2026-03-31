from datetime import date
from sqlalchemy.orm import Session

from app.models.activity import Activity, Category
from app.repositories.activity_repository import ActivityRepository, CategoryRepository
from app.schemas.activity import (
    ActivityCreate, ActivityUpdate, ActivityFilters,
    ActivityListResponse, DashboardStats,
    CategoryCreate, CategoryUpdate, CategoryRead,
)
from app.core.exceptions import (
    ActivityNotFoundError, CategoryNotFoundError,
    not_found, bad_request, conflict,
)
import math


class CategoryService:
    def __init__(self, db: Session):
        self.repo = CategoryRepository(db)

    def get_all(self) -> list[Category]:
        return self.repo.get_with_counts()

    def get_by_id(self, category_id: int) -> Category:
        cat = self.repo.get_by_id(category_id)
        if not cat:
            raise not_found("Category", category_id)
        return cat

    def create(self, payload: CategoryCreate) -> Category:
        existing = self.repo.get_by_name(payload.name)
        if existing:
            raise conflict(f"Category '{payload.name}' already exists.")
        return self.repo.create(payload)

    def update(self, category_id: int, payload: CategoryUpdate) -> Category:
        cat = self.get_by_id(category_id)
        if cat.is_system:
            raise bad_request("System categories cannot be modified.")
        if payload.name:
            existing = self.repo.get_by_name(payload.name)
            if existing and existing.id != category_id:
                raise conflict(f"Category name '{payload.name}' is already taken.")
        return self.repo.update(cat, payload)

    def delete(self, category_id: int) -> None:
        cat = self.get_by_id(category_id)
        if cat.is_system:
            raise bad_request("System categories cannot be deleted.")
        self.repo.delete(cat)


class ActivityService:
    def __init__(self, db: Session):
        self.repo = ActivityRepository(db)
        self.cat_repo = CategoryRepository(db)

    def _validate_category(self, category_id: int) -> None:
        if not self.cat_repo.get_by_id(category_id):
            raise not_found("Category", category_id)

    def get_by_id(self, activity_id: int) -> Activity:
        activity = self.repo.get_by_id(activity_id)
        if not activity:
            raise not_found("Activity", activity_id)
        return activity

    def get_filtered(self, filters: ActivityFilters) -> ActivityListResponse:
        items, total = self.repo.get_filtered(filters)
        total_pages = math.ceil(total / filters.page_size) if total > 0 else 1
        return ActivityListResponse(
            items=items,
            total=total,
            page=filters.page,
            page_size=filters.page_size,
            total_pages=total_pages,
        )

    def get_for_calendar(self, date_from: date, date_to: date) -> list[Activity]:
        return self.repo.get_for_date_range(date_from, date_to)

    def create(self, payload: ActivityCreate) -> Activity:
        self._validate_category(payload.category_id)
        return self.repo.create(payload)

    def update(self, activity_id: int, payload: ActivityUpdate) -> Activity:
        activity = self.get_by_id(activity_id)
        if payload.category_id is not None:
            self._validate_category(payload.category_id)
        return self.repo.update(activity, payload)

    def delete(self, activity_id: int) -> None:
        activity = self.get_by_id(activity_id)
        self.repo.delete(activity)

    def mark_completed(self, activity_id: int) -> Activity:
        from app.schemas.activity import ActivityUpdate
        from app.models.activity import Status
        return self.update(activity_id, ActivityUpdate(status=Status.COMPLETED))

    def get_dashboard(self) -> DashboardStats:
        today = date.today()

        today_activities = self.repo.get_today(today)
        upcoming = self.repo.get_upcoming(today, days=7)
        overdue = self.repo.get_overdue(today)
        deadlines_soon = self.repo.get_deadlines_soon(today, days=7)
        by_category = self.repo.get_stats_by_category()
        by_priority = self.repo.get_stats_by_field("priority")
        by_status = self.repo.get_stats_by_field("status")

        return DashboardStats(
            today_count=len(today_activities),
            upcoming_count=len(upcoming),
            overdue_count=len(overdue),
            deadline_soon_count=len(deadlines_soon),
            by_category=by_category,
            by_priority=by_priority,
            by_status=by_status,
            today_activities=today_activities,
            upcoming_activities=upcoming,
            overdue_activities=overdue,
            deadlines_soon=deadlines_soon,
        )
