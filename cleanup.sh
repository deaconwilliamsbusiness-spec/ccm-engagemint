#!/bin/bash

echo "🧹 EngageMint Repository Cleanup"
echo "================================="

# Confirm before proceeding
read -p "This will delete files. Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

echo "1️⃣ Removing root node_modules..."
rm -rf node_modules/
rm -f package-lock.json

echo "2️⃣ Removing old documentation..."
rm -f DEVNET_EXECUTION_GUIDE.md
rm -f ENGAGEMENT_AUDIT.md
rm -f FINAL_INTEGRATION_SUMMARY.md
rm -f IMPLEMENTATION_SUMMARY.md
rm -f INTEGRATION_STATUS.md
rm -f LOCALHOST_SETUP.md
rm -f QUICK_START.md
rm -f READY_TO_PUSH.md
rm -f PRODUCTION_DEPLOYMENT_READY.md

echo "3️⃣ Removing duplicate folders..."
rm -rf engagemint-bonding-curve/

echo "4️⃣ Removing orphan files..."
rm -f server.js
rm -f package.json
rm -f vercel.json

echo "5️⃣ Removing build artifacts..."
rm -rf target/
rm -rf frontend/.next/
rm -rf backend/node_modules/.cache/

echo "6️⃣ Removing logs..."
rm -f frontend/frontend.log
find . -name "*.log" -type f -delete
find . -name ".DS_Store" -type f -delete

echo "7️⃣ Cleaning uploads (keeping .gitkeep)..."
find backend/uploads/ -type f ! -name '.gitkeep' -delete 2>/dev/null || true

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "Repository size now:"
du -sh .
echo ""
echo "Next steps:"
echo "1. Run: git status"
echo "2. Review changes"
echo "3. Commit: git add -A && git commit -m 'Clean up repository'"
echo "4. Test: cd backend && npm run dev"
echo "5. Test: cd frontend && npm run dev"
