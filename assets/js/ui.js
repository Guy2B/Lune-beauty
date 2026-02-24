import { applyI18n } from './i18n.js';

function openPricing(targetId){
  const details=document.getElementById(targetId);
  if(!details) return;
  // close others
  document.querySelectorAll('#pricing details').forEach(d=>{ if(d!==details) d.removeAttribute('open'); });
  details.setAttribute('open','');
  details.scrollIntoView({behavior:'smooth', block:'start'});
}

// service card click
Array.from(document.querySelectorAll('.service-card')).forEach(card=>{
  card.addEventListener('click',()=>{ openPricing(card.dataset.target); });
});

// ensure i18n after dynamic
applyI18n();
