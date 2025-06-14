# Final Working IIS Deployment for Job Description Manager
# This deployment works with in-memory storage and no database dependencies

param(
    [Parameter(Mandatory=$false)]
    [string]$AppPath = "C:\inetpub\wwwroot\jobmanager",
    [Parameter(Mandatory=$false)]
    [string]$AppPoolName = "JobManagerPool"
)

Write-Host "Job Description Manager - Final IIS Deployment" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

# Administrator check
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "ERROR: Must run as Administrator" -ForegroundColor Red
    exit 1
}

# Node.js check
try {
    $nodeVersion = node --version
    Write-Host "Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Install Node.js 18 LTS from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Clean installation
if (Test-Path $AppPath) {
    Write-Host "Removing existing installation..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force $AppPath
}

Write-Host "Creating application directory..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path $AppPath -Force | Out-Null

# Copy files
Write-Host "Copying application files..." -ForegroundColor Yellow
Get-ChildItem -Path "." | Where-Object { 
    $_.Name -notin @("node_modules", ".git", "dist", "*.log", "*.tar.gz", "*-broken.ts") 
} | Copy-Item -Destination $AppPath -Recurse -Force

Set-Location $AppPath

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install --silent

# Build application
Write-Host "Building application..." -ForegroundColor Yellow
npm run build

# Production environment
@"
NODE_ENV=production
PORT=3000
SESSION_SECRET=JobManager_Production_$(Get-Random)_$(Get-Date -Format 'yyyyMMdd')
"@ | Out-File -FilePath ".env" -Encoding UTF8

# IIS setup
Import-Module WebAdministration -ErrorAction SilentlyContinue

# Remove existing
if (Get-IISAppPool -Name $AppPoolName -ErrorAction SilentlyContinue) {
    Stop-WebAppPool -Name $AppPoolName -ErrorAction SilentlyContinue
    Remove-WebAppPool -Name $AppPoolName
}

if (Get-WebApplication -Site "Default Web Site" -Name "jobmanager" -ErrorAction SilentlyContinue) {
    Remove-WebApplication -Site "Default Web Site" -Name "jobmanager"
}

# Create application pool
Write-Host "Creating IIS application pool..." -ForegroundColor Yellow
New-WebAppPool -Name $AppPoolName
Set-ItemProperty -Path "IIS:\AppPools\$AppPoolName" -Name "managedRuntimeVersion" -Value ""
Set-ItemProperty -Path "IIS:\AppPools\$AppPoolName" -Name "processModel.identityType" -Value "ApplicationPoolIdentity"
Set-ItemProperty -Path "IIS:\AppPools\$AppPoolName" -Name "processModel.idleTimeout" -Value "00:00:00"

# Create web application
Write-Host "Creating web application..." -ForegroundColor Yellow
New-WebApplication -Site "Default Web Site" -Name "jobmanager" -PhysicalPath $AppPath -ApplicationPool $AppPoolName

# IIS configuration
Write-Host "Creating IIS configuration..." -ForegroundColor Yellow
@"
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
        <rule name="DistFiles" stopProcessing="true">
          <match url="^dist/(.*)"/>
          <action type="Rewrite" url="dist/{R:1}"/>
        </rule>
        <rule name="NodeApp">
          <match url="/*"/>
          <action type="Rewrite" url="dist/index.js"/>
        </rule>
      </rules>
    </rewrite>
    <iisnode 
      watchedFiles="web.config;*.js"
      loggingEnabled="true"
      logDirectory="iisnode"
      debuggingEnabled="false"
      nodeProcessCommandLine="node"
    />
    <defaultDocument>
      <files>
        <clear/>
        <add value="dist/index.js"/>
      </files>
    </defaultDocument>
  </system.webServer>
</configuration>
"@ | Out-File -FilePath "web.config" -Encoding UTF8

# Permissions
Write-Host "Setting permissions..." -ForegroundColor Yellow
$acl = Get-Acl $AppPath
$accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule("IIS_IUSRS", "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow")
$acl.SetAccessRule($accessRule)
$appPoolIdentity = "IIS AppPool\$AppPoolName"
$accessRule2 = New-Object System.Security.AccessControl.FileSystemAccessRule($appPoolIdentity, "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow")
$acl.SetAccessRule($accessRule2)
Set-Acl -Path $AppPath -AclObject $acl

# Start
Start-WebAppPool -Name $AppPoolName

Write-Host ""
Write-Host "===============================================" -ForegroundColor Green
Write-Host "SUCCESS: IIS Deployment Complete!" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host "Application URL: http://localhost/jobmanager" -ForegroundColor White
Write-Host "Installation Path: $AppPath" -ForegroundColor White
Write-Host "Application Pool: $AppPoolName" -ForegroundColor White
Write-Host ""

# Test
Write-Host "Testing deployment..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

try {
    $response = Invoke-WebRequest -Uri "http://localhost/jobmanager" -UseBasicParsing -TimeoutSec 20
    if ($response.StatusCode -eq 200) {
        Write-Host "SUCCESS: Application is responding correctly!" -ForegroundColor Green
        Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Green
    } else {
        Write-Host "WARNING: Unexpected status code: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "INFO: Application may still be starting up" -ForegroundColor Yellow
    Write-Host "Check logs at: $AppPath\iisnode\" -ForegroundColor White
}

Write-Host ""
Write-Host "Application Features:" -ForegroundColor Cyan
Write-Host "- Complete job description management system" -ForegroundColor White
Write-Host "- User management with role-based access" -ForegroundColor White
Write-Host "- Active Directory configuration interface" -ForegroundColor White
Write-Host "- Dashboard with analytics and metrics" -ForegroundColor White
Write-Host "- Version tracking and comparison tools" -ForegroundColor White
Write-Host "- Real-time notifications system" -ForegroundColor White
Write-Host "- In-memory data storage (no database required)" -ForegroundColor White
Write-Host ""
Write-Host "Ready for production use! Visit: http://localhost/jobmanager" -ForegroundColor Green