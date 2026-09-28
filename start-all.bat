@echo off
echo =====================================================================
echo  Ministry of Tribal Affairs (MoTA) Scholarship & Fellowship Platform
echo  SIH26239 - End-to-End Integrated Prototype Startup
echo =====================================================================
echo.

echo [1/4] Starting AI Document & Verification Engine (Python FastAPI on port 8000)...
start "MoTA AI Engine (Port 8000)" cmd /k "cd ai-engine && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 3 /nobreak >nul

echo [2/4] Starting Central Backend API (Node.js Express on port 5000)...
start "MoTA Backend API (Port 5000)" cmd /k "cd scholarship-admin\backend && npm run dev"

timeout /t 3 /nobreak >nul

echo [3/4] Starting Student Scholarship Web Portal (Vite on port 5174)...
start "MoTA Student Portal (Port 5174)" cmd /k "cd student-web\frontend && npm run dev"

timeout /t 2 /nobreak >nul

echo [4/4] Starting Scholarship Admin Web Portal (Vite on port 5173)...
start "MoTA Admin Portal (Port 5173)" cmd /k "cd scholarship-admin\frontend && npm run dev"

echo.
echo =====================================================================
echo  ALL 4 SERVICES LAUNCHED SUCCESSFULLY:
echo   - AI Document Engine: http://localhost:8000 (Docs: http://localhost:8000/docs)
echo   - Central Backend:    http://localhost:5000 (Health: http://localhost:5000/api/health)
echo   - Student Portal:     http://localhost:5174
echo   - Admin Portal:       http://localhost:5173
echo =====================================================================
echo.
pause
