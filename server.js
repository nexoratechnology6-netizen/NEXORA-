require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { initDb } = require('./database/db');
const contactRoutes = require('./routes/contact');
const quoteRoutes = require('./routes/quotes');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const { requireAdmin } = require('./middleware/auth');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const isProd = process.env.NODE_ENV === 'production';
if (isProd && (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32)) {
  console.error('[startup-error] Production requires SESSION_SECRET with at least 32 characters.');
  process.exit(1);
}
if (process.env.TRUST_PROXY === 'true') app.set('trust proxy', 1);

app.disable('x-powered-by');
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdn.jsdelivr.net", "data:"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: isProd ? [] : null
    }
  }
}));
app.use(express.json({ limit: '30kb' }));
app.use(express.urlencoded({ extended: false, limit: '30kb' }));
app.use(session({
  name: 'nexora.sid',
  store: new SQLiteStore({ db: 'sessions.sqlite', dir: path.join(__dirname, 'database') }),
  secret: process.env.SESSION_SECRET || 'development-only-change-this-secret-before-deployment',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'strict', secure: isProd, maxAge: 1000 * 60 * 60 * 4 }
}));

const formLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 8, standardHeaders: 'draft-7', legacyHeaders: false,
  message: { error: 'Too many requests. Please try again in a little while.' } });
app.use('/api/contact', formLimiter);
app.use('/api/quotes', formLimiter);
app.use('/api/auth/login', rateLimit({ windowMs: 15 * 60 * 1000, limit: 8, standardHeaders: 'draft-7', legacyHeaders: false,
  message: { error: 'Too many login attempts. Please wait and try again.' } }));

app.use('/api/contact', contactRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'], maxAge: isProd ? '1h' : 0 }));
app.get('/admin/dashboard.html', requireAdmin, (_req, res) => res.sendFile(path.join(__dirname, 'admin', 'dashboard.html')));
app.use('/admin', express.static(path.join(__dirname, 'admin'), { extensions: ['html'], index: false, maxAge: 0 }));
app.get('/admin', (_req, res) => res.redirect('/admin/login.html'));
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'API endpoint not found.' });
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});
app.use((err, _req, res, _next) => {
  console.error('[request-error]', err && err.message ? err.message : 'Unknown error');
  if (res.headersSent) return;
  res.status(500).json({ error: 'An unexpected server error occurred. Please try again.' });
});

initDb().then(() => {
  const server = app.listen(PORT, () => console.log(`NEXORA TECHNOLOGY running at http://localhost:${PORT}`));
  const shutdown = () => server.close(() => process.exit(0));
  process.on('SIGINT', shutdown); process.on('SIGTERM', shutdown);
}).catch(err => { console.error('[startup-error]', err.message); process.exit(1); });

module.exports = app;
