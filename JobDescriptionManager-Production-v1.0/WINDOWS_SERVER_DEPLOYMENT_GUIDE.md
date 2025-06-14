# Windows Server Deployment Guide - Job Description Manager
## IIS + MS SQL Server Installation

### Prerequisites
- Windows Server 2016/2019/2022
- Administrator access
- Internet connectivity for downloading components

## Step 1: Install Required Windows Features

**Enable IIS and required features:**
```powershell
# Run as Administrator
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServer
Enable-WindowsOptionalFeature -Online -FeatureName IIS-CommonHttpFeatures
Enable-WindowsOptionalFeature -Online -FeatureName IIS-HttpErrors
Enable-WindowsOptionalFeature -Online -FeatureName IIS-HttpLogging
Enable-WindowsOptionalFeature -Online -FeatureName IIS-Security
Enable-WindowsOptionalFeature -Online -FeatureName IIS-RequestFiltering
Enable-WindowsOptionalFeature -Online -FeatureName IIS-StaticContent
Enable-WindowsOptionalFeature -Online -FeatureName IIS-DefaultDocument
Enable-WindowsOptionalFeature -Online -FeatureName IIS-DirectoryBrowsing
Enable-WindowsOptionalFeature -Online -FeatureName IIS-ASPNET45
```

**Alternative: Using Server Manager GUI**
1. Open Server Manager
2. Add Roles and Features
3. Select Web Server (IIS)
4. Include: ASP.NET 4.8, Application Development Features

## Step 2: Install Node.js

**Download and install Node.js 18 LTS:**
1. Visit: https://nodejs.org/en/download/
2. Download Windows Installer (.msi) - LTS version
3. Run installer with default settings
4. Verify installation:
```cmd
node --version
npm --version
```

## Step 3: Install IISNode

**Download and install IISNode:**
1. Visit: https://github.com/azure/iisnode/releases
2. Download `iisnode-full-v0.2.26-x64.msi`
3. Run installer
4. Restart IIS:
```cmd
iisreset
```

## Step 4: Install MS SQL Server

**Option A: SQL Server Express (Free)**
1. Download from: https://www.microsoft.com/en-us/sql-server/sql-server-downloads
2. Choose "Express" edition
3. Select "Custom" installation
4. Include SQL Server Management Studio (SSMS)

**Option B: SQL Server Developer (Free for dev/test)**
1. Download SQL Server Developer edition
2. Follow installation wizard
3. Choose "Default" or "Custom" installation
4. Set authentication mode to "Mixed Mode"
5. Set SA password

**Create Database:**
```sql
-- Connect to SQL Server using SSMS
CREATE DATABASE JobDescriptionDB;
USE JobDescriptionDB;

-- Create login for application
CREATE LOGIN jobapp WITH PASSWORD = 'YourSecurePassword123!';
CREATE USER jobapp FOR LOGIN jobapp;
ALTER ROLE db_owner ADD MEMBER jobapp;
```

## Step 5: Install Application Dependencies

**Install global dependencies:**
```cmd
npm install -g pm2
npm install -g typescript
```

## Step 6: Prepare Application for MS SQL Server

**Update database configuration for MS SQL Server:**

Create `server/db-mssql.ts`:
```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '@shared/schema';

// For MS SQL Server, use mssql driver instead
import sql from 'mssql';

const config = {
  user: process.env.DB_USER || 'jobapp',
  password: process.env.DB_PASSWORD || 'YourSecurePassword123!',
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'JobDescriptionDB',
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

export const pool = new sql.ConnectionPool(config);
export const db = drizzle(pool, { schema });
```

## Step 7: Deploy Application to IIS

**Create application directory:**
```cmd
mkdir C:\inetpub\wwwroot\jobmanager
cd C:\inetpub\wwwroot\jobmanager
```

**Copy application files:**
1. Copy your entire project to `C:\inetpub\wwwroot\jobmanager`
2. Install dependencies:
```cmd
npm install --production
npm run build
```

**Create web.config for IIS:**
```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <handlers>
      <add name="iisnode" path="dist/index.js" verb="*" modules="iisnode"/>
    </handlers>
    <rewrite>
      <rules>
        <rule name="StaticFiles" stopProcessing="true">
          <match url="([\S]+[.](html|htm|svg|js|css|png|gif|jpg|jpeg))"/>
          <action type="Rewrite" url="dist/client/{R:1}"/>
        </rule>
        <rule name="DynamicContent">
          <match url="/*" />
          <action type="Rewrite" url="dist/index.js"/>
        </rule>
      </rules>
    </rewrite>
    <iisnode watchedFiles="web.config;*.js"/>
    <directoryBrowse enabled="false" />
  </system.webServer>
</configuration>
```

