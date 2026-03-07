function parseBody(req) {
  if (typeof req.body === 'object' && req.body !== null) return req.body;
  try {
    return JSON.parse(req.body || '{}');
  } catch (e) {
    return {};
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false });
    return;
  }
  const user = process.env.CANOPY_ADMIN_USER || 'canopy';
  const pass = process.env.CANOPY_ADMIN_PASS || 'canopy123';
  const body = parseBody(req);
  const u = body.user || body.username || '';
  const p = body.pass || body.password || '';

  if (u === user && p === pass) {
    res.setHeader('Set-Cookie', 'canopy_admin=1; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400');
    res.status(200).json({ ok: true });
    return;
  }
  res.status(401).json({ ok: false, error: 'invalid_credentials' });
};
