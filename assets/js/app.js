import { analyze, gauge, summarize, buildPrompt } from './analysis.js';
import { applyI18n } from './i18n.js';

const els={video:document.getElementById('video'), btnStart:document.getElementById('btnStart'), btnFlip:document.getElementById('btnFlip'), btnCapture:document.getElementById('btnCapture'), gauge:document.getElementById('gauge'), summary:document.getElementById('summary'), toStep3:document.getElementById('toStep3'), name:document.getElementById('name'), email:document.getElementById('email'), prompt:document.getElementById('prompt'), submit:document.getElementById('submit')};
let stream=null; let facing='user'; let metrics=null;

function secureWarn(){ const isLocal=location.hostname==='localhost'||location.hostname==='127.0.0.1'; if(location.protocol!=='https:' && !isLocal){ alert('Bitte Seite über HTTPS oder localhost öffnen, damit die Kamera funktioniert.'); } }

async function startCamera(){ try{ if(stream){ stream.getTracks().forEach(t=>t.stop()); } const constraints={ video:{ facingMode:{ ideal:facing }, width:{ideal:1280}, height:{ideal:720} }, audio:false }; stream=await navigator.mediaDevices.getUserMedia(constraints); els.video.setAttribute('playsinline','true'); els.video.muted=true; els.video.autoplay=true; els.video.srcObject=stream; try{ await els.video.play(); }catch(e){} els.btnFlip.style.display='inline-block'; }catch(e){ alert('Kamera konnte nicht gestartet werden. Zugriff erlauben oder anderes Gerät versuchen.'); } }

function ready(){ return els.video.videoWidth>0 && els.video.videoHeight>0; }

async function capture(){ if(!ready()){ await new Promise(r=>setTimeout(r,140)); if(!ready()){ alert('Kamera noch nicht bereit. Bitte erneut versuchen.'); return; } } const c=document.createElement('canvas'); c.width=els.video.videoWidth; c.height=els.video.videoHeight; c.getContext('2d').drawImage(els.video,0,0); const img=new Image(); img.src=c.toDataURL('image/png'); await new Promise(r=>img.onload=r); return img; }

function goto(step){ ['step1','step2','step3'].forEach(id=>document.getElementById(id).classList.remove('active')); document.getElementById(step).classList.add('active'); }

els.btnStart.addEventListener('click', startCamera);
els.btnFlip.addEventListener('click', ()=>{ facing=(facing==='user'?'environment':'user'); startCamera(); });
els.btnCapture.addEventListener('click', async ()=>{ const img=await capture(); if(!img) return; try{ stream.getTracks().forEach(t=>t.stop()); }catch(_){} metrics = await analyze(img); gauge(els.gauge, metrics.score); els.summary.textContent=summarize(metrics); goto('step2'); });
els.toStep3.addEventListener('click', ()=>{ goto('step3'); });
els.submit.addEventListener('click', ()=>{ const name=els.name.value.trim(); const email=els.email.value.trim(); const p=buildPrompt({name,email}, metrics); els.prompt.value=p; const rows=JSON.parse(localStorage.getItem('lune_records')||'[]'); rows.unshift({name,email,plan:(document.querySelector('input[name="plan"]:checked')||{}).value||'', timestamp:new Date().toISOString(), prompt:p}); localStorage.setItem('lune_records', JSON.stringify(rows)); alert('Gespeichert. Eintrag im Dashboard sichtbar.'); });

document.addEventListener('visibilitychange', ()=>{ if(document.hidden && stream){ try{ stream.getTracks().forEach(t=>t.stop()); }catch(_){} } });
secureWarn();
applyI18n();
