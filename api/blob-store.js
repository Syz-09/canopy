// Shared: read/write submissions JSON from Vercel Blob (pathname canopy/submissions.json)
// Uses @vercel/blob ^2.x (get, put with private + allowOverwrite)
const BLOB_PATH = 'canopy/submissions.json';
const { get, put, list } = require('@vercel/blob');

async function readSubmissions() {
  try {
    const { blobs } = await list({ prefix: 'canopy/' });
    const b = blobs.find((x) => x.pathname === BLOB_PATH);
    if (!b) return [];
    const blob = await get(b.url, { access: 'private' });
    if (!blob || !blob.stream) return [];
    const chunks = [];
    for await (const chunk of blob.stream()) chunks.push(chunk);
    const text = Buffer.concat(chunks).toString('utf8');
    const data = JSON.parse(text || '[]');
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
}

async function writeSubmissions(items) {
  const body = JSON.stringify(items);
  await put(BLOB_PATH, body, {
    access: 'private',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

module.exports = { readSubmissions, writeSubmissions };
