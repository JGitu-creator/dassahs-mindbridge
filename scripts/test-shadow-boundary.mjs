import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const route = await readFile(new URL('../src/app/api/simplify/route.ts', import.meta.url), 'utf8');
const helper = await readFile(new URL('../src/lib/server/shadow-mode.ts', import.meta.url), 'utf8');
const env = await readFile(new URL('../.env.example', import.meta.url), 'utf8');

assert.match(env, /PRISM_SHADOW_MODE=false/);
assert.match(helper, /PRISM_SHADOW_SYNTHETIC_TOKEN/);
assert.match(helper, /PRISM_SHADOW_FIXTURE_SHA256/);
assert.match(helper, /createHash\('sha256'\)/);
assert.match(helper, /PRISM_SHADOW_MAX_COST_USD/);
assert.match(helper, /PRISM_SHADOW_MAX_OUTPUT_TOKENS/);
assert.match(helper, /fallbackState/);
assert.match(helper, /catch \{/);
assert.match(route, /after\(async \(\) =>/);
assert.match(route, /x-prism-shadow-fixture/);
assert.match(route, /runShadowProbe/);
assert.doesNotMatch(route, /shadowTelemetry.*return/);
assert.doesNotMatch(helper, /console\.log\([^)]*input\.text/);
assert.doesNotMatch(helper, /console\.log\([^)]*userId/);

console.log('shadow boundary static checks: 13 passed');
