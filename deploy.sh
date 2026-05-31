#!/bin/bash
set -e

cd ~/codonot-lite

echo "📦 Pulling latest code..."
git fetch origin master
git reset --hard origin/master    # ← force reset, ignores local changes

echo "🔧 Building server..."
cd server
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 restart codonot-lite-api

echo "🎨 Building client..."
cd ../client
npm install
npm run build

echo "✅ Codonot Lite deployed!"