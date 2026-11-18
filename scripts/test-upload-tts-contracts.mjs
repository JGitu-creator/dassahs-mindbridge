import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const parseRoutePath = new URL('../src/app/api/parse/route.ts', import.meta.url);
const ttsRoutePath = new URL('../src/app/api/tts/route.ts', import.meta.url);
const deleteRoutePath = new URL('../src/app/api/user/delete-data/route.ts', import.meta.url);
const pagePath = new URL('../src/app/page.tsx', import.meta.url);

test('/api/parse enforces file presence, extension/MIME whitelist, 10MB cap, and empty-text 422', async () => {
  const parseRoute = await readFile(parseRoutePath, 'utf8');

  assert.match(parseRoute, /No file provided.*status:\s*400/s, 'Missing file must return 400');
  assert.match(parseRoute, /10 \* 1024 \* 1024/, 'Max upload size must be 10 MB');
  assert.match(parseRoute, /status:\s*413/, 'Oversized file must return 413');
  assert.match(parseRoute, /status:\s*415/, 'Unsupported MIME/extension must return 415');
  assert.match(parseRoute, /No selectable text was found.*status:\s*422/s, 'Empty extracted text must return 422');
  assert.match(parseRoute, /text\.slice\(0,\s*100000\)/, 'Parsed text must be bounded to 100,000 chars');
});

test('/api/tts validates payload, fails safely to 503 when XAI_API_KEY is absent, and bounds text length', async () => {
  const ttsRoute = await readFile(ttsRoutePath, 'utf8');
  const page = await readFile(pagePath, 'utf8');

  assert.match(ttsRoute, /Invalid TTS request payload.*status:\s*400/s, 'Malformed JSON must return 400');
  assert.match(ttsRoute, /Text is required.*status:\s*400/s, 'Empty text must return 400');
  assert.match(ttsRoute, /!process\.env\.XAI_API_KEY[\s\S]*status:\s*503/, 'Missing XAI_API_KEY must return 503 for browser fallback');
  assert.match(ttsRoute, /rawText\.length\s*>\s*4000/, 'TTS input must be bounded to 4000 chars');
  assert.match(ttsRoute, /AbortSignal\.timeout\(20000\)/, 'TTS fetch must enforce a 20s timeout');
  assert.match(page, /Switched to browser voice/, 'Client TTS handler must gracefully fall back to browser speech synthesis');
});

test('/api/user/delete-data enforces Bearer auth, scopes deletes to user.id, and leaks no secrets', async () => {
  const deleteRoute = await readFile(deleteRoutePath, 'utf8');

  assert.match(deleteRoute, /status:\s*401/, 'Unauthenticated requests must return 401');
  assert.match(deleteRoute, /\.eq\('user_id',\s*user\.id\)/, 'All deletions must be scoped to user.id');
  assert.match(deleteRoute, /'history'/, 'Must support clearing history');
  assert.match(deleteRoute, /'neural_vault_items'/, 'Must support clearing neural_vault_items');
  assert.match(deleteRoute, /'ask_dj_questions'/, 'Must support clearing ask_dj_questions');
  assert.doesNotMatch(
    deleteRoute,
    /GEMINI_API_KEY|OPENROUTER_API_KEY|XAI_API_KEY|STRIPE_SECRET_KEY/,
    'Delete-data route must never reference AI or billing secrets'
  );
});
