import { toCSV } from './utils.js';
import { applyI18n } from './i18n.js';
const rows=JSON.parse(localStorage.getItem('lune_records')||'[]');
const tbody=document.querySelector('#tbl tbody');
function render(){ tbody.innerHTML=''; rows.forEach(r=>{ const tr=document.createElement('tr'); ['name','email','plan','timestamp','prompt'].forEach(k=>{ const td=document.createElement('td'); td.textContent=r[k]||''; tr.appendChild(td); }); tbody.appendChild(tr); }); }
render();

document.getElementById('export').addEventListener('click',()=>{ const headers=['name','email','plan','timestamp','prompt']; const csv=toCSV(rows,headers); const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'})); a.download='lune_records.csv'; a.click(); URL.revokeObjectURL(a.href); });
applyI18n();
