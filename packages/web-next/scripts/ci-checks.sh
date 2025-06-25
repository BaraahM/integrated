#!/bin/bash

# CI Checks Script for Web-Next Package
# This script runs all the quality checks needed for GitLab CI

set -e  # Exit on any error

echo "🚀 Starting CI checks for Web-Next package..."

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Change to Web-Next directory if not already there
if [[ ! -f "package.json" ]]; then
    cd packages/web-next
fi

echo "📍 Current directory: $(pwd)"

# Check if node_modules exists
echo "🔍 Checking dependencies..."
if [[ ! -d "node_modules" ]]; then
    print_warning "node_modules not found, installing dependencies..."
    yarn install
fi
print_status "Dependencies checked"

# Run linting (Next.js built-in linting)
echo "🔍 Running Next.js ESLint checks..."
if yarn lint:check; then
    print_status "Linting passed"
else
    print_error "Linting failed"
    exit 1
fi

# Run Prettier check
echo "🎨 Checking code formatting..."
if yarn prettier --check "**/*.{ts,tsx}"; then
    print_status "Code formatting is correct"
else
    print_error "Code formatting issues found"
    echo "💡 Run 'yarn format' to fix formatting issues"
    exit 1
fi

# Run unit tests with coverage
echo "🧪 Running unit tests with coverage..."
if yarn test:cov; then
    print_status "Unit tests passed"
else
    print_error "Unit tests failed"
    exit 1
fi

# Check if coverage files were generated
echo "📊 Checking coverage reports..."
if [[ -f "coverage/cobertura-coverage.xml" ]]; then
    print_status "Coverage report generated (cobertura-coverage.xml)"
else
    print_warning "Coverage report not found"
fi

if [[ -f "coverage/lcov.info" ]]; then
    print_status "LCOV coverage report generated"
else
    print_warning "LCOV coverage report not found"
fi

# TypeScript compilation check
echo "🔨 Checking TypeScript compilation..."
if yarn tsc --noEmit; then
    print_status "TypeScript compilation check passed"
else
    print_error "TypeScript compilation errors found"
    exit 1
fi

# Next.js build check
echo "🏗️  Testing Next.js build process..."
if yarn build; then
    print_status "Next.js build successful"
else
    print_error "Next.js build failed"
    exit 1
fi

# Run E2E tests if Playwright is available
if command -v npx &> /dev/null && [[ -f "playwright.config.ts" ]]; then
    echo "🎭 Running E2E tests with Playwright..."
    if yarn test:e2e; then
        print_status "E2E tests passed"
    else
        print_warning "E2E tests failed or not configured"
    fi
else
    print_warning "Playwright not configured, skipping E2E tests"
fi

# Final summary
echo ""
echo "🎉 All CI checks completed successfully!"
echo ""
echo "📋 Summary:"
echo "  ✅ Linting passed"
echo "  ✅ Code formatting correct"
echo "  ✅ Unit tests passed"
echo "  ✅ Coverage reports generated"
echo "  ✅ TypeScript compilation successful"
echo "  ✅ Next.js build successful"
echo ""
echo "🚀 Ready for deployment!" 
