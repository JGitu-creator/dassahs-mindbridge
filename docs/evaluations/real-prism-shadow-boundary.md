# Real Prism Shadow Boundary

## Safety contract

The existing `/api/simplify` baseline remains the only user-visible result. The new probe runs only after a successful baseline refraction and only when all server-side gates pass:

- `PRISM_SHADOW_MODE=true`.
- The authenticated user ID is explicitly listed in `PRISM_SHADOW_USER_IDS`.
- The request carries the server-issued synthetic fixture token and its SHA-256 text hash is explicitly listed in `PRISM_SHADOW_FIXTURE_SHA256`.
- The request is within `PRISM_SHADOW_MAX_CHARS`.
- An HTTPS `PRISM_SHADOW_CANDIDATE_URL` is configured.
- A positive `PRISM_SHADOW_MAX_COST_USD` budget is configured; output tokens and reported cost are checked against hard ceilings.

The probe is scheduled with Next.js `after()` after the baseline response is prepared, so candidate latency is not response-critical. The browser never receives candidate output. Server logs contain only sanitized telemetry and never source text, prompts, embeddings, user IDs, or provider credentials. Candidate timeouts, HTTP errors, budget breaches, and unexpected helper errors are recorded as failure telemetry and cannot replace the baseline.

## Default state

The `.env.example` defaults keep shadow mode disabled, the candidate endpoint empty, the synthetic token empty, the fixture hash list empty, and the cost ceiling at zero. No Model Garden or Vertex credential was added. No private document is indexed by this change. The main branch is unchanged; GitHub/Vercel created only a branch preview deployment.

## Remaining gates

The branch includes `npm run test:shadow` for executable boundary assertions. Before merge or deployment, run that test, lint, and build, then use a controlled HTTPS candidate endpoint with synthetic content. Verify default-off behavior, allowlisted versus non-allowlisted accounts, guest exclusion, timeout/failure fallback, sanitized logs, and quota/cost behavior. This branch is a boundary implementation, not approval for a live pilot or a verified Jev/Embedding 2 adapter.
