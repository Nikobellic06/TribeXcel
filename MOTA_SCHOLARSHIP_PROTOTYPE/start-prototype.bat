@echo off
TITLE MoTA Scholarship Prototype - Launch All Services
echo =================================================================
echo  MINISTRY OF TRIBAL AFFAIRS (MoTA) SCHOLARSHIP AI PROTOTYPE
echo  Starting OCR Engine, System A, System B, Integration API, and Dashboard...
echo =================================================================

:: Start OCR Microservice (PaddleOCR / PyMuPDF on Port 5003)
start "OCR Microservice (Port 5003)" cmd /k "cd /d "%~dp0system-a-document-intelligence\ocr-service" && python ocr_app.py"

:: Start System A (Document Intelligence on Port 5001)
start "System A - Document Intelligence (Port 5001)" cmd /k "cd /d "%~dp0system-a-document-intelligence" && npm start"

:: Start System B (Scholarship Verification Engine on Port 5050)
start "System B - Verification Engine (Port 5050)" cmd /k "cd /d "%~dp0system-b-verification-engine" && npm start"

:: Start Integration API Server (Port 5002)
start "Integration API Server (Port 5002)" cmd /k "cd /d "%~dp0integration" && npm start"

:: Start React Vite Demo Dashboard (Port 3000)
start "Demo Dashboard - React Vite (Port 3000)" cmd /k "cd /d "%~dp0integration\frontend" && npm run dev"

echo.
echo All 5 services are starting in separate windows:
echo   - OCR Microservice       : http://localhost:5003
echo   - System A (Document AI) : http://localhost:5001
echo   - System B (Verification): http://localhost:5050
echo   - Integration API Server : http://localhost:5002
echo   - Demo Dashboard (React) : http://localhost:3000
echo.
echo Opening browser to http://localhost:3000 ...
timeout /t 3 >nul
start http://localhost:3000
