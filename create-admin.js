require('dotenv').config();
const readline = require('readline');
const bcrypt = require('bcryptjs');
const { initDb, get, run } = require('../database/db');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = q => new Promise(resolve => rl.question(q, resolve));
(async () => {
  try {
    await initDb();
    const email = String(await ask('Admin email: ')).trim().toLowerCase();
    const password = await ask('New admin password (minimum 12 characters): ');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 12 || password.length > 200) {
      throw new Error('Use a valid email and a password between 12 and 200 characters.');
    }
    const exists = await get('SELECT id FROM admins WHERE email=?', [email]);
    if (exists) throw new Error('That admin email already exists. Ask an existing administrator to manage access.');
    const hash = await bcrypt.hash(password, 12);
    await run('INSERT INTO admins(email,password_hash) VALUES(?,?)', [email, hash]);
    console.log('Admin account created. Keep the password manager-stored and private.');
  } catch (e) { console.error(e.message); process.exitCode = 1; }
  finally { rl.close(); }
})();
