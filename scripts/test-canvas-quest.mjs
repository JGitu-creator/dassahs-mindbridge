import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  parseCanvasCourseUrl,
  splitIntoPrismCards,
  createInstantLocalPrism,
  DEMO_QUESTS,
} from '../src/lib/canvas-parser.ts';

test('parseCanvasCourseUrl parses valid Canvas course URLs', () => {
  const parsed = parseCanvasCourseUrl('https://example-school.instructure.com/courses/1234/modules');
  assert.equal(parsed.baseUrl, 'https://example-school.instructure.com');
  assert.equal(parsed.courseId, '1234');
});

test('parseCanvasCourseUrl blocks insecure or private-network URLs (SSRF protection)', () => {
  assert.throws(() => parseCanvasCourseUrl('http://example-school.instructure.com/courses/1234'));
  assert.throws(() => parseCanvasCourseUrl('https://localhost:3000/courses/1234'));
  assert.throws(() => parseCanvasCourseUrl('https://127.0.0.1/courses/1234'));
  assert.throws(() => parseCanvasCourseUrl('https://192.168.1.10/courses/1234'));
  assert.throws(() => parseCanvasCourseUrl('https://example-school.instructure.com/profile/settings'));
});

test('splitIntoPrismCards strips HTML noise and creates bite-sized cards', () => {
  const html = `
    <script>alert('bad')</script>
    <nav>Sidebar noise</nav>
    <h2>Understanding HTTP</h2>
    <p>${'HTTP lets browsers and servers exchange structured data cleanly. '.repeat(25)}</p>
    <h2>Status Codes</h2>
    <p>Status 200 means success and 404 means not found.</p>
  `;
  const cards = splitIntoPrismCards('HTTP Basics', html, true);
  assert.ok(cards.length >= 2, 'Expected long HTML to split into multiple calm cards');
  assert.equal(cards.some((c) => c.text.includes('alert(')), false, 'Scripts must be stripped');
  assert.equal(cards.some((c) => c.text.includes('Sidebar noise')), false, 'Nav must be stripped');
  assert.equal(cards[0].heading, 'Understanding HTTP');
});

test('createInstantLocalPrism always generates Tiny Idea, Metaphor, Dopamine Boost, and One Small Move', () => {
  const res = createInstantLocalPrism(
    'A REST API uses HTTP methods like GET and POST to exchange JSON data between client and server.',
    'REST APIs',
  );
  assert.ok(res.tinyIdea.length > 10);
  assert.ok(res.metaphor.length > 20);
  assert.ok(res.dopamineBoost.length > 10);
  assert.ok(res.oneSmallMove.length > 10);
  assert.equal(res.source, 'local');
  assert.ok(DEMO_QUESTS.length >= 2);
});

test('/canvas page uses joyful Prism Play language, zero intimidating jargon, and zero hardcoded personal URLs', async () => {
  const canvasPage = await readFile(new URL('../src/app/canvas/page.tsx', import.meta.url), 'utf8');
  const parserFile = await readFile(new URL('../src/lib/canvas-parser.ts', import.meta.url), 'utf8');

  // Positive DP & ADHD v2 features
  assert.match(canvasPage, /Prism Play/);
  assert.match(canvasPage, /The Tiny Idea/);
  assert.match(canvasPage, /The Metaphor/);
  assert.match(canvasPage, /Dopamine Boost/);
  assert.match(canvasPage, /Claim Win/);
  assert.match(canvasPage, /Refract with Prism/);
  assert.match(canvasPage, /Private to your browser/);
  assert.match(canvasPage, /COLOR_THEMES/);
  assert.match(canvasPage, /playCardWinChime/);
  assert.match(canvasPage, /PROGRESS_KEY/);
  assert.match(canvasPage, /bodyDoubleMessage/);

  // Zero hardcoded personal Canvas URLs
  assert.doesNotMatch(canvasPage, /moringa\.instructure\.com/i);
  assert.doesNotMatch(parserFile, /moringa\.instructure\.com/i);

  // Zero intimidating machinery words
  assert.doesNotMatch(canvasPage, /Dastastic Study Dock/i);
  assert.doesNotMatch(canvasPage, /Mark chunk complete/i);
  assert.doesNotMatch(canvasPage, /min remaining/i);
  assert.doesNotMatch(canvasPage, /Chunk \d+ of/i);
});

