#!/usr/bin/env bash
set -euo pipefail

# ============================================
# FreeInvoice Landing Page Deploy Script
# Deploys a static HTML landing page to Vercel
# ============================================
# Usage: ./deploy-landing.sh
# Requires: vercel CLI authenticated

PROJECT_DIR="/home/auham/freeinvoice/landing"
PROJECT_NAME="freeinvoice"

echo "=== FreeInvoice Landing Page Deploy ==="
echo "Project: $PROJECT_NAME"
echo "Directory: $PROJECT_DIR"
echo ""

cd "$PROJECT_DIR"

# Step 1: Create vercel.json for static deployment
echo "[1/4] Creating vercel.json..."
cat > vercel.json <<'EOF'
{
  "version": 2,
  "name": "freeinvoice",
  "public": true,
  "builds": [
    {
      "src": "index.html",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
EOF

# Step 2: Link to existing Vercel project if available
echo ""
echo "[2/4] Linking Vercel project..."
if [ -f ../.vercel/project.json ]; then
  echo "Found existing Vercel project link. Copying..."
  mkdir -p .vercel
  cp ../.vercel/project.json .vercel/project.json 2>/dev/null || true
  cp ../.vercel/README.txt .vercel/README.txt 2>/dev/null || true
fi

# Step 3: Deploy
echo ""
echo "[3/4] Deploying to Vercel..."
vercel --prod --yes 2>/dev/null || vercel --yes

# Step 4: Get URL
echo ""
echo "[4/4] Deployment complete!"
echo ""
echo "NEXT STEPS:"
echo "1. Go to https://dashboard.stripe.com/products"
echo "2. Create a Pro product (€9/month) and copy the Payment Link"
echo "3. Create an Agency product (€29/month) and copy the Payment Link"
echo "4. Replace PLACEHOLDER_PRO and PLACEHOLDER_AGENCY in index.html"
echo "5. Run: cd $PROJECT_DIR && vercel --prod"
echo ""
echo "Marketing ready to launch! 🚀"
