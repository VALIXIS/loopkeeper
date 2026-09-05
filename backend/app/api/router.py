from fastapi import APIRouter
from app.api.routes import (
    health,
    auth,
    users,
    meetings,
    action_items,
    commitments,
    accountability,
    dashboard,
    google_drive,
    employees,
    integrations,
    jira,
    recordings,
    transcripts
)

api_router = APIRouter()

api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(meetings.router)
api_router.include_router(action_items.router)
api_router.include_router(commitments.router)
api_router.include_router(accountability.router)
api_router.include_router(dashboard.router)
api_router.include_router(google_drive.router)
api_router.include_router(employees.router)
api_router.include_router(integrations.router)
api_router.include_router(jira.router)
api_router.include_router(recordings.router)
api_router.include_router(transcripts.router)
