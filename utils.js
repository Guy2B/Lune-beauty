import { applyI18n } from './i18n.js';
function openPricing(id){ const t=document.getElementById(id); if(!t) return; document.querySelectorAll('#pricing details').forEach(d=>{ if(d!==t) d.removeAttribute('open'); }); t.setAttribute('open',''); document.getElementById('pricing')?.scrollIntoView({behavior:'smooth',block:'start'}); }
function handleCardClick(e){ const id=e.currentTarget.getAttribute('data-target'); if(id){ openPricing(id); history.replaceState(null,'',`#pricing=${id}`); } }
function wireCards(){ document.querySelectorAll('.service-card').forEach(c=>{ c.addEventListener('click', handleCardClick); c.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); handleCardClick({currentTarget:c}); } }); }); }
function applyDeepLink(){ const m=location.hash.match(/#pricing=([^&]+)/); if(m && m[1]){ openPricing(m[1]); } }
document.addEventListener('DOMContentLoaded',()=>{ applyI18n(); wireCards(); applyDeepLink(); window.addEventListener('hashchange',applyDeepLink); });
