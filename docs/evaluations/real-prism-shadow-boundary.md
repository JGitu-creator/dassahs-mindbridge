# Real Prism Shadow Boundary

## Safety contract

The existing `/api/simplify` baseline remains the only user-visible result. The new probe runs only after a successful baseline refraction and only when all server-side gates pass:

- `PRISM_SHADOW_MODE=true`.
- The authenticated user ID is explicitly listed in `PRISM_SHADOW_USER_IDS`.
- The request is within `PRISM_SHADOW_MAX_CHARS`.
- An HTTPS `PRISM_SHADOW_CANDIDATE_URL` is configured.

The browser never receives candidate output. Server logs contain only sanitized telemetry and never source text, prompts, embeddings, user IDs, or provider credentials. Candidate timeouts and HTTP errors are recorded as telemetry and cannot replace the baseline.

## Default state

The `.env.example` defaults keep shadow mode disabled and the candidate endpoint empty. No Model Garden or Vertex credential was added. No private document is indexed by this change. The main branch and production deployment are unchanged.

## Remaining gates

Before merge or deployment, run lint and build, then use a controlled HTTPS candidate endpoint with synthetic content. Verify default-off behavior, allowlisted versus non-allowlisted accounts, guest exclusion, timeout/failure fallback, sanitized logs, and quota/cost behavior. This branch is a boundary implementation, not approval for a live pilot.
