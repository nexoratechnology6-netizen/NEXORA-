const nodemailer = require('nodemailer');
function configured() { return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.INQUIRY_TO); }
async function sendInquiry(type, data, id) {
  if (!configured()) { console.warn(`[email-not-configured] inquiry=${id} type=${type}`); return false; }
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
  const safe = s => String(s || '').replace(/[<>]/g, '');
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: process.env.INQUIRY_TO,
    replyTo: data.email,
    subject: `NEXORA ${type === 'quote' ? 'Quote Request' : 'Contact Inquiry'} #${id}`,
    text: [
      `Inquiry ID: ${id}`, `Type: ${type}`, `Name: ${safe(data.name)}`, `Email: ${safe(data.email)}`,
      `Company: ${safe(data.company)}`, `Phone: ${safe(data.phone)}`, `Service: ${safe(data.service)}`,
      `Budget: ${safe(data.budget)}`, `Timeline: ${safe(data.timeline)}`, '', 'Message:', data.message
    ].join('\n')
  });
  return true;
}
module.exports = { sendInquiry };
