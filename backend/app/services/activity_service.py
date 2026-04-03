from datetime import date
import math
from sqlalchemy.orm import Session

from app.models.activity import Activity, Category
from app.repositories.activity_repository import ActivityRepository, CategoryRepository
from app.schemas.activity import (
    ActivityCreate, ActivityUpdate, ActivityFilters,
    ActivityListResponse, DashboardStats,
    CategoryCreate, CategoryUpdate,
)
from app.core.exceptions import not_found, bad_request, conflict


class CategoryService:
    def __init__(self, db: Session):
        self.repo = CategoryRepository(db)

    def get_all(self, user_id: int) -> list[Category]:
        return self.repo.get_with_counts(user_id)

    def get_by_id(self, category_id: int, user_id: int) -> Category:
        cat = self.repo.get_by_id(category_id, user_id)
        if not cat:
            raise not_found("Category", category_id)
        return cat

    def create(self, payload: CategoryCreate, user_id: int) -> Category:
        existing = self.repo.get_by_name(payload.name, user_id)
        if existing:
            raise conflict(f"Ya tenés una categoría llamada '{payload.name}'.")
        return self.repo.create(payload, user_id)

    def update(self, category_id: int, payload: CategoryUpdate, user_id: int) -> Category:
        cat = self.get_by_id(category_id, user_id)
        if cat.is_system:
            raise bad_request("Las categorías del sistema no se pueden modificar.")
        if payload.name:
            existing = self.repo.get_by_name(payload.name, user_id)
            if existing and existing.id != category_id:
                raise conflict(f"Ya tenés una categoría llamada '{payload.name}'.")
        return self.repo.update(cat, payload)

    def delete(self, category_id: int, user_id: int) -> None:
        cat = self.get_by_id(category_id, user_id)
        # Both system and custom categories can be deleted, as long as they have no activities
        if hasattr(cat, "activity_count"):
            count = cat.activity_count
        else:
            # Re-fetch with count
            cats_with_count = self.repo.get_with_counts(user_id)
            matched = next((c for c in cats_with_count if c.id == category_id), None)
            count = matched.activity_count if matched else 0  # type: ignore

        if count > 0:
            raise bad_request(
                f"No podés eliminar esta categoría porque tiene {count} "
                f"{'actividad' if count == 1 else 'actividades'} asociada{'s' if count != 1 else ''}. "
                "Primero reasignálas o eliminá las actividades."
            )
        self.repo.delete(cat)


class ActivityService:
    def __init__(self, db: Session):
        self.repo = ActivityRepository(db)
        self.cat_repo = CategoryRepository(db)

    def _validate_category(self, category_id: int, user_id: int) -> None:
        if not self.cat_repo.get_by_id(category_id, user_id):
            raise not_found("Category", category_id)

    def get_by_id(self, activity_id: int, user_id: int) -> Activity:
        activity = self.repo.get_by_id(activity_id, user_id)
        if not activity:
            raise not_found("Activity", activity_id)
        return activity

    def get_filtered(self, filters: ActivityFilters, user_id: int) -> ActivityListResponse:
        items, total = self.repo.get_filtered(filters, user_id)
        total_pages = math.ceil(total / filters.page_size) if total > 0 else 1
        return ActivityListResponse(
            items=items, total=total, page=filters.page,
            page_size=filters.page_size, total_pages=total_pages,
        )

    def get_for_calendar(self, date_from: date, date_to: date, user_id: int) -> list[Activity]:
        return self.repo.get_for_date_range(date_from, date_to, user_id)

    def create(self, payload: ActivityCreate, user_id: int) -> Activity:
        self._validate_category(payload.category_id, user_id)
        return self.repo.create(payload, user_id)

    def update(self, activity_id: int, payload: ActivityUpdate, user_id: int) -> Activity:
        activity = self.get_by_id(activity_id, user_id)
        if payload.category_id is not None:
            self._validate_category(payload.category_id, user_id)
        return self.repo.update(activity, payload)

    def delete(self, activity_id: int, user_id: int) -> None:
        activity = self.get_by_id(activity_id, user_id)
        self.repo.delete(activity)

    def mark_completed(self, activity_id: int, user_id: int) -> Activity:
        from app.schemas.activity import ActivityUpdate
        from app.models.activity import Status
        return self.update(activity_id, ActivityUpdate(status=Status.COMPLETED), user_id)

    def get_dashboard(self, user_id: int) -> DashboardStats:
        today = date.today()
        return DashboardStats(
            today_count=len(self.repo.get_today(today, user_id)),
            upcoming_count=len(self.repo.get_upcoming(today, user_id)),
            overdue_count=len(self.repo.get_overdue(today, user_id)),
            deadline_soon_count=len(self.repo.get_deadlines_soon(today, user_id)),
            by_category=self.repo.get_stats_by_category(user_id),
            by_priority=self.repo.get_stats_by_field("priority", user_id),
            by_status=self.repo.get_stats_by_field("status", user_id),
            today_activities=self.repo.get_today(today, user_id),
            upcoming_activities=self.repo.get_upcoming(today, user_id),
            overdue_activities=self.repo.get_overdue(today, user_id),
            deadlines_soon=self.repo.get_deadlines_soon(today, user_id),
        )
