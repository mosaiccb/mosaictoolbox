# 🛠️ MosaicToolbox Modern Deployment Script - PowerShell
# Deploy using Azure Developer CLI (azd) with fallback to SWA CLI
# 
# Author: GitHub Copilot AI Assistant
# Purpose: Modern deployment pipeline using azd deploy

param(
    [Parameter(Mandatory = $false)]
    [switch]$SkipBuild,
    
    [Parameter(Mandatory = $false)]
    [switch]$SkipTests,
    
    [Parameter(Mandatory = $false)]
    [switch]$UseAzd,
    
    [Parameter(Mandatory = $false)]
    [switch]$VerboseOutput
)

Write-Host "🛠️ Starting MosaicToolbox Modern Deployment" -ForegroundColor Green
Write-Host "📅 Deployment initiated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor DarkGray

# Check prerequisites
Write-Host "`n📋 Checking prerequisites..." -ForegroundColor Cyan

# Check Node.js
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ Node.js not found" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Node.js not found" -ForegroundColor Red
    exit 1
}

# Check Azure CLI
try {
    $azAccount = az account show 2>$null | ConvertFrom-Json
    if ($azAccount) {
        Write-Host "✅ Azure CLI authenticated as: $($azAccount.user.name)" -ForegroundColor Green
    } else {
        Write-Host "❌ Azure CLI not authenticated" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Azure CLI not available" -ForegroundColor Red
    exit 1
}

# Check Azure Developer CLI (default to using azd)
if (-not $UseAzd.IsPresent) {
    # Default to using azd if not explicitly disabled
    $UseAzd = $true
}

if ($UseAzd) {
    try {
        $azdVersion = azd version 2>$null
        if ($azdVersion) {
            Write-Host "✅ Azure Developer CLI available" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Azure Developer CLI not found, falling back to SWA CLI" -ForegroundColor Yellow
            $UseAzd = $false
        }
    } catch {
        Write-Host "⚠️  Azure Developer CLI not found, falling back to SWA CLI" -ForegroundColor Yellow
        $UseAzd = $false
    }
}

# Dependencies and Build
if (-not $SkipBuild) {
    Write-Host "`n📦 Installing dependencies..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ npm install failed" -ForegroundColor Red
        exit 1
    }
    
    if (-not $SkipTests) {
        Write-Host "`n🔍 Running type check..." -ForegroundColor Cyan
        npm run type-check
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Type checking failed" -ForegroundColor Red
            exit 1
        }
    }
    
    Write-Host "`n🔨 Building..." -ForegroundColor Cyan
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed" -ForegroundColor Red
        exit 1
    }
}

# Deployment
Write-Host "`n🚀 Deploying..." -ForegroundColor Cyan

if ($UseAzd) {
    # Modern azd deployment
    Write-Host "Using Azure Developer CLI (azd)..." -ForegroundColor Cyan
    
    # Check if azd is initialized
    if (-not (Test-Path ".azure")) {
        Write-Host "⚠️  azd not initialized. Initializing..." -ForegroundColor Yellow
        azd env new
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ azd environment creation failed" -ForegroundColor Red
            exit 1
        }
    }
    
    # Suppress Node.js deprecation warnings for azd
    $env:NODE_OPTIONS = "--no-deprecation"
    
    azd deploy
    $deployResult = $LASTEXITCODE
    
    # Reset NODE_OPTIONS
    $env:NODE_OPTIONS = $null
    
    if ($deployResult -ne 0) {
        Write-Host "❌ azd deployment failed" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ azd deployment completed" -ForegroundColor Green
    
    # Get deployment URL
    try {
        $azdEnv = azd env get-values 2>$null
        if ($azdEnv) {
            $urlLine = $azdEnv | Where-Object { $_ -match "SERVICE_WEB_URI" }
            if ($urlLine) {
                $frontendUrl = ($urlLine -split "=")[1].Trim('"')
                Write-Host "🌐 Frontend URL: $frontendUrl" -ForegroundColor Cyan
            }
        }
    } catch {
        Write-Host "🔍 Could not retrieve deployment URL" -ForegroundColor DarkGray
    }
    
} else {
    # Fallback to existing SWA CLI method
    Write-Host "Using SWA CLI fallback method..." -ForegroundColor Yellow
    
    # Your existing SWA CLI deployment logic here
    Write-Host "💡 Falling back to existing deploy.ps1 method" -ForegroundColor Cyan
    & .\deploy.ps1 -SkipBuild:$SkipBuild -SkipTests:$SkipTests
}

Write-Host "`n🎉 Deployment completed!" -ForegroundColor Green
