#!/usr/bin/env bash
set -euo pipefail

# ============================================
# FreeInvoice One-Shot Deploy Script
# ============================================
# Usage: ./deploy.sh <NEON_DATABASE_URL> <VERCEL_TOKEN>
# Example: ./deploy.sh "postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/freeinvoice?sslmode=require" "vercel_token_xyz"

NEON_URL="${1:?Usage: ./deploy.sh <NEON_DATABASE_URL> <VERCEL_TOKEN>}"
VERCEL_TOKEN="${2:?Usage: ./deploy.sh <NEON_DATABASE_URL> <VERCEL_TOKEN>}"

echo "=== FreeInvoice Deploy ==="
echo "Neon URL: ${NEON_URL:0:30}..."
echo "Vercel Token: ${VERCEL_TOKEN:0:10}..."

cd "$(dirname "$0")"

# Step 1: Auth Vercel
echo ""
echo "[1/6] Authenticating Vercel..."
vercel login --token "$VERCEL_TOKEN"

# Step 2: Link project
echo ""
echo "[2/6] Linking project to Vercel..."
vercel link --yes --token "$VERCEL_TOKEN"

# Step 3: Set environment variables
echo ""
echo "[3/6] Setting environment variables on Vercel..."

# Read current .env values (excluding comments and empty lines)
while IFS='=' read -r key value; do
  [[ -z "$key" || "$key" == \#* ]] && continue
  value="${value%"}"  value="${value#"}"  # Strip quotes
  [[ -z "$value" ]] && continue
  echo "  Setting $key=***"
  echo "$value" | vercel env add "$key" production --token "$VERCEL_TOKEN" 2>/dev/null || true
done < .env

# Override DATABASE_URL with Neon
echo "$NEON_URL" | vercel env add DATABASE_URL production --token "$VERCEL_TOKEN" 2>/dev/null || true

# Step 4: Run Prisma migration against Neon
echo ""
echo "[4/6] Running Prisma migration against Neon..."
export DATABASE_URL="$NEON_URL"
npx prisma migrate deploy
npx prisma db push --accept-data-loss

# Step 5: Deploy to Vercel
echo ""
echo "[5/6] Deploying to Vercel (production)..."
vercel --prod --token "$VERCEL_TOKEN"

# Step 6: Get the live URL
echo ""
echo "[6/6] Getting production URL..."
LIVE_URL=$(vercel ls --token "$VERCEL_TOKEN" 2>/dev/null | grep -m1 "freeinvoice" || echo "check vercel dashboard")

echo ""
echo "=== DEPLOY COMPLETE ==="
echo "Live URL: $LIVE_URL"
echo ""
echo "NEXT STEPS:"
echo "1. Update Google OAuth redirect URI: $LIVE_URL/api/auth/callback/google"
echo "2. Update NEXTAUTH_URL env var on Vercel to: $LIVE_URL"
echo "3. Add Stripe webhook: $LIVE_URL/api/stripe/webhook"
echo "4. Switch Stripe to live mode and update price IDs"
echo ""
echo "Revenue target: 90 EUR/mo = 10 Pro subscribers at 9 EUR/mo"
echo "Dutch freelancer market: 1.2M self-employed"
echo "Conversion needed: 0.001% of market = break-even"
