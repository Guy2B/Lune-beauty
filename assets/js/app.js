import { analyze, gauge, summarize, buildPrompt } from './analysis.js';
import { applyI18n } from './i18n.js';

const els={video:document.getElementById('video'), btnStart:document.getElementById('btnStart'), btnFlip:document.getElementById('btnFlip'), btnCapture:document.getElementById('btnCapture'), gauge:document.getElementById('gauge'), summary:document.getElementById('summary')};
let stream=null; let facing='user'; let metrics=null; let captured=null;

function isSecure(){ return location.protocol==='https:' || location.hostname==='localhost' || location.hostname==='127.0.0.1'; }

async function startCamera(){ try{ if(!isSecure()){ alert("Bitte HTTPS oder 'localhost' verwenden – Kamera wird sonst blockiert."); return; } if(stream){ stream.getTracks().forEach(t=>t.stop()); } const constraints={ video:{ facingMode:{ ideal:facing }, width:{ideal:1280}, height:{ideal:720} }, audio:false }; stream=await navigator.mediaDevices.getUserMedia(constraints); els.video.setAttribute('playsinline','true'); els.video.muted=true; els.video.autoplay=true; els.video.srcObject=stream; try{ await els.video.play(); }catch(e){} els.btnFlip.style.display='inline-block'; }catch(e){ alert('Kamera konnte nicht gestartet werden. Zugriff erlauben oder anderes Gerät versuchen.'); console.error(e); } }

function ready(){ return els.video.videoWidth>0 && els.video.videoHeight>0; }

async function capture(){ if(!ready()){ await new Promise(r=>setTimeout(r,140)); if(!ready()){ alert('Kamera noch nicht bereit. Bitte erneut versuchen.'); return; } } const c=document.createElement('canvas'); c.width=els.video.videoWidth; c.height=els.video.videoHeight; c.getContext('2d').drawImage(els.video,0,0); const img=new Image(); img.src=c.toDataURL('image/png'); await new Promise(r=>img.onload=r); return img; }

function goto(step){ ['step1','step2','step3'].forEach(id=>document.getElementById(id).classList.remove('active')); document.getElementById(step).classList.add('active'); }

els.btnStart.addEventListener('click', startCamera);
els.btnFlip.addEventListener('click', ()=>{ facing=(facing==='user'?'environment':'user'); startCamera(); });
els.btnCapture.addEventListener('click', async ()=>{ captured=await capture(); if(!captured) return; try{ stream.getTracks().forEach(t=>t.stop()); }catch(_){} goto('step2'); });

// Step2 → Step3
const next=document.getElementById('toStep3');
if(next){ next.addEventListener('click', async ()=>{ if(!captured) { alert('Bitte zuerst ein Foto aufnehmen.'); return; } metrics = await analyze(captured); gauge(els.gauge, metrics.score); els.summary.textContent=summarize(metrics); goto('step3'); }); }

document.addEventListener('visibilitychange', ()=>{ if(document.hidden && stream){ try{ stream.getTracks().forEach(t=>t.stop()); }catch(_){} } });
applyI18n();
