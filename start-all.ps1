# Ministry of Tribal Affairs (MoTA) Scholarship Platform - All-in-One Startup Script
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host " Ministry of Tribal Affairs (MoTA) Scholarship & Fellowship Platform" -ForegroundColor Yellow
Write-Host " SIH26239 - End-to-End Integrated Prototype Startup" -ForegroundColor Green
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host ""

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $Root) { $Root = "c:\Users\Preet\Desktop\Github\TribeXcel" }
Set-Location $Root

Write-Host "[1/4] Starting AI Document & Verification Engine (Python FastAPI on port 8000)..." -ForegroundColor White
Start-Process powershell -WorkingDirectory "$Root\ai-engine" -ArgumentList "-NoExit", "-Command", "python -m uvicorn app.main:app --host 0.0.0.0 --port 8000"

Start-Sleep -Seconds 3

Write-Host "[2/4] Starting Central Backend API (Node.js Express on port 5000)..." -ForegroundColor White
Start-Process powershell -WorkingDirectory "$Root\scholarship-admin\backend" -ArgumentList "-NoExit", "-Command", "node server.js"

Start-Sleep -Seconds 2

Write-Host "[3/4] Starting Student Scholarship Web Portal (Vite on port 5174)..." -ForegroundColor White
Start-Process powershell -WorkingDirectory "$Root\student-web\frontend" -ArgumentList "-NoExit", "-Command", "npm run dev"

Start-Sleep -Seconds 2

Write-Host "[4/4] Starting Scholarship Admin Web Portal (Vite on port 5173)..." -ForegroundColor White
Start-Process powershell -WorkingDirectory "$Root\scholarship-admin\frontend" -ArgumentList "-NoExit", "-Command", "npm run dev"

Write-Host ""
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host " ALL 4 SERVICES LAUNCHED:" -ForegroundColor Green
Write-Host "   - AI Document Engine: http://localhost:8000 (Docs: http://localhost:8000/docs)" -ForegroundColor Yellow
Write-Host "   - Central Backend:    http://localhost:5000 (Health: http://localhost:5000/api/health)" -ForegroundColor Yellow
Write-Host "   - Student Portal:     http://localhost:5174" -ForegroundColor Yellow
Write-Host "   - Admin Portal:       http://localhost:5173" -ForegroundColor Yellow
Write-Host "=====================================================================" -ForegroundColor Cyan
