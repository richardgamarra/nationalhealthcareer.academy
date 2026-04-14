#!/bin/bash
# OVH deployment script — run this ON the OVH server
# First run: bash deploy.sh
# Subsequent deploys: git pull && npm run build && pm2 restart nha

set -e

APP_DIR="/var/www/nationalhealthcareer.academy"
REPO="https://github.com/richardgamarra/nationalhealthcareer.academy.git"

if [ ! -d "$APP_DIR/.git" ]; then
  echo "⬇ Cloning repo..."
  git clone "$REPO" "$APP_DIR"
fi

cd "$APP_DIR"

echo "⬇ Pulling latest..."
git pull origin main

echo "📦 Installing dependencies..."
npm ci --production=false

echo "🔨 Building..."
npm run build

echo "🚀 Starting/restarting with PM2..."
pm2 describe nha > /dev/null 2>&1 \
  && pm2 restart nha \
  || pm2 start npm --name "nha" -- start

pm2 save

echo "✅ Deployed!"
