import { applyI18n } from './i18n.js';
document.addEventListener('DOMContentLoaded',()=>{
  applyI18n();
  const cards=document.querySelectorAll('.service-card');
  const accs=document.querySelectorAll('#pricing details');
  function openPricing(id){ const t=document.getElementById(id); if(!t) return; accs.forEach(d=>{ if(d!==t) d.removeAttribute('open'); }); t.setAttribute('open',''); t.scrollIntoView({behavior:'smooth',block:'start'}); }
  cards.forEach(c=>c.addEventListener('click',()=>openPricing(c.dataset.target)));
});
