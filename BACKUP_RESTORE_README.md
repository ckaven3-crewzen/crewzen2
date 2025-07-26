# CrewZen Project Backup & Restore Guide

**Project**: CrewZen - Multi-Module Business Management Platform  
**Created**: July 26, 2025  
**Backup Location**: `C:\Users\ckave\Documents\crewzen_backup_2025-07-26_12-29-20`

---

## 📁 Current Backup Information

### **Latest Backup Details**
- **📍 Location**: `C:\Users\ckave\Documents\crewzen_backup_2025-07-26_12-29-20`
- **📊 Size**: 4.63 MB
- **📂 Files**: 207 files copied
- **📁 Directories**: 78 directories
- **⏰ Created**: Saturday, July 26, 2025 at 12:30 PM

### **What's Included in Backup**
✅ **Source Code**: All `src/` files and components  
✅ **Documentation**: Complete `docs/` folder including cleanup recommendations  
✅ **Configuration**: Firebase, TypeScript, Next.js, and package configurations  
✅ **Public Assets**: Manifests, service worker, icons  
✅ **Environment Templates**: `.env.example` files  
✅ **Patches**: Custom code patches  
✅ **Tests**: Test files and specifications  

### **What's Excluded (Can be Regenerated)**
❌ `node_modules/` - Dependencies (run `npm install` to restore)  
❌ `.next/` - Build output (run `npm run build` to regenerate)  
❌ `.git/` - Version control history  

---

## 🔄 How to Restore from Backup

### **Option 1: Full Project Restore (Recommended)**

1. **Navigate to backup location**:
   ```powershell
   cd "C:\Users\ckave\Documents\crewzen_backup_2025-07-26_12-29-20"
   ```

2. **Copy backup to new location**:
   ```powershell
   # Create new project folder
   $newProjectPath = "C:\Users\ckave\Documents\crewzen_restored_$(Get-Date -Format 'yyyy-MM-dd_HH-mm-ss')"
   robocopy "C:\Users\ckave\Documents\crewzen_backup_2025-07-26_12-29-20" $newProjectPath /E /COPY:DAT
   ```

3. **Navigate to restored project**:
   ```powershell
   cd $newProjectPath
   ```

4. **Install dependencies**:
   ```powershell
   npm install
   ```

5. **Set up environment**:
   ```powershell
   # Copy environment template
   Copy-Item ".env.example" ".env.local"
   # Edit .env.local with your Firebase and API keys
   ```

6. **Build and run**:
   ```powershell
   npm run build
   npm run dev
   ```

### **Option 2: Selective File Restore**

If you only need specific files or folders:

```powershell
# Copy specific files/folders from backup
robocopy "C:\Users\ckave\Documents\crewzen_backup_2025-07-26_12-29-20\src\components" "C:\Users\ckave\Documents\crewzen\src\components" /E
robocopy "C:\Users\ckave\Documents\crewzen_backup_2025-07-26_12-29-20\docs" "C:\Users\ckave\Documents\crewzen\docs" /E
```

### **Option 3: Emergency Quick Restore**

If your current project is corrupted:

```powershell
# Backup current broken project (just in case)
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
Move-Item "C:\Users\ckave\Documents\crewzen" "C:\Users\ckave\Documents\crewzen_broken_$timestamp"

# Restore from backup
robocopy "C:\Users\ckave\Documents\crewzen_backup_2025-07-26_12-29-20" "C:\Users\ckave\Documents\crewzen" /E /COPY:DAT

# Navigate and reinstall
cd "C:\Users\ckave\Documents\crewzen"
npm install
```

---

## 💾 Creating New Backups

### **Manual Backup Creation**

Use this PowerShell script to create timestamped backups:

```powershell
# Set variables
$sourceDir = "C:\Users\ckave\Documents\crewzen"
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupDir = "C:\Users\ckave\Documents\crewzen_backup_$timestamp"

# Create backup
New-Item -ItemType Directory -Path $backupDir -Force
robocopy $sourceDir $backupDir /E /COPY:DAT /R:3 /W:1 /MT:8 /XD node_modules .next .git

# Display results
Write-Host "✅ Backup created: $backupDir" -ForegroundColor Green
$backupSize = (Get-ChildItem $backupDir -Recurse | Measure-Object -Property Length -Sum).Sum
$backupSizeMB = [math]::Round($backupSize / 1MB, 2)
Write-Host "📊 Backup size: $backupSizeMB MB" -ForegroundColor Cyan
```

### **Automated Backup Script**

Save this as `create_backup.ps1` in your project root:

