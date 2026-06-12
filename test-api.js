const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// Load .env.local manually
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  const lines = content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      process.env[key] = val;
    }
  }
}

async function testGemini(modelName = 'gemini-1.5-flash') {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log('Gemini: Missing Key');
    return;
  }
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent('Hello, reply with only the word SUCCESS.');
    console.log(`Gemini (${modelName}) success:`, result.response.text().trim());
  } catch (e) {
    console.log(`Gemini (${modelName}) error:`, e.message);
  }
}

async function testOpenAI() {
  const { OpenAI } = require('openai');
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.log('OpenAI: Missing Key');
    return;
  }
  try {
    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'Hello, reply with only the word SUCCESS.' }],
    });
    console.log('OpenAI success:', completion.choices[0].message.content.trim());
  } catch (e) {
    console.log('OpenAI error:', e.message);
  }
}

async function testAnthropic() {
  const Anthropic = require('@anthropic-ai/sdk');
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.log('Anthropic: Missing Key');
    return;
  }
  try {
    const anthropic = new Anthropic({ apiKey });
    const msg = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1024,
      messages: [{ role: 'user', content: 'Hello, reply with only the word SUCCESS.' }],
    });
    console.log('Anthropic success:', msg.content[0].text.trim());
  } catch (e) {
    console.log('Anthropic error:', e.message);
  }
}

async function testDeepSeek() {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.log('DeepSeek: Missing Key');
    return;
  }
  try {
    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: 'Hello, reply with only the word SUCCESS.' }]
      })
    });
    const data = await res.json();
    if (data.error) {
      console.log('DeepSeek error:', data.error.message || data.error);
    } else {
      console.log('DeepSeek success:', data.choices[0].message.content.trim());
    }
  } catch (e) {
    console.log('DeepSeek error:', e.message);
  }
}

async function run() {
  await testGemini('gemini-1.5-flash');
  await testGemini('gemini-2.5-flash');
  await testGemini('gemini-2.0-flash');
  await testOpenAI();
  await testAnthropic();
  await testDeepSeek();
}

run();
