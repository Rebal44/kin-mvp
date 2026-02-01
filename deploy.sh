#!/bin/bash
# Quick deployment helper for KIN

echo "=== KIN Deployment Helper ==="
echo ""
echo "Choose deployment option:"
echo "1) Railway (Recommended - uses railway.json)"
echo "2) Render (render.yaml)"
echo "3) Manual Docker"
echo ""

read -p "Option (1-3): " option

case $option in
  1)
    echo ""
    echo "=== Railway Deployment ==="
    echo "1. Go to: https://railway.app/new"
    echo "2. Select 'Deploy from GitHub repo'"
    echo "3. Choose: Rebal44/kin-mvp"
    echo "4. Railway will auto-detect railway.json"
    echo "5. Add Postgres and Redis databases"
    echo "6. Deploy!"
    echo ""
    echo "Or install Railway CLI:"
    echo "  npm install -g @railway/cli"
    echo "  railway login"
    echo "  railway link"
    echo "  railway up"
    ;;
  2)
    echo ""
    echo "=== Render Deployment ==="
    echo "1. Go to: https://dashboard.render.com/"
    echo "2. Click 'Blueprint' → 'New Blueprint Instance'"
    echo "3. Connect GitHub repo: Rebal44/kin-mvp"
    echo "4. Render will read render.yaml and create all services"
    echo "5. Deploy!"
    ;;
  3)
    echo ""
    echo "=== Manual Docker ==="
    echo "Building locally..."
    docker build -t kin-platform .
    docker run -p 3000:3000 -p 3001:3001 kin-platform
    ;;
  *)
    echo "Invalid option"
    exit 1
    ;;
esac