test('BionicText renders real whitespace for clean wrapping and ReadAloud styles option contrast explicitly', async () => {
  const bionic = await readFile(new URL('../src/components/prism/BionicText.tsx', import.meta.url), 'utf8');
  const readAloud = await readFile(new URL('../src/components/prism/ReadAloud.tsx', import.meta.url), 'utf8');

  assert.match(bionic, /trailingSpace/, 'BionicText must insert real whitespace so long text wraps inside cards');
  assert.match(bionic, /break-words/, 'BionicText must allow word breaking');
  assert.match(readAloud, /colorScheme/, 'ReadAloud select must declare colorScheme for readable native popups');
  assert.match(readAloud, /optionClass/, 'ReadAloud options must have explicit contrast classes');
  assert.match(readAloud, /playbackRate/, 'ReadAloud must support 1x-2x speed control (Tool A)');
});

test('Neural Identity presets, Quick Brain Check-In analysis, and all A–H polarizing tools work cleanly', async () => {
  const {
    NEURAL_PRESETS,
    POLARIZING_SUPERPOWERS,
    analyzeBrainCheckIn,
    buildProfileFromCheckIn,
    parseSoundtrackEmbedUrl,
  } = await import('../src/lib/neural-identity.ts');

  // All 8 polarizing tools A–H exist in the catalog
  assert.deepEqual(
    POLARIZING_SUPERPOWERS.map((p) => p.id),
    ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
  );

  // Presets exist
  assert.ok(NEURAL_PRESETS.adhd_flow);
  assert.ok(NEURAL_PRESETS.adhd_energy);
  assert.ok(NEURAL_PRESETS.dyslexia_comfort);
  assert.ok(NEURAL_PRESETS.low_sensory);

  // High-energy + challenge analysis recommends all A–H
  const highAnalysis = analyzeBrainCheckIn('energized', 'bionic', 'challenge');
  assert.equal(highAnalysis.recommendedIds.length, 8);

  // Quiet + gentle analysis keeps all A–H OFF by default
  const quietAnalysis = analyzeBrainCheckIn('silence', 'clean', 'gentle');
  assert.equal(quietAnalysis.recommendedIds.length, 0);

  // User hand-picking specific A–H tools overrides recommendations cleanly
  const custom = buildProfileFromCheckIn('silence', 'clean', 'gentle', ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']);
  assert.equal(custom.profile.preferredReadSpeed, 1.5);
  assert.equal(custom.profile.challengeMode, true);
  assert.equal(custom.profile.bossFightMode, true);
  assert.equal(custom.profile.showRsvpMode, true);
  assert.equal(custom.profile.showGamma40, true);
  assert.equal(custom.profile.showSensoryBar, true);
  assert.equal(custom.profile.kineticMotion, true);
  assert.equal(custom.profile.shameFreeStreak, false);
  assert.equal(custom.profile.showVoiceRecap, true);

  // Soundtrack embed URL parser allows valid Spotify/YouTube HTTPS links and blocks unsafe URLs
  const sp = parseSoundtrackEmbedUrl('https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO');
  assert.equal(sp?.provider, 'spotify');
  assert.match(sp?.embedUrl || '', /^https:\/\/open\.spotify\.com\/embed\/playlist\//);

  const yt = parseSoundtrackEmbedUrl('https://www.youtube.com/watch?v=jfKfPfyJRdk');
  assert.equal(yt?.provider, 'youtube');
  assert.equal(yt?.embedUrl, 'https://www.youtube-nocookie.com/embed/jfKfPfyJRdk');

  const ytShort = parseSoundtrackEmbedUrl('https://youtu.be/jfKfPfyJRdk');
  assert.equal(ytShort?.embedUrl, 'https://www.youtube-nocookie.com/embed/jfKfPfyJRdk');

  assert.equal(parseSoundtrackEmbedUrl('javascript:alert(1)'), null);
  assert.equal(parseSoundtrackEmbedUrl('http://open.spotify.com/track/12345'), null);
  assert.equal(parseSoundtrackEmbedUrl('https://evil.example.com/embed/123'), null);
});

test('/canvas integrates QuickBrainCheckIn, NeuralIdentityDrawer, Neural Command, Studio Dock, and all power tools', async () => {
  const canvasPage = await readFile(new URL('../src/app/canvas/page.tsx', import.meta.url), 'utf8');
  const identityPanel = await readFile(new URL('../src/components/canvas/NeuralIdentityPanel.tsx', import.meta.url), 'utf8');
  const audioLib = await readFile(new URL('../src/lib/prism-audio.ts', import.meta.url), 'utf8');

  assert.match(canvasPage, /QuickBrainCheckIn/);
  assert.match(canvasPage, /NeuralIdentityDrawer/);
  assert.match(canvasPage, /Neural Command/);
  assert.match(canvasPage, /Soundscape/);
  assert.match(canvasPage, /SensorySoundscapeBar/);
  assert.match(canvasPage, /BrainDumpDrawer/);
  assert.match(canvasPage, /RsvpSpeedReader/);
  assert.match(canvasPage, /VoiceTalkItOut/);
  assert.match(canvasPage, /StageBossFight/);
  assert.match(canvasPage, /PrismLensPopup/);
  assert.match(canvasPage, /PrismWeaver/);
  assert.match(canvasPage, /Beat-the-Clock/);
  assert.doesNotMatch(identityPanel, /A–H tools ON/);
  assert.match(audioLib, /gamma40/);
  assert.match(audioLib, /startSoundscape/);
});

test('Unified 4-tier Prism Engine AI cascade powers both /api/simplify and /api/chat with zero-API local fallback', async () => {
  const cascade = await readFile(new URL('../src/lib/server/prism-ai-cascade.ts', import.meta.url), 'utf8');
  const simplifyRoute = await readFile(new URL('../src/app/api/simplify/route.ts', import.meta.url), 'utf8');
  const chatRoute = await readFile(new URL('../src/app/api/chat/route.ts', import.meta.url), 'utf8');
  const envExample = await readFile(new URL('../.env.example', import.meta.url), 'utf8');

  // 4-Tier Cascade: Groq -> OpenRouter Free -> Gemini -> Unlimited Local Prism
  assert.match(cascade, /llama-3\.3-70b-versatile/);
  assert.match(cascade, /meta-llama\/llama-3\.3-70b-instruct:free/);
  assert.match(cascade, /google\/gemini-2\.0-flash-exp:free/);
  assert.match(cascade, /openrouter\/free/);
  assert.match(cascade, /gemini-2\.0-flash/);
  assert.match(cascade, /createLocalChatReply/);

  // Both routes use the unified cascade and local fallback
  assert.match(simplifyRoute, /callPrismCompletion/);
  assert.match(simplifyRoute, /createLocalChatReply/);
  assert.match(simplifyRoute, /createLocalRefraction/);
  assert.match(chatRoute, /callPrismChat/);
  assert.match(chatRoute, /createLocalChatReply/);

  // .env.example documents GROQ_API_KEY safely without any real secret
  assert.match(envExample, /GROQ_API_KEY=your_groq_api_key/);
  assert.doesNotMatch(envExample, /gsk_[A-Za-z0-9]{10,}/);
});

test('Prism Engine Launchpad (/engine), Prism Play (/canvas), and Dassah\'s Prism (/) are interconnected', async () => {
  const enginePage = await readFile(new URL('../src/app/engine/page.tsx', import.meta.url), 'utf8');
  const canvasPage = await readFile(new URL('../src/app/canvas/page.tsx', import.meta.url), 'utf8');
  const mainPage = await readFile(new URL('../src/app/page.tsx', import.meta.url), 'utf8');

  assert.match(enginePage, /The Prism Engine/);
  assert.match(enginePage, /Turning Dread into Play/);
  assert.match(enginePage, /href="\/"/);
  assert.match(enginePage, /href="\/canvas"/);
  assert.match(enginePage, /Groq LPU/);
  assert.match(enginePage, /Unlimited Local Prism/);

  assert.match(canvasPage, /Turning Dread into Play/);
  assert.match(canvasPage, /href="\/engine"/);

  assert.match(mainPage, /href="\/canvas"/);
  assert.match(mainPage, /href="\/engine"/);
});

