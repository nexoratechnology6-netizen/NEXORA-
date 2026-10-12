const express = require('express');
const { run } = require('../database/db');
const { validateInquiry } = require('../lib/validation');
const { sendInquiry } = require('../lib/mailer');
const router = express.Router();
router.post('/', async (req, res, next) => {
  try {
    const { data, errors } = validateInquiry(req.body, 'quote');
    if (errors.length) return res.status(400).json({ error: errors[0], errors });
    const result = await run(`INSERT INTO inquiries(type,name,email,company,phone,service,budget,timeline,message) VALUES('quote',?,?,?,?,?,?,?,?)`,
      [data.name, data.email, data.company, data.phone, data.service, data.budget, data.timeline, data.message]);
    try { await sendInquiry('quote', data, result.id); }
    catch (e) { console.error(`[email-failure] inquiry=${result.id} reason=${e.message}`); }
    res.status(201).json({ message: 'Your quote request has been received. We will review your requirements and contact you.', id: result.id });
  } catch (e) { next(e); }
});
module.exports = router;
