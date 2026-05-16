#!/usr/bin/env bash
set -uo pipefail

# ============================================
# FreeInvoice Deployment Pre-Flight Check
# ============================================
# Run this to verify all prerequisites before deploying

echo "╔══════════════════════════════════════════════════════════╗"
echo "║       FreeInvoice Deployment Pre-Flight Check           ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

PASS=0
FAIL=0
WARN=0

check_pass() { echo "  ✅ $1"; ((PASS++)); }
check_fail() { echo "  ❌ $1"; ((FAIL++)); }
check_warn() { echo "  ⚠️  $1"; ((WARN++)); }

cd "$(dirname "$0")"

# 1. Project files
echo "━━━ Project Files ━━━"
if [ -f package.json ]; then check_pass "package.json exists"; else check_fail "package.json missing"; fi
if [ -f prisma/schema.prisma ]; then check_pass "schema.prisma exists"; else check_fail "schema.prisma missing"; fi
if [ -f .env ]; then check_pass ".env exists"; else check_fail ".env missing"; fi
if [ -d .next ]; then check_pass "Next.js build exists (.next/)"; else check_warn "No .next build dir - run: npm run build"; fi
echo ""

# 2. Prisma config
echo "━━━ Database ━━━"
if grep -q '"postgresql"' prisma/schema.prisma 2>/dev/null; then
    check_pass "Prisma schema set to PostgreSQL"
else
    check_fail "Prisma schema NOT set to PostgreSQL (currently SQLite)"
    echo "       Fix: edit prisma/schema.prisma and change provider to \"postgresql\""
fi

if grep -q 'dev.db' .env 2>/dev/null && grep -q 'DATABASE_URL' .env 2>/dev/null; then
    check_warn "DATABASE_URL still points to local SQLite (dev.db)"
    echo "       Need: Neon/Supabase PostgreSQL connection string"
    echo "       Get one free at: https://console.neon.tech"
else
    if grep -q 'postgresql://' .env 2>/dev/null; then
        check_pass "DATABASE_URL is a PostgreSQL connection string"
    else
        check_fail "DATABASE_URL not found or invalid in .env"
    fi
fi
echo ""

# 3. Vercel authentication
echo "━━━ Vercel ━━━"
if command -v vercel &>/dev/null; then
    VERCEL_AUTH=$(vercel whoami 2>&1)
    if echo "$VERCEL_AUTH" | grep -qi "error\|no existing credentials"; then
        check_fail "Vercel CLI not authenticated"
        echo "       Fix: run 'vercel login' or set VERCEL_TOKEN env var"
        echo "       Get token at: https://vercel.com/account/tokens"
    else
        check_pass "Vercel CLI authenticated as: $VERCEL_AUTH"
    fi
else
    check_fail "Vercel CLI not installed"
    echo "       Fix: npm i -g vercel"
fi
echo ""

# 4. Stripe configuration
echo "━━━ Stripe ━━━"
if grep -q 'pk_test_' .env 2>/dev/null; then
    check_warn "Stripe is in TEST mode (pk_test_...)"
    echo "       For production: switch to live mode in Stripe Dashboard"
    echo "       Then update STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, and price IDs"
elif grep -q 'pk_live_' .env 2>/dev/null; then
    check_pass "Stripe is in LIVE mode"
else
    check_fail "Stripe keys not found in .env"
fi

if grep -q 'STRIPE_PRO_PRICE_ID' .env 2>/dev/null; then
    if grep -q 'price_1' .env 2>/dev/null; then
        check_pass "Stripe price IDs configured"
    else
        check_warn "Stripe price IDs may be empty/placeholder"
    fi
else
    check_fail "STRIPE_PRO_PRICE_ID not in .env"
fi
echo ""

# 5. Auth configuration
echo "━━━ Authentication ━━━"
if grep -q 'NEXTAUTH_SECRET=.' .env 2>/dev/null; then
    check_pass "NEXTAUTH_SECRET is set"
else
    check_warn "NEXTAUTH_SECRET may be empty"
    echo "       Generate: openssl rand -base64 32"
fi

if grep -q 'GOOGLE_CLIENT_ID=.' .env 2>/dev/null; then
    check_pass "Google OAuth Client ID set"
else
    check_warn "Google OAuth Client ID not set"
fi
echo ""

# 6. AI Node
echo "━━━ AI Integration ━━━"
if curl -s --max-time 3 http://localhost:8000/health 2>/dev/null | grep -q 'ok\|healthy\|status'; then
    check_pass "Local Qwen LLM running on port 8000"
else
    check_warn "Local LLM not responding on port 8000"
    echo "       AI features will use OpenRouter fallback"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Results: ✅ $PASS passed  |  ❌ $FAIL failed  |  ⚠️  $WARN warnings"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $FAIL -gt 0 ]; then
    echo "  🚫 Cannot deploy — fix ❌ items above first"
    echo ""
    echo "  QUICKEST PATH TO DEPLOY:"
    echo "  1. Create free Neon database: https://console.neon.tech"
    echo "  2. Get Vercel token: https://vercel.com/account/tokens"
    echo "  3. Run: ./deploy.sh <NEON_URL> <VERCEL_TOKEN>"
    exit 1
elif [ $WARN -gt 0 ]; then
    echo "  ⚡ Can deploy with warnings — review ⚠️ items above"
    echo "  Production launch requires fixing warnings first"
    exit 0
else
    echo "  🚀 Ready to deploy! Run: ./deploy.sh <NEON_URL> <VERCEL_TOKEN>"
    exit 0
fi
