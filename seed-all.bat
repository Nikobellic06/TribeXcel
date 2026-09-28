@echo off
echo =====================================================================
echo  MoTA Scholarship Platform - Seeding Database
echo =====================================================================
echo.

cd scholarship-admin\backend
echo [1/2] Seeding Default Admin Account (admin@mota.gov.in / Admin@1234)...
node scripts/seedAdmin.js admin@mota.gov.in Admin@1234 "Shri Rajesh Kumar, Verification Officer"

echo.
echo [2/2] Seeding 20 Realistic Scholarship Applications across Pre-Matric, NFST, and NOS...
node scripts/seedApplications.js

echo.
echo =====================================================================
echo  DATABASE SEEDED SUCCESSFULLY!
echo =====================================================================
pause
