# FreeInvoice Deployment SOP (Standard Operating Procedure)

## Current Status (Updated April 24, 2026)
- ✅ Code is production-ready (Next.js 16.1.6, Prisma 6, Stripe 17.4)
- ✅ Prisma schema migrated to PostgreSQL (from SQLite)
- ✅ Local build passes (`npm run build` — 16 routes, 0 errors)
- ✅ Stripe integration working (Pro $9/mo, Agency $29/mo)
- ✅ Google OAuth configured
- ✅ Local Qwen LLM healthy on port 8000
- ⚠️ Stripe in **test mode** — needs live mode keys for production
- ❌ No production database (still on SQLite dev.db) — needs Neon/Supabase Postgres
- ❌ Vercel CLI not authenticated — needs manual `vercel login` or token

## Quick Deploy (3 Manual Steps)

### Step 1: Create Neon Database (5 min)
1. Go to https://console.neon.tech → sign up / log in
2. Create new project: name=`freeinvoice`, region=`Frankfurt` (closest to NL)
3. Copy the connection string (looks like `postgresql://neondb_owner:...@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require`)

### Step 2: Get Vercel Token (2 min)
1. Go to https://vercel.com/account/tokens
2. Create a token with scope "Full Account"
3. Copy the token value

### Step 3: Run the Deploy Script
```bash
cd ~/freeinvoice
./deploy.sh "<NEON_URL>" "<VERCEL_TOKEN>"
```

Or run the pre-flight check first:
```bash
./preflight-check.sh
```

## Post-Deploy Checklist
- [ ] Update Google OAuth redirect URI: `<LIVE_URL>/api/auth/callback/google`
- [ ] Update NEXTAUTH_URL on Vercel to the production URL
- [ ] Add Stripe webhook endpoint: `<LIVE_URL>/api/stripe/webhook`
- [ ] Switch Stripe to live mode and update keys/price IDs
- [ ] Update Google Cloud Console authorized redirect URIs

## Pricing Tiers
| Tier | Price | Invoices/month | Target |
|------|-------|---------------|--------|
| Free | $0 | 3 | Trial users |
| Pro | $9/mo | 50 | Solo freelancers |
| Agency | $29/mo | Unlimited | Small agencies |

## Market
- 1.2M self-employed in Netherlands
- Revenue target: €90/mo = 10 Pro subscribers
- Conversion needed: 0.001% of Dutch freelancer market

## Launch Marketing
- **Reddit:** r/freelance, r/entrepreneur — "1-for-3" social impact hook
- **Indie Hackers:** "Local AI Node" technical breakdown
- **Twitter/X:** "Plain English to Invoice" demo

## Environment Variables (Required on Vercel)
- `DATABASE_URL` — Neon PostgreSQL connection string
- `NEXTAUTH_URL` — Production URL (after deploy)
- `NEXTAUTH_SECRET` — Already generated (in .env)
- `GOOGLE_CLIENT_ID` — Already set
- `GOOGLE_CLIENT_SECRET` — Already set
- `STRIPE_PUBLISHABLE_KEY` — Currently test mode
- `STRIPE_SECRET_KEY` — Currently test mode
- `STRIPE_PRO_PRICE_ID` — `price_1TGM3y2fLVt6s3n8SyikD8Ws` (test)
- `STRIPE_AGENCY_PRICE_ID` — `price_1TGM5m2fLVt6s3n8JOzqqYvw` (test)
- `STRIPE_WEBHOOK_SECRET` — Set after creating webhook endpoint
- `AI_NODE_URL` — Local Qwen tunnel URL (or OpenRouter fallback)