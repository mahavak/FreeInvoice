# FreeInvoice Stripe Setup Guide

## Phase 1: Revenue Foundation

### 1. Create Stripe Products

Log into your [Stripe Dashboard](https://dashboard.stripe.com/products) and create the following products:

#### Pro Tier ($9/month)
```
Product: FreeInvoice Pro
Price: $9.00 / month
Price ID: price_pro_monthly (or use auto-generated)
```

#### Agency Tier ($29/month)
```
Product: FreeInvoice Agency
Price: $29.00 / month
Price ID: price_agency_monthly (or use auto-generated)
```

### 2. Get Your Keys

From the Stripe Dashboard:

1. **API Keys** (Developers > API Keys):
   - `STRIPE_SECRET_KEY` - Your secret key (sk_test_... or sk_live_...)
   - `STRIPE_PUBLISHABLE_KEY` - Your publishable key (pk_test_... or pk_live_...)

2. **Webhook Secret** (Developers > Webhooks):
   - Create a webhook endpoint: `https://your-domain.com/api/stripe/webhook`
   - Select events: `checkout.session.completed`, `customer.subscription.*`, `invoice.*`
   - Copy the signing secret: `STRIPE_WEBHOOK_SECRET` (whsec_...)

3. **Price IDs** (Products > Click each product):
   - Copy the Price ID for each tier
   - Set `STRIPE_PRO_PRICE_ID` and `STRIPE_AGENCY_PRICE_ID`

### 3. Update .env

```bash
# Add to .env
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRO_PRICE_ID=price_xxx
STRIPE_AGENCY_PRICE_ID=price_xxx
```

### 4. Run Database Migration

```bash
cd ~/freeinvoice
npm run db:push
# or
npx prisma db push
```

### 5. Install Dependencies & Start

```bash
npm install
npm run dev
```

### 6. Test the Flow

1. Go to http://localhost:3000/pricing
2. Click "Start Pro Trial"
3. Use Stripe test card: `4242 4242 4242 4242`
4. Complete checkout
5. Check subscription status at `/dashboard`

## Social Impact Model

The 1-for-3 model is automatically tracked:
- Pro subscription: Creates 1 SocialImpactCredit
- Agency subscription: Creates 5 SocialImpactCredits
- Free users can be matched to these credits

## Next Steps

- Phase 2: Client management UI
- Phase 3: AI fallback (Local Qwen → OpenRouter)
- Phase 4: Connect briefing agents for AI assistant feature