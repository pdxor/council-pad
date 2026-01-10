#!/bin/bash

# Pre-commit Security Check Script
# Run this before committing to ensure no secrets are exposed

echo "🔒 Running Security Check..."
echo "================================"
echo ""

# Check if .env files are being tracked
echo "Checking for .env files in git..."
if git ls-files | grep -E "\.env$|\.env\."; then
    echo "❌ ERROR: .env files found in git!"
    echo "These files should be in .gitignore:"
    git ls-files | grep -E "\.env$|\.env\."
    exit 1
else
    echo "✅ No .env files tracked by git"
fi
echo ""

# Check for common secret patterns (excluding node_modules)
echo "Scanning for potential secrets in tracked files..."

PATTERNS=(
    "sk-[a-zA-Z0-9]{48}"  # OpenAI API keys
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+"  # JWT tokens
)

FOUND_SECRETS=0

for pattern in "${PATTERNS[@]}"; do
    if git diff --cached --diff-filter=ACM | grep -E "$pattern" > /dev/null 2>&1; then
        echo "⚠️  WARNING: Potential secret pattern found: $pattern"
        FOUND_SECRETS=1
    fi
done

if [ $FOUND_SECRETS -eq 1 ]; then
    echo ""
    echo "❌ Potential secrets detected in staged changes!"
    echo "Please review your changes before committing."
    exit 1
else
    echo "✅ No obvious secret patterns detected"
fi
echo ""

# Check if ENV_TEMPLATE has real credentials
echo "Checking ENV_TEMPLATE.txt..."
if grep -E "https://[a-z]{20}\.supabase\.co" ENV_TEMPLATE.txt > /dev/null 2>&1; then
    echo "❌ ENV_TEMPLATE.txt contains real Supabase URL!"
    exit 1
elif grep -E "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" ENV_TEMPLATE.txt > /dev/null 2>&1; then
    echo "❌ ENV_TEMPLATE.txt contains real JWT token!"
    exit 1
else
    echo "✅ ENV_TEMPLATE.txt looks good"
fi
echo ""

# Final checks
echo "================================"
echo "🎉 All security checks passed!"
echo ""
echo "✅ Safe to commit"
echo ""

