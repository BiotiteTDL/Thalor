(()=>{
'use strict';
const app=document.getElementById('xpApp');
if(!app)return;
const slug='xp';
const storageKey='thalor.xp.v1';
const esc=(v)=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const internalHref=(href)=>{const raw=String(href||'').trim();if(!raw)return '#';if(/^(javascript:|data:|vbscript:|https?:|mailto:|tel:|\/\/)/i.test(raw))return '#';return raw.replace(/["'<>\s]/g,'');};
const richText=(v)=>esc(v).replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g,(_,label,href)=>`<a class="lore-link" href="${esc(internalHref(href))}">${esc(label)}</a>`);
const num=(v)=>{if(v===null||v===undefined||v==='')return null;const n=Number(String(v).replace(/\./g,'').replace(',','.'));return Number.isFinite(n)?n:null;};
const fmt=(v)=>v===null||v===undefined||v===''?'—':Number(v).toLocaleString('it-IT');
const authAvailable=()=>!!(window.ThalorAuth&&typeof window.ThalorAuth.init==='function');
function isLocalPreview(){try{const h=String(location.hostname||'').toLowerCase();const pr=String(location.protocol||'').toLowerCase();return pr==='file:'||h===''||h==='localhost'||h==='127.0.0.1'||h==='::1'||/^192\.168\./.test(h)||/^10\./.test(h)||/^172\.(1[6-9]|2\d|3[0-1])\./.test(h);}catch(e){return false;}}
function canMasterEdit(){try{if(isLocalPreview())return true;if(authAvailable()&&window.ThalorAuth.isMaster&&window.ThalorAuth.isMaster())return true;if(authAvailable()&&window.ThalorAuth.canEdit&&window.ThalorAuth.canEdit('__archive__'))return true;}catch(e){}return false;}
const names=[['ralph','Ralph','Alessandro','../personaggi/ralph.html'],['abraxas','Abraxas','Carlo','../personaggi/abraxas.html'],['igor','Igor','Gerry','../personaggi/igor.html'],['arolf','Arolf','Ivan','../personaggi/arolf.html'],['irven','Irven','Ettore','../personaggi/irven.html']];
function defaultXpThreshold(level){level=Math.max(1,Number(level)||1);return Math.max(0,(level*(level-1)/2)*1000);}
function xpThreshold(table,level){const row=(table||[]).find(r=>Number(r.livello)===Number(level));const val=num(row?.xp_minimi);return row&&val!==null?val:defaultXpThreshold(level);}
function levelFromXp(table,xp){let lvl=1;const max=Math.max(20,...(table||[]).map(r=>Number(r.livello)||0));for(let l=1;l<=max;l++){if(Number(xp)>=xpThreshold(table,l))lvl=l;else break;}return lvl;}
function nextThreshold(table,lvl){return xpThreshold(table,Number(lvl)+1);}
function staticFallback(){
  const d={personaggi:{},registro_xp:[],tabella_xp:[]};
  const rows=[...app.querySelectorAll('.panel.timeline')];
  const registroPanel=rows.find(p=>/Registro XP/i.test(p.querySelector('h3')?.textContent||''));
  const levelsPanel=rows.find(p=>/Progressione livelli/i.test(p.querySelector('h3')?.textContent||''));
  if(registroPanel){
    registroPanel.querySelectorAll('tbody tr').forEach(tr=>{
      const t=[...tr.children].map(td=>td.textContent.trim());
      if(!t.length)return;
      d.registro_xp.push({categoria:'Registro principale',evento:t[0]||'Evento',ralph:num(t[1]),abraxas:num(t[2]),igor:num(t[3]),arolf:num(t[4]),irven:num(t[5])});
    });
  }
  if(levelsPanel){
    levelsPanel.querySelectorAll('tbody tr').forEach(tr=>{
      const t=[...tr.children].map(td=>td.textContent.trim());
      if(!t.length)return;
      d.tabella_xp.push({livello:num(t[0]),xp_minimi:num(t[1]),xp_per_arrivarci:t[2]==='-'?'-':num(t[2])});
    });
  }
  return normalize(d);
}
function normalize(input){
  const d=input&&typeof input==='object'?JSON.parse(JSON.stringify(input)):{};
  d.personaggi=d.personaggi&&typeof d.personaggi==='object'?d.personaggi:{};
  d.registro_xp=Array.isArray(d.registro_xp)?d.registro_xp:[];
  d.tabella_xp=Array.isArray(d.tabella_xp)?d.tabella_xp:[];
  d.registro_xp=d.registro_xp.map(r=>Object.assign({categoria:r.categoria||r.category||'Registro principale',evento:r.evento||'Evento',ralph:null,abraxas:null,igor:null,arolf:null,irven:null},r));
  if(!d.tabella_xp.length){for(let l=1;l<=20;l++)d.tabella_xp.push({livello:l,xp_minimi:defaultXpThreshold(l),xp_per_arrivarci:l===1?'-':(l-1)*1000});}
  names.forEach(([key,nome,player])=>{d.personaggi[key]=Object.assign({giocatore:player,personaggio:nome,ispirazione:null,xp_totali:0,livello:1,prossimo_livello:1000,xp_mancanti:1000,avanzamento:0},d.personaggi[key]||{});});
  return recompute(d);
}
function meaningful(d){return !!(d&&Array.isArray(d.registro_xp)&&d.registro_xp.length&&Array.isArray(d.tabella_xp)&&d.tabella_xp.length);}
function recompute(d){
  const table=d.tabella_xp||[];
  names.forEach(([key,nome,player])=>{
    const total=(d.registro_xp||[]).reduce((sum,row)=>sum+(Number(row[key])||0),0);
    const lvl=levelFromXp(table,total);
    const next=nextThreshold(table,lvl);
    const current=xpThreshold(table,lvl);
    const span=Math.max(1,next-current);
    const progress=Math.max(0,Math.min(1,(total-current)/span));
    d.personaggi[key]=Object.assign({},d.personaggi[key]||{}, {giocatore:player,personaggio:nome,xp_totali:total,livello:lvl,prossimo_livello:next,xp_mancanti:Math.max(0,next-total),avanzamento:progress});
  });
  return d;
}
function sectionsFrom(d){
  const map=new Map();
  (d.registro_xp||[]).forEach(r=>{const c=(r.categoria||'Registro principale').trim()||'Registro principale';if(!map.has(c))map.set(c,[]);map.get(c).push(r);});
  if(!map.size)map.set('Registro principale',[]);
  return [...map.entries()].map(([title,rows])=>({title,rows}));
}
function fieldAttrs(path){return `data-xp-field="${esc(path)}" contenteditable="true" spellcheck="false"`;}
function floatingActions(edit){return `<nav class="sheet-floating-actions xp-floating-actions" aria-label="Azioni tabella EXP"><button class="sheet-floating-toggle" id="sheetFloatingToggle" type="button" aria-label="Apri menu EXP" aria-expanded="false"><span></span><span></span><span></span></button><div class="sheet-floating-menu" id="sheetFloatingMenu"><button class="button primary-action" id="xpEditSave" type="button">${edit?'Salva':'Modifica'}</button>${edit?'<button class="button ghost-button" id="xpAddSectionTop" type="button">+ Categoria sopra</button><button class="button ghost-button" id="xpAddSection" type="button">+ Categoria sotto</button><button class="button ghost-button" id="xpAddRow" type="button">+ Riga XP</button><button class="button ghost-button" id="xpCancelEdit" type="button">Annulla</button>':''}</div></nav>`;}
function render(data,edit=false){
  currentData=normalize(data);currentEditing=!!edit;
  data=currentData;const can=canMasterEdit();app.classList.toggle('xp-editing',!!edit);app.classList.toggle('xp-readonly',!can);
  const e=edit?' class="editable-field"':'';
  const currentRows=names.map(([key,nome,player,url])=>{const p=data.personaggi[key]||{};return `<tr><td>${esc(player)}</td><td><a class="lore-link" href="${esc(url)}">${esc(nome)}</a></td><td class="num">${fmt(p.xp_totali)}</td><td class="num">${fmt(p.livello)}</td><td class="num">${fmt(p.xp_mancanti)}</td></tr>`}).join('');
  const registry=sectionsFrom(data).map((sec,si)=>`<details class="panel timeline xp-registry-section" ${si===0?'open':''} data-xp-section="${si}"><summary><span ${edit?fieldAttrs(`section.${si}.title`):''}${e}>${edit?esc(sec.title):richText(sec.title)}</span><small>${sec.rows.length} elementi</small></summary><div class="xp-table-wrap"><table class="archive-table compact xp-edit-table"><thead><tr><th>Evento</th>${names.map(n=>`<th>${esc(n[1])}</th>`).join('')}${edit?'<th></th>':''}</tr></thead><tbody>${sec.rows.map(r=>{const absoluteIndex=(data.registro_xp||[]).indexOf(r);return `<tr data-xp-row="${absoluteIndex}"><td ${edit?fieldAttrs(`row.${absoluteIndex}.evento`):''}${e}>${edit?esc(r.evento||''):richText(r.evento||'')}</td>${names.map(([key])=>`<td class="num" ${edit?fieldAttrs(`row.${absoluteIndex}.${key}`):''}${e}>${r[key]===null||r[key]===undefined?'':esc(r[key])}</td>`).join('')}${edit?`<td><button class="row-del xp-delete-row" type="button" data-delete-row="${absoluteIndex}">×</button></td>`:''}</tr>`}).join('')}</tbody></table></div>${edit?`<div class="xp-inline-actions"><button class="button ghost-button" type="button" data-add-row="${si}">+ Riga in questa categoria</button><button class="button ghost-button danger-action" type="button" data-delete-section="${si}">Elimina categoria</button></div>`:''}</details>`).join('');
  const levels=(data.tabella_xp||[]).map((r,i)=>`<tr><td class="num" ${edit?fieldAttrs(`level.${i}.livello`):''}${e}>${esc(r.livello)}</td><td class="num" ${edit?fieldAttrs(`level.${i}.xp_minimi`):''}${e}>${esc(r.xp_minimi)}</td><td class="num" ${edit?fieldAttrs(`level.${i}.xp_per_arrivarci`):''}${e}>${esc(r.xp_per_arrivarci)}</td>${edit?`<td><button class="row-del" type="button" data-delete-level="${i}">×</button></td>`:''}</tr>`).join('');
  app.innerHTML=`<section><h2 class="section-title">Tabella EXP</h2><p class="section-note">Progressione, situazione attuale del gruppo e registro XP. Il riepilogo viene calcolato dal registro qui sotto.</p><div class="panel timeline xp-current-panel"><h3>Situazione attuale</h3><div class="xp-table-wrap"><table class="archive-table compact"><thead><tr><th>Giocatore</th><th>Personaggio</th><th>XP totali</th><th>Livello</th><th>XP mancanti</th></tr></thead><tbody>${currentRows}</tbody></table></div><div class="page-actions"><a class="button" href="../assets/files/Esperienza_player_bello.xlsx">Scarica Excel XP</a><a class="button" href="../assets/data/xp.json">Apri dati JSON</a></div></div><details class="xp-main-details" open><summary><span>Registro XP</span><small>Collassabile e diviso in categorie</small></summary><div class="xp-registry-list">${registry}</div></details><details class="panel timeline xp-levels-panel"><summary><span>Progressione livelli</span><small>Tabella soglie</small></summary><div class="xp-table-wrap"><table class="archive-table compact xp-edit-table"><thead><tr><th>Livello</th><th>XP minimi</th><th>XP per arrivarci</th>${edit?'<th></th>':''}</tr></thead><tbody>${levels}</tbody></table></div>${edit?'<div class="xp-inline-actions"><button class="button ghost-button" type="button" id="xpAddLevel">+ Livello</button></div>':''}</details><p style="text-align:center"><a class="button" href="../archivio.html">Torna all\'archivio</a></p></section><footer>Thalor</footer>${can?floatingActions(edit):''}`;
  bind(data);
}
window.addEventListener('thalor-auth-changed',()=>{if(currentData)render(currentData,currentEditing);});
window.addEventListener('thalor-local-master-changed',()=>{if(currentData)render(currentData,currentEditing);});
function collect(prev){
  const d=normalize(prev);const sections=sectionsFrom(d);
  app.querySelectorAll('[data-xp-field]').forEach(el=>{
    const [kind,a,b]=el.dataset.xpField.split('.');const val=el.textContent.trim();
    if(kind==='row'){const i=Number(a);d.registro_xp[i]=d.registro_xp[i]||{categoria:'Registro principale',evento:'Evento'};d.registro_xp[i][b]=b==='evento'?val:num(val);}
    if(kind==='section'){const si=Number(a);const old=sections[si]?.title||'Registro principale';const next=val||old;d.registro_xp.forEach(r=>{if((r.categoria||'Registro principale')===old)r.categoria=next;});}
    if(kind==='level'){const i=Number(a);d.tabella_xp[i]=d.tabella_xp[i]||{livello:i+1,xp_minimi:0,xp_per_arrivarci:0};d.tabella_xp[i][b]=b==='xp_per_arrivarci'&&val==='-'?'-':num(val);}
  });
  d.registro_xp=d.registro_xp.filter(Boolean);d.tabella_xp=d.tabella_xp.filter(Boolean).sort((a,b)=>Number(a.livello)-Number(b.livello));
  return normalize(d);
}
let currentData=null;
let currentEditing=false;
let saveInFlight=null;
async function saveXp(data){
  if(saveInFlight)return saveInFlight;
  saveInFlight=(async()=>{const draft=collect(data);localStorage.setItem(storageKey,JSON.stringify(draft));if(canMasterEdit()&&authAvailable()&&window.ThalorAuth.state.configured&&!window.ThalorAuth.state.localMaster){await window.ThalorAuth.saveCharacter(slug,draft);}render(draft,false);return draft;})().catch(err=>{alert('Salvataggio XP non riuscito: '+(err.message||err));return collect(data);}).finally(()=>{saveInFlight=null;});
  return saveInFlight;
}
function bind(data){
  const nav=document.querySelector('.xp-floating-actions');const toggle=document.getElementById('sheetFloatingToggle');if(toggle)toggle.onclick=()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));};
  const editSave=document.getElementById('xpEditSave');if(editSave)editSave.onclick=()=>{if(app.classList.contains('xp-editing'))saveXp(data);else render(data,true);};
  const cancel=document.getElementById('xpCancelEdit');if(cancel)cancel.onclick=()=>render(data,false);
  const addSecTop=document.getElementById('xpAddSectionTop');if(addSecTop)addSecTop.onclick=()=>{const d=collect(data);d.registro_xp.unshift({categoria:'Nuova categoria',evento:'Nuovo evento',ralph:null,abraxas:null,igor:null,arolf:null,irven:null});render(d,true);};
  const addSec=document.getElementById('xpAddSection');if(addSec)addSec.onclick=()=>{const d=collect(data);d.registro_xp.push({categoria:'Nuova categoria',evento:'Nuovo evento',ralph:null,abraxas:null,igor:null,arolf:null,irven:null});render(d,true);};
  const addRow=document.getElementById('xpAddRow');if(addRow)addRow.onclick=()=>{const d=collect(data);d.registro_xp.push({categoria:'Registro principale',evento:'Nuovo evento',ralph:null,abraxas:null,igor:null,arolf:null,irven:null});render(d,true);};
  app.querySelectorAll('[data-add-row]').forEach(btn=>btn.onclick=()=>{const d=collect(data);const sec=sectionsFrom(d)[Number(btn.dataset.addRow)||0];d.registro_xp.push({categoria:sec?.title||'Registro principale',evento:'Nuovo evento',ralph:null,abraxas:null,igor:null,arolf:null,irven:null});render(d,true);});
  app.querySelectorAll('[data-delete-row]').forEach(btn=>btn.onclick=()=>{const d=collect(data);d.registro_xp.splice(Number(btn.dataset.deleteRow)||0,1);render(d,true);});
  app.querySelectorAll('[data-delete-section]').forEach(btn=>btn.onclick=()=>{const d=collect(data);const sec=sectionsFrom(d)[Number(btn.dataset.deleteSection)||0];if(!sec)return;d.registro_xp=d.registro_xp.filter(r=>(r.categoria||'Registro principale')!==sec.title);render(d,true);});
  const addLevel=document.getElementById('xpAddLevel');if(addLevel)addLevel.onclick=()=>{const d=collect(data);const last=d.tabella_xp[d.tabella_xp.length-1]||{livello:0,xp_minimi:0};const lvl=Number(last.livello||0)+1;d.tabella_xp.push({livello:lvl,xp_minimi:Number(last.xp_minimi||0)+(lvl-1)*1000,xp_per_arrivarci:(lvl-1)*1000});render(d,true);};
  app.querySelectorAll('[data-delete-level]').forEach(btn=>btn.onclick=()=>{const d=collect(data);d.tabella_xp.splice(Number(btn.dataset.deleteLevel)||0,1);render(d,true);});
  app.querySelectorAll('[contenteditable="true"]').forEach(el=>el.addEventListener('keydown',ev=>{if(ev.key==='Enter'){ev.preventDefault();el.blur();}}));
}
(async function start(){
  const fallback=staticFallback();let data=fallback;
  try{const fetched=await fetch('../assets/data/xp.json',{cache:'no-store'}).then(r=>r.ok?r.json():null);if(meaningful(fetched))data=fetched;}catch(e){}
  try{const local=localStorage.getItem(storageKey);if(local){const parsed=JSON.parse(local);if(meaningful(parsed))data=parsed;}}
  catch(e){}
  try{if(authAvailable())await window.ThalorAuth.init();if(authAvailable()&&window.ThalorAuth.state.configured){const online=await window.ThalorAuth.loadCharacter(slug,normalize(data));if(meaningful(online))data=online;localStorage.setItem(storageKey,JSON.stringify(normalize(data)));}}
  catch(e){console.warn('XP load:',e);}
  render(data,false);
})();
})();
