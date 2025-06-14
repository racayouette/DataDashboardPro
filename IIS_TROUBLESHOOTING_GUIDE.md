# IIS Deployment Troubleshooting Guide
## Fixing HTTP Error 500.19 - Configuration Data Invalid

### Prerequisites Check

**1. Install Required IIS Components**
Run this PowerShell command as Administrator:
```powershell
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole, IIS-WebServer, IIS-CommonHttpFeatures, IIS-HttpErrors, IIS-HttpRedirect, IIS-ApplicationDevelopment, IIS-NetFxExtensibility45, IIS-HealthAndDiagnostics, IIS-HttpLogging, IIS-Security, IIS-RequestFiltering, IIS-Performance, IIS-WebServerManagementTools, IIS-ManagementConsole, IIS-IIS6ManagementCompatibility, IIS-Metabase, IIS-ASPNET45
```

**2. Install IISNode**
Download and install from: https://github.com/Azure/iisnode/releases
Or via Chocolatey:
```powershell
choco install iisnode
```

**3. Install URL Rewrite Module**
Download from: https://www.iis.net/downloads/microsoft/url-rewrite
Or via Web Platform Installer

### Step-by-Step Deployment

**Step 1: Clean Previous Installation**
```powershell
# Run as Administrator
Import-Module WebAdministration
Stop-WebAppPool -Name "JobManagerPool" -ErrorAction SilentlyContinue
Remove-WebAppPool -Name "JobManagerPool" -ErrorAction SilentlyContinue
Remove-WebApplication -Site "Default Web Site" -Name "jobmanager" -ErrorAction SilentlyContinue
Remove-Item -Path "C:\inetpub\wwwroot\jobmanager" -Recurse -Force -ErrorAction SilentlyContinue
```

**Step 2: Create Application Directory**
```powershell
$AppPath = "C:\inetpub\wwwroot\jobmanager"
New-Item -ItemType Directory -Path $AppPath -Force
```

**Step 3: Copy and Build Application**
```powershell
# Copy all files except node_modules
Copy-Item -Path "." -Destination $AppPath -Recurse -Force -Exclude "node_modules", ".git", "*.log", "*.tar.gz"
Set-Location $AppPath

# Install dependencies and build
npm install
npm run build
```

**Step 4: Create Production Environment File**
```powershell
@"
NODE_ENV=production
PORT=3000
SESSION_SECRET=JobManager_Production_Secret_$(Get-Random)
"@ | Out-File -FilePath ".env" -Encoding UTF8
```

**Step 5: Create Minimal web.config**
```powershell
@'
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <handlers>
      <add name="iisnode" path="dist/index.js" verb="*" modules="iisnode"/>
    </handlers>
    <rewrite>
      <rules>
        <rule name="NodeApp">
          <match url="/*"/>
          <action type="Rewrite" url="dist/index.js"/>
        </rule>
      </rules>
    </rewrite>
    <iisnode loggingEnabled="true" logDirectory="iisnode"/>
  </system.webServer>
</configuration>
'@ | Out-File -FilePath "web.config" -Encoding UTF8
```

**Step 6: Create Application Pool**
```powershell
New-WebAppPool -Name "JobManagerPool"
Set-ItemProperty -Path "IIS:\AppPools\JobManagerPool" -Name "managedRuntimeVersion" -Value ""
Set-ItemProperty -Path "IIS:\AppPools\JobManagerPool" -Name "processModel.identityType" -Value "ApplicationPoolIdentity"
```

**Step 7: Create Web Application**
```powershell
New-WebApplication -Site "Default Web Site" -Name "jobmanager" -PhysicalPath $AppPath -ApplicationPool "JobManagerPool"
```

**Step 8: Set Permissions**
```powershell
$acl = Get-Acl $AppPath
$accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule("IIS_IUSRS", "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow")
$acl.SetAccessRule($accessRule)
$appPoolIdentity = "IIS AppPool\JobManagerPool"
$accessRule2 = New-Object System.Security.AccessControl.FileSystemAccessRule($appPoolIdentity, "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow")
$acl.SetAccessRule($accessRule2)
Set-Acl -Path $AppPath -AclObject $acl
```

**Step 9: Start Application Pool**
```powershell
Start-WebAppPool -Name "JobManagerPool"
```

### Common Error Solutions

**Error 0x8007000d (Configuration Invalid)**
- Check web.config syntax using: `iisreset /noforce`
- Validate XML: Copy web.config content to XML validator
- Ensure all required IIS features are installed

**IISNode Not Found**
- Install IISNode: https://github.com/Azure/iisnode/releases
- Restart IIS after installation: `iisreset`

**URL Rewrite Module Missing**
- Install from: https://www.iis.net/downloads/microsoft/url-rewrite
- Check in IIS Manager > Modules

**Permission Errors**
- Verify IIS_IUSRS has full control on application folder
- Check Application Pool identity permissions

### Testing Deployment

1. **Check Application Pool Status**
   ```powershell
   Get-IISAppPool -Name "JobManagerPool"
   ```

2. **Test Application Response**
   ```powershell
   Invoke-WebRequest -Uri "http://localhost/jobmanager" -UseBasicParsing
   ```

3. **Check IISNode Logs**
   - Look in: `C:\inetpub\wwwroot\jobmanager\iisnode\`
   - Check for Node.js startup errors

### Manual Alternative (if automated script fails)

1. **Use IIS Manager GUI**
   - Open IIS Manager
   - Create new Application Pool (No Managed Code)
   - Create new Application under Default Web Site
   - Point to your application folder
   - Ensure web.config is valid

2. **Test Node.js Directly**
   ```cmd
   cd C:\inetpub\wwwroot\jobmanager
   node dist/index.js
   ```

3. **Verify Build Output**
   - Ensure `dist/index.js` exists
   - Check that `npm run build` completed successfully

### Success Indicators

- Application Pool shows "Started" status
- No errors in Windows Event Viewer
- IISNode logs show successful Node.js startup
- HTTP 200 response from `http://localhost/jobmanager`

### Support

If issues persist:
1. Check Windows Event Viewer > Windows Logs > Application
2. Review IISNode logs in application folder
3. Verify all prerequisites are properly installed
4. Test with minimal web.config first, then add features