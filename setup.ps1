# Setup script for Enterprise E2E Test Platform (PowerShell)
# Run this script to set up the project from scratch

Write-Host "🚀 Setting up Enterprise E2E Test Platform..." -ForegroundColor Green

# Check Node version
$nodeVersion = node -v
$majorVersion = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')

if ($majorVersion -lt 18) {
    Write-Host "❌ Node.js 18+ is required. Current version: $nodeVersion" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Node.js version check passed: $nodeVersion" -ForegroundColor Green

# Install dependencies
Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Create .env file if it doesn't exist
if (-not (Test-Path .env)) {
    Write-Host ""
    Write-Host "📝 Creating .env file from .env.example..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "✅ .env file created" -ForegroundColor Green
}

# Create necessary directories
Write-Host ""
Write-Host "📁 Creating necessary directories..." -ForegroundColor Yellow
$directories = @(
    "test-platform\allure-results",
    "test-platform\playwright-report",
    "test-platform\coverage",
    "logs",
    "screenshots"
)

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "✅ Created: $dir" -ForegroundColor Green
    }
}


Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📖 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Review .env file: get-content .env"
Write-Host "  2. Ensure mock services are running (see REPO_SEPARATION_GUIDE.md)"
Write-Host "  3. Run tests: npm test"
Write-Host "  4. View reports: npm run report:html"
Write-Host ""
