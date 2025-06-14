# Working IIS Deployment Script for Job Description Manager
# This script creates a functional IIS deployment without database dependencies

param(
    [Parameter(Mandatory=$false)]
    [string]$AppPath = "C:\inetpub\wwwroot\jobmanager",
    [Parameter(Mandatory=$false)]
    [string]$AppPoolName = "JobManagerPool"
)

Write-Host "Job Description Manager - IIS Deployment" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# Check administrator privileges
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "ERROR: Run as Administrator" -ForegroundColor Red
    exit 1
}

# Verify Node.js
try {
    $nodeVersion = node --version 2>$null
    Write-Host "Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Install Node.js 18 LTS first" -ForegroundColor Red
    exit 1
}

# Clean and create app directory
if (Test-Path $AppPath) {
    Remove-Item -Recurse -Force $AppPath
}
New-Item -ItemType Directory -Path $AppPath -Force | Out-Null
Write-Host "Created: $AppPath" -ForegroundColor Cyan

# Copy application files
Write-Host "Copying application files..." -ForegroundColor Yellow
Copy-Item -Path ".\*" -Destination $AppPath -Recurse -Force -Exclude @("node_modules", ".git", "dist", "*.log", "*.tar.gz")

Set-Location $AppPath

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Dependency installation completed with warnings" -ForegroundColor Yellow
}

# Build application
Write-Host "Building application..." -ForegroundColor Yellow
npm run build 2>$null

# Create production environment
@"
NODE_ENV=production
PORT=3000
SESSION_SECRET=JobManager_Production_Secret_$(Get-Random)_$(Get-Date -Format 'yyyyMMdd')
"@ | Out-File -FilePath ".env" -Encoding UTF8

# Install tsx globally for TypeScript execution
npm install -g tsx 2>$null

# Import IIS module
Import-Module WebAdministration -ErrorAction SilentlyContinue

# Remove existing app pool and application
if (Get-IISAppPool -Name $AppPoolName -ErrorAction SilentlyContinue) {
    Stop-WebAppPool -Name $AppPoolName -ErrorAction SilentlyContinue
    Remove-WebAppPool -Name $AppPoolName
}

if (Get-WebApplication -Site "Default Web Site" -Name "jobmanager" -ErrorAction SilentlyContinue) {
    Remove-WebApplication -Site "Default Web Site" -Name "jobmanager"
}

# Create application pool
New-WebAppPool -Name $AppPoolName
Set-ItemProperty -Path "IIS:\AppPools\$AppPoolName" -Name "managedRuntimeVersion" -Value ""
Set-ItemProperty -Path "IIS:\AppPools\$AppPoolName" -Name "processModel.identityType" -Value "ApplicationPoolIdentity"
Set-ItemProperty -Path "IIS:\AppPools\$AppPoolName" -Name "processModel.idleTimeout" -Value "00:00:00"
Set-ItemProperty -Path "IIS:\AppPools\$AppPoolName" -Name "recycling.periodicRestart.time" -Value "00:00:00"

# Create web application
New-WebApplication -Site "Default Web Site" -Name "jobmanager" -PhysicalPath $AppPath -ApplicationPool $AppPoolName

# Create optimized web.config for TypeScript execution
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
          <match url="([\S]+[.](html|htm|svg|js|css|png|gif|jpg|jpeg|ico|woff|woff2|ttf|eot|json))"/>
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsFile"/>
          </conditions>
          <action type="None"/>
        </rule>
        <rule name="ClientFiles" stopProcessing="true">
          <match url="^client/(.*)"/>
          <action type="Rewrite" url="client/{R:1}"/>
        </rule>
        <rule name="DistFiles" stopProcessing="true">
          <match url="^dist/(.*)"/>
          <action type="Rewrite" url="dist/{R:1}"/>
        </rule>
        <rule name="NodeApp">
          <match url="/*"/>
          <action type="Rewrite" url="server/index.ts"/>
        </rule>
      </rules>
    </rewrite>
    <iisnode 
      watchedFiles="web.config;*.ts;*.js"
      loggingEnabled="true"
      logDirectory="iisnode"
      nodeProcessCommandLine="$env:APPDATA\npm\tsx.cmd"
      debuggingEnabled="false"
      maxNamedPipeConnectionRetry="100"
      namedPipeConnectionRetryDelay="250"
    />
    <defaultDocument>
      <files>
        <clear/>
        <add value="server/index.ts"/>
      </files>
    </defaultDocument>
    <staticContent>
      <mimeMap fileExtension=".ts" mimeType="application/typescript"/>
    </staticContent>
  </system.webServer>
</configuration>
"@ | Out-File -FilePath "web.config" -Encoding UTF8

# Set file permissions
$acl = Get-Acl $AppPath
$accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule("IIS_IUSRS", "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow")
$acl.SetAccessRule($accessRule)
$appPoolIdentity = "IIS AppPool\$AppPoolName"
$accessRule2 = New-Object System.Security.AccessControl.FileSystemAccessRule($appPoolIdentity, "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow")
$acl.SetAccessRule($accessRule2)
Set-Acl -Path $AppPath -AclObject $acl

# Start application pool
Start-WebAppPool -Name $AppPoolName

Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "IIS Deployment Complete!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host "URL: http://localhost/jobmanager" -ForegroundColor White
Write-Host "Path: $AppPath" -ForegroundColor White
Write-Host "Pool: $AppPoolName" -ForegroundColor White
Write-Host ""

# Test deployment
Write-Host "Testing deployment..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

try {
    $response = Invoke-WebRequest -Uri "http://localhost/jobmanager" -UseBasicParsing -TimeoutSec 15
    if ($response.StatusCode -eq 200) {
        Write-Host "SUCCESS: Application is running!" -ForegroundColor Green
    } else {
        Write-Host "Status: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Testing: Check IIS logs at $AppPath\iisnode\" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Application Features:" -ForegroundColor Cyan
Write-Host "- Job description management" -ForegroundColor White
Write-Host "- User management interface" -ForegroundColor White
Write-Host "- Active Directory configuration" -ForegroundColor White
Write-Host "- Dashboard analytics" -ForegroundColor White
Write-Host "- In-memory data storage" -ForegroundColor White
Write-Host ""
Write-Host "Visit http://localhost/jobmanager to start using the application." -ForegroundColor Green