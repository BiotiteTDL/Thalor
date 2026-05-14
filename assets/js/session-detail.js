(()=>{
'use strict';
const app=document.getElementById('sessionDetailApp');
const slug='diario';
const storageKey='thalor.diary.v1';
const esc=(v)=>String(v??'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
const internalHref=(href)=>{const raw=String(href||'').trim();if(!raw)return '#';if(/^(javascript:|data:|vbscript:|https?:|mailto:|tel:|\/\/)/i.test(raw))return '#';return raw.replace(/["'<>\s]/g,'');};
const richText=(v)=>esc(v).replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g,(_,label,href)=>`<a class="lore-link" href="${esc(internalHref(href))}">${esc(label)}</a>`);
const nl=(v)=>String(v??'').split(/\n+/).map(x=>x.trim()).filter(Boolean);
const params=new URLSearchParams(location.search);
const sessionId=params.get('id')||'';
const authAvailable=()=>!!(window.ThalorAuth&&typeof window.ThalorAuth.init==='function');
function canMasterEdit(){try{return authAvailable()&&window.ThalorAuth.isMaster&&window.ThalorAuth.isMaster();}catch(e){return false;}}
function fallbackData(){return {sessions:[]};}
function normalize(data){
  data=data&&typeof data==='object'?data:fallbackData();
  return {...data,sessions:Array.isArray(data.sessions)?data.sessions.map((s,i)=>({
    id:String(s.id||('sessione-'+(i+1))),
    tag:String(s.tag||'Sessione'),
    title:String(s.title||'Nuova sessione'),
    href:String(s.href||'#'),
    description:String(s.description||''),
    detailTitle:String(s.detailTitle||s.title||'Nuova sessione'),
    detailBody:String(s.detailBody||s.body||s.description||'')
  })):[]};
}
function findIndex(data){return data.sessions.findIndex(s=>String(s.id)===String(sessionId));}
function paragraphHtml(text){const parts=nl(text);return parts.length?parts.map(p=>`<p>${richText(p)}</p>`).join(''):'<p class="muted">Nessun dettaglio inserito.</p>';}
function floatingActions(edit){return `<nav class="sheet-floating-actions diary-floating-actions" aria-label="Azioni sessione"><button class="sheet-floating-toggle" id="sheetFloatingToggle" type="button" aria-label="Apri menu sessione" aria-expanded="false"><span></span><span></span><span></span></button><div class="sheet-floating-menu" id="sheetFloatingMenu"><button class="button primary-action" id="sessionEditSave" type="button">${edit?'Salva':'Modifica'}</button>${edit?`<button class="button ghost-button" id="sessionCancelEdit" type="button">Annulla</button>`:''}<a class="button ghost-button" href="../diario.html">Torna al diario</a></div></nav>`;}
function render(data,editing=false){
  data=normalize(data);
  const index=findIndex(data);
  const can=canMasterEdit();
  if(index<0){
    app.innerHTML=`<section class="hero"><span class="tag">Diario della campagna</span><h1 class="hero-title">Sessione non trovata</h1><p class="hero-subtitle">Questa sessione non è più presente nel Diario oppure è stata eliminata.</p><p><a class="button" href="../diario.html">Torna al Diario</a></p></section>`;
    return;
  }
  const s=data.sessions[index];
  const edit=editing&&can;
  document.title=`${s.tag} — ${s.title} — Diario di Thalor`;
  app.classList.toggle('diary-editing',!!edit);
  app.innerHTML=`
    <section class="hero dynamic-session-hero">
      <span class="tag"${edit?' contenteditable="true" spellcheck="false" data-session-field="tag"':''}>${edit?esc(s.tag):richText(s.tag)}</span>
      <h1 class="hero-title"${edit?' contenteditable="true" spellcheck="false" data-session-field="title"':''}>${edit?esc(s.title):richText(s.title)}</h1>
      <p class="hero-subtitle"${edit?' contenteditable="true" spellcheck="false" data-session-field="description"':''}>${edit?esc(s.description):richText(s.description)}</p>
    </section>
    <section class="panel lore-section session-text dynamic-session-text">
      ${edit?`<label class="diary-edit-label wide session-detail-body-label">Testo pagina sessione<textarea data-session-field="detailBody">${esc(s.detailBody)}</textarea></label>`:paragraphHtml(s.detailBody)}
    </section>
    <p class="dynamic-session-back"><a class="button ghost-button" href="../diario.html">Torna al Diario</a></p>
    ${can?floatingActions(edit):''}`;
  bind(data,index);
}
function collect(data,index){
  data=normalize(data);
  const s=data.sessions[index];
  if(!s)return data;
  app.querySelectorAll('[data-session-field]').forEach(el=>{
    const f=el.dataset.sessionField;
    s[f]=(el.tagName==='TEXTAREA'?el.value:el.textContent).trim();
  });
  s.detailTitle=s.title;
  return data;
}
let saveInFlight=null;
async function saveSession(data,index){
  if(saveInFlight)return saveInFlight;
  saveInFlight=(async()=>{
    const draft=collect(data,index);
    localStorage.setItem(storageKey,JSON.stringify(draft));
    if(canMasterEdit()&&authAvailable()&&window.ThalorAuth.state.configured&&!window.ThalorAuth.state.localMaster){
      await window.ThalorAuth.saveCharacter(slug,draft);
    }
    render(draft,false);
    return draft;
  })();
  try{return await saveInFlight;}catch(err){alert('Salvataggio sessione non riuscito: '+(err.message||err));return data;}finally{saveInFlight=null;}
}
function bind(data,index){
  const nav=document.querySelector('.diary-floating-actions');
  const toggle=document.getElementById('sheetFloatingToggle');
  if(toggle)toggle.onclick=()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));};
  const editSave=document.getElementById('sessionEditSave');
  if(editSave)editSave.onclick=()=>{if(app.classList.contains('diary-editing'))saveSession(data,index);else render(data,true);};
  const cancel=document.getElementById('sessionCancelEdit');
  if(cancel)cancel.onclick=()=>render(data,false);
  app.querySelectorAll('[contenteditable="true"]').forEach(el=>{el.addEventListener('keydown',ev=>{if(ev.key==='Enter'&&!ev.shiftKey){ev.preventDefault();el.blur();}});});
}
(async function start(){
  let data=fallbackData();let freshLoaded=false;
  try{
    if(authAvailable())await window.ThalorAuth.init();
    if(authAvailable()&&window.ThalorAuth.state.configured&&navigator.onLine!==false){
      const online=await window.ThalorAuth.loadCharacter(slug,null);
      if(online&&typeof online==='object'){
        data=normalize(online);freshLoaded=true;
        try{localStorage.setItem(storageKey,JSON.stringify(data));}catch(e){}
      }
    }
  }catch(e){console.warn('Sessione load online:',e);}
  if(!freshLoaded){try{const local=localStorage.getItem(storageKey);if(local)data=normalize(JSON.parse(local));}catch(e){}}
  render(data,false);
})();
})();
