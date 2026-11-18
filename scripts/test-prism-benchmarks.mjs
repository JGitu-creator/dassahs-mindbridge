import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const fixturesPath = new URL('./fixtures/prism-synthetic-benchmarks.json', import.meta.url);
const progressPrismPath = new URL('../src/components/prism/ProgressPrism.tsx', import.meta.url);

function formatReadingTimeLabel(wordCount) {
  const minutes = Math.round(wordCount / 200);
  return minutes < 1 ? '<1m' : `${minutes}m`;
}

test('synthetic benchmark fixtures are non-sensitive, valid, and cover core Prism audiences', async () => {
  const raw = await readFile(fixturesPath, 'utf8');
  const fixtures = JSON.parse(raw);

  assert.ok(Array.isArray(fixtures) && fixtures.length >= 4, 'Must include at least 4 synthetic benchmark fixtures');

  const categories = new Set(fixtures.map((f) => f.category));
  assert.ok(categories.has('student_notes'), 'Must include student_notes fixture');
  assert.ok(categories.has('it_support'), 'Must include it_support fixture');
  assert.ok(categories.has('work_policy'), 'Must include work_policy fixture');
  assert.ok(categories.has('short_note'), 'Must include short_note fixture');

  for (const fixture of fixtures) {
    assert.ok(typeof fixture.id === 'string' && fixture.id.length > 0);
    assert.ok(typeof fixture.goal === 'string' && fixture.goal.length > 0);
    assert.ok(typeof fixture.text === 'string' && fixture.text.length > 0);

    const words = fixture.text.trim().split(/\s+/).filter(Boolean).length;
    assert.ok(words >= fixture.expectedMinWords, `${fixture.id} should have >= ${fixture.expectedMinWords} words (got ${words})`);

    const readingTime = formatReadingTimeLabel(words);
    assert.notEqual(readingTime, '0m', `${fixture.id} reading time must never display 0m`);
    assert.doesNotMatch(
      fixture.text,
      /sk-[A-Za-z0-9]{10,}|AIza[A-Za-z0-9_-]{10,}|sb_secret_|password\s*[:=]/i,
      `${fixture.id} must never contain real credentials or secrets`
    );
  }
});

test('ProgressPrism clamps progress between 0% and 100%', async () => {
  const progressPrism = await readFile(progressPrismPath, 'utf8');
  assert.match(progressPrism, /Math\.max\(0,\s*Math\.min\(1,\s*progress\)\)/, 'ProgressPrism must clamp progress to [0, 1]');
});
