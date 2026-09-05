@echo off
setlocal enabledelayedexpansion

:: Navigate to the directory containing this batch file
cd /d "%~dp0"

echo ============================================================
echo   Starting LoopKeeper Backend API
echo ============================================================
echo.
echo   Backend URL:    http://localhost:8000
echo   Health Check:   http://localhost:8000/health
echo   API Docs:       http://localhost:8000/api/v1/openapi.json
echo.
echo   Press Ctrl+C in this window to stop the server.
echo ============================================================
echo.

:: Set PYTHONPATH to include repository root and backend directory
set "PYTHONPATH=%~dp0;%~dp0backend"

:: Start FastAPI server using Uvicorn
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

if errorlevel 1 (
    echo.
    echo [ERROR] LoopKeeper Backend failed to start or exited with an error.
)
echo.
pause