## Step 8: Configure IIS Application

**Create IIS Application:**
```powershell
# Import IIS module
Import-Module WebAdministration

# Create application pool
New-WebAppPool -Name "JobManagerPool"
Set-ItemProperty -Path "IIS:\AppPools\JobManagerPool" -Name processModel.identityType -Value ApplicationPoolIdentity

# Create website/application
New-WebApplication -Site "Default Web Site" -Name "jobmanager" -PhysicalPath "C:\inetpub\wwwroot\jobmanager" -ApplicationPool "JobManagerPool"
```

**Alternative: Using IIS Manager GUI**
1. Open IIS Manager
2. Right-click "Default Web Site"
3. Add Application
4. Alias: "jobmanager"
5. Physical path: `C:\inetpub\wwwroot\jobmanager`
6. Application pool: Create new "JobManagerPool"

## Step 9: Set Environment Variables

**Configure application settings:**
```cmd
# Set environment variables for the application pool
%windir%\system32\inetsrv\appcmd.exe set config -section:system.applicationHost/applicationPools /+"[name='JobManagerPool'].environmentVariables.[name='NODE_ENV',value='production']" /commit:apphost
%windir%\system32\inetsrv\appcmd.exe set config -section:system.applicationHost/applicationPools /+"[name='JobManagerPool'].environmentVariables.[name='DB_SERVER',value='localhost']" /commit:apphost
%windir%\system32\inetsrv\appcmd.exe set config -section:system.applicationHost/applicationPools /+"[name='JobManagerPool'].environmentVariables.[name='DB_NAME',value='JobDescriptionDB']" /commit:apphost
%windir%\system32\inetsrv\appcmd.exe set config -section:system.applicationHost/applicationPools /+"[name='JobManagerPool'].environmentVariables.[name='DB_USER',value='jobapp']" /commit:apphost
%windir%\system32\inetsrv\appcmd.exe set config -section:system.applicationHost/applicationPools /+"[name='JobManagerPool'].environmentVariables.[name='DB_PASSWORD',value='YourSecurePassword123!']" /commit:apphost
```

## Step 10: Configure Firewall

**Open required ports:**
```cmd
netsh advfirewall firewall add rule name="HTTP" dir=in action=allow protocol=TCP localport=80
netsh advfirewall firewall add rule name="HTTPS" dir=in action=allow protocol=TCP localport=443
netsh advfirewall firewall add rule name="SQL Server" dir=in action=allow protocol=TCP localport=1433
```

## Step 11: Test Deployment

**Access the application:**
- Local: http://localhost/jobmanager
- Remote: http://your-server-ip/jobmanager

**Check logs:**
- IIS logs: `C:\inetpub\logs\LogFiles`
- Application logs: Event Viewer > Windows Logs > Application

## Troubleshooting

**Common Issues:**

1. **"Cannot find module" errors:**
   - Run `npm install` in application directory
   - Check Node.js installation

2. **Database connection errors:**
   - Verify SQL Server is running
   - Check connection string
   - Ensure firewall allows SQL Server traffic

3. **IISNode errors:**
   - Check web.config syntax
   - Verify IISNode installation
   - Restart application pool

4. **Permission errors:**
   - Grant IIS_IUSRS full control to application folder
   - Check application pool identity

**Useful Commands:**
```cmd
# Restart IIS
iisreset

# Restart application pool
%windir%\system32\inetsrv\appcmd recycle apppool "JobManagerPool"

# Check IIS status
%windir%\system32\inetsrv\appcmd list sites
%windir%\system32\inetsrv\appcmd list apps
```

## Security Considerations

1. **SQL Server Security:**
   - Use strong passwords
   - Enable SQL Server authentication
   - Restrict network access

2. **IIS Security:**
   - Remove unused modules
   - Configure request filtering
   - Enable HTTPS with SSL certificate

3. **Application Security:**
   - Set secure session secrets
   - Configure CORS properly
   - Regular security updates

## Performance Optimization

1. **IIS Configuration:**
   - Enable compression
   - Configure caching headers
   - Optimize application pool settings

2. **SQL Server:**
   - Regular maintenance plans
   - Index optimization
   - Monitor performance

3. **Node.js:**
   - Use PM2 for process management
   - Enable clustering
   - Monitor memory usage

## Backup Strategy

1. **Database Backup:**
```sql
BACKUP DATABASE JobDescriptionDB 
TO DISK = 'C:\Backup\JobDescriptionDB.bak'
```

2. **Application Backup:**
   - Regular file system backups
   - Version control integration
   - Configuration backup