(function(){
  'use strict';
  const app=document.getElementById('itemApp');
  if(!app) return;
  const inv=window.ThalorInventory;
  const esc=inv?inv.esc:(v)=>String(v??'');
  const params=new URLSearchParams(location.search||'');
  const id=String(params.get('id')||params.get('item')||'').trim();
  let state={db:null,item:null,busy:false};

  function isLocalPreview(){
    try{
      if(window.ThalorAuth?.isLocalPreview?.()) return true;
      const h=String(location.hostname||'').toLowerCase();
      const p=String(location.protocol||'').toLowerCase();
      return p==='file:'||h===''||h==='localhost'||h==='127.0.0.1'||h==='::1'||/^192\.168\./.test(h)||/^10\./.test(h)||/^172\.(1[6-9]|2\d|3[0-1])\./.test(h);
    }catch(e){return false;}
  }
  function rawOfflineMasterFlag(){
    if(!isLocalPreview()) return false;
    try{
      const q=new URLSearchParams(location.search||'');
      if(q.get('master')==='offline'||q.get('thalorMaster')==='1'){
        localStorage.setItem('thalor.offlineMaster','1');
        sessionStorage.setItem('thalor.offlineMaster','1');
        return true;
      }
      return localStorage.getItem('thalor.offlineMaster')==='1'||sessionStorage.getItem('thalor.offlineMaster')==='1';
    }catch(e){return false;}
  }
  function isMaster(){
    const auth=window.ThalorAuth;
    try{return !!(rawOfflineMasterFlag()||auth?.state?.localMaster||auth?.localMasterEnabled?.()||auth?.isMaster?.());}
    catch(e){return rawOfflineMasterFlag();}
  }
  function notify(msg,kind=''){
    const box=document.getElementById('itemStatus');
    if(box){box.textContent=msg||'';box.className='loot-status '+(kind||'');}
  }
  function resizeItemImageFile(file, maxSide=860, quality=0.70, maxChars=240000){
    return new Promise(resolve=>{
      if(!file || !String(file.type||'').startsWith('image/')){ resolve(''); return; }
      const reader=new FileReader();
      reader.onerror=()=>resolve('');
      reader.onload=()=>{
        const img=new Image();
        img.onerror=()=>resolve('');
        img.onload=()=>{
          try{
            let w=img.naturalWidth||img.width||maxSide;
            let h=img.naturalHeight||img.height||maxSide;
            let side=maxSide;
            let q=quality;
            const make=()=>{
              const scale=Math.min(1, side/Math.max(w,h));
              const cw=Math.max(1, Math.round(w*scale));
              const ch=Math.max(1, Math.round(h*scale));
              const canvas=document.createElement('canvas');
              canvas.width=cw; canvas.height=ch;
              const ctx=canvas.getContext('2d');
              ctx.drawImage(img,0,0,cw,ch);
              return canvas.toDataURL('image/jpeg', q);
            };
            let out=make();
            while(out.length>maxChars && q>0.42){ q-=0.08; out=make(); }
            while(out.length>maxChars && side>420){ side=Math.round(side*0.82); q=Math.max(0.42,q-0.04); out=make(); }
            resolve(out.length<=Math.max(maxChars*1.45,340000)?out:'');
          }catch(e){ resolve(''); }
        };
        img.src=String(reader.result||'');
      };
      reader.readAsDataURL(file);
    });
  }

  async function imageInput(){
    const file=document.getElementById('itemImageFile')?.files?.[0];
    if(!file) return '';
    const data=await resizeItemImageFile(file);
    if(!data) notify('Immagine troppo pesante o non leggibile: item salvato senza nuova immagine.', 'warn');
    return data;
  }
  function ensureItem(){
    state.db=inv.normalizeDatabase(state.db);
    if(!id) return null;
    if(!state.db.items[id]){
      state.db.items[id]=Object.assign({},inv.blankItem,{id,name:'Nuovo oggetto',page:inv.itemPageUrl(id),identified:false,identification:{status:'unidentified'}});
    }
    state.item=state.db.items[id];
    return state.item;
  }
  async function saveDb(){
    state.db.updatedAt=new Date().toISOString();
    try{ inv.writeLocal(state.db); }
    catch(e){
      if(String(e&&e.message||e).toLowerCase().includes('quota')){
        throw new Error('Spazio locale esaurito: immagine troppo pesante. Riprova con un file più piccolo.');
      }
      throw e;
    }
    if(!inv.shouldUseOnline?.()) return;
    await inv.saveOnline(state.db);
  }
  function render(){
    if(!inv){app.innerHTML='<article class="card"><h3>Modulo inventario non caricato</h3></article>';return;}
    if(!id){app.innerHTML='<article class="card"><h3>Oggetto non specificato</h3><p>Manca il parametro <code>?id=...</code>.</p></article>';return;}
    const item=ensureItem();
    const master=isMaster();
    const identified=item.identified===true||item.identification?.status==='identified';
    const img=item.image?`<img class="item-page-img" src="${esc(item.image)}" alt="${esc(item.name||'Oggetto')}">`:`<div class="item-page-placeholder">💎</div>`;
    const publicText=String(item.publicNotes||'').trim()||'Nessuna descrizione pubblica.';
    const fullText=String(item.description||'').trim()||'Descrizione completa ancora vuota.';
    app.innerHTML=`<article class="panel item-page-panel">
      <div class="item-page-hero">${img}<div><div class="loot-badges"><span class="loot-badge complex">Oggetto complesso</span><span class="loot-badge ${identified?'simple':'unique'}">${identified?'Identificato':'Non identificato'}</span>${item.unique?'<span class="loot-badge unique">Unico</span>':''}</div><h2>${esc(item.name||'Oggetto')}</h2><p class="section-note">Ref: <code>${esc(id)}</code></p><p>${esc(identified?fullText:publicText)}</p></div></div>
      ${master?`<div class="item-edit-panel"><h3>Modifica Master</h3><div class="loot-form-grid"><label>Nome item <input id="itemName" value="${esc(item.name||'')}"></label><label>Identificato <select id="itemIdentified"><option value="no" ${identified?'':'selected'}>No</option><option value="yes" ${identified?'selected':''}>Sì</option></select></label><label>Immagine <input id="itemImageFile" type="file" accept="image/*"></label><label class="loot-wide">Descrizione pubblica / non identificata <textarea id="itemPublicNotes">${esc(item.publicNotes||'')}</textarea></label><label class="loot-wide">Descrizione completa identificata <textarea id="itemDescription">${esc(item.description||'')}</textarea></label><label><span class="loot-inline-check"><input id="itemUnique" type="checkbox" ${item.unique?'checked':''}> Oggetto unico</span></label></div><div class="loot-form-actions"><button class="button" id="itemSave" type="button">Salva item</button><a class="button ghost-button" href="loot.html">Torna al Loot</a></div></div>`:`<p class="section-mini-note">Solo il Master può modificare questa pagina.</p>`}
      <p id="itemStatus" class="loot-status"></p>
    </article>`;
    bind();
  }
  function bind(){
    document.getElementById('itemSave')?.addEventListener('click',async()=>{
      if(state.busy) return;
      state.busy=true; notify('Salvataggio item…');
      try{
        const item=ensureItem();
        const img=await imageInput();
        const identified=document.getElementById('itemIdentified')?.value==='yes';
        item.name=document.getElementById('itemName')?.value?.trim()||item.name||'Oggetto';
        item.publicNotes=document.getElementById('itemPublicNotes')?.value||'';
        item.description=document.getElementById('itemDescription')?.value||'';
        item.unique=!!document.getElementById('itemUnique')?.checked;
        if(img) item.image=img;
        item.identified=identified;
        item.identification=Object.assign({},item.identification||{}, {status:identified?'identified':'unidentified'});
        item.page=inv.itemPageUrl(id);
        await saveDb();
        notify('Item salvato.', 'ok');
        render();
      }catch(e){notify('Salvataggio non riuscito: '+(e.message||e),'warn');}
      finally{state.busy=false;}
    });
  }
  async function start(){
    if(!inv){render();return;}
    try{ if(window.ThalorAuth?.init) await window.ThalorAuth.init(); }catch(e){}
    state.db=inv.readLocal();
    if(!isLocalPreview() && !inv.isOfflineMaster?.() && navigator.onLine!==false){
      try{const online=await inv.loadOnline(); if(online) state.db=inv.writeLocal(online);}catch(e){}
    }
    ensureItem();
    render();
  }
  start();
})();
