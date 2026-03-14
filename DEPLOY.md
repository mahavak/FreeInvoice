# FreeInvoice Deployment SOP (Standard Operating Procedure)

## 1. Environment Finalization (.env)
Ensure the following are configured in Vercel/Production:
- [ ] `DATABASE_URL`: Production Postgres string.
- [ ] `NEXTAUTH_SECRET`: Generate using `openssl rand -base64 32`.
- [ ] `STRIPE_SECRET_KEY`: Live Stripe key.
- [ ] `STRIPE_PRO_PRICE_ID`: Stripe Price ID for $7/mo.
- [ ] `STRIPE_AGENCY_PRICE_ID`: Stripe Price ID for $20/mo.
- [ ] `AI_NODE_URL`: Your Cloudflare Tunnel URL (pointing to your 3090 Ti).

## 2. AI Node Setup (3090 Ti)
1. Start the Qwen server: `bash start-llm-server.sh`
2. Start the secure tunnel: `cloudflared tunnel run freeinvoice-ai`
3. Verify connectivity: `curl https://your-tunnel-url.com/v1/models`

## 3. Database Sync
Run migrations against the production database:
```bash
npx prisma migrate deploy
```

## 4. Launch Sequence (Day 1)
- [ ] **Twitter:** Post the "Plain English to Invoice" demo video.
- [ ] **Reddit:** Post in r/freelance and r/entrepreneur using the "1-for-3" hook.
- [ ] **Indie Hackers:** Share the "Local AI Node" technical breakdown to attract dev-users.

## 5. Post-Launch Monitoring
- [ ] Monitor GPU utilization via the `Mission Control` dashboard.
- [ ] Check Stripe dashboard for "Impact Credits" generation.
- [ ] Verify PDF generation consistency on mobile devices.
