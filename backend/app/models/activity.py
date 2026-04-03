from datetime import datetime, date, time
from typing import Optional
from sqlalchemy import (
    Integer, String, Text, Date, Time, DateTime,
    Boolean, ForeignKey, Enum as SAEnum, func
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
import enum


class Priority(str, enum.Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class Status(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class RecurrenceType(str, enum.Enum):
    NONE = "none"
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    color: Mapped[str] = mapped_column(String(7), default="#6366F1")
    icon: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    is_system: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    user: Mapped["User"] = relationship("User", back_populates="categories")  # noqa: F821
    activities: Mapped[list["Activity"]] = relationship(
        "Activity", back_populates="category", lazy="select"
    )

    def __repr__(self) -> str:
        return f"<Category(id={self.id}, name={self.name!r})>"


class Activity(Base):
    __tablename__ = "activities"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    observations: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    category_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("categories.id", ondelete="RESTRICT"), nullable=False
    )

    event_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    start_time: Mapped[Optional[time]] = mapped_column(Time, nullable=True)
    end_time: Mapped[Optional[time]] = mapped_column(Time, nullable=True)

    priority: Mapped[Priority] = mapped_column(
        SAEnum(Priority, name="priority_enum"), default=Priority.MEDIUM, nullable=False
    )
    status: Mapped[Status] = mapped_column(
        SAEnum(Status, name="status_enum"), default=Status.PENDING, nullable=False
    )
    recurrence: Mapped[RecurrenceType] = mapped_column(
        SAEnum(RecurrenceType, name="recurrence_enum"),
        default=RecurrenceType.NONE,
        nullable=False,
    )
    recurrence_end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)

    is_deadline: Mapped[bool] = mapped_column(Boolean, default=False)
    is_all_day: Mapped[bool] = mapped_column(Boolean, default=False)

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    user: Mapped["User"] = relationship("User", back_populates="activities")  # noqa: F821
    category: Mapped["Category"] = relationship("Category", back_populates="activities")

    def __repr__(self) -> str:
        return f"<Activity(id={self.id}, title={self.title!r}, date={self.event_date})>"
