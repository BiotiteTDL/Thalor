(()=>{
'use strict';
const docApp=document.getElementById('archiveDocumentsApp');
const symApp=document.getElementById('archiveSymbolsApp');
if(!docApp&&!symApp)return;
const app=docApp||symApp;
const type=docApp?'documents':'symbols';
const slug=type==='documents'?'archive-documents':'archive-symbols';
const storageKey=type==='documents'?'thalor.archive.documents.v1':'thalor.archive.symbols.v1';
const esc=(v)=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const internalHref=(href)=>{const raw=String(href||'').trim();if(!raw)return '#';if(/^(javascript:|data:|vbscript:|https?:|mailto:|tel:|\/\/)/i.test(raw))return '#';return raw.replace(/["'<>\s]/g,'');};
const richText=(v)=>esc(v).replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g,(_,label,href)=>`<a class="lore-link" href="${esc(internalHref(href))}">${esc(label)}</a>`);
const authAvailable=()=>!!(window.ThalorAuth&&typeof window.ThalorAuth.init==='function');
function canMasterEdit(){try{return authAvailable()&&window.ThalorAuth.isMaster&&window.ThalorAuth.isMaster();}catch(e){return false;}}
function baseDocuments(){return {title:'Documenti',note:'Carte, appunti e lettere raccolte durante la campagna. Le immagini restano chiuse finché non servono, così la pagina rimane leggibile anche da telefono.',categories:[
  {title:'Appunti del Dr. Otmar Van Verschuer',items:[
    {title:'Tav. I',subtitle:'Persistenza del Tessuto Necrotico',image:'../assets/img/otmar-1.jpeg',href:'../assets/img/otmar-1.jpeg'},
    {title:'Tav. II',subtitle:'Primi Risultati',image:'../assets/img/otmar-2.jpeg',href:'../assets/img/otmar-2.jpeg'},
    {title:'Tav. III',subtitle:'Sulla Vista',image:'../assets/img/otmar-3.jpeg',href:'../assets/img/otmar-3.jpeg'},
    {title:'Tav. IV',subtitle:'Ancoraggio',image:'../assets/img/otmar-4.jpeg',href:'../assets/img/otmar-4.jpeg'},
    {title:'Tav. V',subtitle:'Il Frammento',image:'../assets/img/otmar-5.jpeg',href:'../assets/img/otmar-5.jpeg'},
    {title:'Tav. VI',subtitle:'Persistenza dell\'Essenza',image:'../assets/img/otmar-6.jpeg',href:'../assets/img/otmar-6.jpeg'},
    {title:'Nota riservata',subtitle:'R.M.',image:'../assets/img/otmar-7.jpeg',href:'../assets/img/otmar-7.jpeg'}
  ]},
  {title:'Lettere di Varek Thorm',items:[
    {title:'Lettera I',subtitle:'A coloro che hanno superato le prove',image:'../assets/img/lettera-thorm-1.jpg',href:'../assets/img/lettera-thorm-1.jpg'},
    {title:'Lettera a Otmar',subtitle:'Hai compreso ciò che gli altri temono di studiare',image:'../assets/img/lettera-thorm-otmar.jpeg',href:'../assets/img/lettera-thorm-otmar.jpeg'}
  ]},
  {title:'Extractum Ex Tenebris, rituale della Crucimigrazione Consapevole',items:[
    {title:'Pagina I',subtitle:'Della Preparazione del Legno e della Carne',image:'../assets/img/extractum/extractum_1.png',href:'../assets/img/extractum/extractum_1.png'},
    {title:'Pagina II',subtitle:'Dei Ministri Morti e della Prima Litania',image:'../assets/img/extractum/extractum_2.png',href:'../assets/img/extractum/extractum_2.png'},
    {title:'Pagina III',subtitle:'Del Respiro Tradito',image:'../assets/img/extractum/extractum_3.png',href:'../assets/img/extractum/extractum_3.png'},
    {title:'Pagina IV',subtitle:'Dell’Incisione dei Segni e del Distacco',image:'../assets/img/extractum/extractum_4.png',href:'../assets/img/extractum/extractum_4.png'},
    {title:'Pagina V',subtitle:'Del Punto di Rottura',image:'../assets/img/extractum/extractum_5.png',href:'../assets/img/extractum/extractum_5.png'},
    {title:'Pagina VI',subtitle:'Della Caduta e dell’Ancoraggio',image:'../assets/img/extractum/extractum_6.png',href:'../assets/img/extractum/extractum_6.png'}
  ]},
  {title:'Schede personaggio',items:[
    {title:'Irven Till “Blightborn”',subtitle:'Scheda originale aggiornata del personaggio.',image:'',href:'../assets/files/Irven_Till_Blightborn.pdf',badge:'PDF'},
    {title:'Abraxas',subtitle:'Scheda originale del personaggio.',image:'',href:'../assets/files/Abraxas.pdf',badge:'PDF'}
  ]}
]};}
function baseSymbols(){return {title:'Simboli',note:'Segni riconosciuti durante la campagna.',categories:[{title:'Simboli conosciuti',items:[
  {tag:'Casata Thorm',title:'Simbolo dei Thorm',description:'Il marchio della famiglia Thorm. La versione priva di scheletro rappresenta il volto pubblico della casata.',image:'../assets/img/SimboloThorm.jpeg',href:'simboli.html'},
  {tag:'Varek Thorm',title:'Simbolo di Varek Thorm',description:'La variante associata a Varek, segnata dallo scheletro. Un dettaglio che lega il nome Thorm a morte, forma e trasformazione.',image:'../assets/img/SimboloVarek_thorm.jpeg',href:'../personaggi/varek.html'},
  {tag:'Otmar Van Verschuer',title:'Simbolo del Dr. Otmar Van Verschuer',description:'Sigillo associato al direttore dell’Istituto di Biologia Ereditaria di Portogrigio e agli appunti ritrovati nei sotterranei dell’Accademia.',image:'../assets/img/Simbolo_Otmar.png',href:'../personaggi/otmar.html'}
]}]};}
function normalize(input){
  const fb=type==='documents'?baseDocuments():baseSymbols();
  const d=input&&typeof input==='object'?JSON.parse(JSON.stringify(input)):{};
  d.title=String(d.title||fb.title);d.note=String(d.note||fb.note);
  d.categories=Array.isArray(d.categories)?d.categories:fb.categories;
  d.categories=d.categories.map(c=>({title:String(c.title||'Nuova categoria'),items:(Array.isArray(c.items)?c.items:[]).map(it=>type==='documents'?{
    title:String(it.title||'Nuovo documento'),subtitle:String(it.subtitle||''),image:String(it.image||''),href:String(it.href||it.image||'#'),badge:String(it.badge||'')
  }:{
    tag:String(it.tag||'Simbolo'),title:String(it.title||'Nuovo simbolo'),description:String(it.description||''),image:String(it.image||''),href:String(it.href||'#')
  })}));
  return d;
}
function field(path,multiline=false){return multiline?`data-archive-field="${esc(path)}"`:`data-archive-field="${esc(path)}" contenteditable="true" spellcheck="false"`;}
function floatingActions(edit){return `<nav class="sheet-floating-actions archive-floating-actions" aria-label="Azioni archivio"><button class="sheet-floating-toggle" id="sheetFloatingToggle" type="button" aria-label="Apri menu archivio" aria-expanded="false"><span></span><span></span><span></span></button><div class="sheet-floating-menu" id="sheetFloatingMenu"><button class="button primary-action" id="archiveEditSave" type="button">${edit?'Salva':'Modifica'}</button>${edit?`<button class="button ghost-button" id="archiveAddCategory" type="button">+ Categoria</button><button class="button ghost-button" id="archiveCancelEdit" type="button">Annulla</button>`:''}</div></nav>`;}
function imgPreview(src,alt,badge){return src?`<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy" decoding="async">`:`<span class="doc-thumb doc-thumb-text">${esc(badge||'IMG')}</span>`;}
function renderDocuments(data,edit){
  const can=canMasterEdit(); app.classList.toggle('archive-editing',!!edit); app.classList.toggle('archive-readonly',!can);
  const categories=data.categories.map((cat,ci)=>`<details class="archive-edit-category" ${ci===0?'open':''} data-cat="${ci}"><summary><span class="${edit?'editable-field':''}" ${edit?field(`cat.${ci}.title`):''}>${edit?esc(cat.title):richText(cat.title)}</span><small>${cat.items.length} elementi</small></summary><div class="doc-list archive-edit-list">${cat.items.map((it,ii)=>`<div class="doc-row has-preview archive-edit-item" data-item="${ci}.${ii}">${edit?`<div class="archive-upload-box">${imgPreview(it.image,it.title,it.badge)}<label class="archive-upload-button">Cambia immagine<input type="file" accept="image/*" data-image-input="${ci}.${ii}"></label><input class="archive-url-input" type="text" value="${esc(it.href)}" ${field(`item.${ci}.${ii}.href`,true)} placeholder="Link/file"></div><div class="archive-edit-text"><strong class="editable-field" ${field(`item.${ci}.${ii}.title`)}>${esc(it.title)}</strong><span class="editable-field" ${field(`item.${ci}.${ii}.subtitle`)}>${esc(it.subtitle)}</span><span class="editable-field archive-badge-edit" ${field(`item.${ci}.${ii}.badge`)}>${esc(it.badge||'')}</span></div><button class="row-del archive-delete-item" type="button" data-delete-item="${ci}.${ii}">×</button>`:`<a class="doc-row-link" href="${esc(it.href||it.image||'#')}" target="_blank" rel="noopener">${imgPreview(it.image,it.title,it.badge)}<strong>${richText(it.title)}</strong><span>${richText(it.subtitle)}</span></a>`}</div>`).join('')}</div>${edit?`<div class="archive-inline-actions"><button class="button ghost-button" type="button" data-add-item="${ci}">+ Documento</button><button class="button ghost-button danger-action" type="button" data-delete-category="${ci}">Elimina categoria</button></div>`:''}</details>`).join('');
  app.innerHTML=`<section><h2 class="section-title ${edit?'editable-field':''}" ${edit?field('title'):''}>${edit?esc(data.title):richText(data.title)}</h2><p class="section-note ${edit?'editable-field':''}" ${edit?field('note'):''}>${edit?esc(data.note):richText(data.note)}</p><div class="doc-accordion archive-edit-accordion">${categories}</div><p style="margin-top:34px;text-align:center"><a class="button" href="../archivio.html">Torna all'archivio</a></p></section><footer>Thalor</footer>${can?floatingActions(edit):''}`;
}
function renderSymbols(data,edit){
  const can=canMasterEdit(); app.classList.toggle('archive-editing',!!edit); app.classList.toggle('archive-readonly',!can);
  const categories=data.categories.map((cat,ci)=>`<details class="archive-edit-category symbol-edit-category" ${ci===0?'open':''} data-cat="${ci}"><summary><span class="${edit?'editable-field':''}" ${edit?field(`cat.${ci}.title`):''}>${edit?esc(cat.title):richText(cat.title)}</span><small>${cat.items.length} elementi</small></summary><div class="symbols archive-symbol-grid">${cat.items.map((it,ii)=>`<article class="panel symbol-card archive-edit-item" data-item="${ci}.${ii}">${edit?`<div class="archive-upload-box">${imgPreview(it.image,it.title)}<label class="archive-upload-button">Cambia immagine<input type="file" accept="image/*" data-image-input="${ci}.${ii}"></label><input class="archive-url-input" type="text" value="${esc(it.href)}" ${field(`item.${ci}.${ii}.href`,true)} placeholder="Link pagina"></div><div><span class="tag editable-field" ${field(`item.${ci}.${ii}.tag`)}>${esc(it.tag)}</span><h3 class="editable-field" ${field(`item.${ci}.${ii}.title`)}>${esc(it.title)}</h3><textarea class="archive-edit-textarea" ${field(`item.${ci}.${ii}.description`,true)}>${esc(it.description)}</textarea></div><button class="row-del archive-delete-item" type="button" data-delete-item="${ci}.${ii}">×</button>`:`<img alt="${esc(it.title)}" src="${esc(it.image)}" loading="lazy" decoding="async"><div><span class="tag"><a class="lore-link" href="${esc(internalHref(it.href||'#'))}">${richText(it.tag)}</a></span><h3>${richText(it.title)}</h3><p>${richText(it.description)}</p></div>`}</article>`).join('')}</div>${edit?`<div class="archive-inline-actions"><button class="button ghost-button" type="button" data-add-item="${ci}">+ Simbolo</button><button class="button ghost-button danger-action" type="button" data-delete-category="${ci}">Elimina categoria</button></div>`:''}</details>`).join('');
  app.innerHTML=`<section><h2 class="section-title ${edit?'editable-field':''}" ${edit?field('title'):''}>${edit?esc(data.title):richText(data.title)}</h2><p class="section-note ${edit?'editable-field':''}" ${edit?field('note'):''}>${edit?esc(data.note):richText(data.note)}</p><div class="archive-symbol-categories">${categories}</div><p style="margin-top:34px"><a class="button" href="../archivio.html">Torna all'archivio</a></p></section><footer>Thalor</footer>${can?floatingActions(edit):''}`;
}
function render(data,edit=false){data=normalize(data); type==='documents'?renderDocuments(data,edit):renderSymbols(data,edit); bind(data);}
function setField(d,path,val){const p=path.split('.'); if(p[0]==='title'||p[0]==='note'){d[p[0]]=val;return;} if(p[0]==='cat'){const c=d.categories[Number(p[1])]; if(c)c.title=val;return;} if(p[0]==='item'){const it=d.categories[Number(p[1])]?.items[Number(p[2])]; if(it)it[p[3]]=val;}}
function collect(prev){const d=normalize(prev); app.querySelectorAll('[data-archive-field]').forEach(el=>{const val=(el.tagName==='INPUT'||el.tagName==='TEXTAREA')?el.value:el.textContent; setField(d,el.dataset.archiveField,val.trim());}); return normalize(d);}
function readFile(input){return new Promise((resolve,reject)=>{const file=input.files&&input.files[0]; if(!file){resolve('');return;} const r=new FileReader(); r.onload=()=>resolve(String(r.result||'')); r.onerror=()=>reject(r.error||new Error('File non leggibile')); r.readAsDataURL(file);});}
let saveInFlight=null;
async function saveArchive(data){if(saveInFlight)return saveInFlight; saveInFlight=(async()=>{const draft=collect(data); localStorage.setItem(storageKey,JSON.stringify(draft)); if(canMasterEdit()&&authAvailable()&&window.ThalorAuth.state.configured&&!window.ThalorAuth.state.localMaster){await window.ThalorAuth.saveCharacter(slug,draft);} render(draft,false); return draft;})().catch(err=>{alert('Salvataggio archivio non riuscito: '+(err.message||err)); return collect(data);}).finally(()=>{saveInFlight=null;}); return saveInFlight;}
function bind(data){
  const nav=document.querySelector('.archive-floating-actions'); const toggle=document.getElementById('sheetFloatingToggle'); if(toggle)toggle.onclick=()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));};
  const editSave=document.getElementById('archiveEditSave'); if(editSave)editSave.onclick=()=>{if(app.classList.contains('archive-editing'))saveArchive(data);else render(data,true);};
  const cancel=document.getElementById('archiveCancelEdit'); if(cancel)cancel.onclick=()=>render(data,false);
  const addCat=document.getElementById('archiveAddCategory'); if(addCat)addCat.onclick=()=>{const d=collect(data); d.categories.push({title:'Nuova categoria',items:[]}); render(d,true);};
  app.querySelectorAll('[data-add-item]').forEach(btn=>btn.onclick=()=>{const d=collect(data); const ci=Number(btn.dataset.addItem)||0; d.categories[ci]=d.categories[ci]||{title:'Nuova categoria',items:[]}; d.categories[ci].items.push(type==='documents'?{title:'Nuovo documento',subtitle:'Descrizione breve',image:'',href:'#',badge:''}:{tag:'Categoria',title:'Nuovo simbolo',description:'Descrizione del simbolo.',image:'',href:'#'}); render(d,true);});
  app.querySelectorAll('[data-delete-item]').forEach(btn=>btn.onclick=()=>{const d=collect(data); const [ci,ii]=btn.dataset.deleteItem.split('.').map(Number); d.categories[ci]?.items.splice(ii,1); render(d,true);});
  app.querySelectorAll('[data-delete-category]').forEach(btn=>btn.onclick=()=>{const ci=Number(btn.dataset.deleteCategory)||0; const name=(collect(data).categories[ci]?.title||'questa categoria'); if(!confirm('Eliminare la categoria "'+name+'" e tutti i suoi elementi?'))return; const d=collect(data); d.categories.splice(ci,1); render(d,true);});
  app.querySelectorAll('[data-image-input]').forEach(input=>input.onchange=async()=>{const d=collect(data); const [ci,ii]=input.dataset.imageInput.split('.').map(Number); const src=await readFile(input); if(src&&d.categories[ci]?.items[ii]){d.categories[ci].items[ii].image=src; if(type==='documents')d.categories[ci].items[ii].href=src;} render(d,true);});
  app.querySelectorAll('.doc-row-link').forEach(link=>link.addEventListener('click',ev=>{
    const href=link.getAttribute('href')||'';
    if(!href||href==='#')return;
    ev.preventDefault();
    ev.stopPropagation();
    const isDataImage=href.startsWith('data:image/');
    if(isDataImage){
      const title=(link.querySelector('strong')?.textContent||'Documento').trim();
      const tab=window.open('', '_blank');
      if(!tab)return;
      tab.opener=null;
      tab.document.open();
      tab.document.write('<!doctype html><html><head><title>'+esc(title)+'</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;min-height:100%;background:#120d0b;color:#f3e7cf}body{display:grid;place-items:center;padding:24px;box-sizing:border-box}img{max-width:100%;max-height:96vh;object-fit:contain;box-shadow:0 18px 60px rgba(0,0,0,.55);border-radius:12px}</style></head><body><img alt="'+esc(title)+'" src="'+href+'"></body></html>');
      tab.document.close();
      return;
    }
    window.open(href, '_blank', 'noopener');
  }));
  app.querySelectorAll('[contenteditable="true"]').forEach(el=>el.addEventListener('keydown',ev=>{if(ev.key==='Enter'){ev.preventDefault();el.blur();}}));
}
(async function start(){let data=type==='documents'?baseDocuments():baseSymbols(); try{const local=localStorage.getItem(storageKey); if(local)data=normalize(JSON.parse(local));}catch(e){} try{if(authAvailable())await window.ThalorAuth.init(); if(authAvailable()&&window.ThalorAuth.state.configured){const online=await window.ThalorAuth.loadCharacter(slug,normalize(data)); if(online&&typeof online==='object')data=normalize(online); localStorage.setItem(storageKey,JSON.stringify(data));}}catch(e){console.warn('Archivio load:',e);} render(data,false);})();
})();
