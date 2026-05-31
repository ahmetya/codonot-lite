#!/bin/bash
cd ~/codonot-lite
git pull origin master

# Server
cd server
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 restart codonot-lite-api

# Client
cd ../client
npm install
npm run build

echo "✅ Codonot Lite deployed!"