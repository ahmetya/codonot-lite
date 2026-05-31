#!/bin/bash
cd ~/codonot-lite
git pull origin main

# Server
cd server
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 restart codonot-lite

# Client
cd ../client
npm install
npm run build

echo "✅ Codonot Lite deployed!"