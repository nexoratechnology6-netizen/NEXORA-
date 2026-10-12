const express = require('express');
const { run } = require('../database/db');
const { validateInquiry } = require('../lib/validation');
const { sendInquiry } = require('../lib/mailer');
const router = express.Router();
router.post('/', async (req, res, next) => {
  try {
    const { data, errors } = validateInquiry(req.body, 'contact');
    if (errors.length) return res.status(400).json({ error: errors[0], errors });
    const result = await run(`INSERT INTO inquiries(type,name,email,company,phone,service,message) VALUES('contact',?,?,?,?,?,?)`,
      [data.name, data.email, data.company, data.phone, data.service, data.message]);
    try { await sendInquiry('contact', data, result.id); }
    catch (e) { console.error(`[email-failure] inquiry=${result.id} reason=${e.message}`); }
    res.status(201).json({ message: 'Your inquiry has been received. We will be in touch soon.', id: result.id });
  } catch (e) { next(e); }
});
module.exports = router;
