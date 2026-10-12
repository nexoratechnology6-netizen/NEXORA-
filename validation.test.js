const test = require('node:test');
const assert = require('node:assert/strict');
const { validateInquiry } = require('../lib/validation');
test('valid contact inquiry passes validation', () => {
 const r=validateInquiry({name:'Ada Example',email:'ada@example.com',message:'I would like to discuss a new website.'},'contact');
 assert.equal(r.errors.length,0); assert.equal(r.data.email,'ada@example.com');
});
test('invalid email and short message are rejected', () => {
 const r=validateInquiry({name:'A',email:'not-an-email',message:'Hi'},'contact');
 assert.ok(r.errors.length>=3);
});
test('quote inquiry requires service', () => {
 const r=validateInquiry({name:'Ada Example',email:'ada@example.com',message:'Please share project pricing details.'},'quote');
 assert.ok(r.errors.some(e=>e.includes('select a service')));
});
