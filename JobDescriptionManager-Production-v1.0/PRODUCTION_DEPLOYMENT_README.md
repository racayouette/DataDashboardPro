# Job Description Manager - Production Deployment Package

## Package Contents

This deployment package contains everything needed to deploy the Job Description Manager application to a Windows Server with IIS and MS SQL Server.

### Files Included:
- `Deploy-WindowsServer.ps1` - Main PowerShell deployment script
- `deploy.cmd` - Alternative batch file deployment
- `web.config` - IIS configuration file
- `package.json` - Node.js dependencies
- `dist/` - Pre-built production application
- `database-mssql-schema.sql` - Database schema
- `database-mssql-sample-data.sql` - Sample data
- `database-mssql-procedures.sql` - Stored procedures
- `WINDOWS_SERVER_DEPLOYMENT_GUIDE.md` - Detailed deployment guide

## Quick Start (Recommended)

### Prerequisites
1. Windows Server 2016/2019/2022
2. Administrator access
3. IIS with Node.js support installed
4. SQL Server (Express/Developer/Standard)
5. Node.js 18 LTS

### One-Click Deployment
```powershell
# Extract the zip file to your deployment location
# Open PowerShell as Administrator
# Navigate to the extracted folder
.\Deploy-WindowsServer.ps1 -CreateDatabase
```

### Manual Deployment Options
```powershell
# Custom deployment path
.\Deploy-WindowsServer.ps1 -DeploymentPath "D:\Apps\JobManager" -CreateDatabase

# Existing database
.\Deploy-WindowsServer.ps1 -DatabaseServer "SQLSERVER01" -DatabaseName "ExistingDB"

# Skip prerequisites check (for repeated deployments)
.\Deploy-WindowsServer.ps1 -SkipPrerequisites
```

## Application Features

### Core Functionality
- Job description creation and management
- Version tracking and comparison
- User management with role-based access
- Dashboard analytics and reporting
- Real-time notifications

### Technical Features
- Active Directory integration (dual environment support)
- Advanced search and filtering
- Bulk operations and data export
- Audit trails and change history
- RESTful API for integrations

### Security
- Role-based permission system
- Session management
- Brute force protection
- Input validation and sanitization
- HTTPS enforcement ready

## Post-Deployment Configuration

### 1. Access the Application
- URL: `http://your-server/jobmanager`
- Default admin: `admin@company.com`

### 2. Configure Active Directory
1. Navigate to Settings → Active Directory
2. Set up Testing environment configuration
3. Set up Go Live environment configuration
4. Test connections

### 3. User Management
1. Go to Users section
2. Configure user roles and permissions
3. Import users from Active Directory

### 4. System Settings
1. Review application settings
2. Configure notification preferences
3. Set up backup procedures

## Database Information

### Default Configuration
- Server: localhost
- Database: JobDescriptionDB
- User: jobapp
- Tables: 8 core tables with proper indexing
- Stored Procedures: 12 optimized procedures

### Sample Data Included
- 10 job families
- 5 sample job descriptions
- 5 test users with different roles
- Active Directory configurations
- Notification examples

## Troubleshooting

### Common Issues

**Application won't start:**
- Check IIS logs in `C:\inetpub\logs\LogFiles`
- Verify Node.js version: `node --version`
- Check application pool status in IIS Manager

**Database connection errors:**
- Verify SQL Server is running
- Check connection string in environment variables
- Ensure firewall allows SQL Server traffic (port 1433)

**Permission errors:**
- Run PowerShell as Administrator
- Check IIS_IUSRS permissions on application folder
- Verify application pool identity

**Active Directory integration:**
- Test network connectivity to AD servers
- Verify service account credentials
- Check firewall rules for LDAP ports (389/636)

### Useful Commands
```cmd
# Restart IIS
iisreset

# Check application pool status
%windir%\system32\inetsrv\appcmd list apppools

# View application logs
type C:\inetpub\wwwroot\jobmanager\iisnode\*.log

# Test database connection
sqlcmd -S localhost -d JobDescriptionDB -E -Q "SELECT COUNT(*) FROM users"
```

## Performance Optimization

### IIS Tuning
- Enable compression
- Configure caching headers
- Optimize application pool settings
- Set up health monitoring

### Database Optimization
- Regular index maintenance
- Statistics updates
- Backup and recovery procedures
- Query performance monitoring

### Security Hardening
- SSL certificate installation
- Remove unused IIS modules
- Configure request filtering
- Set up monitoring alerts

## Support and Maintenance

### Regular Maintenance Tasks
1. Monitor application logs
2. Check database performance
3. Update Node.js dependencies
4. Review security settings
5. Backup configuration and data

### Version Updates
1. Stop application pool
2. Backup current deployment
3. Extract new version
4. Run deployment script
5. Test functionality

### Monitoring Recommendations
- Set up Windows Performance Counters
- Monitor IIS request processing
- Track database query performance
- Monitor Active Directory connectivity
- Set up email alerts for errors

## Contact Information

For technical support or questions about this deployment package, please contact your system administrator or development team.

## License and Legal

This software is proprietary and confidential. Unauthorized distribution or modification is prohibited.

---

**Deployment Package Version:** 1.0  
**Build Date:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")  
**Target Environment:** Windows Server + IIS + MS SQL Server