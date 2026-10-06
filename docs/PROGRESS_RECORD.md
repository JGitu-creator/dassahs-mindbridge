# Dassah's Prism — Implementation Progress Record
**Last updated:** 2026-10-06
**Branch:** `feature/provider-selection-credits` (recreated from `main` and pushed)
**Repo:** `JGitu-creator/dassahs-mindbridge`

## ✅ Done on this branch
| Area | Files |
|---|---|
| DB schema + RPC (not yet run in production) | `supabase/migrations/001_user_credits.sql`, `.env.example` |
| Credits API | `src/app/api/user/credits/route.ts` (GET), `.../deduct/route.ts` (POST, 402 on insufficient), `.../refund/route.ts` (internal only) |
| AI routing | `src/app/api/chat/route.ts`, `src/lib/server/ai-provider.ts` — `provider: 'openrouter' \| 'abacus'`, deduct-before-generate, refund on failure, SSE contract unchanged |
| Payments | `src/lib/lemon-squeezy.ts`, `src/app/api/webhooks/lemon-squeezy/route.ts` (HMAC-verified, idempotent top-up) |
| Auth bridge | `src/components/SessionSync.tsx`, mounted in `src/app/layout.tsx` |
| UI | `src/app/select-provider/page.tsx` — provider cards, 👁️ toggle (`prism_credits_visible`), Top Up, sign-in gate, document handoff |
| Extension v1.4.0 | `extension/background.js`, `content.js`, `popup.js`, `manifest.json` — sessionStorage handoff (`prism_pending_document`) |
| Docs | `docs/PROVIDER_CREDITS_SETUP.md` |

`src/app/page.tsx` was **not** touched (focus timer, history, profile restoration, themes, brown noise, reading breaks, streaks, Sovereign tone preserved).

## Implementation notes
- `@supabase/auth-helpers-nextjs` is not a dependency; SessionSync and `/select-provider` use the existing shared client in `src/lib/supabase.ts`.
- OpenRouter key: `OPENROUTER_API_KEY`, falling back to legacy `ROUTER_API_KEY`.
- Deduct/refund endpoints reject non-positive amounts; refund requires an internal HMAC header from `/api/chat`.
- Homepage does not yet pass `provider` (uses OpenRouter default) — follow-up.

## 🔜 Next steps
1. Review & merge the PR.
2. Run the SQL migration in Supabase.
3. Set env vars in Vercel.
4. Set up Lemon Squeezy product + webhook.
5. Test end-to-end: extension → `/select-provider` → homepage.
