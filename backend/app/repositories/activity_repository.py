from datetime import date, timedelta
from typing import Optional
from sqlalchemy import select, func, and_, or_, desc
from sqlalchemy.orm import Session, joinedload

from app.models.activity import Activity, Category, Priority, Status, RecurrenceType
from app.schemas.activity import (
    ActivityCreate, ActivityUpdate, ActivityFilters,
    CategoryCreate, CategoryUpdate,
)


class CategoryRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self, user_id: int) -> list[Category]:
        stmt = (
            select(Category)
            .where(Category.user_id == user_id)
            .order_by(Category.name)
        )
        return list(self.db.scalars(stmt).all())

    def get_by_id(self, category_id: int, user_id: int) -> Optional[Category]:
        stmt = select(Category).where(
            Category.id == category_id,
            Category.user_id == user_id,
        )
        return self.db.scalar(stmt)

    def get_by_name(self, name: str, user_id: int) -> Optional[Category]:
        return self.db.scalar(
            select(Category).where(
                Category.name.ilike(name),
                Category.user_id == user_id,
            )
        )

    def create(self, payload: CategoryCreate, user_id: int, is_system: bool = False) -> Category:
        category = Category(**payload.model_dump(), user_id=user_id, is_system=is_system)
        self.db.add(category)
        self.db.commit()
        self.db.refresh(category)
        return category

    def update(self, category: Category, payload: CategoryUpdate) -> Category:
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(category, field, value)
        self.db.commit()
        self.db.refresh(category)
        return category

    def delete(self, category: Category) -> None:
        self.db.delete(category)
        self.db.commit()

    def get_with_counts(self, user_id: int) -> list[Category]:
        stmt = (
            select(Category, func.count(Activity.id).label("activity_count"))
            .outerjoin(Activity, and_(
                Activity.category_id == Category.id,
                Activity.user_id == user_id,
            ))
            .where(Category.user_id == user_id)
            .group_by(Category.id)
            .order_by(Category.name)
        )
        rows = self.db.execute(stmt).all()
        result = []
        for cat, count in rows:
            cat.activity_count = count  # type: ignore
            result.append(cat)
        return result


class ActivityRepository:
    def __init__(self, db: Session):
        self.db = db

    def _base_query(self, user_id: int):
        return (
            select(Activity)
            .options(joinedload(Activity.category))
            .where(Activity.user_id == user_id)
            .order_by(desc(Activity.event_date), Activity.start_time)
        )

    def get_by_id(self, activity_id: int, user_id: int) -> Optional[Activity]:
        stmt = (
            select(Activity)
            .options(joinedload(Activity.category))
            .where(Activity.id == activity_id, Activity.user_id == user_id)
        )
        return self.db.scalar(stmt)

    def get_filtered(self, filters: ActivityFilters, user_id: int) -> tuple[list[Activity], int]:
        conditions = [Activity.user_id == user_id]

        if filters.category_id is not None:
            conditions.append(Activity.category_id == filters.category_id)
        if filters.priority is not None:
            conditions.append(Activity.priority == filters.priority)
        if filters.status is not None:
            conditions.append(Activity.status == filters.status)
        if filters.date_from is not None:
            conditions.append(Activity.event_date >= filters.date_from)
        if filters.date_to is not None:
            conditions.append(Activity.event_date <= filters.date_to)
        if filters.is_deadline is not None:
            conditions.append(Activity.is_deadline == filters.is_deadline)
        if filters.search:
            pattern = f"%{filters.search}%"
            conditions.append(
                or_(Activity.title.ilike(pattern), Activity.description.ilike(pattern))
            )

        total = self.db.scalar(select(func.count(Activity.id)).where(and_(*conditions))) or 0
        offset = (filters.page - 1) * filters.page_size
        items = list(
            self.db.scalars(
                select(Activity)
                .options(joinedload(Activity.category))
                .where(and_(*conditions))
                .order_by(desc(Activity.event_date), Activity.start_time)
                .offset(offset)
                .limit(filters.page_size)
            ).all()
        )
        return items, total

    def get_for_date_range(self, date_from: date, date_to: date, user_id: int) -> list[Activity]:
        stmt = (
            self._base_query(user_id)
            .where(
                Activity.event_date >= date_from,
                Activity.event_date <= date_to,
                Activity.status != Status.CANCELLED,
            )
        )
        return list(self.db.scalars(stmt).all())

    def get_today(self, today: date, user_id: int) -> list[Activity]:
        stmt = self._base_query(user_id).where(
            Activity.event_date == today,
            Activity.status != Status.CANCELLED,
        )
        return list(self.db.scalars(stmt).all())

    def get_upcoming(self, from_date: date, user_id: int, days: int = 7) -> list[Activity]:
        to_date = from_date + timedelta(days=days)
        stmt = self._base_query(user_id).where(
            Activity.event_date > from_date,
            Activity.event_date <= to_date,
            Activity.status.in_([Status.PENDING, Status.IN_PROGRESS]),
        )
        return list(self.db.scalars(stmt).all())

    def get_overdue(self, today: date, user_id: int) -> list[Activity]:
        stmt = self._base_query(user_id).where(
            Activity.event_date < today,
            Activity.status == Status.PENDING,
        )
        return list(self.db.scalars(stmt).all())

    def get_deadlines_soon(self, today: date, user_id: int, days: int = 7) -> list[Activity]:
        to_date = today + timedelta(days=days)
        stmt = self._base_query(user_id).where(
            Activity.is_deadline == True,  # noqa: E712
            Activity.event_date >= today,
            Activity.event_date <= to_date,
            Activity.status != Status.CANCELLED,
        )
        return list(self.db.scalars(stmt).all())

    def create(self, payload: ActivityCreate, user_id: int) -> Activity:
        activity = Activity(**payload.model_dump(), user_id=user_id)
        self.db.add(activity)
        self.db.commit()
        self.db.refresh(activity)
        return self.get_by_id(activity.id, user_id)  # type: ignore

    def update(self, activity: Activity, payload: ActivityUpdate) -> Activity:
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(activity, field, value)
        self.db.commit()
        self.db.refresh(activity)
        return self.get_by_id(activity.id, activity.user_id)  # type: ignore

    def delete(self, activity: Activity) -> None:
        self.db.delete(activity)
        self.db.commit()

    def get_stats_by_category(self, user_id: int) -> list[dict]:
        stmt = (
            select(
                Category.id, Category.name, Category.color,
                func.count(Activity.id).label("total"),
            )
            .join(Activity, and_(
                Activity.category_id == Category.id,
                Activity.user_id == user_id,
            ))
            .where(Category.user_id == user_id)
            .group_by(Category.id, Category.name, Category.color)
            .order_by(desc("total"))
        )
        rows = self.db.execute(stmt).all()
        return [{"id": r.id, "name": r.name, "color": r.color, "total": r.total} for r in rows]

    def get_stats_by_field(self, field: str, user_id: int) -> dict:
        model_field = getattr(Activity, field)
        stmt = (
            select(model_field, func.count(Activity.id).label("count"))
            .where(Activity.user_id == user_id)
            .group_by(model_field)
        )
        rows = self.db.execute(stmt).all()
        return {str(row[0].value): row[1] for row in rows}