(() => {
const navItems=[['Home','index.html'],['About','about.html'],['Services','services.html'],['Portfolio','portfolio.html'],['Our Process','process.html'],['FAQ','faq.html'],['Contact','contact.html']];
const path=location.pathname.split('/').pop()||'index.html';

// VIP Professional High-Tech SVG Logo Vector
const vipLogo = `<div class="d-inline-flex align-items-center justify-content-center me-2 position-relative" style="width: 38px; height: 38px; background: linear-gradient(135deg, #0d6efd 0%, #00d2ff 100%); border-radius: 10px; box-shadow: 0 4px 15px rgba(13, 110, 253, 0.35);">
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 19V5L13.5 14.5L18 5V19" stroke="#ffffff" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="18" cy="18" r="1.8" fill="#ffffff"/>
  </svg>
</div>`;

const nav=`<nav class="navbar navbar-expand-lg sticky-top shadow-lg" style="background: rgba(11, 15, 25, 0.92); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding: 12px 0;"><div class="container"><a class="navbar-brand d-flex align-items-center text-white text-decoration-none" href="/">${vipLogo}<div class="d-flex flex-column ms-1"><span class="text-white fw-bold lh-1" style="font-size: 1.15rem; letter-spacing: 1.2px; font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;">NEXORA</span><span class="text-white-50 fw-semibold lh-1 mt-1" style="font-size: 0.62rem; letter-spacing: 2px;">TECHNOLOGY</span></div></a><button class="navbar-toggler border-0 navbar-dark" type="button" data-bs-toggle="collapse" data-bs-target="#siteNav" aria-controls="siteNav" aria-expanded="false" aria-label="Toggle navigation"><span class="navbar-toggler-icon"></span></button><div class="collapse navbar-collapse" id="siteNav"><ul class="navbar-nav ms-auto align-items-lg-center gap-1">${navItems.map(([name,url])=>`<li class="nav-item"><a class="nav-link ${path===url?'active fw-bold text-white':'text-white-50'}" ${path===url?'aria-current="page"':''} href="/${url}">${name}</a></li>`).join('')}<li class="nav-item ms-lg-3"><a class="btn btn-primary btn-sm px-3 rounded-pill fw-medium shadow-sm" style="background: linear-gradient(135deg, #0d6efd, #0b5ed7); border: none;" href="/quote.html">Get a Quote</a></li></ul></div></div></nav>`;

const footer=`<footer class="footer py-5" style="background-color: #080b12; color: #a0aec0;"><div class="container"><div class="row g-4"><div class="col-lg-4"><a class="navbar-brand d-inline-flex align-items-center mb-3 text-white text-decoration-none" href="/">${vipLogo}<div class="d-flex flex-column ms-1"><span class="text-white fw-bold lh-1" style="font-size: 1.15rem; letter-spacing: 1.2px;">NEXORA</span><span class="text-white-50 fw-semibold lh-1 mt-1" style="font-size: 0.62rem; letter-spacing: 2px;">TECHNOLOGY</span></div></a><p class="muted">Practical IT and digital solutions designed to help businesses move forward with clarity and confidence.</p><a href="mailto:nexoratechnology6@gmail.com" class="text-white-50 text-decoration-none">nexoratechnology6@gmail.com</a></div><div class="col-6 col-lg-2"><div class="footer-title mb-3 text-white fw-semibold">Explore</div><div class="d-grid gap-2"><a href="/about.html" class="text-white-50 text-decoration-none">About Us</a><a href="/services.html" class="text-white-50 text-decoration-none">Services</a><a href="/portfolio.html" class="text-white-50 text-decoration-none">Portfolio</a><a href="/process.html" class="text-white-50 text-decoration-none">Our Process</a></div></div><div class="col-6 col-lg-2"><div class="footer-title mb-3 text-white fw-semibold">Resources</div><div class="d-grid gap-2"><a href="/faq.html" class="text-white-50 text-decoration-none">FAQs</a><a href="/contact.html" class="text-white-50 text-decoration-none">Contact</a><a href="/privacy.html" class="text-white-50 text-decoration-none">Privacy Policy</a><a href="/terms.html" class="text-white-50 text-decoration-none">Terms of Service</a></div></div><div class="col-lg-4"><div class="footer-title mb-3 text-white fw-semibold">Have a project in mind?</div><p class="muted">Tell us what you want to build. We’ll help you identify a practical next step.</p><a class="btn btn-outline-light btn-sm rounded-pill px-3" href="/quote.html">Discuss your project</a></div></div><hr class="my-4 border-secondary opacity-25"><div class="d-flex flex-column flex-md-row justify-content-between gap-2 small muted"><span>© <span id="year"></span> NEXORA TECHNOLOGY. All rights reserved.</span><span>Built with clarity, care and purpose.</span></div></div></footer>`;

document.querySelectorAll('[data-site-nav]').forEach(el=>el.innerHTML=nav);
document.querySelectorAll('[data-site-footer]').forEach(el=>el.innerHTML=footer);
document.querySelectorAll('#year').forEach(el=>el.textContent=new Date().getFullYear());
document.querySelectorAll('[data-current-year]').forEach(el=>el.textContent=new Date().getFullYear());
const params=new URLSearchParams(location.search);
const service=params.get('service');
const serviceSelect=document.querySelector('select[name="service"]');
if(service && serviceSelect) serviceSelect.value=service;
document.querySelectorAll('form[data-api-form]').forEach(form=>{
form.addEventListener('submit',async e=>{
e.preventDefault();const status=form.querySelector('.status-message');const submit=form.querySelector('[type="submit"]');
if(!form.reportValidity())return;
const original=submit.textContent;submit.disabled=true;submit.textContent='Sending…';
status.className='status-message';status.textContent='';
try{
const response=await fetch(form.dataset.apiForm,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(form).entries()))});
const result=await response.json();if(!response.ok)throw new Error(result.error||'Please check your details and try again.');
status.textContent=result.message;status.classList.add('show','success');form.reset();
}catch(err){status.textContent=err.message||'Could not send your request. Please try again.';status.classList.add('show','error');}
finally{submit.disabled=false;submit.textContent=original;}
});
});
})();