import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const pagePath = new URL('../src/app/page.tsx', import.meta.url);
const contextAnchorPath = new URL('../src/components/prism/ContextAnchor.tsx', import.meta.url);
const stackedThemePath = new URL('../src/components/morphing/StackedThemeSelector.tsx', import.meta.url);
const aiUsagePath = new URL('../src/components/AIUsageControl.tsx', import.meta.url);
const globalsPath = new URL('../src/app/globals.css', import.meta.url);
const healthRoutePath = new URL('../src/app/api/health/route.ts', import.meta.url);
const envExamplePath = new URL('../.env.example', import.meta.url);

test('no bg-[var(--bg)] text-black regressions in src/app/page.tsx', async () => {
  const page = await readFile(pagePath, 'utf8');
  assert.doesNotMatch(
    page,
    /bg-\[var\(--bg\)\]\s+text-black/,
    'Found dark-mode contrast regression: bg-[var(--bg)] text-black'
  );
});

test('no text-[var(--fg)] on solid colored buttons (bg-blue-600, bg-red-600, bg-[var(--color-accent)])', async () => {
  const page = await readFile(pagePath, 'utf8');
  const lines = page.split('\n');
  const solidButtonBgRe = /\b(bg-blue-600|bg-red-600|bg-\[var\(--color-accent\)\])\b/;
  const fgTextRe = /\btext-\[var\(--fg\)\]\b/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (solidButtonBgRe.test(line) && line.includes('<button')) {
      // Check each <button ...> tag segment on the line individually
      const buttonTags = line.match(/<button[^>]*>/g) || [];
      for (const tag of buttonTags) {
        if (solidButtonBgRe.test(tag)) {
          assert.equal(
            fgTextRe.test(tag),
            false,
            `Line ${i + 1}: solid colored button uses text-[var(--fg)] instead of text-white: ${tag}`
          );
        }
      }
    }
  }
});

test('no unguarded w-[350px] mobile popover overflow on Ask DJ and no undefined xs: breakpoints', async () => {
  const page = await readFile(pagePath, 'utf8');
  const aiUsage = await readFile(aiUsagePath, 'utf8');
  const globals = await readFile(globalsPath, 'utf8');

  assert.doesNotMatch(
    page,
    /\bw-\[350px\]/,
    'Ask DJ popover must use responsive width like w-[calc(100vw-2rem)] sm:w-[400px]'
  );

  const hasXsTheme = globals.includes('--breakpoint-xs');
  if (!hasXsTheme) {
    assert.doesNotMatch(page, /\bxs:/, 'Undefined xs: breakpoint in src/app/page.tsx');
    assert.doesNotMatch(aiUsage, /\bxs:/, 'Undefined xs: breakpoint in src/components/AIUsageControl.tsx');
  }
});

test('ContextAnchor and Ask DJ do not share identical bottom-right coordinates', async () => {
  const page = await readFile(pagePath, 'utf8');
  const contextAnchor = await readFile(contextAnchorPath, 'utf8');

  const anchorMatch = contextAnchor.match(/fixed\s+(bottom-\d+\s+right-\d+)/);
  const askDjMatch = page.match(/data && !isZenLocked && \(<div className="fixed\s+(bottom-\d+\s+right-\d+)/);

  assert.ok(anchorMatch, 'ContextAnchor must have fixed bottom-* right-* positioning');
  assert.ok(askDjMatch, 'Ask DJ container must have fixed bottom-* right-* positioning');
  assert.notEqual(
    anchorMatch[1],
    askDjMatch[1],
    `ContextAnchor (${anchorMatch[1]}) and Ask DJ (${askDjMatch[1]}) share identical bottom-right coordinates`
  );
});

test('StackedThemeSelector provides mobile wrap/compact layout without 320px clipping', async () => {
  const selector = await readFile(stackedThemePath, 'utf8');
  assert.match(selector, /flex-wrap/, 'StackedThemeSelector should wrap cleanly on narrow mobile viewports');
});

test('src/app/api/health/route.ts exists, exports GET, and contains no secret env reads', async () => {
  const route = await readFile(healthRoutePath, 'utf8');
  assert.match(route, /export\s+async\s+function\s+GET\s*\(/, 'Health route must export GET');
  assert.match(route, /service:\s*['"]dassahs-prism['"]/, 'Health route must identify dassahs-prism');
  assert.doesNotMatch(
    route,
    /GEMINI_API_KEY|OPENROUTER_API_KEY|SUPABASE_SERVICE_ROLE_KEY|LEMON_SQUEEZY|XAI_API_KEY|ROUTER_API_KEY|STRIPE/,
    'Health route must never read or expose secret environment variables'
  );
});

test('PRISM_SHADOW_MODE remains false in .env.example', async () => {
  const envExample = await readFile(envExamplePath, 'utf8');
  assert.match(envExample, /^PRISM_SHADOW_MODE=false$/m, 'PRISM_SHADOW_MODE must remain false in .env.example');
});

test('.light .prism-text preserves background-clip: text and emojis are outside .prism-text spans', async () => {
  const globals = await readFile(globalsPath, 'utf8');
  const page = await readFile(pagePath, 'utf8');

  assert.match(
    globals,
    /\.light\s+\.prism-text\s*\{[\s\S]*?background-clip:\s*text/m,
    '.light .prism-text must explicitly retain background-clip: text'
  );
  assert.doesNotMatch(
    page,
    /<span className="prism-text">[^<]*(🧠|✨|🌟)[^<]*<\/span>/,
    'Emojis must be placed outside .prism-text spans to prevent solid color block rendering'
  );
});

test('BionicText supports mobile tap-to-Lens via onWordSelect and LivingIchthysFooter makes zero network calls', async () => {
  const bionicPath = new URL('../src/components/prism/BionicText.tsx', import.meta.url);
  const livingFooterPath = new URL('../src/components/prism/LivingIchthysFooter.tsx', import.meta.url);
  const bionic = await readFile(bionicPath, 'utf8');
  const livingFooter = await readFile(livingFooterPath, 'utf8');

  assert.match(bionic, /onWordSelect\?/, 'BionicText must accept optional onWordSelect callback for mobile Prism Lens');
  assert.doesNotMatch(
    livingFooter,
    /\bfetch\s*\(|GEMINI_API_KEY|OPENROUTER_API_KEY/,
    'LivingIchthysFooter must be a pure client-side interaction with zero network or API calls'
  );
});

test('Light Mode brand-prism stays visible and ContextAnchor + uiNotice + Prism Lens maintain Light/Dark contrast and separation', async () => {
  const page = await readFile(pagePath, 'utf8');
  const contextAnchor = await readFile(contextAnchorPath, 'utf8');

  assert.doesNotMatch(
    page,
    /@keyframes\s+prism-refract-light\s*\{[\s\S]*?background-image:\s*none/m,
    '@keyframes prism-refract-light must not set background-image: none while -webkit-text-fill-color: transparent !important is active'
  );
  assert.doesNotMatch(
    contextAnchor,
    /bg-slate-900/,
    'ContextAnchor must use theme-aware apple-glass instead of hardcoded bg-slate-900'
  );
  assert.doesNotMatch(
    page,
    /bg-slate-900\/90\s+text-amber-100/,
    'Info uiNotice banner must not pair bg-slate-900/90 with text-amber-100 (unreadable in Light Mode)'
  );
  assert.match(
    page,
    /fixed\s+bottom-40\s+left-4\s+right-4\s+sm:bottom-24\s+sm:left-6/,
    'Prism Lens must be positioned away from bottom-right ContextAnchor and Ask DJ'
  );
});
