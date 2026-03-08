const { readSubmissions, writeSubmissions } = require('../kv-store');

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
  res.setHeader('Content-Type', 'application/json');
  try {
    const body = parseBody(req);
    const name = body.name || '';
    const email = body.email || '';
    const items = await readSubmissions();
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    items.unshift({
      id,
      form_type: 'feature',
      name,
      email,
      payload: JSON.stringify(body),
      created_at: new Date().toISOString(),
    });
    await writeSubmissions(items);
    res.status(200).json({ ok: true, id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: 'server_error' });
  }
};
