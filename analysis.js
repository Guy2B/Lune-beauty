import { analyze, gauge, summarize, buildPromptV2 } from './analysis.js';
import { applyI18n } from './i18n.js';

const els={video:document.getElementById('video'), btnStart:document.getElementById('btnStart'), btnFlip:document.getElementById('btnFlip'), btnCapture:document.getElementById('btnCapture'), fileInput:document.getElementById('fileInput'), btnUpload:document.getElementById('btnUpload'), gauge:document.getElementById('gauge'), summary:document.getElementById('summary')};
let stream=null; let facing='user'; let captured=null; let metrics=null;

function setCamStatus(msg){ const el=document.getElementById('camStatus'); if(el) el.textContent=msg||''; }
function isSecure(){ return location.protocol==='https:' || /^localhost|127\.0\.0\.1$/.test(location.hostname); }

async function startCamera(){ try{
  if(!isSecure()){ setCamStatus("Nicht sichere Adresse – bitte HTTPS oder localhost verwenden."); alert("Bitte HTTPS oder 'localhost' verwenden – Kamera wird sonst blockiert."); return; }
  if(stream){ try{ stream.getTracks().forEach(t=>t.stop()); }catch(_){} }
  setCamStatus('Kamera wird gestartet …');
  // Device-friendly constraints (Safari iOS tolerates auto HD better than strict ideals)
  const constraints={ video:{ facingMode:{ ideal:facing }, width:{ideal:1280}, height:{ideal:720} }, audio:false };
  // iOS hint: remove ideals if OverconstrainedError happens
  try{
    stream=await navigator.mediaDevices.getUserMedia(constraints);
  }catch(e){
    if(e.name==='OverconstrainedError' || e.name==='NotReadableError'){
      stream=await navigator.mediaDevices.getUserMedia({ video:true, audio:false });
    } else { throw e; }
  }
  els.video.setAttribute('playsinline','true'); els.video.muted=true; els.video.autoplay=true; els.video.srcObject=stream; 
  await els.video.play().catch(()=>{});
  els.btnFlip.style.display='inline-block';
  setCamStatus('Kamera aktiv.');
  // Enable capture when ready
  const enable=()=>{ if(els.video.videoWidth>0){ els.btnCapture.disabled=false; } else { setTimeout(enable,120); } }; enable();
}catch(e){ console.error(e); if(e.name==='NotAllowedError'){ setCamStatus('Zugriff verweigert – bitte Kamera erlauben (Browser/OS-Einstellungen).'); } else if(e.name==='NotFoundError'){ setCamStatus('Keine Kamera gefunden – anderes Gerät versuchen.'); } else if(e.name==='AbortError'){ setCamStatus('Kamera belegt – andere Apps schließen.'); } else { setCamStatus('Kamera konnte nicht gestartet werden.'); } alert('Kamera konnte nicht gestartet werden. Bitte Berechtigungen prüfen.'); }}

function goto(step){ ['step1','step2','step3'].forEach(id=>document.getElementById(id).classList.remove('active')); document.getElementById(step).classList.add('active'); }

function showLoader(on){ const el=document.getElementById('loader'); if(el) el.hidden=!on; }

function ready(){ return els.video.videoWidth>0 && els.video.videoHeight>0; }

async function capture(){ if(!ready()){ await new Promise(r=>setTimeout(r,140)); if(!ready()){ alert('Kamera noch nicht bereit. Bitte erneut versuchen.'); return; } } const c=document.createElement('canvas'); c.width=els.video.videoWidth; c.height=els.video.videoHeight; c.getContext('2d').drawImage(els.video,0,0); const img=new Image(); img.src=c.toDataURL('image/png'); await new Promise(r=>img.onload=r); return img; }

els.btnStart?.addEventListener('click', startCamera);
els.btnFlip?.addEventListener('click', ()=>{ facing=(facing==='user'?'environment':'user'); startCamera(); });
els.btnUpload?.addEventListener('click', ()=> els.fileInput?.click());
els.fileInput?.addEventListener('change', async (e)=>{ const file=e.target.files?.[0]; if(!file) return; const fr=new FileReader(); fr.onload=()=>{ const img=new Image(); img.onload=async()=>{ captured=img; goto('step2'); showLoader(true); metrics=await analyze(captured); showLoader(false); gauge(els.gauge, metrics.score); els.summary.textContent=summarize(metrics); }; img.src=fr.result; }; fr.readAsDataURL(file); });

els.btnCapture?.addEventListener('click', async ()=>{ captured=await capture(); if(!captured) return; try{ stream?.getTracks().forEach(t=>t.stop()); }catch(_){} goto('step2'); showLoader(true); metrics = await analyze(captured); showLoader(false); gauge(els.gauge, metrics.score); els.summary.textContent=summarize(metrics); });

// Step2 -> Step3
const next=document.getElementById('toStep3'); if(next){ next.addEventListener('click', ()=> goto('step3')); }

// Save Step3
function pick(id){ return [...document.querySelectorAll(`#${id} .tag.active`)].map(t=>t.textContent.trim()); }
const save=document.getElementById('btnSave'); if(save){ save.addEventListener('click', ()=>{ if(!captured){ alert('Bitte zuerst ein Foto aufnehmen oder hochladen.'); return; } const plan=(document.querySelector('input[name="planSelect"]:checked')||{}).value||''; const name=(document.getElementById('p_name')||{}).value||''; const email=(document.getElementById('p_email')||{}).value||''; const age=(document.getElementById('p_age')||{}).value||''; const gender=(document.getElementById('p_gender')||{}).value||''; const notes=(document.getElementById('p_notes')||{}).value||''; const user={plan,name,email,age,gender,notes, allergies:pick('allergyTags'), priorities:pick('prioTags'), routine:pick('routineTags')}; const prompt=buildPromptV2(user, metrics||{}); const id=(crypto?.randomUUID?.()||('id-'+Date.now())); const record={id,timestamp:new Date().toISOString(), image:captured.src, user, metrics, prompt}; const rows=JSON.parse(localStorage.getItem('lune_records')||'[]'); rows.unshift(record); localStorage.setItem('lune_records', JSON.stringify(rows)); alert('Gespeichert. Eintrag im Dashboard sichtbar.'); goto('step1'); }); }

applyI18n();
