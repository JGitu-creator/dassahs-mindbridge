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

test('AI route select and all <select>/<option> elements have explicit Light and Dark contrast', async () => {
  const globals = await readFile(globalsPath, 'utf8');
  const aiUsage = await readFile(aiUsagePath, 'utf8');

  assert.match(
    globals,
    /\.light\s+select\s+option\s*\{[^}]*background-color:\s*#ffffff[^}]*color:\s*#172033/,
    'globals.css must set explicit Light Mode background-color and color on select option'
  );
  assert.match(
    globals,
    /\.dark\s+select\s+option\s*\{[^}]*background-color:\s*#0f172a[^}]*color:\s*#f8fafc/,
    'globals.css must set explicit Dark Mode background-color and color on select option'
  );
  assert.match(
    aiUsage,
    /<option[^>]*className="[^"]*bg-\[var\(--bg\)\][^"]*text-\[var\(--fg\)\]/,
    'AIUsageControl <option> tags must explicitly set bg-[var(--bg)] text-[var(--fg)]'
  );
});

test('Navbar renders full word Dastastic (not Das) and supports Focus (Sovereign) mode', async () => {
  const page = await readFile(pagePath, 'utf8');

  assert.match(
    page,
    /focusMode\s*===\s*['"]sovereign['"]\s*\?\s*['"]Focus['"]\s*:\s*['"]Dastastic['"]/,
    'Navbar focusMode toggle must display full word Dastastic instead of truncated Das'
  );
  assert.doesNotMatch(
    page,
    /focusMode\s*===\s*['"]sovereign['"]\s*\?\s*['"]Focus['"]\s*:\s*['"]Das['"]/,
    'Navbar must not abbreviate Dastastic to Das'
  );
});

test('Light Mode remaps all pastel utility text classes and input/vault/action cards use theme-aware glass', async () => {
  const globals = await readFile(globalsPath, 'utf8');
  const page = await readFile(pagePath, 'utf8');

  for (const cls of [
    'text-blue-100',
    'text-blue-200',
    'text-blue-300',
    'text-purple-100',
    'text-purple-300',
    'text-amber-100',
    'text-amber-200',
    'text-amber-300',
    'text-emerald-300',
    'text-slate-200',
    'text-slate-300',
    'text-slate-400',
  ]) {
    assert.match(
      globals,
      new RegExp(`\\.light\\s+\\.${cls}\\s*\\{`),
      `globals.css must remap .light .${cls} for Light Mode contrast`
    );
  }

  assert.doesNotMatch(
    page,
    /className="prism-input[^"]*bg-black\/40/,
    'textarea.prism-input must use bg-[var(--color-glass)] instead of bg-black/40 for Light Mode readability'
  );
  assert.doesNotMatch(
    page,
    /bg-black\/60[^"]*><NeuroMirrorText/,
    'NeuroMirrorText container must use bg-[var(--color-glass)] instead of bg-black/60'
  );
});

test('App-wide scan across src/app and src/components has zero bg-[var(--bg)] text-black regressions', async () => {
  const { readdir } = await import('node:fs/promises');
  const { join } = await import('node:path');
  const srcRoot = new URL('../src', import.meta.url).pathname;

  async function collectTsx(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...(await collectTsx(full)));
      } else if (entry.name.endsWith('.tsx')) {
        files.push(full);
      }
    }
    return files;
  }

  const tsxFiles = await collectTsx(srcRoot);
  assert.ok(tsxFiles.length >= 10, `Expected >= 10 .tsx files in src/, found ${tsxFiles.length}`);

  for (const file of tsxFiles) {
    const content = await readFile(file, 'utf8');
    assert.doesNotMatch(
      content,
      /bg-\[var\(--bg\)\]\s+text-black/,
      `Contrast regression in ${file}: bg-[var(--bg)] text-black`
    );
  }
});
