# Create Production Deployment Package
# This script packages all necessary files for Windows Server deployment

$packageName = "JobDescriptionManager-Production-v1.0"
$packageDir = ".\$packageName"
$zipFile = "$packageName.zip"

Write-Host "Creating production deployment package..." -ForegroundColor Green

# Create package directory
if (Test-Path $packageDir) {
    Remove-Item -Recurse -Force $packageDir
}
New-Item -ItemType Directory -Path $packageDir | Out-Null

# Copy essential files
$filesToCopy = @(
    "Deploy-WindowsServer.ps1",
    "deploy.cmd",
    "web.config",
    "package.json",
    "package-lock.json",
    "tsconfig.json",
    "vite.config.ts",
    "tailwind.config.ts",
    "postcss.config.js",
    "components.json",
    "database-mssql-schema.sql",
    "database-mssql-sample-data.sql",
    "database-mssql-procedures.sql",
    "WINDOWS_SERVER_DEPLOYMENT_GUIDE.md",
    "PRODUCTION_DEPLOYMENT_README.md"
)

foreach ($file in $filesToCopy) {
    if (Test-Path $file) {
        Copy-Item $file $packageDir -Force
        Write-Host "✓ Copied $file" -ForegroundColor Cyan
    }
}

# Copy directories
$dirsToTopy = @("client", "server", "shared")
foreach ($dir in $dirsToTopy) {
    if (Test-Path $dir) {
        Copy-Item -Recurse $dir $packageDir -Force
        Write-Host "✓ Copied $dir directory" -ForegroundColor Cyan
    }
}

# Create dist directory with build files if they exist
if (Test-Path "dist") {
    Copy-Item -Recurse "dist" $packageDir -Force
    Write-Host "✓ Copied dist directory (production build)" -ForegroundColor Cyan
} else {
    Write-Host "⚠ No dist directory found - production build may be needed" -ForegroundColor Yellow
}

# Create installation script
$installScript = @"
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
"@

$installScript | Out-File -FilePath "$packageDir\INSTALL.cmd" -Encoding ASCII

# Create package info file
$packageInfo = @"
Job Description Manager - Production Deployment Package
======================================================

Package Version: 1.0
Build Date: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Target Environment: Windows Server + IIS + MS SQL Server

Contents:
- Production-ready application code
- Automated PowerShell deployment script
- Database schema and sample data
- IIS configuration files
- Comprehensive documentation
- Installation guides and troubleshooting

System Requirements:
- Windows Server 2016/2019/2022
- IIS 10.0 or higher
- SQL Server 2016 or higher
- Node.js 18 LTS
- 4GB RAM minimum (8GB recommended)
- 10GB free disk space

Quick Installation:
1. Extract package to server
2. Run Deploy-WindowsServer.ps1 as Administrator
3. Follow post-deployment configuration steps

For support, contact your system administrator.
"@

$packageInfo | Out-File -FilePath "$packageDir\PACKAGE-INFO.txt" -Encoding UTF8

Write-Host "✓ Created installation files" -ForegroundColor Cyan

# Create the zip file
if (Test-Path $zipFile) {
    Remove-Item $zipFile -Force
}

Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($packageDir, $zipFile)

Write-Host "✓ Created deployment package: $zipFile" -ForegroundColor Green

# Clean up temporary directory
Remove-Item -Recurse -Force $packageDir

Write-Host ""
Write-Host "======================================================" -ForegroundColor Green
Write-Host "Production deployment package created successfully!" -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Green
Write-Host "Package file: $zipFile" -ForegroundColor White
Write-Host "Size: $([math]::Round((Get-Item $zipFile).Length / 1MB, 2)) MB" -ForegroundColor White
Write-Host ""
Write-Host "This package contains:" -ForegroundColor Yellow
Write-Host "• Complete application source code" -ForegroundColor White
Write-Host "• Automated deployment scripts" -ForegroundColor White
Write-Host "• Database setup files" -ForegroundColor White
Write-Host "• IIS configuration" -ForegroundColor White
Write-Host "• Production documentation" -ForegroundColor White
Write-Host "• Installation guides" -ForegroundColor White
Write-Host ""
Write-Host "Ready for production deployment!" -ForegroundColor Green