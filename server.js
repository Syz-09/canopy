// CANOPY backend: store submissions in SQLite and serve admin UI

const path = require('path');
const fs = require('fs');
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Simple admin credentials (can override with env)
const ADMIN_USER = process.env.CANOPY_ADMIN_USER || 'canopy';
const ADMIN_PASS = process.env.CANOPY_ADMIN_PASS || 'canopy123';

// Static files (front-end)
app.use(express.static(path.join(__dirname)));

// Body parsers
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Tiny cookie parser
app.use((req, res, next) => {
  const header = req.headers.cookie || '';
  const cookies = {};
  header.split(';').forEach((part) => {
    const [k, v] = part.split('=');
    if (!k || !v) return;
    cookies[k.trim()] = decodeURIComponent(v.trim());
  });
  req.cookies = cookies;
  next();
});

function isAuthed(req) {
  return req.cookies && req.cookies.canopy_admin === '1';
}

// SQLite setup
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const dbPath = path.join(dataDir, 'canopy.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      form_type TEXT NOT NULL,          -- project | feature | contributor
      name TEXT,
      email TEXT,
      payload TEXT NOT NULL,            -- full JSON body
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

function saveSubmission(formType, baseFields, fullBody, res) {
  const stmt = db.prepare(
    'INSERT INTO submissions (form_type, name, email, payload) VALUES (?, ?, ?, ?)'
  );

  stmt.run(
    formType,
    baseFields.name || null,
    baseFields.email || null,
    JSON.stringify(fullBody),
    function (err) {
      if (err) {
        console.error('DB insert error:', err);
        return res.status(500).json({ ok: false, error: 'db_error' });
      }
      return res.json({ ok: true, id: this.lastID });
    }
  );
}

// ===== API: submissions =====

// Submit a project
app.post('/api/submit/project', (req, res) => {
  const body = req.body;
  const name = body.name || '';
  const email = body.email || '';
  saveSubmission('project', { name, email }, body, res);
});

// Request a feature
app.post('/api/submit/feature', (req, res) => {
  const body = req.body;
  const name = body.name || '';
  const email = body.email || '';
  saveSubmission('feature', { name, email }, body, res);
});

// Join as contributor
app.post('/api/submit/contributor', (req, res) => {
  const body = req.body;
  const name = body.name || '';
  const email = body.email || '';
  saveSubmission('contributor', { name, email }, body, res);
});

// ===== Admin APIs =====

// Protect admin APIs with simple cookie auth
app.use('/api/admin', (req, res, next) => {
  if (isAuthed(req)) return next();
  return res.status(401).json({ ok: false, error: 'unauthorized' });
});

// List all submissions
app.get('/api/admin/submissions', (req, res) => {
  db.all(
    'SELECT id, form_type, name, email, created_at, payload FROM submissions ORDER BY created_at DESC',
    (err, rows) => {
      if (err) {
        console.error('DB query error:', err);
        return res.status(500).json({ ok: false, error: 'db_error' });
      }
      res.json({ ok: true, items: rows });
    }
  );
});

// Delete a submission
app.delete('/api/admin/submissions/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  db.run('DELETE FROM submissions WHERE id = ?', id, function (err) {
    if (err) {
      console.error('DB delete error:', err);
      return res.status(500).json({ ok: false, error: 'db_error' });
    }
    res.json({ ok: true, deleted: this.changes });
  });
});

// Admin HTML page (protected)
app.get('/admin', (req, res) => {
  if (!isAuthed(req)) {
    return res.redirect('/admin-login');
  }
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Login routes
app.get('/admin-login', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>CANOPY Admin Login</title>
  <style>
    body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center; font-family:system-ui,-apple-system,BlinkMacSystemFont,sans-serif; background:#050816; color:#f5f5f5; }
    .box { background:#111827; padding:2rem; border-radius:12px; width:100%; max-width:360px; box-shadow:0 18px 45px rgba(15,23,42,0.65); }
    h1 { margin:0 0 1rem; font-size:1.4rem; }
    label { display:block; font-size:0.85rem; margin-bottom:0.25rem; }
    input { width:100%; padding:0.5rem 0.6rem; margin-bottom:0.75rem; border-radius:6px; border:1px solid #374151; background:#020617; color:#f5f5f5; }
    button { width:100%; padding:0.55rem; border-radius:6px; border:none; background:#16a34a; color:#f5f5f5; font-weight:600; cursor:pointer; }
    button:hover { background:#22c55e; }
    .error { color:#fecaca; font-size:0.8rem; margin-bottom:0.5rem; }
  </style>
</head>
<body>
  <div class="box">
    <h1>CANOPY Admin</h1>
    <form method="post" action="/admin-login">
      <div class="error">${req.query.error === '1' ? 'Incorrect username or password.' : ''}</div>
      <label for="user">Username</label>
      <input id="user" name="user" autocomplete="username" />
      <label for="pass">Password</label>
      <input id="pass" type="password" name="pass" autocomplete="current-password" />
      <button type="submit">Sign in</button>
    </form>
  </div>
</body>
</html>
  `);
});

app.post('/admin-login', (req, res) => {
  const { user, pass } = req.body;
  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    res.setHeader(
      'Set-Cookie',
      'canopy_admin=1; HttpOnly; Path=/; SameSite=Lax'
    );
    return res.redirect('/admin');
  }
  return res.redirect('/admin-login?error=1');
});

// Start server
app.listen(PORT, () => {
  console.log(`CANOPY server running at http://localhost:${PORT}`);
});

