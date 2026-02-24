import { toCSV } from './utils.js';
import { applyI18n } from './i18n.js';
const rows=JSON.parse(localStorage.getItem('lune_records')||'[]');
const cards=document.getElementById('cards');

function esc(s){ return String(s??''); }
function fmtList(a){ return (a&&a.length)? a.join(', ') : '-'; }
function fmtDate(iso){ try{ return new Date(iso).toLocaleString(); }catch(_){ return iso||'-'; } }

function render(){ if(!cards) return; cards.innerHTML='';
  rows.forEach(r=>{
    const {id,timestamp,image,user,metrics,prompt}=r;
    const art=document.createElement('article'); art.className='card';
    art.innerHTML=`
      <div class=\"card-media\">${image?`<img src=\"${esc(image)}\" alt=\"client\"/>`:''}</div>
      <div class=\"card-body\">
        <h3>${esc(user?.name||'–')} <small>(${esc(user?.plan||'–')})</small></h3>
        <p class=\"muted\">${esc(user?.email||'–')} • ${esc(user?.gender||'–')} • ${esc(user?.age||'–')} Jahre</p>
        <p class=\"muted\">Gespeichert: ${fmtDate(timestamp)}</p>
        <details class=\"blk\"><summary>Analyse‑Metriken</summary>
          <ul class=\"kv\">
            <li><b>Score</b><span>${metrics?.score ?? '-'}</span></li>
            <li><b>Texture</b><span>${(metrics?.texture??0).toFixed(2)}</span></li>
            <li><b>Redness</b><span>${(metrics?.redIdx??0).toFixed(2)}</span></li>
            <li><b>Oil</b><span>${(metrics?.oilBal??0).toFixed(2)}</span></li>
            <li><b>Pores</b><span>${(metrics?.poreProb??0).toFixed(2)}</span></li>
            <li><b>Pigmentation</b><span>${(metrics?.pigment??0).toFixed(2)}</span></li>
          </ul>
        </details>
        <details class=\"blk\"><summary>Angaben & Routine</summary>
          <ul class=\"kv\">
            <li><b>Allergien</b><span>${fmtList(user?.allergies)}</span></li>
            <li><b>Priorität</b><span>${fmtList(user?.priorities)}</span></li>
            <li><b>Routine</b><span>${fmtList(user?.routine)}</span></li>
            <li class=\"notes\"><b>Notizen</b><span>${esc(user?.notes||'-')}</span></li>
          </ul>
        </details>
        <details class=\"blk\"><summary>Prompt</summary>
          <div class=\"prompt-wrap\">
            <textarea readonly>${esc(prompt)}</textarea>
            <button class=\"copy gold-btn\" data-id=\"${esc(id)}\">Copy</button>
          </div>
        </details>
        <div class=\"row-links\">
          <a href=\"index.html\">← Startseite</a>
          <a href=\"app.html\">Zur App</a>
        </div>
      </div>`;
    cards.appendChild(art);
  });
  // copy handlers
  cards.querySelectorAll('button.copy').forEach(btn=>{
    btn.addEventListener('click', e=>{
      const id=e.currentTarget.getAttribute('data-id');
      const rec=rows.find(x=>x.id===id); if(!rec) return;
      navigator.clipboard?.writeText(rec.prompt)
        .then(()=>{ e.currentTarget.textContent='Copied ✓'; setTimeout(()=>e.currentTarget.textContent='Copy',1200); })
        .catch(()=> alert('Copy fehlgeschlagen'));
    });
  });
}
render();

document.getElementById('export')?.addEventListener('click',()=>{
  const headers=['timestamp','name','email','plan','age','gender','allergies','priorities','routine','notes','score','texture','redness','oil','pores','pigment','prompt'];
  const flat=rows.map(r=>{ const u=r.user||{}, m=r.metrics||{}; return { timestamp:r.timestamp, name:u.name, email:u.email, plan:u.plan, age:u.age, gender:u.gender, allergies:(u.allergies||[]).join('|'), priorities:(u.priorities||[]).join('|'), routine:(u.routine||[]).join('|'), notes:u.notes||'', score:m.score, texture:m.texture, redness:m.redIdx, oil:m.oilBal, pores:m.poreProb, pigment:m.pigment, prompt:r.prompt }; });
  const csv=toCSV(flat, headers);
  const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'})); a.download='lune_records.csv'; a.click(); URL.revokeObjectURL(a.href);
});

applyI18n();
