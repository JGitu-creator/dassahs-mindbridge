# Provider Selection & Credits — Setup Guide

This guide covers everything needed to run the provider selection page (`/select-provider`), the credit system, and Lemon Squeezy payments for Dassah's Prism.

**Credit model:** 50 free credits/day (topped up when >24h since last reset), `PRISM_CREDITS_PER_REQUEST` (default 10) per AI request. Paid packs: **500 credits / $5**, **2000 credits / $15**.

---

## 1. Run the Supabase SQL migration

1. Open the SQL editor: https://supabase.com/dashboard/project/kuhbflsmgrlrwkooerpd/sql
2. Paste the full contents of `supabase/migrations/001_user_credits.sql` and click **Run**.
3. Verify in **Table Editor** that `user_credits` and `credit_purchases` exist, and in **Database → Functions** that these exist:
   - `get_or_create_user_credits(p_user_id)`
   - `deduct_credits(p_user_id, p_amount)` — atomic, applies the daily +50 reset, raises `insufficient_credits`
   - `refund_credits(p_user_id, p_amount)`
   - `topup_credits(p_user_id, p_lemon_squeezy_order_id, p_credits_amount, p_amount_cents)` — idempotent per order

> The migration is not re-runnable as-is (policies/trigger use `CREATE`). If you need to re-run it, drop the policies and the `user_credits_updated_at` trigger first.

Also make sure **Google** is enabled under **Authentication → Providers**, and add `https://<your-domain>/select-provider` (and `http://localhost:3000/select-provider`) to **Authentication → URL Configuration → Redirect URLs**.

---

## 2. Environment variables

Copy `.env.example` to `.env.local` for local dev, and add the same keys in **Vercel → Project → Settings → Environment Variables** for production.

| Variable | Where to get it | Required |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API (`https://kuhbflsmgrlrwkooerpd.supabase.co`) | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → `anon` key | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → `service_role` key (**server only, never expose**) | ✅ |
| `OPENROUTER_API_KEY` | https://openrouter.ai/keys (falls back to legacy `ROUTER_API_KEY` if unset) | ✅ |
| `ABACUS_API_KEY` | Abacus.AI → API Keys | Optional (premium) |
| `ABACUS_API_BASE_URL` | `https://routellm.abacus.ai/v1` | Optional |
| `NEXT_PUBLIC_LEMON_SQUEEZY_CHECKOUT_URL` | Lemon Squeezy → Product → Share → checkout link | For payments |
| `LEMON_SQUEEZY_WEBHOOK_SECRET` | The signing secret you set on the webhook (step 3) | For payments |
| `PRISM_CREDITS_PER_REQUEST` | Credits per AI call (default `10`) | Optional |
| `PRISM_REQUIRE_AUTH_FOR_AI` | `true` = guests get 401 from `/api/chat` | Optional |

> ⚠️ `PRISM_REQUIRE_AUTH_FOR_AI=true` blocks guest AI calls on the homepage. Leave it unset/`false` until you want to require sign-in. When unset, guests (no `sb-access-token` cookie) are not charged.

---

## 3. Lemon Squeezy setup

1. Create an account / store at https://lemonsqueezy.com.
2. **Products → New product** e.g. "Prism Credits" with two variants:
   - Variant name containing **`500`** (e.g. "500 Credits") — $5
   - Variant name containing **`2000`** (e.g. "2000 Credits") — $15

   The webhook maps credits by finding `500` / `2000` in `first_order_item.variant_name` (defaults to 500 if neither matches).
3. Copy the product's checkout link into `NEXT_PUBLIC_LEMON_SQUEEZY_CHECKOUT_URL`.
4. **Settings → Webhooks → +**:
   - URL: `https://<your-domain>/api/webhooks/lemon-squeezy`
   - Signing secret: generate a random string (e.g. `openssl rand -hex 32`) → also set as `LEMON_SQUEEZY_WEBHOOK_SECRET`
   - Events: `order_created`
5. Buyers must check out with **the same email they sign into Prism with** — the webhook matches the order's `user_email` to a Supabase auth user.

---

## 4. How the flow works

1. `SessionSync` (mounted in `layout.tsx`) copies the Supabase access/refresh tokens into first-party cookies (`sb-access-token`, `sb-refresh-token`).
2. `/select-provider` shows the sign-in gate, credit balance (eye toggle persisted in `localStorage.prism_credits_visible`), Top Up link, and provider cards. The choice is stored in `sessionStorage.prism_selected_provider`.
3. `/api/chat` accepts `provider: 'openrouter' | 'abacus'` (default `openrouter`), deducts credits via `/api/user/credits/deduct` **before** generation (402 if insufficient), and best-effort refunds via `/api/user/credits/refund` on failure. The SSE response format is unchanged.
4. The Chrome extension (v1.4.0) opens `/select-provider` and writes the captured text to `sessionStorage.prism_pending_document`. On **Continue**, the page forwards it to the homepage through its existing `?text=` reader.

> Note: the homepage (`src/app/page.tsx`) was intentionally not modified, so it does not yet send `provider` to `/api/chat` — it uses the OpenRouter default. Wiring `sessionStorage.prism_selected_provider` into the homepage's chat request is a follow-up.

---

## 5. Test locally

```bash
cp .env.example .env.local   # fill in real values
npm install
npm run dev                  # http://localhost:3000
```

1. Visit `http://localhost:3000/select-provider`, sign in with Google.
2. Toggle 👁️ — balance should show **50** for a new user.
3. Check the API directly (cookie is set by SessionSync after sign-in):
   ```bash
   curl -b "sb-access-token=<token>" http://localhost:3000/api/user/credits
   curl -X POST -b "sb-access-token=<token>" http://localhost:3000/api/user/credits/deduct
   ```
4. Send a chat from the homepage while signed in → balance drops by `PRISM_CREDITS_PER_REQUEST`.
5. Simulate a webhook:
   ```bash
   BODY='{"meta":{"event_name":"order_created"},"data":{"id":"test-1","attributes":{"user_email":"you@example.com","total":500,"first_order_item":{"variant_name":"500 Credits"}}}}'
   SIG=$(printf '%s' "$BODY" | openssl dgst -sha256 -hmac "$LEMON_SQUEEZY_WEBHOOK_SECRET" | awk '{print $2}')
   curl -X POST http://localhost:3000/api/webhooks/lemon-squeezy -H "x-signature: $SIG" -d "$BODY"
   ```
   Re-sending the same order id must **not** add credits twice.
6. Extension: load `extension/` unpacked in `chrome://extensions`, right-click selected text → "Refract into Dassah's Prism" → `/select-provider` should show "📎 Document ready to send." (For local testing, temporarily set `PRISM_APP_URL` in `extension/background.js` to `http://localhost:3000`.)
