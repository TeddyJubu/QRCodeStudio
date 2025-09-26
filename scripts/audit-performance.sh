#!/bin/bash

# Performance Audit Script for QRCodeStudio
# This script runs comprehensive performance audits including Lighthouse CI and bundle analysis

set -e

echo "🚀 Starting Performance Audit for QRCodeStudio..."

# Check if required dependencies are installed
if ! command -v lhci &> /dev/null; then
    echo "❌ Lighthouse CI not found. Installing..."
    npm install -g @lhci/cli@0.12.x
fi

# Create reports directory
mkdir -p performance-reports

echo "📊 Running Lighthouse CI audit..."
# Run Lighthouse CI audit
lhci autorun || {
    echo "⚠️  Lighthouse CI audit completed with warnings"
}

echo "📦 Running bundle analysis..."
# Build and analyze bundle
npm run build

# Check if bundle analysis was generated
if [ -f "dist/public/bundle-analysis.html" ]; then
    echo "✅ Bundle analysis generated successfully"
    cp dist/public/bundle-analysis.html performance-reports/
else
    echo "❌ Bundle analysis failed to generate"
fi

# Copy Lighthouse reports if they exist
if [ -d ".lighthouseci" ]; then
    echo "📋 Copying Lighthouse reports..."
    cp -r .lighthouseci/* performance-reports/ 2>/dev/null || true
fi

echo "📈 Generating performance summary..."
# Generate a simple summary report
cat > performance-reports/summary.md << EOF
# Performance Audit Summary

## Audit Date: $(date)

## Lighthouse CI Results
$(ls -la performance-reports/ | grep -E '\.(json|html)$' || echo "No Lighthouse reports found")

## Bundle Analysis
- Bundle analysis report: $(ls -la performance-reports/bundle-analysis.html 2>/dev/null || echo "Not found")

## Next Steps
1. Review Lighthouse scores and address any issues below 90%
2. Check bundle size against budgets in performance-budget.json
3. Optimize any large chunks identified in bundle analysis
4. Run audit again after optimizations

## Commands
- View bundle analysis: open performance-reports/bundle-analysis.html
- Run individual audit: npm run audit:lighthouse
- Analyze bundle only: npm run analyze
EOF

echo "✅ Performance audit completed!"
echo "📁 Reports available in: performance-reports/"
echo "📋 Summary: performance-reports/summary.md"
echo ""
echo "🔍 Quick commands:"
echo "  View bundle analysis: open performance-reports/bundle-analysis.html"
echo "  Read summary: cat performance-reports/summary.md"