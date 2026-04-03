from fastapi import APIRouter
from app.api.v1.endpoints.activities import router as activities_router
from app.api.v1.endpoints.categories import router as categories_router
from app.api.v1.endpoints.dashboard import router as dashboard_router
from app.api.v1.endpoints.auth import router as auth_router

v1_router = APIRouter(prefix="/api/v1")
v1_router.include_router(auth_router)
v1_router.include_router(activities_router)
v1_router.include_router(categories_router)
v1_router.include_router(dashboard_router)
