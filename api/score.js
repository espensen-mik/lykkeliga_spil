const script = `
local previous = redis.call('GET', KEYS[2])
if previous then return tonumber(redis.call('GET', KEYS[1]) or '0') end
local score = redis.call('INCR', KEYS[1])
redis.call('SET', KEYS[2], '1', 'EX', 86400)
return score
`;
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!['GET', 'POST'].includes(req.method)) return res.status(405).json({ error: 'Metoden understøttes ikke.' });
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return res.status(503).json({ error: 'Den fælles tæller er ikke tilsluttet endnu.' });
  if (req.method === 'POST') {
    const origin = req.headers.origin;
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    if (!origin || new URL(origin).host !== host) return res.status(403).json({ error: 'Ugyldig afsender.' });
  }
  const key = process.env.SCORE_KEY || 'lykkeliga:maal:v1';
  const id = req.headers['idempotency-key'];
  if (req.method === 'POST' && !/^[a-f0-9-]{36}$/i.test(id || '')) return res.status(400).json({ error: 'Målet mangler et gyldigt id.' });
  try {
    const command = req.method === 'GET' ? ['GET', key] : ['EVAL', script, '2', key, `${key}:event:${id}`];
    const response = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(command), signal: AbortSignal.timeout(6000) });
    if (!response.ok) throw new Error('Storage unavailable');
    const data = await response.json();
    if (data.error) throw new Error('Storage error');
    const score = Number(data.result || 0);
    if (!Number.isSafeInteger(score) || score < 0) throw new Error('Invalid score');
    return res.status(200).json({ score });
  } catch {
    return res.status(502).json({ error: 'Tælleren kan ikke kontaktes. Prøv igen.' });
  }
}
