# CSB Site — Setup for Demo

## 1. Twilio (SMS notifications) — 5 min

1. Go to https://twilio.com/try-twilio — sign up (free, no card needed)
2. Verify your email, then verify phone number 708-203-1313
3. Get a free trial phone number (Twilio assigns one)
4. From the console dashboard, grab:
   - **Account SID** (starts with AC...)
   - **Auth Token**
   - **Your Twilio number** (e.g., +1312XXXXXXX)

## 2. Cloudflare Worker (notification endpoint) — 5 min

```bash
cd worker/
npx wrangler login          # opens browser to auth
npx wrangler deploy         # deploys the worker

# Set secrets (paste when prompted):
npx wrangler secret put TWILIO_SID
npx wrangler secret put TWILIO_AUTH_TOKEN
npx wrangler secret put TWILIO_FROM       # your Twilio number, e.g. +13125551234
npx wrangler secret put MIKE_PHONE        # +17082031313
```

Worker URL will be: `https://csb-notify.<your-account>.workers.dev`

## 3. Wire the form — 1 min

In `form-handler.js` line 4, set:
```js
const WORKER_URL = 'https://csb-notify.<your-account>.workers.dev';
```

Push and the form is live.

## 4. Test

1. Open https://salttymalty.github.io/csb-site
2. Fill out the form, submit
3. SMS arrives at 708-203-1313 with the quote request details

## What the SMS looks like

```
New CSB quote request!
From: Sarah Johnson (sarah@example.com)
Type: Wedding
Date: 2026-04-12
PITD: Wedding-level stress

Concorde Banquets, 200 guests, 7-piece band...
```
