import assert from 'node:assert/strict';

const BASE = process.env.STRESS_BASE_URL || 'http://127.0.0.1:3099';

async function check(name, fn) {
  const start = performance.now();
  try {
    await fn();
    console.log(`PASS [${Math.round(performance.now() - start)}ms] ${name}`);
  } catch (err) {
    console.error(`FAIL [${Math.round(performance.now() - start)}ms] ${name}:`, err.message || err);
    process.exitCode = 1;
  }
}

async function run() {
  console.log(`Running Prism Engine Full Stress Test against ${BASE}...\n`);

  // 1. All core pages return 200 HTML with expected branding
  await check('GET / (Dassah\'s Prism) renders 200 with brand & Unlimited badge', async () => {
    const res = await fetch(`${BASE}/`);
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.match(html, /Dassah/);
    assert.match(html, /Unlimited/i);
  });

  await check('GET /canvas (Prism Play) renders 200 with Prism Play & Turning Dread into Play', async () => {
    const res = await fetch(`${BASE}/canvas`);
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.match(html, /Prism/);
    assert.match(html, /Turning Dread into Play/);
  });

  await check('GET /engine (The Prism Engine) renders 200 with portal cards', async () => {
    const res = await fetch(`${BASE}/engine`);
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.match(html, /The Prism/);
    assert.match(html, /Engine/);
  });

  await check('GET /robots.txt & /sitemap.xml return valid SEO files for dassahs-prism.vercel.app', async () => {
    const robots = await fetch(`${BASE}/robots.txt`);
    assert.equal(robots.status, 200);
    const robotsText = await robots.text();
    assert.match(robotsText, /sitemap\.xml/i);

    const sitemap = await fetch(`${BASE}/sitemap.xml`);
    assert.equal(sitemap.status, 200);
    const sitemapText = await sitemap.text();
    assert.match(sitemapText, /\/engine/);
    assert.match(sitemapText, /\/canvas/);
  });

  await check('GET /api/health returns 200 with safe boolean provider flags (zero secrets)', async () => {
    const res = await fetch(`${BASE}/api/health`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.ok, true);
    assert.equal(typeof json.providers?.groq, 'boolean');
    assert.equal(typeof json.providers?.openrouter, 'boolean');
    assert.equal(typeof json.providers?.gemini, 'boolean');
    assert.equal(json.providers?.local, true);
    assert.doesNotMatch(JSON.stringify(json), /gsk_|sk-or-|AIza/);
  });

  // 2. /api/simplify validation & 10x parallel stress burst
  await check('POST /api/simplify rejects empty payload (400) & 160k overload (413)', async () => {
    const empty = await fetch(`${BASE}/api/simplify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: '' }),
    });
    assert.equal(empty.status, 400);

    const huge = await fetch(`${BASE}/api/simplify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'A'.repeat(155000) }),
    });
    assert.equal(huge.status, 413);
  });

  await check('POST /api/simplify survives 10 concurrent parallel refraction bursts cleanly (zero 500s)', async () => {
    const reqs = Array.from({ length: 10 }, (_, idx) =>
      fetch(`${BASE}/api/simplify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `Parallel stress card #${idx + 1}: React state lets components remember user interactions and re-render UI cleanly without manual DOM mutations.`,
          cognitiveMode: 'adhd',
          simplicityLevel: 'concise',
          preferredProvider: 'auto',
        }),
      }).then(async (r) => ({ status: r.status, body: await r.json() })),
    );
    const results = await Promise.all(reqs);
    for (const r of results) {
      assert.equal(r.status, 200, `Expected 200, got ${r.status}: ${JSON.stringify(r.body)}`);
      assert.ok(Array.isArray(r.body.chunks) && r.body.chunks.length > 0);
      assert.ok(r.body.usage?.provider, 'Expected usage.provider to be populated');
    }
  });

  await check('POST /api/chat survives 5 concurrent Ask DJ bursts with zero 500s', async () => {
    const reqs = Array.from({ length: 5 }, (_, idx) =>
      fetch(`${BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Explain React state simply (burst ${idx + 1})`,
          history: [],
          data: { tldr: ['React state tracks UI memory'], chunks: [{ heading: 'State', summary: 'State triggers re-renders.' }] },
          preferredProvider: 'auto',
        }),
      }).then(async (r) => ({ status: r.status, body: await r.json() })),
    );
    const results = await Promise.all(reqs);
    for (const r of results) {
      assert.equal(r.status, 200, `Expected 200, got ${r.status}: ${JSON.stringify(r.body)}`);
      assert.ok(typeof r.body.text === 'string' && r.body.text.length > 10);
    }
  });

  // 3. /api/parse document parsing (TXT, PDF, and MP4 rejection message)
  await check('POST /api/parse extracts TXT cleanly and rejects unsupported MP4 with 415', async () => {
    const txtForm = new FormData();
    txtForm.append('file', new Blob(['Hello Dassah Prism stress test document!'], { type: 'text/plain' }), 'notes.txt');
    const txtRes = await fetch(`${BASE}/api/parse`, { method: 'POST', body: txtForm });
    assert.equal(txtRes.status, 200);
    const txtJson = await txtRes.json();
    assert.match(txtJson.text, /Hello Dassah Prism/);

    const mp4Form = new FormData();
    mp4Form.append('file', new Blob([new Uint8Array([0, 0, 0, 24])], { type: 'video/mp4' }), 'intro.mp4');
    const mp4Res = await fetch(`${BASE}/api/parse`, { method: 'POST', body: mp4Form });
    assert.equal(mp4Res.status, 415);
  });

  // 4. /api/canvas/modules SSRF & auth validation
  await check('POST /api/canvas/modules blocks localhost SSRF and missing token', async () => {
    const ssrf = await fetch(`${BASE}/api/canvas/modules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-canvas-token': 'fake-token' },
      body: JSON.stringify({ courseUrl: 'http://localhost:3000/courses/123' }),
    });
    assert.equal(ssrf.status, 400);

    const noToken = await fetch(`${BASE}/api/canvas/modules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseUrl: 'https://example.instructure.com/courses/123' }),
    });
    assert.equal(noToken.status, 400);
  });

  if (process.exitCode) {
    console.error('\nStress test finished WITH FAILURES.');
  } else {
    console.log('\nALL PRISM ENGINE STRESS CHECKS PASSED!');
  }
}

run();