```powershell
# CrewZen Backup Script
param(
    [string]$BackupLocation = "C:\Users\ckave\Documents\",
    [switch]$IncludeGit = $false
)

$sourceDir = "C:\Users\ckave\Documents\crewzen"
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupDir = Join-Path $BackupLocation "crewzen_backup_$timestamp"

Write-Host "🔄 Creating backup..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

$excludeDirs = @('node_modules', '.next')
if (-not $IncludeGit) {
    $excludeDirs += '.git'
}

$excludeArgs = $excludeDirs | ForEach-Object { "/XD $_" }
$robocopyArgs = @($sourceDir, $backupDir, '/E', '/COPY:DAT', '/R:3', '/W:1', '/MT:8') + $excludeArgs

& robocopy @robocopyArgs | Out-Null

# Calculate and display results
$backupSize = (Get-ChildItem $backupDir -Recurse | Measure-Object -Property Length -Sum).Sum
$backupSizeMB = [math]::Round($backupSize / 1MB, 2)
$fileCount = (Get-ChildItem $backupDir -Recurse -File).Count

Write-Host "✅ Backup completed successfully!" -ForegroundColor Green
Write-Host "📍 Location: $backupDir" -ForegroundColor Cyan
Write-Host "📊 Size: $backupSizeMB MB" -ForegroundColor Cyan
Write-Host "📄 Files: $fileCount files" -ForegroundColor Cyan
```

Run with: `.\create_backup.ps1` or `.\create_backup.ps1 -IncludeGit`

---

## 🗂️ Backup Management

### **Backup Naming Convention**
- Format: `crewzen_backup_YYYY-MM-DD_HH-mm-ss`
- Example: `crewzen_backup_2025-07-26_12-29-20`

### **Backup Verification**
```powershell
# Verify backup integrity
$backupPath = "C:\Users\ckave\Documents\crewzen_backup_2025-07-26_12-29-20"

# Check main directories exist
$requiredDirs = @('src', 'docs', 'public')
foreach ($dir in $requiredDirs) {
    $dirPath = Join-Path $backupPath $dir
    if (Test-Path $dirPath) {
        Write-Host "✅ $dir directory found" -ForegroundColor Green
    } else {
        Write-Host "❌ $dir directory missing" -ForegroundColor Red
    }
}

# Check important files
$requiredFiles = @('package.json', 'next.config.ts', 'tailwind.config.ts')
foreach ($file in $requiredFiles) {
    $filePath = Join-Path $backupPath $file
    if (Test-Path $filePath) {
        Write-Host "✅ $file found" -ForegroundColor Green
    } else {
        Write-Host "❌ $file missing" -ForegroundColor Red
    }
}
```

### **Cleanup Old Backups**
```powershell
# Remove backups older than 30 days
$backupLocation = "C:\Users\ckave\Documents\"
$cutoffDate = (Get-Date).AddDays(-30)

Get-ChildItem $backupLocation -Directory | 
    Where-Object { $_.Name -match "crewzen_backup_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}" -and $_.CreationTime -lt $cutoffDate } |
    ForEach-Object {
        Write-Host "🗑️ Removing old backup: $($_.Name)" -ForegroundColor Yellow
        Remove-Item $_.FullName -Recurse -Force
    }
```

---

## 🔧 Project Setup After Restore

### **Required Environment Variables**
After restoring, make sure your `.env.local` contains:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Additional API Keys
NEXT_PUBLIC_OTHER_API_KEY=your_other_keys
```

### **First Run Checklist**
- [ ] Run `npm install` to install dependencies
- [ ] Copy and configure `.env.local` from `.env.example`
- [ ] Run `npm run build` to verify build works
- [ ] Run `npm run dev` to start development server
- [ ] Verify Firebase connection
- [ ] Test main application modules (AccessZen, ConnectZen, ProZen, CrewZen)

---

## 📋 Backup Schedule Recommendations

### **Recommended Backup Frequency**
- **Before major changes**: Always backup before significant code changes
- **Daily during active development**: Use automated script
- **Weekly for stable periods**: Minimum backup frequency
- **Before deployment**: Always backup before production deployments

### **Storage Recommendations**
- **Local**: Keep 3-5 recent backups locally
- **Cloud Storage**: Consider OneDrive, Google Drive, or Dropbox for offsite backups
- **External Drive**: Monthly backups to external storage

---

## 🆘 Emergency Contacts & Resources

### **Project Information**
- **Modules**: AccessZen (Estate Management), ConnectZen (Marketplace), ProZen (Project Management), CrewZen (Employee Management)
- **Tech Stack**: Next.js, React, TypeScript, Firebase, Tailwind CSS
- **Documentation**: See `docs/` folder for comprehensive project documentation

### **Key Files to Protect**
- `src/` - All source code
- `docs/COMPONENT_CLEANUP_RECOMMENDATIONS.md` - Critical technical debt documentation
- `firebase.json` & `firestore.rules` - Firebase configuration
- `package.json` - Dependencies and scripts
- Environment configuration files

---

## 📞 Need Help?

If you encounter issues with backup or restore:

1. **Check file permissions**: Ensure you have read/write access to backup locations
2. **Verify paths**: Double-check all file paths are correct
3. **Dependencies**: Run `npm install` after any restore
4. **Environment**: Ensure `.env.local` is properly configured
5. **Firebase**: Verify Firebase project settings and API keys

---

**Last Updated**: July 26, 2025  
**Backup Version**: 2025-07-26_12-29-20  
**Project Status**: Active Development with 4 Modules Documented
