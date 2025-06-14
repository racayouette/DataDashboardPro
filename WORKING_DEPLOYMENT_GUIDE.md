# Working Deployment Guide - Job Description Manager

## Current Issues Identified

The previous deployment scripts failed due to several fundamental issues:

1. **Database Schema Mismatch**: Application uses PostgreSQL schema but deployment targets MS SQL Server
2. **Storage Layer Problems**: In-memory storage instead of proper database connections
3. **Build Configuration Issues**: Incomplete production build setup
4. **Environment Variable Conflicts**: Missing or incorrect configuration

## Fixed Deployment Solution

### Step 1: Prerequisites Setup

**Required Software:**
- Windows Server 2016/2019/2022
- Node.js 18 LTS
- PostgreSQL 14+ (recommended) OR SQL Server 2019+
- IIS 10.0 with URL Rewrite module

**Install Node.js:**
```powershell
# Download and install Node.js 18 LTS from nodejs.org
node --version  # Should show v18.x.x
npm --version   # Should show 9.x.x or higher
```

**Install PostgreSQL (Recommended):**
```powershell
# Download PostgreSQL from postgresql.org
# During installation, note the password for postgres user
# Create application database:
createdb jobdescriptiondb
```

### Step 2: Database Setup

**Create database and user:**
```sql
-- Connect to PostgreSQL as postgres user
CREATE DATABASE jobdescriptiondb;
CREATE USER jobapp WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE jobdescriptiondb TO jobapp;
```

**Run schema migration:**
```bash
# In the application directory
npm install
npm run db:push
```

### Step 3: Application Configuration

**Create .env file:**
```env
NODE_ENV=production
DATABASE_URL=postgresql://jobapp:your_secure_password@localhost:5432/jobdescriptiondb
SESSION_SECRET=your_random_session_secret_at_least_32_chars
PORT=3000
```

**Install dependencies and build:**
```bash
npm install --production
npm run build
```

### Step 4: IIS Configuration

**Create application directory:**
```cmd
mkdir C:\inetpub\wwwroot\jobmanager
```

**Copy files to IIS:**
```cmd
robocopy . C:\inetpub\wwwroot\jobmanager /E /XD node_modules .git
cd C:\inetpub\wwwroot\jobmanager
npm install --production
npm run build
```

**Create web.config:**
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
          <match url="([\S]+[.](html|htm|svg|js|css|png|gif|jpg|jpeg|ico|woff|woff2|ttf|eot))"/>
          <action type="Rewrite" url="dist/client/{R:1}"/>
        </rule>
        <rule name="API">
          <match url="^api/(.*)"/>
          <action type="Rewrite" url="dist/index.js"/>
        </rule>
        <rule name="SPA">
          <match url=".*"/>
          <action type="Rewrite" url="dist/client/index.html"/>
        </rule>
      </rules>
    </rewrite>
    <iisnode 
      watchedFiles="web.config;*.js"
      loggingEnabled="true"
      logDirectory="logs"
    />
  </system.webServer>
</configuration>
```

**Configure IIS Application:**
```powershell
Import-Module WebAdministration

# Create application pool
New-WebAppPool -Name "JobManagerPool"
Set-ItemProperty "IIS:\AppPools\JobManagerPool" managedRuntimeVersion ""

# Create application
New-WebApplication -Site "Default Web Site" -Name "jobmanager" -PhysicalPath "C:\inetpub\wwwroot\jobmanager" -ApplicationPool "JobManagerPool"

# Set environment variables
$env:NODE_ENV = "production"
$env:DATABASE_URL = "postgresql://jobapp:your_password@localhost:5432/jobdescriptiondb"
```

### Step 5: Testing

**Verify application:**
1. Visit `http://localhost/jobmanager`
2. Check IIS logs in `C:\inetpub\wwwroot\jobmanager\logs`
3. Test database connection via application health endpoint

## Alternative: Docker Deployment

**Create Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

**Deploy with Docker:**
```bash
docker build -t jobmanager .
docker run -d -p 3000:3000 --env-file .env jobmanager
```

## Troubleshooting

**Database Connection Issues:**
- Verify PostgreSQL is running: `pg_isready`
- Check connection string format
- Ensure firewall allows connections

**Build Failures:**
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node.js version compatibility
- Verify all dependencies are installed

**IIS Issues:**
- Install IISNode module
- Check URL Rewrite module is installed
- Verify application pool permissions

## Production Checklist

- [ ] Database is properly configured with backups
- [ ] Environment variables are secure
- [ ] SSL certificate is installed
- [ ] Firewall rules are configured
- [ ] Monitoring is set up
- [ ] Log rotation is configured
- [ ] Application health checks are working

This deployment guide addresses the actual application architecture and provides working solutions for production deployment.