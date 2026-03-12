#!/bin/bash

# Setup script for Enterprise E2E Test Platform
# Run this script to set up the project from scratch

set -e

echo "🚀 Setting up Enterprise E2E Test Platform..."

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ Node.js 18+ is required. Current version: $(node -v)"
  exit 1
fi

echo "✅ Node.js version check passed: $(node -v)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
  echo ""
  echo "📝 Creating .env file from .env.example..."
  cp .env.example .env
  echo "✅ .env file created"
fi

# Create necessary directories
echo ""
echo "📁 Creating necessary directories..."
mkdir -p test-platform/allure-results
mkdir -p test-platform/playwright-report
mkdir -p test-platform/coverage
mkdir -p logs
mkdir -p screenshots

# Verify Docker installation

echo ""
echo "✅ Setup complete!"
echo ""
echo "📖 Next steps:"
echo "  1. Review .env file: cat .env" 
 echo "  2. Ensure mock services are running (see REPO_SEPARATION_GUIDE.md)"
echo "  3. Run tests: npm test"
echo "  4. View reports: npm run report:html"
echo ""
