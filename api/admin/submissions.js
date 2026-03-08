const { readSubmissions, writeSubmissions } = require('../kv-store');

function parseCookies(req) {
  const raw = req.headers.cookie || '';
  const out = {};
  raw.split(';').forEach((part) => {
    const [k, v] = part.split('=');
    if (k && v) out[k.trim()] = decodeURIComponent(v.trim());
  });
  return out;
}

function isAuthed(req) {
  const cookies = parseCookies(req);
  return cookies.canopy_admin === '1';
}

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (!isAuthed(req)) {
    res.status(401).json({ ok: false, error: 'unauthorized' });
    return;
  }

  if (req.method === 'GET') {
    try {
      const items = await readSubmissions();
      res.status(200).json({ ok: true, items });
    } catch (e) {
      console.error(e);
      res.status(500).json({ ok: false, error: 'server_error' });
    }
    return;
  }

  if (req.method === 'DELETE') {
    const id = req.query.id || (req.body && req.body.id);
    if (!id) {
      res.status(400).json({ ok: false });
      return;
    }
    try {
      const items = await readSubmissions();
      const next = items.filter((x) => x.id !== id);
      await writeSubmissions(next);
      res.status(200).json({ ok: true, deleted: 1 });
    } catch (e) {
      console.error(e);
      res.status(500).json({ ok: false, error: 'server_error' });
    }
    return;
  }

  res.status(405).json({ ok: false });
};
