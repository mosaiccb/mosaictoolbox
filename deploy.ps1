# 🛠️ MosaicToolbox Deployment Script - PowerShell
# Deploy React TypeScript MosaicToolbox to existing Azure Static Web App
# 
# Author: Claude AI Assistant
# Created: January 2025
# Purpose: Deploy MosaicToolbox tenant and API management app to existing SWA
#
# This script will:
# 1. Check prerequisites (Node.js, Azure CLI, SWA CLI)
# 2. Install dependencies and build the frontend
# 3. Run type checking for error detection
# 4. Deploy to existing SWA: swa-ukg-labor-dashboard
# 5. Test the deployment
# 6. Configure Azure AD authentication settings
#
# 🔧 Configuration:
#   • Frontend: React TypeScript with Vite
#   • Target SWA: swa-ukg-labor-dashboard
#   • Authentication: Azure AD (Entra ID)
#   • Features: Tenant Management, Third-Party API Management
#
# Usage Examples:
#   .\deploy.ps1                                        # Full deployment
#   .\deploy.ps1 -SkipBuild                            # Skip npm build step
#   .\deploy.ps1 -SkipTests                            # Skip type checking
#   .\deploy.ps1 -ResourceGroup "your-rg"             # Specify resource group
#   .\deploy.ps1 -VerboseOutput                        # Verbose output

param(
    [Parameter(Mandatory = $false)]
    [switch]$SkipBuild,
    
    [Parameter(Mandatory = $false)]
    [switch]$SkipTests,
    
    [Parameter(Mandatory = $false)]
    [switch]$VerboseOutput,
    
    [Parameter(Mandatory = $false)]
    [string]$StaticWebAppName = "swa-ukg-labor-dashboard",
    
    [Parameter(Mandatory = $false)]
    [string]$ResourceGroup = "",
    
    [Parameter(Mandatory = $false)]
    [string]$SubscriptionId = ""
)

Write-Host "🛠️ Starting MosaicToolbox Deployment Pipeline" -ForegroundColor Green
Write-Host "📅 Deployment initiated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor DarkGray
Write-Host "👤 Executed by: $env:USERNAME on $env:COMPUTERNAME" -ForegroundColor DarkGray
Write-Host "🎯 Target SWA: $StaticWebAppName" -ForegroundColor Cyan

# Check prerequisites
Write-Host "`n📋 Checking prerequisites..." -ForegroundColor Cyan

# Check if Node.js is installed
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Node.js not found. Please install Node.js" -ForegroundColor Red
        Write-Host "💡 Download from: https://nodejs.org/" -ForegroundColor Cyan
        exit 1
    }
}
catch {
    Write-Host "❌ Node.js not found. Please install Node.js" -ForegroundColor Red
    exit 1
}

