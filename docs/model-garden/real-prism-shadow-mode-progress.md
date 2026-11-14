# Real Prism Shadow Mode Progress

**Branch:** `feature/disabled-shadow-boundary`
**Status:** implemented but disabled; not merged; branch preview only

The real `/api/simplify` route now has a server-only shadow probe. It is inactive unless `PRISM_SHADOW_MODE=true`, the request belongs to a user ID listed in `PRISM_SHADOW_USER_IDS`, the request carries the server-issued synthetic fixture token, the SHA-256 hash of the submitted text is explicitly listed in `PRISM_SHADOW_FIXTURE_SHA256`, and an HTTPS `PRISM_SHADOW_CANDIDATE_URL` plus positive budget ceiling are configured.

The original Prism response remains unchanged and visible. The candidate response is never returned to the browser. The probe records only sanitized provider/model, latency, token, cost, HTTP/failure, and eligibility metadata. It never logs user IDs, source text, prompts, embeddings, or candidate output.

The probe runs through Next.js `after()` after the baseline response has been constructed, so candidate latency cannot block the user response. The candidate endpoint is deliberately not configured in this branch. Model Garden credentials and Vertex AI were not added or called. OpenRouter/Gemini provider selection remains unchanged for normal requests.

The route requires existing authenticated quota behavior to provide a user ID; guest requests are not shadow-eligible. This prevents accidental shadow calls for anonymous testers.

## Verification required before merge

- Run `npm run test:shadow`, lint, and production build.
- Test default `PRISM_SHADOW_MODE=false` and confirm no candidate request occurs.
- Test an authenticated allowlisted synthetic account against a controlled HTTPS candidate endpoint.
- Test a non-allowlisted account and a guest request; both must skip shadow mode.
- Inject candidate timeout and HTTP failure; baseline output must remain unchanged.
- Inspect logs for absence of text, prompt, user ID, and candidate output.
- Keep the branch unmerged until the Model Garden progress file and budget alerts are reviewed.
