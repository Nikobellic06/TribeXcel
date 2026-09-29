# Ministry of Tribal Affairs - National Scholarship & Fellowship Portal - All-in-One Startup Script
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host " Ministry of Tribal Affairs - National Scholarship & Fellowship Portal" -ForegroundColor Yellow
Write-Host " Integrated Platform Startup (Production Monorepo Layout)" -ForegroundColor Green
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/4] Starting AI Document & Verification Engine (Python FastAPI on port 8000)..." -ForegroundColor White
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd services/ai-engine; python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

Start-Sleep -Seconds 3

Write-Host "[2/4] Starting Central Backend API (Node.js Express on port 5000)..." -ForegroundColor White
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd services/api-server; npm run dev"

Start-Sleep -Seconds 3

Write-Host "[3/4] Starting Student Scholarship Web Portal (Vite on port 5174)..." -ForegroundColor White
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd apps/student-portal; npm run dev"

Start-Sleep -Seconds 2

Write-Host "[4/4] Starting Scholarship Admin Web Portal (Vite on port 5173)..." -ForegroundColor White
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd apps/admin-portal; npm run dev"

Write-Host ""
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host " ALL 4 SERVICES LAUNCHED:" -ForegroundColor Green
Write-Host "   - AI Document Engine: http://localhost:8000 (Docs: http://localhost:8000/docs)" -ForegroundColor Yellow
Write-Host "   - Central Backend:    http://localhost:5000 (Health: http://localhost:5000/api/health)" -ForegroundColor Yellow
Write-Host "   - Student Portal:     http://localhost:5174" -ForegroundColor Yellow
Write-Host "   - Admin Portal:       http://localhost:5173" -ForegroundColor Yellow
Write-Host "=====================================================================" -ForegroundColor Cyan
