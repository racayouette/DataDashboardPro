@echo off
echo =====================================================
echo Job Description Manager - Production Installation
echo =====================================================
echo.
echo This package contains everything needed to deploy
echo the Job Description Manager to Windows Server.
echo.
echo Prerequisites:
echo - Windows Server 2016/2019/2022
echo - IIS with Node.js support
echo - SQL Server (Express/Developer/Standard)
echo - Node.js 18 LTS
echo - Administrator privileges
echo.
echo Quick Start:
echo 1. Extract this package to your server
echo 2. Open PowerShell as Administrator
echo 3. Run: .\Deploy-WindowsServer.ps1 -CreateDatabase
echo.
echo For detailed instructions, see:
echo - PRODUCTION_DEPLOYMENT_README.md
echo - WINDOWS_SERVER_DEPLOYMENT_GUIDE.md
echo.
pause