@echo off
title ContextMed AI - Cofounder Office Baslatici
echo ===================================================
echo   ContextMed AI - Cofounder Office Hizli Kurulum
echo ===================================================
echo.
echo [1/3] Node.js bagimliliklari kontrol ediliyor...
cd packages\cofounder-office\cofounder-backend
call npm install
cd ..\cofounder-dashboard
call npm install
cd ..\..\..

echo [2/3] Sunucular baslatiliyor...
start cmd /k "cd packages\cofounder-office\cofounder-backend && title Backend Server && node server.js"
echo Backend Server (Port 4000) baslatildi.

echo [3/3] Arayuz (Dashboard) baslatiliyor...
start cmd /k "cd packages\cofounder-office\cofounder-dashboard && title Dashboard Client && npx vite"
echo Dashboard Client (Port 5173) baslatildi.
echo.
echo ===================================================
echo   KURULUM TAMAMLANDI!
echo   Tarayicida http://localhost:5173 adresini acin.
echo ===================================================
pause
