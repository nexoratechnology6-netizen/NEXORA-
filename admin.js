const express = require('express');
const { requireAdmin } = require('../middleware/auth');
const { all, get, run } = require('../database/db');
const { clean } = require('../lib/validation');
const router = express.Router();
router.use(requireAdmin);
router.get('/stats', async (_req, res, next) => {
  try {
    const total = await get('SELECT COUNT(*) n FROM inquiries');
    const pending = await get("SELECT COUNT(*) n FROM inquiries WHERE status='New'");
    const contacts = await get("SELECT COUNT(*) n FROM inquiries WHERE type='contact'");
    const quotes = await get("SELECT COUNT(*) n FROM inquiries WHERE type='quote'");
    res.json({ total: total.n, pending: pending.n, contacts: contacts.n, quotes: quotes.n });
  } catch(e) { next(e); }
});
router.get('/inquiries', async (req, res, next) => {
  try {
    const search = `%${clean(req.query.search).slice(0,100)}%`;
    const type = ['contact','quote'].includes(req.query.type) ? req.query.type : null;
    const status = ['New','In Progress','Completed'].includes(req.query.status) ? req.query.status : null;
    const rows = await all(`SELECT id,type,name,email,company,service,status,created_at FROM inquiries
      WHERE (name LIKE ? OR email LIKE ? OR company LIKE ? OR service LIKE ?)
      AND (? IS NULL OR type=?) AND (? IS NULL OR status=?)
      ORDER BY id DESC LIMIT 200`, [search,search,search,search,type,type,status,status]);
    res.json({ inquiries: rows });
  } catch(e) { next(e); }
});
router.get('/inquiries/:id', async (req, res, next) => {
  try {
    const row = await get('SELECT * FROM inquiries WHERE id=?', [Number(req.params.id)]);
    if (!row) return res.status(404).json({ error: 'Inquiry not found.' });
    res.json({ inquiry: row });
  } catch(e) { next(e); }
});
router.patch('/inquiries/:id/status', async (req, res, next) => {
  try {
    const status = clean(req.body.status);
    if (!['New','In Progress','Completed'].includes(status)) return res.status(400).json({ error: 'Invalid status.' });
    const result = await run('UPDATE inquiries SET status=? WHERE id=?', [status, Number(req.params.id)]);
    if (!result.changes) return res.status(404).json({ error: 'Inquiry not found.' });
    res.json({ message: 'Status updated.' });
  } catch(e) { next(e); }
});
router.delete('/inquiries/:id', async (req, res, next) => {
  try {
    const result = await run('DELETE FROM inquiries WHERE id=?', [Number(req.params.id)]);
    if (!result.changes) return res.status(404).json({ error: 'Inquiry not found.' });
    res.json({ message: 'Inquiry deleted.' });
  } catch(e) { next(e); }
});
router.get('/services', async (_req, res, next) => {
  try { res.json({ services: await all('SELECT * FROM services ORDER BY id') }); } catch(e) { next(e); }
});
router.post('/services', async (req, res, next) => {
  try {
    const title=clean(req.body.title), slug=clean(req.body.slug).toLowerCase().replace(/[^a-z0-9-]/g,'-'), summary=clean(req.body.summary), details=clean(req.body.details);
    if (title.length<2 || title.length>100 || !slug || summary.length<5 || summary.length>300 || details.length<5 || details.length>3000)
      return res.status(400).json({error:'Provide a valid title, slug, summary and details.'});
    const r=await run('INSERT INTO services(title,slug,summary,details) VALUES(?,?,?,?)',[title,slug,summary,details]);
    res.status(201).json({id:r.id});
  } catch(e) { if (e.code==='SQLITE_CONSTRAINT') return res.status(409).json({error:'That service slug already exists.'}); next(e); }
});
router.patch('/services/:id', async (req,res,next)=>{
  try {
    const active = req.body.active === false || req.body.active === 0 ? 0 : 1;
    const r=await run('UPDATE services SET active=? WHERE id=?',[active,Number(req.params.id)]);
    if(!r.changes) return res.status(404).json({error:'Service not found.'});
    res.json({message:'Service updated.'});
  } catch(e){next(e);}
});
router.delete('/services/:id', async (req,res,next)=>{
  try {const r=await run('DELETE FROM services WHERE id=?',[Number(req.params.id)]); if(!r.changes)return res.status(404).json({error:'Service not found.'});res.json({message:'Service deleted.'});}
  catch(e){next(e);}
});
router.get('/projects', async (_req,res,next)=>{try{res.json({projects:await all('SELECT * FROM projects ORDER BY id DESC')});}catch(e){next(e);}});
router.post('/projects', async (req,res,next)=>{
  try{
    const title=clean(req.body.title), slug=clean(req.body.slug).toLowerCase().replace(/[^a-z0-9-]/g,'-'), category=clean(req.body.category), summary=clean(req.body.summary), technologies=clean(req.body.technologies);
    if(title.length<2||title.length>120||!slug||category.length<2||summary.length<5||summary.length>1000||technologies.length>300)return res.status(400).json({error:'Provide valid project details.'});
    const r=await run('INSERT INTO projects(title,slug,category,summary,technologies,sample) VALUES(?,?,?,?,?,0)',[title,slug,category,summary,technologies]);
    res.status(201).json({id:r.id});
  }catch(e){if(e.code==='SQLITE_CONSTRAINT')return res.status(409).json({error:'That project slug already exists.'});next(e);}
});
router.patch('/projects/:id',async(req,res,next)=>{try{const active=req.body.active===false||req.body.active===0?0:1;const r=await run('UPDATE projects SET active=? WHERE id=?',[active,Number(req.params.id)]);if(!r.changes)return res.status(404).json({error:'Project not found.'});res.json({message:'Project updated.'});}catch(e){next(e);}});
router.delete('/projects/:id',async(req,res,next)=>{try{const r=await run('DELETE FROM projects WHERE id=?',[Number(req.params.id)]);if(!r.changes)return res.status(404).json({error:'Project not found.'});res.json({message:'Project deleted.'});}catch(e){next(e);}});
module.exports = router;
