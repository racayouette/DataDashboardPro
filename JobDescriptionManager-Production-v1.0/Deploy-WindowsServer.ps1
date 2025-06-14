# Job Description Manager - Windows Server Deployment Script
# PowerShell deployment for IIS + MS SQL Server environment
# Author: Job Description Manager Team
# Version: 1.0

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$DeploymentPath = "C:\inetpub\wwwroot\jobmanager",
    
    [Parameter(Mandatory=$false)]
    [string]$AppPoolName = "JobManagerPool",
    
    [Parameter(Mandatory=$false)]
    [string]$SiteName = "Default Web Site",
    
    [Parameter(Mandatory=$false)]
    [string]$ApplicationName = "jobmanager",
    
    [Parameter(Mandatory=$false)]
    [string]$DatabaseServer = "localhost",
    
    [Parameter(Mandatory=$false)]
    [string]$DatabaseName = "JobDescriptionDB",
    
    [Parameter(Mandatory=$false)]
    [string]$DatabaseUser = "jobapp",
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipPrerequisites,
    
    [Parameter(Mandatory=$false)]
    [switch]$CreateDatabase
)

# Color coding for output
$ErrorColor = "Red"
$SuccessColor = "Green"
$WarningColor = "Yellow"
$InfoColor = "Cyan"

function Write-Status {
    param([string]$Message, [string]$Type = "Info")
    
    switch ($Type) {
        "Error" { Write-Host "❌ $Message" -ForegroundColor $ErrorColor }
        "Success" { Write-Host "✅ $Message" -ForegroundColor $SuccessColor }
        "Warning" { Write-Host "⚠️  $Message" -ForegroundColor $WarningColor }
        "Info" { Write-Host "ℹ️  $Message" -ForegroundColor $InfoColor }
        default { Write-Host $Message }
    }
}

