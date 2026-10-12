const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const clean = value => String(value ?? '').replace(/[\u0000-\u001F\u007F]/g, ' ').trim();
function validateInquiry(body, type) {
  const data = {
    name: clean(body.name), email: clean(body.email).toLowerCase(),
    company: clean(body.company), phone: clean(body.phone), service: clean(body.service),
    budget: clean(body.budget), timeline: clean(body.timeline), message: clean(body.message)
  };
  const errors = [];
  if (data.name.length < 2 || data.name.length > 100) errors.push('Name must be between 2 and 100 characters.');
  if (!EMAIL.test(data.email) || data.email.length > 254) errors.push('Enter a valid email address.');
  if (data.company.length > 120 || data.phone.length > 40) errors.push('Company or phone field is too long.');
  if (data.service.length > 100 || data.budget.length > 80 || data.timeline.length > 80) errors.push('One of the project fields is too long.');
  if (data.message.length < 10 || data.message.length > 5000) errors.push('Message must be between 10 and 5000 characters.');
  if (type === 'quote' && !data.service) errors.push('Please select a service.');
  return { data, errors };
}
module.exports = { validateInquiry, clean, EMAIL };
