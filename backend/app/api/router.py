from fastapi import APIRouter
from app.api.routes import health, meetings, action_items, dashboard, google_drive, employees

api_router = APIRouter()

api_router.include_router(health.router)
api_router.include_router(meetings.router)
api_router.include_router(action_items.router)
api_router.include_router(dashboard.router)
api_router.include_router(google_drive.router)
api_router.include_router(employees.router)
