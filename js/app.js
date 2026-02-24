import { analyze, gauge, summarize, buildPromptV2 } from './analysis.js';
import { applyI18n } from './i18n.js';

const els={video:document.getElementById('video'), btnStart:document.getElementById('btnStart'), btnFlip:document.getElementById('btnFlip'), btnCapture:document.getElementById('btnCapture'), fileInput:document.getElementById('fileInput'), btnUpload:document.getElementById('btnUpload'), gauge:document.getElementById('gauge'), summary:document.getElementById('summary'), toStep3:document.getElementById('toStep3'), btnSave:document.getElementById('btnSave')};
let stream=null; let facing='user'; let captured=null; let metrics=null;

function isSecure(){ return location.protocol==='https:' || location.hostname==='localhost' || location.hostname==='127.0.0.1'; }

async function startCamera(){ try{ if(!isSecure()){ alert("Bitte HTTPS oder 'localhost' verwenden – Kamera wird sonst blockiert."); return; } if(stream){ stream.getTracks().forEach(t=>t.stop()); } const constraints={ video:{ facingMode:{ ideal:facing }, width:{ideal:1280}, height:{ideal:720} }, audio:false }; stream=await navigator.mediaDevices.getUserMedia(constraints); els.video.setAttribute('playsinline','true'); els.video.muted=true; els.video.autoplay=true; els.video.srcObject=stream; try{ await els.video.play(); }catch(e){} els.btnFlip.style.display='inline-block'; }catch(e){ alert('Kamera konnte nicht gestartet werden. Zugriff erlauben oder anderes Gerät versuchen.'); console.error(e); } }

function ready(){ return els.video.videoWidth>0 && els.video.videoHeight>0; }

async function capture(){ if(!ready()){ await new Promise(r=>setTimeout(r,140)); if(!ready()){ alert('Kamera noch nicht bereit. Bitte erneut versuchen.'); return; } } const c=document.createElement('canvas'); c.width=els.video.videoWidth; c.height=els.video.videoHeight; c.getContext('2d').drawImage(els.video,0,0); const img=new Image(); img.src=c.toDataURL('image/png'); await new Promise(r=>img.onload=r); return img; }

function goto(step){ ['step1','step2','step3'].forEach(id=>document.getElementById(id).classList.remove('active')); document.getElementById(step).classList.add('active'); }

els.btnStart?.addEventListener('click', startCamera);
els.btnFlip?.addEventListener('click', ()=>{ facing=(facing==='user'?'environment':'user'); startCamera(); });
els.btnUpload?.addEventListener('click', ()=> els.fileInput?.click());
els.fileInput?.addEventListener('change', async (e)=>{ const file=e.target.files?.[0]; if(!file) return; const fr=new FileReader(); fr.onload=()=>{ const img=new Image(); img.onload=async()=>{ captured=img; metrics=await analyze(captured); gauge(els.gauge, metrics.score); els.summary.textContent=summarize(metrics); goto('step2'); }; img.src=fr.result; }; fr.readAsDataURL(file); });

els.btnCapture?.addEventListener('click', async ()=>{ captured=await capture(); if(!captured) return; try{ stream?.getTracks().forEach(t=>t.stop()); }catch(_){} metrics = await analyze(captured); gauge(els.gauge, metrics.score); els.summary.textContent=summarize(metrics); goto('step2'); });
els.toStep3?.addEventListener('click', ()=> goto('step3'));

function pick(id){ return [...document.querySelectorAll(`#${id} .tag.active`)].map(t=>t.textContent.trim()); }

els.btnSave?.addEventListener('click', ()=>{
  if(!captured){ alert('Bitte zuerst ein Foto aufnehmen oder hochladen.'); return; }
  const plan=(document.querySelector('input[name="planSelect"]:checked')||{}).value||'';
  const name=(document.getElementById('p_name')||{}).value||'';
  const email=(document.getElementById('p_email')||{}).value||'';
  const age=(document.getElementById('p_age')||{}).value||'';
  const gender=(document.getElementById('p_gender')||{}).value||'';
  const notes=(document.getElementById('p_notes')||{}).value||'';
  const user={plan,name,email,age,gender,notes, allergies:pick('allergyTags'), priorities:pick('prioTags'), routine:pick('routineTags')};
  const prompt=buildPromptV2(user, metrics||{});
  const id=(crypto?.randomUUID?.()||('id-'+Date.now()));
  const record={id,timestamp:new Date().toISOString(), image:captured.src, user, metrics, prompt};
  const rows=JSON.parse(localStorage.getItem('lune_records')||'[]');
  rows.unshift(record); localStorage.setItem('lune_records', JSON.stringify(rows));
  alert('Gespeichert. Eintrag im Dashboard sichtbar.');
  goto('step1');
});

applyI18n();
