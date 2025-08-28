// Minimal integration test for Meituan AIGC OpenAI-compatible API
// Usage:
//   MT_APP_ID=your_app_id npm run test:ai
//   or
//   npm run test:ai -- --model=gpt-4.1

const DEFAULT_ENDPOINT = 'https://aigc.sankuai.com/v1/openai/native/chat/completions';

function parseArgs(argv) {
  const args = {};
  for (const part of argv.slice(2)) {
    if (part.startsWith('--')) {
      const [k, v] = part.replace(/^--/, '').split('=');
      args[k] = v ?? true;
    }
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv);
  const endpoint = args.endpoint || DEFAULT_ENDPOINT;
  const model = args.model || 'gpt-4o-mini';
  const appId = process.env.MT_APP_ID || '21896386967961661493';
  const controller = new AbortController();
  const timeoutMs = Number(args.timeoutMs || 30000);
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const payload = {
    model,
    messages: [
      {
        role: 'user',
        content: '给我说2个科学家的名字'
      }
    ],
    stream: false
  };

  const start = Date.now();
  try {
    console.log('[test-ai-api] endpoint =', endpoint);
    console.log('[test-ai-api] model    =', model);
    console.log('[test-ai-api] timeout  =', timeoutMs, 'ms');

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${appId}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    const elapsed = Date.now() - start;
    const text = await res.text();

    console.log('[test-ai-api] status  =', res.status, res.statusText);
    console.log('[test-ai-api] elapsed =', `${elapsed} ms`);

    if (!res.ok) {
      console.error('[test-ai-api] ERROR BODY:\n', text);
      process.exitCode = 1;
      return;
    }

    try {
      const json = JSON.parse(text);
      console.log('[test-ai-api] SUCCESS JSON:');
      console.dir(json, { depth: null });
      const content = json?.choices?.[0]?.message?.content;
      if (content) {
        console.log('\n[test-ai-api] Assistant says:\n', content);
      }
    } catch (e) {
      console.log('[test-ai-api] SUCCESS TEXT (non-JSON?):\n', text);
    }
  } catch (err) {
    console.error('[test-ai-api] REQUEST FAILED:', err?.message || err);
    process.exitCode = 1;
  } finally {
    clearTimeout(timer);
  }
}

main();


