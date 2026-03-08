// Shared: read/write submissions JSON from Vercel Blob.
// Use a fixed pathname so submit + admin always read/write the same object.
const { get, put } = require('@vercel/blob');

const BLOB_PATH = 'canopy/submissions.json';

async function readTextFromGetResult(result) {
  if (!result) return '';

  if (typeof result.text === 'function') {
    return await result.text();
  }

  // Some versions expose stream as function, some as property.
  const streamLike = typeof result.stream === 'function' ? result.stream() : result.stream;
  if (!streamLike) return '';

  if (typeof streamLike.getReader === 'function') {
    const reader = streamLike.getReader();
    const chunks = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }
    return new TextDecoder().decode(
      chunks.length === 1 ? chunks[0] : Buffer.concat(chunks.map((c) => Buffer.from(c)))
    );
  }

  const chunks = [];
  for await (const chunk of streamLike) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString('utf8');
}

async function readSubmissions() {
  try {
    const result = await get(BLOB_PATH, { access: 'private' });
    if (!result) return [];
    if (typeof result.statusCode === 'number' && result.statusCode !== 200) return [];

    const text = await readTextFromGetResult(result);
    const data = JSON.parse(text || '[]');
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
}

async function writeSubmissions(items) {
  await put(BLOB_PATH, JSON.stringify(items), {
    access: 'private',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

module.exports = { readSubmissions, writeSubmissions };
