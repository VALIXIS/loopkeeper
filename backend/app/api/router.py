from fastapi import APIRouter, Depends
from app.core.security import get_current_user
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

# Public Routes
api_router.include_router(health.router)
api_router.include_router(auth.router)

# Protected Routes (Require valid Bearer token in production mode)
protected_deps = [Depends(get_current_user)]

api_router.include_router(users.router, dependencies=protected_deps)
api_router.include_router(meetings.router, dependencies=protected_deps)
api_router.include_router(action_items.router, dependencies=protected_deps)
api_router.include_router(commitments.router, dependencies=protected_deps)
api_router.include_router(accountability.router, dependencies=protected_deps)
api_router.include_router(dashboard.router, dependencies=protected_deps)
api_router.include_router(google_drive.router, dependencies=protected_deps)
api_router.include_router(employees.router, dependencies=protected_deps)
api_router.include_router(integrations.router, dependencies=protected_deps)
api_router.include_router(jira.router, dependencies=protected_deps)
api_router.include_router(recordings.router, dependencies=protected_deps)
api_router.include_router(transcripts.router, dependencies=protected_deps)
