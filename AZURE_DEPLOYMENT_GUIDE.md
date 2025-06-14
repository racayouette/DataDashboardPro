# Azure Deployment Guide - Job Description Manager

## Quick Deployment Options

### Option 1: Automated Script (Recommended)

**For Windows (PowerShell):**
```powershell
.\deploy-to-azure.ps1
```

**For Linux/Mac (Bash):**
```bash
./deploy-to-azure.sh
```

### Option 2: Manual Deployment Steps

#### Prerequisites
1. Install Azure CLI: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli
2. Login to Azure: `az login`

#### Step 1: Create Resources
```bash
# Set variables
RESOURCE_GROUP="job-description-rg"
APP_NAME="job-description-manager-$(date +%s)"
LOCATION="eastus"

# Create resource group
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create App Service plan
az appservice plan create --name "$APP_NAME-plan" --resource-group $RESOURCE_GROUP --sku B1 --is-linux

# Create web app
az webapp create --resource-group $RESOURCE_GROUP --plan "$APP_NAME-plan" --name $APP_NAME --runtime "NODE|18-lts"
```

#### Step 2: Create Database
```bash
# Create PostgreSQL server
az postgres server create \
    --resource-group $RESOURCE_GROUP \
    --name "$APP_NAME-db" \
    --location $LOCATION \
    --admin-user dbadmin \
    --admin-password "YourSecurePassword123!" \
    --sku-name B_Gen5_1

# Create database
az postgres db create --resource-group $RESOURCE_GROUP --server-name "$APP_NAME-db" --name jobdescriptiondb

# Configure firewall
az postgres server firewall-rule create \
    --resource-group $RESOURCE_GROUP \
    --server "$APP_NAME-db" \
    --name "AllowAzureServices" \
    --start-ip-address 0.0.0.0 \
    --end-ip-address 0.0.0.0
```

#### Step 3: Configure Environment Variables
```bash
# Set application settings
az webapp config appsettings set \
    --resource-group $RESOURCE_GROUP \
    --name $APP_NAME \
    --settings \
        NODE_ENV=production \
        DATABASE_URL="postgresql://dbadmin@$APP_NAME-db:YourSecurePassword123!@$APP_NAME-db.postgres.database.azure.com:5432/jobdescriptiondb?sslmode=require" \
        SESSION_SECRET="$(openssl rand -base64 32)"
```

#### Step 4: Deploy Application
```bash
# Build application
npm run build

# Deploy using zip
az webapp deployment source config-zip \
    --resource-group $RESOURCE_GROUP \
    --name $APP_NAME \
    --src <(zip -r - . -x "node_modules/*" ".git/*")
```

## Post-Deployment Configuration

### 1. Access Your Application
Visit: `https://YOUR_APP_NAME.azurewebsites.net`

### 2. Configure Active Directory
- Navigate to Settings → Active Directory
- Add your organization's AD server details
- Test the connection

### 3. Set Up Users
- Use the Users tab to manage application users
- Configure roles and permissions

### 4. Monitor Application
- View logs: `az webapp log tail --resource-group $RESOURCE_GROUP --name $APP_NAME`
- Monitor performance in Azure Portal

## Troubleshooting

### Common Issues

**Application won't start:**
- Check logs: `az webapp log tail --name $APP_NAME --resource-group $RESOURCE_GROUP`
- Verify Node.js version in App Service configuration

**Database connection errors:**
- Verify connection string in application settings
- Check firewall rules for PostgreSQL server
- Ensure SSL is enabled

**Build failures:**
- Run `npm install` locally to check for dependency issues
- Verify Node.js version compatibility

### Environment Variables Required
```
NODE_ENV=production
DATABASE_URL=postgresql://username:password@server:5432/database?sslmode=require
SESSION_SECRET=your-random-secret-key
```

## Scaling and Performance

### Basic Tier (B1) - Default
- 1 Core, 1.75 GB RAM
- Good for development and testing

### Standard Tier (S1) - Production
```bash
az appservice plan update --name "$APP_NAME-plan" --resource-group $RESOURCE_GROUP --sku S1
```

### Enable Auto-scaling
```bash
az monitor autoscale create \
    --resource-group $RESOURCE_GROUP \
    --resource $APP_NAME \
    --resource-type Microsoft.Web/sites \
    --name autoscale-settings \
    --min-count 1 \
    --max-count 3 \
    --count 1
```

## Security Best Practices

1. **Use managed identities** for database connections
2. **Enable HTTPS only** in App Service settings
3. **Configure custom domains** with SSL certificates
4. **Set up Application Insights** for monitoring
5. **Use Azure Key Vault** for sensitive configuration

## Cost Optimization

- Start with B1 tier for testing
- Monitor usage with Azure Cost Management
- Set up budget alerts
- Use consumption-based services where possible

## Backup and Recovery

```bash
# Create backup
az webapp config backup create \
    --resource-group $RESOURCE_GROUP \
    --webapp-name $APP_NAME \
    --backup-name "backup-$(date +%Y%m%d)" \
    --storage-account-url "YOUR_STORAGE_URL"
```