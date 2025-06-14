#!/bin/bash

# Azure Deployment Script for Job Description Manager
echo "Starting Azure deployment for Job Description Manager..."

# Configuration variables
RESOURCE_GROUP="job-description-rg"
APP_NAME="job-description-manager-$(date +%s)"
LOCATION="eastus"
APP_SERVICE_PLAN="job-description-plan"
DATABASE_SERVER="job-description-db-server"
DATABASE_NAME="jobdescriptiondb"
ADMIN_USER="dbadmin"

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "Azure CLI is not installed. Please install it first."
    exit 1
fi

# Login to Azure (if not already logged in)
echo "Checking Azure login status..."
if ! az account show &> /dev/null; then
    echo "Please log in to Azure..."
    az login
fi

# Create resource group
echo "Creating resource group: $RESOURCE_GROUP"
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create App Service plan
echo "Creating App Service plan: $APP_SERVICE_PLAN"
az appservice plan create \
    --name $APP_SERVICE_PLAN \
    --resource-group $RESOURCE_GROUP \
    --sku B1 \
    --is-linux

# Create web app
echo "Creating web app: $APP_NAME"
az webapp create \
    --resource-group $RESOURCE_GROUP \
    --plan $APP_SERVICE_PLAN \
    --name $APP_NAME \
    --runtime "NODE|18-lts"

# Create PostgreSQL server
echo "Creating PostgreSQL server: $DATABASE_SERVER"
read -s -p "Enter database admin password: " DB_PASSWORD
echo

az postgres server create \
    --resource-group $RESOURCE_GROUP \
    --name $DATABASE_SERVER \
    --location $LOCATION \
    --admin-user $ADMIN_USER \
    --admin-password $DB_PASSWORD \
    --sku-name B_Gen5_1 \
    --version 11

# Create database
echo "Creating database: $DATABASE_NAME"
az postgres db create \
    --resource-group $RESOURCE_GROUP \
    --server-name $DATABASE_SERVER \
    --name $DATABASE_NAME

# Configure firewall for Azure services
echo "Configuring database firewall..."
az postgres server firewall-rule create \
    --resource-group $RESOURCE_GROUP \
    --server $DATABASE_SERVER \
    --name "AllowAzureServices" \
    --start-ip-address 0.0.0.0 \
    --end-ip-address 0.0.0.0

# Generate connection string
CONNECTION_STRING="postgresql://$ADMIN_USER@$DATABASE_SERVER:$DB_PASSWORD@$DATABASE_SERVER.postgres.database.azure.com:5432/$DATABASE_NAME?sslmode=require"

# Configure app settings
echo "Configuring application settings..."
az webapp config appsettings set \
    --resource-group $RESOURCE_GROUP \
    --name $APP_NAME \
    --settings \
        NODE_ENV=production \
        DATABASE_URL="$CONNECTION_STRING" \
        SESSION_SECRET="$(openssl rand -base64 32)" \
        WEBSITE_NODE_DEFAULT_VERSION="18-lts"

# Build and deploy the application
echo "Building application..."
npm install --production
npm run build

# Create deployment package
echo "Creating deployment package..."
zip -r deployment.zip . -x "node_modules/*" ".git/*" "*.log"

# Deploy to Azure
echo "Deploying to Azure Web App..."
az webapp deployment source config-zip \
    --resource-group $RESOURCE_GROUP \
    --name $APP_NAME \
    --src deployment.zip

# Get the application URL
APP_URL="https://$APP_NAME.azurewebsites.net"

echo "=================================="
echo "Deployment completed successfully!"
echo "=================================="
echo "App Name: $APP_NAME"
echo "Resource Group: $RESOURCE_GROUP"
echo "App URL: $APP_URL"
echo "Database Server: $DATABASE_SERVER.postgres.database.azure.com"
echo "Database Name: $DATABASE_NAME"
echo "=================================="
echo "Next steps:"
echo "1. Visit $APP_URL to access your application"
echo "2. Configure Active Directory settings in the app"
echo "3. Set up any additional environment variables if needed"
echo "=================================="