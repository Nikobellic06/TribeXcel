# PowerShell Launcher for MoTA AI Scholarship Prototype
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host " MINISTRY OF TRIBAL AFFAIRS (MoTA) SCHOLARSHIP AI PROTOTYPE" -ForegroundColor Yellow
Write-Host " Starting System A, System B, Integration API, and Dashboard..." -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Start System A
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$scriptDir\system-a-document-intelligence'; npm start"
# Start System B
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$scriptDir\system-b-verification-engine'; npm start"
# Start Integration API
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$scriptDir\integration'; npm start"
# Start Frontend Dashboard
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$scriptDir\integration\frontend'; npm run dev"

Write-Host "`nAll 4 services launched:" -ForegroundColor Green
Write-Host "  - System A (Document AI) : http://localhost:5001"
Write-Host "  - System B (Verification): http://localhost:5050"
Write-Host "  - Integration API Server : http://localhost:5002"
Write-Host "  - Demo Dashboard (React) : http://localhost:3000"

Start-Sleep -Seconds 3
Start-Process "http://localhost:3000"