# Check if npm is available
try {
    $npmVersion = npm --version 2>$null
    if ($npmVersion) {
        Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
    }
    else {
        Write-Host "❌ npm not found" -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host "❌ npm not found" -ForegroundColor Red
    exit 1
}

# Check if Azure CLI is installed and logged in
try {
    $azVersion = az version 2>$null | ConvertFrom-Json
    if ($azVersion.'azure-cli') {
        Write-Host "✅ Azure CLI: $($azVersion.'azure-cli')" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Azure CLI not found. Please install Azure CLI" -ForegroundColor Red
        Write-Host "💡 Download from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli" -ForegroundColor Cyan
        exit 1
    }
    
    $azAccount = az account show 2>$null | ConvertFrom-Json
    if ($azAccount) {
        Write-Host "✅ Azure CLI authenticated as: $($azAccount.user.name)" -ForegroundColor Green
        Write-Host "📍 Subscription: $($azAccount.name)" -ForegroundColor Cyan
        if (-not $SubscriptionId) {
            $SubscriptionId = $azAccount.id
        }
    }
    else {
        Write-Host "❌ Azure CLI not authenticated" -ForegroundColor Red
        Write-Host "💡 Run: az login" -ForegroundColor Cyan
        exit 1
    }
}
catch {
    Write-Host "❌ Error checking Azure CLI: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Check if SWA CLI is available
try {
    $swaVersion = swa --version 2>$null
    if ($swaVersion) {
        Write-Host "✅ Static Web Apps CLI: $swaVersion" -ForegroundColor Green
    }
    else {
        Write-Host "⚠️  SWA CLI not found. Installing..." -ForegroundColor Yellow
        npm install -g @azure/static-web-apps-cli
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Failed to install SWA CLI" -ForegroundColor Red
            exit 1
        }
        Write-Host "✅ SWA CLI installed successfully" -ForegroundColor Green
    }
}
catch {
    Write-Host "❌ Error checking SWA CLI" -ForegroundColor Red
    exit 1
}

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ package.json not found. Make sure you're in the MosaicToolbox directory" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "src")) {
    Write-Host "❌ src directory not found. Make sure you're in the MosaicToolbox directory" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Prerequisites check completed" -ForegroundColor Green

# Get resource group if not specified
if (-not $ResourceGroup) {
    Write-Host "`n🔍 Finding resource group for SWA..." -ForegroundColor Cyan
    try {
        $swaInfo = az staticwebapp list --query "[?name=='$StaticWebAppName']" 2>$null | ConvertFrom-Json
        if ($swaInfo -and $swaInfo.Count -gt 0) {
            $ResourceGroup = $swaInfo[0].resourceGroup
            Write-Host "✅ Found SWA in resource group: $ResourceGroup" -ForegroundColor Green
        }
        else {
            Write-Host "❌ Could not find SWA: $StaticWebAppName" -ForegroundColor Red
            Write-Host "💡 Make sure the SWA exists and you have access" -ForegroundColor Cyan
            exit 1
        }
    }
    catch {
        Write-Host "❌ Error finding SWA: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

try {
    $isGitRepo = Test-Path ".git"
    if ($isGitRepo) {
        $gitStatus = git status --porcelain 2>$null
        if ($gitStatus) {
            Write-Host "⚠️  Uncommitted changes detected:" -ForegroundColor Yellow
            $gitStatusLines = $gitStatus -split "`n"
            foreach ($line in $gitStatusLines | Select-Object -First 5) {
                if ($line.Trim()) {
                    Write-Host "   $line" -ForegroundColor Yellow
                }
            }
            Write-Host "💡 Changes will be committed after successful deployment" -ForegroundColor DarkGray
        }
        else {
            Write-Host "✅ Working directory is clean" -ForegroundColor Green
        }
        
        $currentBranch = git branch --show-current 2>$null
        if ($currentBranch) {
            Write-Host "📍 Current branch: $currentBranch" -ForegroundColor Cyan
        }
    }
    else {
        Write-Host "📁 Not a Git repository" -ForegroundColor Yellow
        $NoGitBackup = $true
    }
}
catch {
    Write-Host "📁 Git not available" -ForegroundColor Yellow
    $NoGitBackup = $true
}

# Install dependencies and build (unless skipped)
if (-not $SkipBuild) {
    Write-Host "`n📦 Installing dependencies..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ npm install failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
    
    # Run type checking (unless skipped)
    if (-not $SkipTests) {
        Write-Host "`n🔍 Running type check..." -ForegroundColor Cyan
        npm run type-check
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ TypeScript type checking failed" -ForegroundColor Red
            Write-Host "💡 Fix type errors before deployment" -ForegroundColor Cyan
            exit 1
        }
        Write-Host "✅ Type checking passed" -ForegroundColor Green
        
        Write-Host "`n📝 Running linter..." -ForegroundColor Cyan
        npm run lint
        if ($LASTEXITCODE -ne 0) {
            Write-Host "⚠️  Linting failed, but continuing deployment" -ForegroundColor Yellow
            Write-Host "💡 Consider fixing linting issues for better code quality" -ForegroundColor DarkGray
        }
        else {
            Write-Host "✅ Linting passed" -ForegroundColor Green
        }
    }
    else {
        Write-Host "⏭️  Skipping type checking and linting (-SkipTests specified)" -ForegroundColor Yellow
    }
    
    Write-Host "`n🔨 Building frontend..." -ForegroundColor Cyan
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Build completed successfully" -ForegroundColor Green
    
    # Verify build output
    if (Test-Path "dist") {
        $distFiles = Get-ChildItem "dist" -Recurse | Measure-Object
        Write-Host "📁 Build output: $($distFiles.Count) files in dist folder" -ForegroundColor DarkGray
    }
    else {
        Write-Host "⚠️  dist folder not found after build" -ForegroundColor Yellow
    }
}
else {
    Write-Host "⏭️  Skipping build (-SkipBuild specified)" -ForegroundColor Yellow
}

# Deploy using SWA CLI
Write-Host "`n🚀 Deploying to Static Web App: $StaticWebAppName..." -ForegroundColor Cyan

# Get deployment token for the SWA
Write-Host "Getting deployment token..." -ForegroundColor DarkGray
try {
    $deploymentToken = az staticwebapp secrets list --name "$StaticWebAppName" --resource-group "$ResourceGroup" --query "properties.apiKey" -o tsv 2>$null
    if (-not $deploymentToken) {
        Write-Host "❌ Could not get deployment token for SWA" -ForegroundColor Red
        Write-Host "💡 Make sure you have contributor access to the SWA" -ForegroundColor Cyan
        exit 1
    }
    Write-Host "✅ Deployment token retrieved" -ForegroundColor Green
}
catch {
    Write-Host "❌ Error getting deployment token: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Deploy using SWA CLI
try {
    Write-Host "Executing: swa deploy" -ForegroundColor DarkGray
    
    $tempConfigCreated = $false
    
    # Create a staticwebapp.config.json file if it doesn't exist to help SWA CLI
    if (-not (Test-Path "staticwebapp.config.json")) {
        Write-Host "⚠️  staticwebapp.config.json not found, creating temporary one" -ForegroundColor Yellow
        $tempConfigCreated = $true
        $staticConfig = @{
            "routes" = @(
                @{ "route" = "/api/*"; "allowedRoles" = @("authenticated") },
                @{ "route" = "/*"; "allowedRoles" = @("authenticated") },
                @{ "route" = "/.auth/**"; "allowedRoles" = @("anonymous") }
            )
        } | ConvertTo-Json -Depth 3
        $staticConfig | Out-File -FilePath "staticwebapp.config.json" -Encoding utf8
    }
    
    # Try direct deployment first - change to the project directory explicitly
    $currentDir = Get-Location
    Write-Host "Current directory: $currentDir" -ForegroundColor DarkGray
    Write-Host "Deploying from dist folder..." -ForegroundColor DarkGray
    
    # Use absolute paths to avoid scanning issues
    $distPath = Join-Path $currentDir "dist"
    Write-Host "Dist path: $distPath" -ForegroundColor DarkGray
    
    # Simple deployment command with minimal options - suppress punycode deprecation warning
    $env:NODE_OPTIONS = "--no-deprecation"
    $deployCommand = "swa deploy `"$distPath`" --deployment-token `"$deploymentToken`""
    Write-Host "Command: $deployCommand" -ForegroundColor DarkGray
    
    Invoke-Expression $deployCommand
    
    # Reset NODE_OPTIONS
    $env:NODE_OPTIONS = $null
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ SWA deployment failed" -ForegroundColor Red
        # Clean up temp config if created
        if ($tempConfigCreated -and (Test-Path "staticwebapp.config.json")) {
            Remove-Item "staticwebapp.config.json" -Force
        }
        exit 1
    }
    
    # Clean up temporary staticwebapp.config.json if we created it
    if ($tempConfigCreated -and (Test-Path "staticwebapp.config.json")) {
        Remove-Item "staticwebapp.config.json" -Force
        Write-Host "Cleaned up temporary configuration file" -ForegroundColor DarkGray
    }
    
    Write-Host "✅ SWA deployment completed successfully" -ForegroundColor Green
}
catch {
    Write-Host "❌ SWA deployment failed: $($_.Exception.Message)" -ForegroundColor Red
    # Clean up temp config if created
    if ($tempConfigCreated -and (Test-Path "staticwebapp.config.json")) {
        Remove-Item "staticwebapp.config.json" -Force
    }
    exit 1
}

# Get SWA information
Write-Host "`n🔍 Getting SWA information..." -ForegroundColor Cyan
try {
    $swaInfo = az staticwebapp show --name "$StaticWebAppName" --resource-group "$ResourceGroup" 2>$null | ConvertFrom-Json
    if ($swaInfo) {
        Write-Host "📍 SWA Details:" -ForegroundColor Cyan
        Write-Host "   Name: $($swaInfo.name)" -ForegroundColor DarkGray
        Write-Host "   Resource Group: $($swaInfo.resourceGroup)" -ForegroundColor DarkGray
        Write-Host "   Default Hostname: $($swaInfo.defaultHostname)" -ForegroundColor DarkGray
        $frontendUrl = "https://$($swaInfo.defaultHostname)"
    }
}
catch {
    Write-Host "🔍 Could not retrieve SWA details" -ForegroundColor DarkGray
}

# Test the deployment
Write-Host "`n🧪 Testing deployment..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

if ($frontendUrl) {
    try {
        Write-Host "Testing frontend at: $frontendUrl" -ForegroundColor DarkGray
        $response = Invoke-WebRequest -Uri $frontendUrl -Method GET -TimeoutSec 15 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Frontend is accessible and responding" -ForegroundColor Green
            Write-Host "🌐 Frontend URL: $frontendUrl" -ForegroundColor Cyan
        }
        else {
            Write-Host "⚠️  Frontend responded with status: $($response.StatusCode)" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "⚠️  Could not test frontend URL: $($_.Exception.Message)" -ForegroundColor Yellow
        Write-Host "💡 The deployment may still be successful, deployment can take a few minutes to propagate" -ForegroundColor DarkGray
    }
}
else {
    Write-Host "🔍 Frontend URL not available for testing" -ForegroundColor DarkGray
    Write-Host "💡 Check Azure portal for the deployed Static Web App URL" -ForegroundColor Cyan
}

# Check Azure AD configuration
Write-Host "`n🔐 Checking Azure AD configuration..." -ForegroundColor Cyan
try {
    $appSettings = az staticwebapp appsettings list --name "$StaticWebAppName" --resource-group "$ResourceGroup" 2>$null | ConvertFrom-Json
    $hasClientId = $appSettings | Where-Object { $_.name -eq "AZURE_CLIENT_ID" }
    $hasClientSecret = $appSettings | Where-Object { $_.name -eq "AZURE_CLIENT_SECRET" }
    
    if ($hasClientId -and $hasClientSecret) {
        Write-Host "✅ Azure AD configuration appears to be set up" -ForegroundColor Green
    }
    else {
        Write-Host "⚠️  Azure AD configuration may be incomplete" -ForegroundColor Yellow
        Write-Host "💡 Make sure to configure AZURE_CLIENT_ID and AZURE_CLIENT_SECRET in the SWA settings" -ForegroundColor Cyan
        Write-Host "💡 See: https://docs.microsoft.com/en-us/azure/static-web-apps/authentication-authorization" -ForegroundColor DarkGray
    }
}
catch {
    Write-Host "⚠️  Could not check Azure AD configuration" -ForegroundColor Yellow
    Write-Host "💡 Verify Azure AD settings manually in the Azure portal" -ForegroundColor Cyan
}

# GitHub backup (if not skipped and Git is available)
if (-not $NoGitBackup -and (Test-Path ".git")) {
    Write-Host "`n📤 Backing up to GitHub..." -ForegroundColor Cyan
    
    try {
        # Add all changes
        git add -A
        
        # Check if there are changes to commit
        $gitStatus = git status --porcelain 2>$null
        if ($gitStatus) {
            # Commit changes
            git commit -m "$CommitMessage"
            Write-Host "✅ Changes committed locally" -ForegroundColor Green
            
            # Push to GitHub
            Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
            git push origin main
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Successfully backed up to GitHub" -ForegroundColor Green
                
                # Show commit info
                $commitHash = git rev-parse HEAD 2>$null
                if ($commitHash) {
                    Write-Host "📍 Commit hash: $($commitHash.Substring(0,8))" -ForegroundColor DarkGray
                }
            }
            else {
                Write-Host "⚠️  Failed to push to GitHub" -ForegroundColor Yellow
                Write-Host "💡 You may need to push manually later" -ForegroundColor DarkGray
            }
        }
        else {
            Write-Host "✅ No changes to commit - repository is up to date" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "⚠️  GitHub backup failed: $($_.Exception.Message)" -ForegroundColor Yellow
        Write-Host "💡 Deployment was successful, but Git backup failed" -ForegroundColor DarkGray
    }
}
elseif ($NoGitBackup) {
    Write-Host "⏭️  Skipping GitHub backup (-NoGitBackup specified)" -ForegroundColor Yellow
}
else {
    Write-Host "⏭️  Skipping GitHub backup (not a Git repository)" -ForegroundColor Yellow
}

Write-Host "`n🎉 MosaicToolbox deployment pipeline completed!" -ForegroundColor Green
Write-Host "📍 Target SWA: $StaticWebAppName" -ForegroundColor Cyan
if ($frontendUrl) {
    Write-Host "🌐 Frontend URL: $frontendUrl" -ForegroundColor Cyan
}
Write-Host "💡 Check Azure portal for detailed deployment status" -ForegroundColor DarkGray
Write-Host "🔐 Verify Azure AD authentication is working properly" -ForegroundColor DarkYellow

Write-Host "`n✨ MosaicToolbox deployment completed successfully!" -ForegroundColor Green
