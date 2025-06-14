# Azure Deployment Script for Job Description Manager (PowerShell)
Write-Host "Starting Azure deployment for Job Description Manager..." -ForegroundColor Green

# Configuration variables
$resourceGroup = "job-description-rg"
$appName = "job-description-manager-$(Get-Date -Format 'yyyyMMddHHmmss')"
$location = "eastus"
$appServicePlan = "job-description-plan"
$databaseServer = "job-description-db-server-$(Get-Random -Maximum 9999)"
$databaseName = "jobdescriptiondb"
$adminUser = "dbadmin"

# Check if Azure CLI is installed
try {
    az --version | Out-Null
} catch {
    Write-Error "Azure CLI is not installed. Please install it first."
    exit 1
}

# Login to Azure (if not already logged in)
Write-Host "Checking Azure login status..." -ForegroundColor Yellow
try {
    az account show | Out-Null
} catch {
    Write-Host "Please log in to Azure..." -ForegroundColor Yellow
    az login
}

# Create resource group
Write-Host "Creating resource group: $resourceGroup" -ForegroundColor Blue
az group create --name $resourceGroup --location $location

# Create App Service plan
Write-Host "Creating App Service plan: $appServicePlan" -ForegroundColor Blue
az appservice plan create `
    --name $appServicePlan `
    --resource-group $resourceGroup `
    --sku B1 `
    --is-linux

# Create web app
Write-Host "Creating web app: $appName" -ForegroundColor Blue
az webapp create `
    --resource-group $resourceGroup `
    --plan $appServicePlan `
    --name $appName `
    --runtime "NODE|18-lts"

# Create PostgreSQL server
Write-Host "Creating PostgreSQL server: $databaseServer" -ForegroundColor Blue
$dbPassword = Read-Host "Enter database admin password" -AsSecureString
$dbPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword))

az postgres server create `
    --resource-group $resourceGroup `
    --name $databaseServer `
    --location $location `
    --admin-user $adminUser `
    --admin-password $dbPasswordPlain `
    --sku-name B_Gen5_1 `
    --version 11

# Create database
Write-Host "Creating database: $databaseName" -ForegroundColor Blue
az postgres db create `
    --resource-group $resourceGroup `
    --server-name $databaseServer `
    --name $databaseName

# Configure firewall for Azure services
Write-Host "Configuring database firewall..." -ForegroundColor Blue
az postgres server firewall-rule create `
    --resource-group $resourceGroup `
    --server $databaseServer `
    --name "AllowAzureServices" `
    --start-ip-address 0.0.0.0 `
    --end-ip-address 0.0.0.0

# Generate connection string
$connectionString = "postgresql://$adminUser@$databaseServer`:$dbPasswordPlain@$databaseServer.postgres.database.azure.com:5432/$databaseName?sslmode=require"

# Generate session secret
$sessionSecret = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString()))

# Configure app settings
Write-Host "Configuring application settings..." -ForegroundColor Blue
az webapp config appsettings set `
    --resource-group $resourceGroup `
    --name $appName `
    --settings `
        NODE_ENV=production `
        DATABASE_URL="$connectionString" `
        SESSION_SECRET="$sessionSecret" `
        WEBSITE_NODE_DEFAULT_VERSION="18-lts"

# Build the application
Write-Host "Building application..." -ForegroundColor Blue
npm install --production
npm run build

# Create deployment package
Write-Host "Creating deployment package..." -ForegroundColor Blue
Compress-Archive -Path ".\*" -DestinationPath "deployment.zip" -Force -CompressionLevel Optimal

# Deploy to Azure
Write-Host "Deploying to Azure Web App..." -ForegroundColor Blue
az webapp deployment source config-zip `
    --resource-group $resourceGroup `
    --name $appName `
    --src deployment.zip

# Get the application URL
$appUrl = "https://$appName.azurewebsites.net"

Write-Host "==================================" -ForegroundColor Green
Write-Host "Deployment completed successfully!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host "App Name: $appName" -ForegroundColor White
Write-Host "Resource Group: $resourceGroup" -ForegroundColor White
Write-Host "App URL: $appUrl" -ForegroundColor White
Write-Host "Database Server: $databaseServer.postgres.database.azure.com" -ForegroundColor White
Write-Host "Database Name: $databaseName" -ForegroundColor White
Write-Host "==================================" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Visit $appUrl to access your application" -ForegroundColor White
Write-Host "2. Configure Active Directory settings in the app" -ForegroundColor White
Write-Host "3. Set up any additional environment variables if needed" -ForegroundColor White
Write-Host "==================================" -ForegroundColor Green

# Clean up
Remove-Item "deployment.zip" -Force -ErrorAction SilentlyContinue