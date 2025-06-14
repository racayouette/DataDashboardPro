@echo off
echo ======================================================
echo  Job Description Manager - Windows Server Deployment
echo ======================================================

echo Checking prerequisites...

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: This script must be run as Administrator
    echo Right-click and select "Run as administrator"
    pause
    exit /b 1
)

echo [OK] Running as Administrator

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: Node.js is not installed
    echo Please install Node.js 18 LTS from https://nodejs.org
    pause
    exit /b 1
)

echo [OK] Node.js is installed

REM Check if IIS is enabled
sc query W3SVC >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: IIS is not installed or not running
    echo Please enable IIS through Server Manager
    pause
    exit /b 1
)

echo [OK] IIS is running

REM Check if SQL Server is accessible
sqlcmd -S localhost -E -Q "SELECT @@VERSION" >nul 2>&1
if %errorLevel% neq 0 (
    echo WARNING: Cannot connect to SQL Server with Windows Authentication
    echo Make sure SQL Server is installed and accessible
)

echo.
echo Starting deployment...

REM Set deployment directory
set DEPLOY_DIR=C:\inetpub\wwwroot\jobmanager
echo Deployment directory: %DEPLOY_DIR%

REM Create deployment directory
if not exist "%DEPLOY_DIR%" (
    mkdir "%DEPLOY_DIR%"
    echo Created directory: %DEPLOY_DIR%
)

REM Copy application files
echo Copying application files...
robocopy . "%DEPLOY_DIR%" /E /XD node_modules .git dist /XF *.log .env

REM Navigate to deployment directory
cd /d "%DEPLOY_DIR%"

REM Install dependencies
echo Installing dependencies...
call npm install --production

REM Build application
echo Building application...
call npm run build

REM Create web.config
echo Creating IIS configuration...
(
echo ^<?xml version="1.0" encoding="utf-8"?^>
echo ^<configuration^>
echo   ^<system.webServer^>
echo     ^<handlers^>
echo       ^<add name="iisnode" path="dist/index.js" verb="*" modules="iisnode"/^>
echo     ^</handlers^>
echo     ^<rewrite^>
echo       ^<rules^>
echo         ^<rule name="StaticFiles" stopProcessing="true"^>
echo           ^<match url="^([\S]+[.](html^|htm^|svg^|js^|css^|png^|gif^|jpg^|jpeg^)^)"/^>
echo           ^<action type="Rewrite" url="dist/client/{R:1}"/^>
echo         ^</rule^>
echo         ^<rule name="DynamicContent"^>
echo           ^<match url="/*" /^>
echo           ^<action type="Rewrite" url="dist/index.js"/^>
echo         ^</rule^>
echo       ^</rules^>
echo     ^</rewrite^>
echo     ^<iisnode watchedFiles="web.config;*.js"/^>
echo     ^<directoryBrowse enabled="false" /^>
echo   ^</system.webServer^>
echo ^</configuration^>
) > web.config

REM Create application pool
echo Creating IIS application pool...
%windir%\system32\inetsrv\appcmd.exe add apppool /name:"JobManagerPool" /managedRuntimeVersion:""

REM Set application pool properties
%windir%\system32\inetsrv\appcmd.exe set apppool "JobManagerPool" /processModel.identityType:ApplicationPoolIdentity
%windir%\system32\inetsrv\appcmd.exe set apppool "JobManagerPool" /recycling.periodicRestart.time:00:00:00

REM Create application
echo Creating IIS application...
%windir%\system32\inetsrv\appcmd.exe add app /site.name:"Default Web Site" /path:/jobmanager /physicalPath:"%DEPLOY_DIR%"
%windir%\system32\inetsrv\appcmd.exe set app "Default Web Site/jobmanager" /applicationPool:"JobManagerPool"

REM Set environment variables
echo Configuring environment variables...
%windir%\system32\inetsrv\appcmd.exe set config -section:system.applicationHost/applicationPools /+"[name='JobManagerPool'].environmentVariables.[name='NODE_ENV',value='production']" /commit:apphost
%windir%\system32\inetsrv\appcmd.exe set config -section:system.applicationHost/applicationPools /+"[name='JobManagerPool'].environmentVariables.[name='DB_SERVER',value='localhost']" /commit:apphost
%windir%\system32\inetsrv\appcmd.exe set config -section:system.applicationHost/applicationPools /+"[name='JobManagerPool'].environmentVariables.[name='DB_NAME',value='JobDescriptionDB']" /commit:apphost

REM Set permissions
echo Setting file permissions...
icacls "%DEPLOY_DIR%" /grant "IIS_IUSRS:(OI)(CI)F" /T

REM Restart IIS
echo Restarting IIS...
iisreset

echo.
echo ======================================================
echo  Deployment completed successfully!
echo ======================================================
echo.
echo Application URL: http://localhost/jobmanager
echo.
echo Next steps:
echo 1. Configure SQL Server database using the provided scripts
echo 2. Update database connection settings in IIS Manager
echo 3. Configure Active Directory settings through the web interface
echo 4. Test the application
echo.
echo Database setup scripts:
echo - database-mssql-schema.sql (run first)
echo - database-mssql-sample-data.sql (run second)
echo.
pause