@echo off
REM Giving Coast - start everything (API + both Angular sites)
REM Run this file, then open the three addresses printed at the end.

set NODE=D:\nodejs\node.exe
set ROOT=%~dp0
set MYSQL_BIN=C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe
set MYSQL_INI=D:\mysql-data\my.ini

echo.
echo [1/4] Checking MySQL...
netstat -ano | findstr ":3306" | findstr LISTENING >nul
if %errorlevel%==0 (
    echo       MySQL is already running.
) else (
    echo       Starting MySQL...
    start "MySQL" "%MYSQL_BIN%" --defaults-file="%MYSQL_INI%" --console
    timeout /t 12 /nobreak >nul
)

echo [2/4] Starting the API on port 3000...
start "API :3000" cmd /k "cd /d %ROOT%api && "%NODE%" server.js"

echo [3/4] Starting the client site on port 4200...
start "Client :4200" cmd /k "cd /d %ROOT%clientside && "%NODE%" node_modules\@angular\cli\bin\ng.js serve --port 4200"

echo [4/4] Starting the admin site on port 4201...
start "Admin :4201" cmd /k "cd /d %ROOT%adminside && "%NODE%" node_modules\@angular\cli\bin\ng.js serve --port 4201"

echo.
echo Waiting for the sites to build...
timeout /t 25 /nobreak >nul

echo.
echo ============================================================
echo   Client site  (public) :  http://localhost:4200
echo   Admin site   (staff)  :  http://localhost:4201
echo   API health check      :  http://localhost:3000/api/health
echo ============================================================
echo.
echo Keep the three black windows open - closing them stops the sites.
echo.
start "" http://localhost:4200
start "" http://localhost:4201
pause
