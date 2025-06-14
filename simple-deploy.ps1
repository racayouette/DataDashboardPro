# Simple Working Deployment Script for Job Description Manager
# This script creates a working production deployment

param(
    [Parameter(Mandatory=$false)]
    [string]$AppPath = "C:\inetpub\wwwroot\jobmanager",
    [Parameter(Mandatory=$false)]
    [string]$AppPoolName = "JobManagerPool",
    [Parameter(Mandatory=$false)]
    [string]$Port = "3000"
)

Write-Host "Job Description Manager - Simple Deployment" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green

# Check if running as administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "ERROR: Please run as Administrator" -ForegroundColor Red
    exit 1
}

# Check Node.js
try {
    $nodeVersion = node --version 2>$null
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js not found. Please install Node.js 18 LTS" -ForegroundColor Red
    exit 1
}

# Create application directory
Write-Host "Creating application directory..." -ForegroundColor Yellow
if (Test-Path $AppPath) {
    Remove-Item -Recurse -Force $AppPath
}
New-Item -ItemType Directory -Path $AppPath -Force | Out-Null

# Copy application files
Write-Host "Copying application files..." -ForegroundColor Yellow
Copy-Item -Path ".\*" -Destination $AppPath -Recurse -Force -Exclude @("node_modules", ".git", "dist", "*.log")

# Navigate to app directory
Set-Location $AppPath

# Create production environment file
Write-Host "Creating production configuration..." -ForegroundColor Yellow
@"
NODE_ENV=production
PORT=$Port
SESSION_SECRET=JobManager_$(Get-Random)_ProductionSecret_$(Get-Date -Format 'yyyyMMdd')
"@ | Out-File -FilePath ".env" -Encoding UTF8

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
try {
    npm install --production 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Installing all dependencies..." -ForegroundColor Yellow
        npm install
    }
} catch {
    Write-Host "WARNING: Some dependencies may not have installed correctly" -ForegroundColor Yellow
}

# Build application
Write-Host "Building application..." -ForegroundColor Yellow
try {
    npm run build
} catch {
    Write-Host "WARNING: Build step failed, using existing files" -ForegroundColor Yellow
}

# Import IIS module
Import-Module WebAdministration -ErrorAction SilentlyContinue

# Stop existing app pool if it exists
if (Get-IISAppPool -Name $AppPoolName -ErrorAction SilentlyContinue) {
    Write-Host "Stopping existing application pool..." -ForegroundColor Yellow
    Stop-WebAppPool -Name $AppPoolName
    Remove-WebAppPool -Name $AppPoolName
}

# Create new application pool
Write-Host "Creating IIS application pool..." -ForegroundColor Yellow
New-WebAppPool -Name $AppPoolName
Set-ItemProperty -Path "IIS:\AppPools\$AppPoolName" -Name "managedRuntimeVersion" -Value ""
Set-ItemProperty -Path "IIS:\AppPools\$AppPoolName" -Name "processModel.identityType" -Value "ApplicationPoolIdentity"

# Remove existing application if it exists
if (Get-WebApplication -Site "Default Web Site" -Name "jobmanager" -ErrorAction SilentlyContinue) {
    Remove-WebApplication -Site "Default Web Site" -Name "jobmanager"
}

# Create web application
Write-Host "Creating IIS application..." -ForegroundColor Yellow
New-WebApplication -Site "Default Web Site" -Name "jobmanager" -PhysicalPath $AppPath -ApplicationPool $AppPoolName

# Create simplified web.config
Write-Host "Creating IIS configuration..." -ForegroundColor Yellow
@"
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <handlers>
      <add name="iisnode" path="server/index.ts" verb="*" modules="iisnode"/>
    </handlers>
    <rewrite>
      <rules>
        <rule name="StaticFiles" stopProcessing="true">
          <match url="([\S]+[.](html|htm|svg|js|css|png|gif|jpg|jpeg|ico|woff|woff2|ttf|eot))"/>
          <action type="Rewrite" url="client/dist/{R:1}"/>
        </rule>
        <rule name="DynamicContent">
          <match url="/*" />
          <action type="Rewrite" url="server/index.ts"/>
        </rule>
      </rules>
    </rewrite>
    <iisnode 
      watchedFiles="web.config;*.ts;*.js"
      loggingEnabled="true"
      logDirectory="iisnode"
      nodeProcessCommandLine="node --loader tsx/esm"
    />
  </system.webServer>
</configuration>
"@ | Out-File -FilePath "web.config" -Encoding UTF8

# Set permissions
Write-Host "Setting file permissions..." -ForegroundColor Yellow
$acl = Get-Acl $AppPath
$accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule("IIS_IUSRS", "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow")
$acl.SetAccessRule($accessRule)
$appPoolIdentity = "IIS AppPool\$AppPoolName"
$accessRule2 = New-Object System.Security.AccessControl.FileSystemAccessRule($appPoolIdentity, "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow")
$acl.SetAccessRule($accessRule2)
Set-Acl -Path $AppPath -AclObject $acl

# Start application pool
Write-Host "Starting application..." -ForegroundColor Yellow
Start-WebAppPool -Name $AppPoolName

# Final status
Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "Deployment completed!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host "Application URL: http://localhost/jobmanager" -ForegroundColor White
Write-Host "Application Path: $AppPath" -ForegroundColor White
Write-Host "Application Pool: $AppPoolName" -ForegroundColor White
Write-Host ""
Write-Host "The application is now running with in-memory storage." -ForegroundColor Yellow
Write-Host "For production use, configure a PostgreSQL database." -ForegroundColor Yellow
Write-Host ""
Write-Host "Logs can be found in: $AppPath\iisnode\" -ForegroundColor White
Write-Host ""

# Test the deployment
Write-Host "Testing deployment..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
try {
    $response = Invoke-WebRequest -Uri "http://localhost/jobmanager" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "SUCCESS: Application is responding!" -ForegroundColor Green
    } else {
        Write-Host "WARNING: Application returned status code $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "WARNING: Could not test application - check IIS logs" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Deployment complete. Visit http://localhost/jobmanager to access the application." -ForegroundColor Green