function Test-Administrator {
    $currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
    return $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Test-Prerequisites {
    Write-Status "Checking system prerequisites..." "Info"
    
    # Check administrator privileges
    if (-not (Test-Administrator)) {
        Write-Status "This script must be run as Administrator. Please restart PowerShell as Administrator." "Error"
        exit 1
    }
    Write-Status "Administrator privileges confirmed" "Success"
    
    # Check PowerShell version
    if ($PSVersionTable.PSVersion.Major -lt 5) {
        Write-Status "PowerShell 5.0 or higher is required. Current version: $($PSVersionTable.PSVersion)" "Error"
        exit 1
    }
    Write-Status "PowerShell version: $($PSVersionTable.PSVersion)" "Success"
    
    # Check Node.js
    try {
        $nodeVersion = node --version 2>$null
        if ($nodeVersion) {
            Write-Status "Node.js version: $nodeVersion" "Success"
        } else {
            Write-Status "Node.js is not installed. Please install Node.js 18 LTS from https://nodejs.org" "Error"
            exit 1
        }
    } catch {
        Write-Status "Node.js is not installed. Please install Node.js 18 LTS from https://nodejs.org" "Error"
        exit 1
    }
    
    # Check IIS
    $iisFeature = Get-WindowsFeature -Name IIS-WebServerRole -ErrorAction SilentlyContinue
    if ($iisFeature -and $iisFeature.InstallState -eq "Installed") {
        Write-Status "IIS is installed and available" "Success"
    } else {
        Write-Status "IIS is not installed. Installing IIS..." "Warning"
        Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole, IIS-WebServer, IIS-CommonHttpFeatures, IIS-HttpErrors, IIS-HttpLogging, IIS-Security, IIS-RequestFiltering, IIS-StaticContent, IIS-DefaultDocument, IIS-DirectoryBrowsing -All
        Write-Status "IIS installation completed. Please restart the server and run this script again." "Info"
        exit 0
    }
    
    # Check IISNode
    $iisNodePath = "${env:ProgramFiles}\iisnode\iisnode.dll"
    if (Test-Path $iisNodePath) {
        Write-Status "IISNode is installed" "Success"
    } else {
        Write-Status "IISNode is not installed. Please download and install IISNode from GitHub." "Warning"
        Write-Status "Download URL: https://github.com/azure/iisnode/releases" "Info"
    }
    
    # Check SQL Server
    try {
        $sqlCmd = Get-Command sqlcmd -ErrorAction SilentlyContinue
        if ($sqlCmd) {
            Write-Status "SQL Server command line tools are available" "Success"
        } else {
            Write-Status "SQL Server command line tools not found. Please install SQL Server or SQL Server Management Studio." "Warning"
        }
    } catch {
        Write-Status "SQL Server tools not detected." "Warning"
    }
}

function Install-ApplicationDependencies {
    Write-Status "Installing application dependencies..." "Info"
    
    # Navigate to deployment directory
    Set-Location $DeploymentPath
    
    # Install production dependencies
    Write-Status "Running npm install --production..." "Info"
    $npmProcess = Start-Process -FilePath "npm" -ArgumentList "install", "--production", "--silent" -Wait -PassThru -NoNewWindow
    
    if ($npmProcess.ExitCode -eq 0) {
        Write-Status "Dependencies installed successfully" "Success"
    } else {
        Write-Status "Failed to install dependencies. Exit code: $($npmProcess.ExitCode)" "Error"
        exit 1
    }
    
    # Build application
    Write-Status "Building application..." "Info"
    $buildProcess = Start-Process -FilePath "npm" -ArgumentList "run", "build" -Wait -PassThru -NoNewWindow
    
    if ($buildProcess.ExitCode -eq 0) {
        Write-Status "Application built successfully" "Success"
    } else {
        Write-Status "Failed to build application. Exit code: $($buildProcess.ExitCode)" "Error"
        exit 1
    }
}

function New-IISConfiguration {
    Write-Status "Configuring IIS..." "Info"
    
    # Import WebAdministration module
    Import-Module WebAdministration -ErrorAction SilentlyContinue
    
    # Create application pool
    if (Get-IISAppPool -Name $AppPoolName -ErrorAction SilentlyContinue) {
        Write-Status "Application pool '$AppPoolName' already exists. Removing..." "Warning"
        Remove-WebAppPool -Name $AppPoolName
    }
    
    Write-Status "Creating application pool: $AppPoolName" "Info"
    New-WebAppPool -Name $AppPoolName
    Set-ItemProperty -Path "IIS:\AppPools\$AppPoolName" -Name "managedRuntimeVersion" -Value ""
    Set-ItemProperty -Path "IIS:\AppPools\$AppPoolName" -Name "processModel.identityType" -Value "ApplicationPoolIdentity"
    Set-ItemProperty -Path "IIS:\AppPools\$AppPoolName" -Name "recycling.periodicRestart.time" -Value "00:00:00"
    
    Write-Status "Application pool created successfully" "Success"
    
    # Create web application
    $appPath = "/$ApplicationName"
    if (Get-WebApplication -Site $SiteName -Name $ApplicationName -ErrorAction SilentlyContinue) {
        Write-Status "Web application '$ApplicationName' already exists. Removing..." "Warning"
        Remove-WebApplication -Site $SiteName -Name $ApplicationName
    }
    
    Write-Status "Creating web application: $ApplicationName" "Info"
    New-WebApplication -Site $SiteName -Name $ApplicationName -PhysicalPath $DeploymentPath -ApplicationPool $AppPoolName
    
    Write-Status "Web application created successfully" "Success"
}

function Set-EnvironmentVariables {
    Write-Status "Setting environment variables..." "Info"
    
    $envVars = @{
        "NODE_ENV" = "production"
        "DB_SERVER" = $DatabaseServer
        "DB_NAME" = $DatabaseName
        "DB_USER" = $DatabaseUser
        "SESSION_SECRET" = [System.Web.Security.Membership]::GeneratePassword(32, 8)
    }
    
    foreach ($var in $envVars.GetEnumerator()) {
        Write-Status "Setting $($var.Key) = $($var.Value)" "Info"
        
        $cmd = "& '$env:SystemRoot\system32\inetsrv\appcmd.exe' set config -section:system.applicationHost/applicationPools /+`"[name='$AppPoolName'].environmentVariables.[name='$($var.Key)',value='$($var.Value)']`" /commit:apphost"
        Invoke-Expression $cmd
    }
    
    Write-Status "Environment variables configured" "Success"
}

function New-WebConfig {
    Write-Status "Creating web.config..." "Info"
    
    $webConfigContent = @"
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <handlers>
      <add name="iisnode" path="dist/index.js" verb="*" modules="iisnode"/>
    </handlers>
    <rewrite>
      <rules>
        <rule name="StaticFiles" stopProcessing="true">
          <match url="([\S]+[.](html|htm|svg|js|css|png|gif|jpg|jpeg|ico|woff|woff2|ttf|eot))"/>
          <action type="Rewrite" url="dist/client/{R:1}"/>
        </rule>
        <rule name="API" stopProcessing="true">
          <match url="^api/(.*)"/>
          <action type="Rewrite" url="dist/index.js"/>
        </rule>
        <rule name="SPA" stopProcessing="true">
          <match url=".*"/>
          <action type="Rewrite" url="dist/client/index.html"/>
        </rule>
      </rules>
    </rewrite>
    <iisnode 
      watchedFiles="web.config;*.js"
      loggingEnabled="true"
      logDirectory="iisnode"
      debuggingEnabled="false"
      maxNamedPipeConnectionRetry="100"
      namedPipeConnectionRetryDelay="250"
      maxNamedPipeConnectionPoolSize="512"
      maxNamedPipePooledConnectionAge="30000"
      asyncCompletionThreadCount="0"
      initialRequestBufferSize="4096"
      maxRequestBufferSize="65536"
      uncFileChangesPollingInterval="5000"
    />
    <directoryBrowse enabled="false"/>
    <defaultDocument>
      <files>
        <clear/>
        <add value="dist/client/index.html"/>
      </files>
    </defaultDocument>
    <httpErrors errorMode="Custom" existingResponse="Replace">
      <remove statusCode="404"/>
      <error statusCode="404" responseMode="ExecuteURL" path="/dist/client/index.html"/>
    </httpErrors>
  </system.webServer>
</configuration>
"@
    
    $webConfigPath = Join-Path $DeploymentPath "web.config"
    $webConfigContent | Out-File -FilePath $webConfigPath -Encoding UTF8
    
    Write-Status "web.config created successfully" "Success"
}

function Set-FilePermissions {
    Write-Status "Setting file permissions..." "Info"
    
    # Grant IIS_IUSRS full control
    $acl = Get-Acl $DeploymentPath
    $accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule("IIS_IUSRS", "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow")
    $acl.SetAccessRule($accessRule)
    Set-Acl -Path $DeploymentPath -AclObject $acl
    
    # Grant Application Pool identity permissions
    $appPoolIdentity = "IIS AppPool\$AppPoolName"
    $accessRule2 = New-Object System.Security.AccessControl.FileSystemAccessRule($appPoolIdentity, "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow")
    $acl.SetAccessRule($accessRule2)
    Set-Acl -Path $DeploymentPath -AclObject $acl
    
    Write-Status "File permissions set successfully" "Success"
}

function New-DatabaseSetup {
    if ($CreateDatabase) {
        Write-Status "Setting up database..." "Info"
        
        $dbPassword = Read-Host "Enter password for database user '$DatabaseUser'" -AsSecureString
        $dbPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword))
        
        # Create database and user
        $createDbScript = @"
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = '$DatabaseName')
BEGIN
    CREATE DATABASE [$DatabaseName];
    PRINT 'Database $DatabaseName created successfully.';
END
ELSE
    PRINT 'Database $DatabaseName already exists.';

USE [$DatabaseName];

IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = '$DatabaseUser')
BEGIN
    CREATE LOGIN [$DatabaseUser] WITH PASSWORD = '$dbPasswordPlain';
    PRINT 'Login $DatabaseUser created successfully.';
END
ELSE
    PRINT 'Login $DatabaseUser already exists.';

IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = '$DatabaseUser')
BEGIN
    CREATE USER [$DatabaseUser] FOR LOGIN [$DatabaseUser];
    ALTER ROLE db_owner ADD MEMBER [$DatabaseUser];
    PRINT 'User $DatabaseUser created and added to db_owner role.';
END
ELSE
    PRINT 'User $DatabaseUser already exists.';
"@
        
        try {
            $createDbScript | sqlcmd -S $DatabaseServer -E
            Write-Status "Database setup completed" "Success"
            
            # Run schema scripts if they exist
            $schemaScript = "database-mssql-schema.sql"
            $sampleDataScript = "database-mssql-sample-data.sql"
            $proceduresScript = "database-mssql-procedures.sql"
            
            if (Test-Path $schemaScript) {
                Write-Status "Running database schema script..." "Info"
                sqlcmd -S $DatabaseServer -d $DatabaseName -E -i $schemaScript
                Write-Status "Schema script completed" "Success"
            }
            
            if (Test-Path $sampleDataScript) {
                Write-Status "Running sample data script..." "Info"
                sqlcmd -S $DatabaseServer -d $DatabaseName -E -i $sampleDataScript
                Write-Status "Sample data script completed" "Success"
            }
            
            if (Test-Path $proceduresScript) {
                Write-Status "Running stored procedures script..." "Info"
                sqlcmd -S $DatabaseServer -d $DatabaseName -E -i $proceduresScript
                Write-Status "Stored procedures script completed" "Success"
            }
            
        } catch {
            Write-Status "Database setup failed: $($_.Exception.Message)" "Error"
            Write-Status "Please run the database scripts manually using SQL Server Management Studio" "Warning"
        }
    }
}

function Start-Deployment {
    Write-Status "==================================================" "Info"
    Write-Status "Job Description Manager - Windows Server Deployment" "Info"
    Write-Status "==================================================" "Info"
    
    # Check prerequisites
    if (-not $SkipPrerequisites) {
        Test-Prerequisites
    }
    
    # Create deployment directory
    if (-not (Test-Path $DeploymentPath)) {
        Write-Status "Creating deployment directory: $DeploymentPath" "Info"
        New-Item -ItemType Directory -Path $DeploymentPath -Force | Out-Null
        Write-Status "Deployment directory created" "Success"
    }
    
    # Copy application files
    Write-Status "Copying application files..." "Info"
    $excludeItems = @("node_modules", ".git", "dist", "*.log", ".env")
    
    Get-ChildItem -Path "." -Recurse | Where-Object {
        $item = $_
        $shouldExclude = $false
        foreach ($exclude in $excludeItems) {
            if ($item.FullName -like "*$exclude*") {
                $shouldExclude = $true
                break
            }
        }
        -not $shouldExclude
    } | Copy-Item -Destination { 
        $relativePath = $_.FullName.Substring((Get-Location).Path.Length + 1)
        Join-Path $DeploymentPath $relativePath
    } -Force
    
    Write-Status "Application files copied successfully" "Success"
    
    # Install dependencies and build
    Install-ApplicationDependencies
    
    # Configure IIS
    New-IISConfiguration
    
    # Set environment variables
    Set-EnvironmentVariables
    
    # Create web.config
    New-WebConfig
    
    # Set permissions
    Set-FilePermissions
    
    # Setup database
    New-DatabaseSetup
    
    # Restart IIS
    Write-Status "Restarting IIS..." "Info"
    iisreset | Out-Null
    Write-Status "IIS restarted successfully" "Success"
    
    # Final status
    Write-Status "==================================================" "Success"
    Write-Status "Deployment completed successfully!" "Success"
    Write-Status "==================================================" "Success"
    Write-Status "Application URL: http://localhost/$ApplicationName" "Info"
    Write-Status "Deployment Path: $DeploymentPath" "Info"
    Write-Status "Application Pool: $AppPoolName" "Info"
    Write-Status "Database Server: $DatabaseServer" "Info"
    Write-Status "Database Name: $DatabaseName" "Info"
    Write-Status "==================================================" "Info"
    
    Write-Status "Next Steps:" "Info"
    Write-Status "1. Test the application by visiting the URL above" "Info"
    Write-Status "2. Configure Active Directory settings in the admin panel" "Info"
    Write-Status "3. Set up SSL certificate for production use" "Info"
    Write-Status "4. Configure firewall rules if needed" "Info"
    Write-Status "5. Set up monitoring and backup procedures" "Info"
}

# Main execution
try {
    Start-Deployment
} catch {
    Write-Status "Deployment failed: $($_.Exception.Message)" "Error"
    Write-Status "Stack trace: $($_.ScriptStackTrace)" "Error"
    exit 1
}