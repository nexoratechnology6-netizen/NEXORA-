const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const dbPath = path.resolve(process.env.DATABASE_FILE || path.join(__dirname, 'nexora.sqlite'));
fs.mkdirSync(path.dirname(dbPath), { recursive: true });
const db = new sqlite3.Database(dbPath);
db.serialize(() => db.run('PRAGMA foreign_keys = ON'));
function run(sql, params = []) {
  return new Promise((resolve, reject) => db.run(sql, params, function (err) {
    if (err) return reject(err); resolve({ id: this.lastID, changes: this.changes });
  }));
}
function get(sql, params = []) { return new Promise((resolve, reject) => db.get(sql, params, (e, row) => e ? reject(e) : resolve(row))); }
function all(sql, params = []) { return new Promise((resolve, reject) => db.all(sql, params, (e, rows) => e ? reject(e) : resolve(rows))); }
async function initDb() {
  await run(`CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
  await run(`CREATE TABLE IF NOT EXISTS inquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT, type TEXT NOT NULL CHECK(type IN ('contact','quote')),
    name TEXT NOT NULL, email TEXT NOT NULL, company TEXT, phone TEXT, service TEXT, budget TEXT,
    timeline TEXT, message TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'New'
      CHECK(status IN ('New','In Progress','Completed')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
  await run(`CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, slug TEXT NOT NULL UNIQUE,
    summary TEXT NOT NULL, details TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1)`);
  await run(`CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, slug TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL, summary TEXT NOT NULL, technologies TEXT NOT NULL,
    sample INTEGER NOT NULL DEFAULT 1, active INTEGER NOT NULL DEFAULT 1)`);
  const services = [
    ['Web Development','web-development','Fast, accessible websites built around your business goals.','Corporate websites, custom web applications, responsive interfaces, integrations and ongoing improvements.'],
    ['Mobile App Development','mobile-app-development','Thoughtful mobile experiences for customers and teams.','Product discovery, interface design, cross-platform app development, testing and release support.'],
    ['UI/UX Design','ui-ux-design','Clear, accessible interfaces that make complex tasks feel simple.','Research, user journeys, wireframes, interactive prototypes, visual systems and usability reviews.'],
    ['Cloud & IT Solutions','cloud-it-solutions','Practical technology foundations that support growth.','Cloud setup, system integration, workflow automation, technical consulting and maintenance planning.'],
    ['Digital Marketing','digital-marketing','Build a consistent digital presence and reach the right audience.','SEO foundations, content strategy, analytics setup and campaign planning tailored to your goals.'],
    ['E-commerce Solutions','ecommerce-solutions','Online stores designed for smooth product discovery and checkout.','Storefront design, catalog setup, payment-provider integration and operational workflows.']
  ];
  for (const s of services) await run('INSERT OR IGNORE INTO services(title,slug,summary,details) VALUES(?,?,?,?)', s);
  const projects = [
    ['Business Website Concept','business-website-concept','Web Development','A sample corporate website concept focused on clear navigation and lead generation.','HTML, CSS, Bootstrap, JavaScript',1],
    ['Online Store Concept','online-store-concept','E-commerce','A sample storefront concept with product categories and a streamlined shopping journey.','HTML, CSS, JavaScript, Node.js',1],
    ['Service Dashboard Concept','service-dashboard-concept','UI/UX Design','A sample dashboard concept emphasizing useful information hierarchy and responsive layouts.','UI/UX, Bootstrap, JavaScript',1]
  ];
  for (const p of projects) await run('INSERT OR IGNORE INTO projects(title,slug,category,summary,technologies,sample) VALUES(?,?,?,?,?,?)', p);
}
module.exports = { db, run, get, all, initDb };
