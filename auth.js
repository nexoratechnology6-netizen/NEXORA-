const express = require('express');
const bcrypt = require('bcryptjs');
const { get } = require('../database/db');
const router = express.Router();
router.get('/me', (req, res) => res.json({ authenticated: Boolean(req.session?.adminId), email: req.session?.adminEmail || null }));
router.post('/login', async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (email.length > 254 || password.length > 200 || !email || !password)
      return res.status(400).json({ error: 'Enter your admin email and password.' });
    const admin = await get('SELECT id,email,password_hash FROM admins WHERE email = ?', [email]);
    if (!admin || !(await bcrypt.compare(password, admin.password_hash)))
      return res.status(401).json({ error: 'Invalid email or password.' });
    await new Promise((resolve, reject) => req.session.regenerate(err => err ? reject(err) : resolve()));
    req.session.adminId = admin.id; req.session.adminEmail = admin.email;
    res.json({ message: 'Signed in successfully.', email: admin.email });
  } catch (e) { next(e); }
});
router.post('/logout', (req, res, next) => {
  req.session.destroy(err => {
    if (err) return next(err);
    res.clearCookie('nexora.sid', { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' });
    res.json({ message: 'Signed out.' });
  });
});
module.exports = router;
