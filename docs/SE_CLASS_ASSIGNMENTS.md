# Dassah's Prism — Software Engineering Class Assignments

Welcome to the **Dassah's Prism** engineering workbook! This guide was created so you can see exactly how a multi-agent engineering team audited, planned, and evolved `dassahs-prism` during its **"First Day Actions"** sprint, and then practice those same software engineering skills yourself through **8 hands-on labs** grounded in the real codebase.

> **Safety & Brand Mandates Preserved Throughout**
> - `PRISM_SHADOW_MODE=false` remains disabled by default (`.env.example`, `src/lib/server/shadow-mode.ts`).
> - Apple Liquid Glass aesthetics (`.apple-glass`, sensory profiles) and **Dastastic / Sovereign** naming conventions are preserved.
> - Zero secret leaks: API keys (`GEMINI_API_KEY`, `OPENROUTER_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) live only in environment variables and are never exposed to clients or logs.

---

## Part 1 — How the Teamwork Agents Operated ("First Day Actions")

Instead of fixing issues one by one in a single linear thread, the team used a structured **multi-agent parallel workflow** coordinated by `PROJECT.md`:

### 1.1 The 4-Phase Multi-Agent Workflow

```text
  [Step 0: Parallel Survey]
     ├── Explorer 1: UI / Mobile Breakpoints / Light & Dark Contrast
     ├── Explorer 2: Tooling / Git & Vercel Status / Acceptance Gaps
     └── Explorer 3: Architecture / Dart & Flutter Feasibility / SE Concepts
            │
            ▼
  [Phase 1: Feature Inventory & Disjoint File Ownership (PROJECT.md)]
     └── Every finding mapped to M1, M2, or M3 with zero overlapping write paths
            │
            ▼
  [Phase 2: Parallel Implementation]
     ├── Worker M1: Mobile & Contrast Polish + /api/health + Acceptance Checks
     ├── Worker M2: Dart & Flutter Technical Assessment (docs/FLUTTER_COMPANION_GUIDE.md)
     └── Worker M3: SE Class Assignments (docs/SE_CLASS_ASSIGNMENTS.md)
            │
            ▼
  [Phase 3: Independent Verification Wave]
     └── Reviewers + Challengers + Forensic Auditor verify against real files & tests
```

1. **Step 0 — Parallel Survey**: Three read-only explorer agents audited the repository simultaneously across orthogonal concerns:
   - *Survey 1 (UI & Contrast)*: Inspected `src/app/page.tsx`, `src/app/globals.css`, and `src/components/*`, uncovering 14 mobile layout/overflow issues (such as an undefined `xs:` Tailwind v4 breakpoint and bottom-right overlay collisions between `ContextAnchor` and `"Ask DJ"`) and 8 light/dark contrast defects (such as `bg-[var(--bg)] text-black` in dark mode).
   - *Survey 2 (Tooling & Acceptance)*: Checked `package.json`, `git log`, `gh api` Vercel deployment status, and VM constraints (e.g., `node_modules` is absent locally so `eslint`/`next build` run on Vercel CI, while `npm run test:shadow` runs locally using Node v24 built-ins). Also identified that `src/app/api/` lacked a lightweight `/api/health` endpoint.
   - *Survey 3 (Architecture & Dart/Flutter)*: Verified that Dart/Flutter SDKs are not installed in the VM and cannot render inside Next.js 16 / React 18 / Tailwind v4, while noting that `src/lib/ai-quota.ts` already supports `Authorization: Bearer <token>`, making a companion Flutter mobile app viable in a future phase.
2. **Feature Inventory & Disjoint File Ownership (`PROJECT.md`)**: Every survey finding was assigned to a milestone (`M1`, `M2`, `M3`) with **disjoint file ownership** so parallel workers never overwrite each other's files.
3. **Parallel Implementation**: Three workers executed `M1`, `M2`, and `M3` concurrently while logging timestamped progress and producing self-contained handoff reports.
4. **Independent Verification Wave**: Reviewers, challengers, and a forensic auditor independently verify every claim, file path, and test command (`npm run test:shadow`) before merging.

### 1.2 Summary of Decisions Across Milestones (M1, M2, M3)

| Milestone | Scope & Deliverables | Key Architectural Decisions |
|---|---|---|
| **M1 — Mobile Layout, High-Contrast Polish & Acceptance Checks** | Fixes 14 mobile layout issues + 8 contrast defects across `src/app/page.tsx`, `src/app/globals.css`, `src/components/prism/ContextAnchor.tsx`, `src/components/morphing/StackedThemeSelector.tsx`, and `src/components/AIUsageControl.tsx`; adds `GET /api/health` (`src/app/api/health/route.ts`) and Node-native checks (`scripts/test-ui-contrast.mjs`). | Keep Next.js 16 + Tailwind v4 CSS variables (`--bg`, `--fg`, `--color-accent`); fix contrast by pairing `bg-[var(--fg)] text-[var(--bg)]` or `text-white` on solid accents instead of hardcoding `text-black`. Keep `/api/health` secret-free (`{ ok, service, shadowMode, timestamp }`). |
| **M2 — Dart & Flutter Technical Assessment & Companion Guide** | Authors `docs/FLUTTER_COMPANION_GUIDE.md` with honest VM/Next.js assessment, API auth mapping, and a companion Flutter starter scaffold. | **Do not** embed Flutter inside the Next.js web app (avoids duplicating rendering engines, breaking Liquid Glass CSS, and losing SSR). **Do** target a companion native Flutter client in a future phase using `Bearer` auth and Supabase RLS. |
| **M3 — Software Engineering Class Assignments** | Authors `docs/SE_CLASS_ASSIGNMENTS.md` (this document) with team walkthroughs and 8 hands-on labs. | Ground every lab in real files, real HTTP status codes, and runnable Node checks (`npm run test:shadow`) so students learn production engineering patterns directly from `dassahs-prism`. |

---

## Part 2 — 8 Hands-On Software Engineering Labs

Each lab below follows a consistent structure: **Learning Objective**, **Files to Inspect**, **Step-by-Step Exercise**, and **Verification / Self-Check Rubric**.

---

### Lab 1: Client-Server API Contracts & Input Validation

- **Learning Objective**: Understand how server-side Next.js Route Handlers enforce strict input boundaries (size, MIME type, file extension, and empty-content checks) and return semantically accurate HTTP status codes (`400`, `413`, `415`, `422`, `500`) before invoking expensive parsers or AI providers.
- **Files to Inspect**:
  - `src/app/api/parse/route.ts` (lines 6–75)
  - `src/app/api/simplify/route.ts` (lines 19–36)
- **Step-by-Step Exercise**:
  1. Open `src/app/api/parse/route.ts` and trace `POST(req: NextRequest)` from top to bottom.
  2. Build a **Validation Matrix** table listing every rejection branch in `parse/route.ts`:
     - Missing `file` in `formData` -> `400`
     - Invalid extension (`allowedExtension`) or disallowed MIME (`allowedMime`) -> `415`
     - `file.size > maxBytes` (`10 * 1024 * 1024`) -> `413`
     - Corrupt/password-protected PDF (`pdf-parse` catch) or empty extracted text (`!text || text.trim().length === 0`) -> `422`
     - Unexpected runtime exception -> `500`
  3. Notice line 70: `text.slice(0, 100000)`. Compare this 100k-character cap in `/api/parse` with `absoluteMaxChars = 150000` (`413` status) and the `14_000_000`-char base64 image limit in `src/app/api/simplify/route.ts` (lines 27–36).
  4. Write a short design note answering: *Why does `/api/parse` check BOTH `file.name` extension AND `file.type` MIME, and why is `application/octet-stream` explicitly included in `allowedMime`?*
- **Verification / Self-Check Rubric**:
  - [ ] Your matrix accurately maps all 5 HTTP error codes (`400`, `413`, `415`, `422`, `500`) to exact conditions in `src/app/api/parse/route.ts`.
  - [ ] You identified the exact character cap (`100,000` in `/api/parse` vs `150,000` in `/api/simplify`) and image regex (`/^image\/(png|jpeg|jpg|webp|gif)$/i`).
  - [ ] You explained why validating on the server is mandatory even when the browser `<input accept="...">` already filters files.

---

### Lab 2: Graceful Degradation & Tiered AI Routing

- **Learning Objective**: Learn how resilient AI applications classify request complexity to route across model tiers (*Scout*, *Analyst*, *Sovereign*) and degrade gracefully to deterministic local computation when external LLM APIs are unavailable or fail.
- **Files to Inspect**:
  - `src/app/api/orchestrator/route.ts` (`classifyComplexity`, `computeLocalMetrics`, `routeToTier`, lines 17–140)
  - `src/app/api/simplify/route.ts` (`callProvider` and `createLocalRefraction`, lines 103–107 and 146–217)
- **Step-by-Step Exercise**:
  1. In `src/app/api/orchestrator/route.ts`, inspect `classifyComplexity(content)` (lines 17–28). Write down the exact thresholds (`wordCount`, `avgSentenceLength > 20`, technical keyword regex) that map an input to `'light'` (**Scout**), `'standard'` (**Analyst**), or `'complex'` (**Sovereign**).
  2. Inspect `routeToTier` (lines 57–140) and trace how each tier defines a `primaryModel` plus an ordered `fallbackModels` array passed to OpenRouter.
  3. Inspect what happens in `POST` (lines 51–54) when `routeToTier` throws: it returns HTTP `200` with `computeLocalMetrics('')` instead of crashing with `500`.
  4. Now inspect `src/app/api/simplify/route.ts`:
     - In `callProvider` (lines 146–185), trace how `preferredProvider` (`'auto'`, `'openrouter'`, `'gpt'`, `'claude'`, `'deepseek'`) orders `tryGemini` and `tryOpenRouter`, each with a `25000` ms timeout.
     - In `POST` (lines 103–107), observe what happens when `refractionResults.length === 0`: it calls `createLocalRefraction(text, simplicityLevel, cognitiveMode)`, refunds reserved credits, and returns HTTP `200` with `usage.provider: 'local'` and `usage.model: 'structural-refraction'`.
  5. Critique one edge case: in `orchestrator/route.ts:53`, `computeLocalMetrics('')` is called with an empty string in the `catch` block—how would you preserve the parsed `content` variable so `computeLocalMetrics(content)` analyzes the user's actual text on failure?
- **Verification / Self-Check Rubric**:
  - [ ] You listed all three tiers (`Scout`, `Analyst`, `Sovereign`) and their exact classification rules.
  - [ ] You traced both the provider-level fallback (`tryGemini` <-> `tryOpenRouter`) and the local structural fallback (`createLocalRefraction` / `computeLocalMetrics`).
  - [ ] You identified the `computeLocalMetrics('')` scope improvement in `orchestrator/route.ts`.

---

### Lab 3: Concurrency & Bounded Worker Pools

- **Learning Objective**: Master bounded concurrency in Node.js/TypeScript—splitting large payloads into chunks, capping parallel async workers, and handling partial failures cleanly with `PromiseSettledResult`.
- **Files to Inspect**:
  - `src/app/api/simplify/route.ts` (lines 61–117)
- **Step-by-Step Exercise**:
  1. Read lines 61–99 of `src/app/api/simplify/route.ts`.
  2. Trace how `chunksOfText` is constructed: when `image` is present, a single `'Image input'` entry is pushed; otherwise `text` is sliced into `chunkSize = 25000` character chunks.
  3. Draw a **sequence diagram** showing how `workerCount = Math.min(3, chunksOfText.length)` spawns at most 3 concurrent `processChunk()` workers sharing a `let nextChunkIndex = 0` cursor.
  4. Answer:
     - *Why cap at 3 workers instead of `Promise.all(chunksOfText.map(...))`?* (Consider upstream rate limits, memory, and latency).
     - *Why does `processChunk` catch errors per chunk and push `{ status: 'rejected', reason }` instead of letting one failed chunk abort `Promise.all`?*
  5. Trace lines 101–117: how `settledResults` filters for `status === 'fulfilled'`, merges `tldr` (deduplicated via `Set`, capped at `6`), `chunks`, and `actions` (deduplicated by `action.task` via `Map`).
- **Verification / Self-Check Rubric**:
  - [ ] Sequence diagram accurately shows `nextChunkIndex++` work-stealing across `Math.min(3, chunksOfText.length)` workers.
  - [ ] You explained why per-chunk `try/catch` + `PromiseSettledResult` prevents a single chunk timeout from discarding all other fulfilled chunks.
  - [ ] You verified the deduplication logic (`Set` + `.slice(0, 6)` for `tldr`, `Map` keyed by `action.task` for `actions`).

---

### Lab 4: Transactional Quota — Reserve -> Execute -> Commit/Refund

- **Learning Objective**: Understand the **Reserve -> Execute -> Commit/Refund** pattern used to prevent race conditions and ensure users are never charged when an AI call fails.
- **Files to Inspect**:
  - `src/lib/ai-quota.ts` (lines 1–85)
  - `src/app/api/simplify/route.ts` (lines 20–53, 103–107, 118, 140–143)
- **Step-by-Step Exercise**:
  1. Open `src/lib/ai-quota.ts` and trace the three exported functions:
     - `reserveCredits(req)` (lines 40–65)
     - `refundCredits(reservation)` (lines 67–71)
     - `recordUsage(reservation, usage)` (lines 73–84)
  2. Trace `getUserId(req)` (lines 20–32): note how it checks `Authorization: Bearer <token>` first, then falls back to `sb-access-token` or `sb-[-\w]+-auth-token` cookies, and validates via `createServiceClient().auth.getUser(decodedToken)`.
  3. Trace guest trials (lines 34–54): `GUEST_TRIAL_LIMIT = 3` tracked via the `httpOnly` cookie `prism-guest-uses` (and written back in `simplify/route.ts:43-51`).
  4. Now trace `simplify/route.ts`:
     - Why is `reserveCredits(req)` called at line 37 **before** any LLM call?
     - What are the **two** places `refundCredits(reservation)` is called? (Line 105 when `refractionResults.length === 0`, and line 141 in the outer `catch` block).
     - When `refractionResults.length > 0`, `recordUsage(reservation, usage)` is called at line 118.
  5. Write a short paragraph explaining what vulnerability would exist if credits were checked with `SELECT balance` and deducted *after* the LLM call instead of reserving atomically via `rpc('deduct_credits', ...)` up front.
- **Verification / Self-Check Rubric**:
  - [ ] You traced both authenticated (`deduct_credits` RPC, `402` on `insufficient_credits`, `503` on RPC failure) and guest (`401` `guest_trial_exhausted` after 3 uses) paths.
  - [ ] You identified both refund branches in `simplify/route.ts` (lines 105 and 141).
  - [ ] You clearly explained the TOCTOU (Time-of-Check to Time-of-Use) race condition prevented by atomic upfront reservation.

---

### Lab 5: Shadow Testing & Safety Boundaries

- **Learning Objective**: Learn how to safely evaluate candidate AI models in production using non-blocking `after()` hooks, strict allowlists, SHA-256 fixture verification, cost/token caps, and automated boundary tests.
- **Files to Inspect**:
  - `src/lib/server/shadow-mode.ts` (lines 29–145)
  - `src/lib/server/shadow-contract.mjs` (lines 1–42)
  - `scripts/test-shadow-boundary.mjs` (lines 1–89)
  - `scripts/test-shadow-production.mjs` (lines 1–82)
  - `src/app/api/simplify/route.ts` (lines 119–134)
- **Step-by-Step Exercise**:
  1. Run the existing shadow test suite from the repository root:
     ```bash
     npm run test:shadow
     ```
     Observe the two test stages in `package.json` (`node scripts/test-shadow-boundary.mjs && node --experimental-strip-types scripts/test-shadow-production.mjs`).
  2. List all **6 eligibility guardrails** enforced by `runShadowProbe` (`src/lib/server/shadow-mode.ts:71-79`) and `shadowEligibility` (`src/lib/server/shadow-contract.mjs:25-33`) before a candidate HTTP call can happen:
     1. `PRISM_SHADOW_MODE === 'true'` (`disabled` otherwise)
     2. Authenticated `userId` (`no_authenticated_user`)
     3. `allowlisted(userId)` via `PRISM_SHADOW_USER_IDS` (`user_not_allowlisted`)
     4. `approvedFixture(text, syntheticToken)` matching `PRISM_SHADOW_SYNTHETIC_TOKEN` and SHA-256 digest in `PRISM_SHADOW_FIXTURE_SHA256` (`synthetic_fixture_not_approved`)
     5. `input.text.length <= maxChars()` (`input_over_shadow_limit`)
     6. `https://` candidate URL and `budget > 0` (`candidate_endpoint_not_configured`, `candidate_budget_not_configured`)
  3. Inspect `evaluateCandidateResponse` (`shadow-contract.mjs:3-23`) and `logShadowTelemetry` (`shadow-mode.ts:142-145`). Note why `output` is never returned or logged, and why `budgetEnforced === true` plus finite non-negative `totalTokens` and `cost` are required.
  4. Inspect `scripts/test-shadow-boundary.mjs` (lines 8–12): notice how static regex assertions verify that `simplify/route.ts` uses `after(async () => ...)` and never returns `shadowTelemetry` in the user-facing response.
- **Verification / Self-Check Rubric**:
  - [ ] `npm run test:shadow` exits `0` with `shadow behavioral checks: 20 passed` and `production runShadowProbe checks: 9 passed`.
  - [ ] You documented all 6 eligibility guardrails and their exact failure `reason` strings.
  - [ ] You explained why `PRISM_SHADOW_MODE` must remain `false` in `.env.example` and why `logShadowTelemetry` omits user IDs, document text, and candidate output.

---

### Lab 6: Design Systems, Responsive Breakpoints & WCAG Contrast

- **Learning Objective**: Understand how CSS custom properties, sensory profiles, Tailwind v4 breakpoints, and WCAG AA contrast ratios (`4.5:1` for normal text, `3:1` for large text) interact across light and dark themes.
- **Files to Inspect**:
  - `src/app/globals.css` (lines 1–120)
  - `src/app/page.tsx` (`THEMES` at lines 63–99, `SENSORY_PROFILES` at lines 101–105)
- **Step-by-Step Exercise**:
  1. Inspect `THEMES` in `src/app/page.tsx:63-99` (`midnight_sovereign`, `electric_grace`, `divine_gold`, `hadassah_silk`, `sovereign_pulse`). Pick one theme (e.g., `midnight_sovereign`) and record its `light` and `dark` hex colors for `background`, `text`, and `accent`.
  2. Compute (or check) the contrast ratio of:
     - `light.text` on `light.background`
     - `dark.text` on `dark.background`
     - `text-black` on `dark.background` (this was one of the M1 bugs fixed!)
     - `light.text` on `light.accent` (this was another M1 bug fixed—dark text on saturated accent buttons!)
  3. Inspect `src/app/globals.css:39-80` to see how `[data-sensory-profile="calm"|"vibrant"|"contrast"]` adjusts `--glass-blur` and `--glass-saturate` without altering document data.
  4. Inspect Tailwind v4's `@import "tailwindcss";` in `src/app/globals.css:1`. Explain why using `xs:` in TSX without defining `--breakpoint-xs` in `@theme` causes those responsive utility classes to be ignored, and how using `sm:` (`640px`) or defining `--breakpoint-xs` fixes it.
- **Verification / Self-Check Rubric**:
  - [ ] You recorded valid hex values from `THEMES` and verified WCAG AA (`>= 4.5:1`) for normal text.
  - [ ] You explained why pairing `bg-[var(--bg)]` with `text-black` breaks dark mode, and why pairing `bg-[var(--color-accent)]` with `text-[var(--fg)]` breaks light mode.
  - [ ] You verified how `[data-sensory-profile]` changes presentation tokens (`--glass-blur`, `--glass-saturate`) without mutating text.

---

### Lab 7: Database Row-Level Security (RLS) & Hybrid State

- **Learning Objective**: Learn how PostgreSQL Row-Level Security (RLS) enforces multi-tenant data isolation at the database layer, and how web apps pair cloud persistence with `localStorage` fallback for unauthenticated or offline sessions.
- **Files to Inspect**:
  - `supabase/migrations/003_neural_vault_items.sql` (lines 1–32)
  - `src/app/page.tsx` (`localStorage` keys around lines 732–1119, e.g., `dassahs_neural_vault`, `dassahs_theme_mode`, `dassahs_focus_mode`, `dassahs_neural_streak`)
- **Step-by-Step Exercise**:
  1. Open `supabase/migrations/003_neural_vault_items.sql` and inspect the schema constraints:
     - `char_length(heading) <= 120`
     - `char_length(content) <= 2000`
     - `type IN ('hook', 'metaphor')`
     - `UNIQUE (user_id, type, content)`
     - Notice the comment on line 1: `-- Per-user saved hooks and metaphors. Document text is never stored here.`
  2. Trace the 4 RLS policies (lines 17–31):
     - `SELECT` using `auth.uid() = user_id`
     - `INSERT` with check `auth.uid() = user_id`
     - `DELETE` using `auth.uid() = user_id`
     - `ALL` for `auth.role() = 'service_role'`
  3. Inspect `src/app/page.tsx` around lines `774`, `997`, and `1119` to see how `dassahs_neural_vault` is read from and persisted to `localStorage`.
  4. Answer: *If a malicious user modifies the client-side React code in DevTools to pass someone else's `user_id` in an `INSERT` or `SELECT` query via the Supabase anon key, what prevents them from reading or overwriting another user's Vault items?*
- **Verification / Self-Check Rubric**:
  - [ ] You listed all table constraints (`heading`, `content`, `type`, `UNIQUE`) and all 4 RLS policies.
  - [ ] You correctly identified that PostgreSQL enforces `auth.uid() = user_id` inside the database using the verified JWT, independent of client code.
  - [ ] You mapped how `localStorage` (`dassahs_neural_vault`, `dassahs_focus_mode`) provides immediate client persistence alongside Supabase.

---

### Lab 8: Multi-Platform Architecture Decisions (Next.js Web vs. Flutter Companion Client)

- **Learning Objective**: Practice making pragmatic, evidence-based architecture decisions when evaluating whether to embed a new framework (Dart/Flutter) inside an existing web app vs. building a companion client over HTTP APIs.
- **Files to Inspect**:
  - `docs/FLUTTER_COMPANION_GUIDE.md` (created in M2)
  - `src/lib/ai-quota.ts` (lines 20–32)
  - `src/app/api/user/credits/route.ts` (lines 6–10)
  - `package.json` (lines 12–43)
- **Step-by-Step Exercise**:
  1. Compare `src/lib/ai-quota.ts:20-32` (`getUserId`) with `src/app/api/user/credits/route.ts:6-10` (`GET`).
     - Which one already accepts `Authorization: Bearer <token>`?
     - Which one currently reads only `req.cookies.get('sb-access-token')?.value`?
  2. Read `docs/FLUTTER_COMPANION_GUIDE.md` and summarize the **3 technical reasons** why Dart/Flutter is **not** embedded inside `dassahs-prism`'s Next.js 16 / React 18 / Tailwind v4 web UI, and why a **companion native mobile client** is recommended instead.
  3. Design a 1-page **Mobile API Readiness Checklist** for a Flutter client calling `https://dassahs-prism.vercel.app/api/*`:
     - Auth header format (`Authorization: Bearer <supabase_access_token>`)
     - Which endpoints work out-of-the-box (`/api/simplify`, `/api/chat`, `/api/parse`, `/api/tts`, `/api/orchestrator`)
     - Which endpoint needs a 3-line Bearer-token update before mobile launch (`/api/user/credits/route.ts`)
     - How `/api/tts` `503` fallback maps to native `flutter_tts`
- **Verification / Self-Check Rubric**:
  - [ ] You accurately contrasted `ai-quota.ts` (Bearer + cookie) against `api/user/credits/route.ts` (cookie-only).
  - [ ] You articulated why embedding Flutter Web inside React/Next.js breaks Liquid Glass CSS, SSR, and bundle size.
  - [ ] Your checklist covers auth, file/image upload (`/api/parse`, `/api/simplify`), and TTS fallback (`/api/tts` -> `flutter_tts`).
