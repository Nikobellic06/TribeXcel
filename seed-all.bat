@echo off
echo =====================================================================
echo  MoTA Scholarship Platform - Seeding Database
echo =====================================================================
echo.

cd services\api-server
echo [1/2] Seeding Default Admin Account (admin@mota.gov.in / Admin@123)...
node scripts/seedAdmin.js admin@mota.gov.in Admin@123 "Shri Rajesh Kumar, Verification Officer"

echo.
echo [2/2] Seeding Realistic MoTA Scholarship Applications across Schemes...
node scripts/seedApplications.js

echo.
echo =====================================================================
echo  DATABASE SEEDED SUCCESSFULLY!
echo =====================================================================
pause
