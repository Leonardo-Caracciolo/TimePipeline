from sqlalchemy.orm import Session
from fastapi import Depends
from app.core.database import get_db
from app.services.activity_service import ActivityService, CategoryService


def get_activity_service(db: Session = Depends(get_db)) -> ActivityService:
    return ActivityService(db)


def get_category_service(db: Session = Depends(get_db)) -> CategoryService:
    return CategoryService(db)
