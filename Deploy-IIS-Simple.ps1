# Simple IIS Deployment - Fixed web.config syntax
param(
    [string]$AppPath = "C:\inetpub\wwwroot\jobmanager",
    [string]$AppPoolName = "JobManagerPool"
)

Write-Host "Job Description Manager - Simple IIS Deployment" -ForegroundColor Green

# Check admin
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "ERROR: Run as Administrator" -ForegroundColor Red
    exit 1
}

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Install Node.js from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Clean install
if (Test-Path $AppPath) {
    Remove-Item -Recurse -Force $AppPath
}
New-Item -ItemType Directory -Path $AppPath -Force | Out-Null

# Copy files
Copy-Item -Path "." -Destination $AppPath -Recurse -Force -Exclude "node_modules", ".git", "*.log"
Set-Location $AppPath

# Install and build
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install --silent
Write-Host "Building application..." -ForegroundColor Yellow
npm run build

# Environment
@"
NODE_ENV=production
PORT=3000
SESSION_SECRET=JobManager_$(Get-Random)
"@ | Out-File -FilePath ".env" -Encoding UTF8

# Fixed web.config
Write-Host "Creating web.config..." -ForegroundColor Yellow
@'
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <handlers>
      <add name="iisnode" path="dist/index.js" verb="*" modules="iisnode"/>
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
        <rule name="NodeApp">
          <match url="/*"/>
          <action type="Rewrite" url="dist/index.js"/>
        </rule>
      </rules>
    </rewrite>
    <iisnode watchedFiles="web.config;*.js" loggingEnabled="true" logDirectory="iisnode"/>
    <defaultDocument>
      <files>
        <clear/>
        <add value="dist/index.js"/>
      </files>
    </defaultDocument>
  </system.webServer>
</configuration>
'@ | Out-File -FilePath "web.config" -Encoding UTF8

# IIS setup
Import-Module WebAdministration -ErrorAction SilentlyContinue

# Remove existing
try {
    Stop-WebAppPool -Name $AppPoolName -ErrorAction SilentlyContinue
    Remove-WebAppPool -Name $AppPoolName -ErrorAction SilentlyContinue
    Remove-WebApplication -Site "Default Web Site" -Name "jobmanager" -ErrorAction SilentlyContinue
} catch {}

# Create app pool
Write-Host "Creating application pool..." -ForegroundColor Yellow
New-WebAppPool -Name $AppPoolName
Set-ItemProperty -Path "IIS:\AppPools\$AppPoolName" -Name "managedRuntimeVersion" -Value ""
Set-ItemProperty -Path "IIS:\AppPools\$AppPoolName" -Name "processModel.identityType" -Value "ApplicationPoolIdentity"

# Create application
Write-Host "Creating web application..." -ForegroundColor Yellow
New-WebApplication -Site "Default Web Site" -Name "jobmanager" -PhysicalPath $AppPath -ApplicationPool $AppPoolName

# Permissions
$acl = Get-Acl $AppPath
$accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule("IIS_IUSRS", "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow")
$acl.SetAccessRule($accessRule)
Set-Acl -Path $AppPath -AclObject $acl

# Start
Start-WebAppPool -Name $AppPoolName

Write-Host ""
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "URL: http://localhost/jobmanager" -ForegroundColor White
Write-Host "Path: $AppPath" -ForegroundColor White
Write-Host ""
Write-Host "If you get errors, check:" -ForegroundColor Yellow
Write-Host "1. IISNode is installed" -ForegroundColor White
Write-Host "2. URL Rewrite module is installed" -ForegroundColor White
Write-Host "3. Check logs in: $AppPath\iisnode\" -ForegroundColor White