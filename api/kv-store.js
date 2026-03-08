// 使用 Vercel KV（Redis）存储 Submit 提交数据，供 Admin 查看
// 需配置环境变量：KV_REST_API_URL、KV_REST_API_TOKEN（通过 Vercel 添加 Redis 集成自动注入）
const { kv } = require('@vercel/kv');
const KV_KEY = 'canopy:submissions';

async function readSubmissions() {
  try {
    const raw = await kv.get(KV_KEY);
    if (raw == null) return [];
    const data = Array.isArray(raw) ? raw : typeof raw === 'string' ? JSON.parse(raw || '[]') : [];
    return data;
  } catch (e) {
    return [];
  }
}

async function writeSubmissions(items) {
  await kv.set(KV_KEY, items);
}

module.exports = { readSubmissions, writeSubmissions };
