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
});
