import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/score.js';
function response() { return { headers: {}, setHeader(k,v) { this.headers[k]=v; }, status(code) { this.code=code; return this; }, json(body) { this.body=body; return this; } }; }
test('score API validates requests and delegates atomic, deduplicated increments', async () => {
  const originalFetch = globalThis.fetch;
  const saved = { ...process.env };
  try {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    let res = response();
    await handler({ method: 'GET', headers: {} }, res);
    assert.equal(res.code, 503);
    process.env.UPSTASH_REDIS_REST_URL = 'https://example.test';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'test';
    res = response();
    await handler({ method: 'POST', headers: { origin: 'https://other.test', host: 'game.test' } }, res);
    assert.equal(res.code, 403);
    res = response();
    await handler({ method: 'POST', headers: { origin: 'https://game.test', host: 'game.test' } }, res);
    assert.equal(res.code, 400);
    let command;
    globalThis.fetch = async (url, options) => { command = JSON.parse(options.body); return { ok: true, json: async () => ({ result: 42 }) }; };
    res = response();
    await handler({ method: 'POST', headers: { origin: 'https://game.test', host: 'game.test', 'idempotency-key': '12345678-1234-1234-1234-123456789abc' } }, res);
    assert.equal(res.code, 200);
    assert.equal(res.body.score, 42);
    assert.equal(command[0], 'EVAL');
    assert.match(command[1], /INCR/);
    assert.match(command[1], /86400/);
    assert.match(command[4], /:event:12345678/);
    globalThis.fetch = async () => { throw new Error('offline'); };
    res = response();
    await handler({ method: 'GET', headers: {} }, res);
    assert.equal(res.code, 502);
  } finally { globalThis.fetch = originalFetch; process.env = saved; }
});
