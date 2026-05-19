(function(){
  'use strict';
  const app = document.getElementById('lootApp');
  if(!app) return;
  const inv = window.ThalorInventory;
  const esc = inv ? inv.esc : (v)=>String(v ?? '');
  const moneyNames = { MP:'Monete di platino', MO:'Monete d’oro', MA:'Monete d’argento', MR:'Monete di rame' };
  let state = { db:null, source:'localStorage', characters:[], busy:false };

  function isLocalPreview(){
    try{
      if(window.ThalorAuth?.isLocalPreview?.()) return true;
      const h = String(location.hostname || '').toLowerCase();
      const p = String(location.protocol || '').toLowerCase();
      return p === 'file:' || h === '' || h === 'localhost' || h === '127.0.0.1' || h === '::1' ||
        /^192\.168\./.test(h) || /^10\./.test(h) || /^172\.(1[6-9]|2\d|3[0-1])\./.test(h);
    }catch(e){ return false; }
  }

  function rawOfflineMasterFlag(){
    if(!isLocalPreview()) return false;
    try{
      const params = new URLSearchParams(location.search || '');
      if(params.get('master') === 'offline' || params.get('thalorMaster') === '1'){
        localStorage.setItem('thalor.offlineMaster','1');
        sessionStorage.setItem('thalor.offlineMaster','1');
        return true;
      }
      if(params.get('master') === 'off' || params.get('thalorMaster') === '0'){
        localStorage.removeItem('thalor.offlineMaster');
        sessionStorage.removeItem('thalor.offlineMaster');
        return false;
      }
      return localStorage.getItem('thalor.offlineMaster') === '1' || sessionStorage.getItem('thalor.offlineMaster') === '1';
    }catch(e){ return false; }
  }

  function forceOfflineMasterState(){
    const auth = window.ThalorAuth;
    if(rawOfflineMasterFlag() && auth?.state){
      auth.state.localMaster = true;
      auth.state.ready = true;
    }
  }

  const isMaster = ()=>{
    const auth = window.ThalorAuth;
    try{
      forceOfflineMasterState();
      return !!(rawOfflineMasterFlag() || auth?.state?.localMaster || auth?.localMasterEnabled?.() || auth?.isMaster?.());
    }catch(e){ return rawOfflineMasterFlag(); }
  };
  const canTake = ()=>!!(window.ThalorAuth?.state?.user || isMaster() || isLocalPreview());
  function viewerLabel(){
    const auth = window.ThalorAuth;
    const st = auth?.state || {};
    try{ if(rawOfflineMasterFlag() || auth?.localMasterEnabled?.() || st.localMaster) return 'Master offline'; }catch(e){}
    if(isMaster() && !st.user) return 'Master';
    return st.user?.email || 'visitatore';
  }

  function notify(msg, kind=''){
    const box = document.getElementById('lootStatus');
    if(box){ box.textContent = msg || ''; box.className = 'loot-status ' + (kind||''); }
  }

  function itemTitle(item){
    const c = inv.lootCurrency(item);
    return c ? moneyNames[c] : (item.name || item.itemRef || 'Oggetto');
  }

  function remainingLabel(item){
    const c = inv.lootCurrency(item);
    return c ? `${item.qty || 0} ${c}` : `${item.qty || 0} disponibili`;
  }

  function canReturnEntry(t){
    if(isMaster()) return true;
    const primary = inv.primaryAuthCharacter();
    return !!(primary && String(t.targetSlug||'') === String(primary));
  }

  function takenSummary(item, si, ii){
    const taken = Array.isArray(item.taken) ? item.taken : [];
    if(!taken.length) return '<span class="loot-muted">Nessuno</span>';
    return taken.map((t,ti)=>{
      const who = t.actor || t.character || t.targetSlug || 'Sconosciuto';
      const qty = Number(t.qty)||1;
      const max = Math.max(1, qty);
      const controls = canReturnEntry(t) ? `<span class="loot-return-controls"><input class="loot-return-qty" type="number" min="1" max="${max}" value="${max}"><button type="button" class="button ghost-button loot-return-btn" data-section-index="${si}" data-item-index="${ii}" data-taken-index="${ti}">Restituisci</button></span>` : '';
      return `<div class="loot-taken-entry"><span class="loot-taken-chip">${esc(who)}: ${esc(qty)}</span>${controls}</div>`;
    }).join('');
  }

  function targetOptions(){
    const primary = inv.primaryAuthCharacter();
    const chars = state.characters.length ? state.characters : (primary ? [{slug:primary,name:primary}] : []);
    if(!isMaster()) return `<input type="hidden" class="loot-target" value="${esc(primary)}"><span class="loot-auth-target">${primary ? 'Il tuo personaggio: '+esc(primary) : 'Nessun personaggio assegnato all’account'}</span>`;
    return `<select class="loot-target"><option value="">Scegli personaggio…</option>${chars.map(c=>`<option value="${esc(c.slug)}">${esc(c.name || c.slug)}</option>`).join('')}</select>`;
  }

  function lootItemCard(sec, si, item, ii){
    const c = inv.lootCurrency(item);
    const img = item.image ? `<img class="loot-mini-img" src="${esc(item.image)}" alt="${esc(itemTitle(item))}" loading="lazy">` : `<div class="loot-mini-placeholder">${c?'¤':'💎'}</div>`;
    const disabled = state.busy || !canTake() || !item.qty || item.qty <= 0;
    const max = Math.max(0, Number(item.qty)||0);
    const typeBadge = c ? `<span class="loot-badge money">Valuta ${c}</span>` : (item.itemRef ? '<span class="loot-badge complex">Oggetto complesso</span>' : '<span class="loot-badge simple">Item semplice</span>');
    return `<article class="loot-take-card" data-section-index="${si}" data-item-index="${ii}">
      ${img}
      <div class="loot-take-body">
        <div class="loot-card-top"><h3>${esc(itemTitle(item))}</h3><div class="loot-badges">${typeBadge}${item.unique?'<span class="loot-badge unique">Unico</span>':''}</div></div>
        <p class="loot-item-note">${esc(item.publicNotes || item.notes || (c ? 'Valuta: viene aggiunta al riquadro denaro della scheda.' : 'Oggetto: entra subito nell’inventario normale del personaggio, nella sezione Loot.'))}</p>
        <div class="loot-remaining">${esc(remainingLabel(item))}</div>
        <details class="loot-taken-details"><summary>Chi ha preso questo loot</summary><div class="loot-taken-list">${takenSummary(item, si, ii)}</div></details>
        <div class="loot-actions-row">
          <div class="loot-qty-control"><button type="button" class="loot-minus" ${disabled?'disabled':''}>−</button><input class="loot-qty" type="number" min="1" max="${max}" value="${Math.min(1,max)||0}" ${disabled?'disabled':''}><button type="button" class="loot-plus" ${disabled?'disabled':''}>+</button></div>
          ${targetOptions()}
          <button type="button" class="button loot-take-btn" ${disabled?'disabled':''}>Prendi</button>
          ${isMaster()?`<button type="button" class="button ghost-button loot-remove-btn" title="Toglie l’oggetto dal loot condiviso, senza modificare inventari già assegnati">Togli dal loot</button>`:''}
        </div>
      </div>
    </article>`;
  }

  function sectionCard(sec, si){
    const items = (sec.items||[]).map((it, originalIndex)=>Object.assign({__lootOriginalIndex:originalIndex}, it)).filter(x=>!x.removed);
    return `<section class="panel loot-section" data-section-index="${si}">
      <div class="section-head"><div><h3>${esc(sec.name || 'Loot condiviso')}</h3><p class="section-mini-note">${esc(sec.notes || '')}</p></div>${isMaster()?`<button class="button ghost-button loot-delete-section" type="button">Elimina loot</button>`:''}</div>
      <div class="loot-take-list">${items.length ? items.map((it)=>lootItemCard(sec,si,it,it.__lootOriginalIndex)).join('') : '<div class="empty-row">Nessun oggetto disponibile in questo loot.</div>'}</div>
      ${(sec.log||[]).length?`<details class="loot-log"><summary>Storico prese</summary><ul>${sec.log.slice().reverse().map(l=>`<li>${esc(l.when || '')} — ${esc(l.actor || l.character || 'Qualcuno')} ${l.action==='returned'?'ha restituito':'ha preso'} ${esc(l.qty || 1)} × ${esc(l.itemName || 'Oggetto')} ${l.targetSlug?`→ ${esc(l.targetSlug)}`:''}</li>`).join('')}</ul></details>`:''}
    </section>`;
  }

  function offlineMasterPrompt(){
    if(isMaster() || !isLocalPreview()) return '';
    return `<div class="panel loot-master-panel"><h3>Master offline non attivo su questa pagina</h3><p class="section-note">Se stai lavorando in locale/offline, puoi riattivarlo qui senza login.</p><button class="button" id="lootEnableOfflineMaster" type="button">Attiva Master offline</button></div>`;
  }

  function masterForm(){
    if(!isMaster()) return '';
    return `<details class="panel loot-master-panel" open><summary><strong>+ Crea / aggiungi loot</strong></summary>
      <div class="loot-form-grid">
        <label>Titolo loot <input id="lootNewSectionName" placeholder="Relitto della Santa Velia"></label>
        <label>Note loot <input id="lootNewSectionNotes" placeholder="Tesoro trovato nella stiva..."></label>
        <label>Tipo <select id="lootNewKind"><option value="item">Oggetto</option><option value="money">Monete</option></select></label>
        <label>Nome oggetto <input id="lootNewName" placeholder="Pugnale d’Osso Nero"></label>
        <label>Valuta <select id="lootNewCurrency"><option value="MO">MO - oro</option><option value="MA">MA - argento</option><option value="MP">MP - platino</option><option value="MR">MR - rame</option></select></label>
        <label>Quantità <input id="lootNewQty" type="number" min="1" value="1"></label>
        <label>Ref oggetto complesso <input id="lootNewRef" placeholder="opzionale"></label>
        <label>Immagine <input id="lootNewImage" placeholder="assets/img/... opzionale"></label>
        <label class="loot-wide">Note pubbliche <input id="lootNewNotes" placeholder="Descrizione breve visibile ai giocatori"></label>
        <label><input id="lootNewUnique" type="checkbox"> Oggetto unico</label>
      </div>
      <div class="loot-form-actions"><button class="button" id="lootAddItem" type="button">Aggiungi al loot</button><button class="button ghost-button" id="lootNewSectionOnly" type="button">Crea solo contenitore</button></div>
    </details>`;
  }

  function render(){
    const db = state.db || inv.normalizeDatabase(null);
    const sections = db.sharedLoot?.sections || [];
    app.innerHTML = `<div class="loot-system-note panel"><h3>Loot condiviso</h3><p class="section-note">Le monete vengono aggiunte al denaro della scheda. Gli oggetti vengono aggiunti subito nell’inventario normale del personaggio, nella sezione “Loot”, e poi possono essere spostati nelle altre categorie. Togliere un oggetto dalla pagina non rimuove nulla dagli inventari; “Restituisci” invece rimette la quantità nel loot e la scala dalla scheda.</p><div class="loot-summary"><span>Fonte: ${esc(state.source)}</span><span>Loot attivi: ${sections.length}</span><span>Utente: ${esc(viewerLabel())}</span></div><div id="lootStatus" class="loot-status"></div></div>${offlineMasterPrompt()}${masterForm()}<div class="loot-shared-list">${sections.length ? sections.map(sectionCard).join('') : '<article class="card"><div class="icon">🎒</div><h3>Nessun loot condiviso</h3><p>Il master può creare un bottino da questa pagina.</p></article>'}</div>`;
    bind();
  }

  async function saveDb(msg='Loot salvato.'){
    state.db = inv.writeLocal(state.db);
    try{ await inv.saveOnline(state.db); notify(msg,'ok'); }
    catch(e){ notify('Salvato in locale, ma non online: '+(e.message||e),'warn'); }
  }

  function getOrCreateSection(){
    const db = state.db = inv.normalizeDatabase(state.db);
    db.sharedLoot.sections = db.sharedLoot.sections || [];
    let name = document.getElementById('lootNewSectionName')?.value?.trim() || '';
    let sec = name ? db.sharedLoot.sections.find(s=>String(s.name||'').trim().toLowerCase()===name.toLowerCase()) : null;
    if(!sec){
      sec = { id:inv.newId('loot'), name:name || 'Loot condiviso', notes:document.getElementById('lootNewSectionNotes')?.value?.trim() || '', items:[], log:[] };
      db.sharedLoot.sections.push(sec);
    }else if(document.getElementById('lootNewSectionNotes')?.value?.trim()){
      sec.notes = document.getElementById('lootNewSectionNotes').value.trim();
    }
    return sec;
  }

  function bind(){
    document.getElementById('lootEnableOfflineMaster')?.addEventListener('click', ()=>{
      try{
        if(window.ThalorAuth?.enableLocalMaster?.()) forceOfflineMasterState();
        else{
          localStorage.setItem('thalor.offlineMaster','1');
          sessionStorage.setItem('thalor.offlineMaster','1');
          forceOfflineMasterState();
        }
      }catch(e){}
      notify('Master offline attivato su questa pagina.', 'ok');
      render();
    });

    document.getElementById('lootAddItem')?.addEventListener('click', async ()=>{
      const sec = getOrCreateSection();
      const kind = document.getElementById('lootNewKind')?.value || 'item';
      const qty = Math.max(1, Number(document.getElementById('lootNewQty')?.value)||1);
      const currency = document.getElementById('lootNewCurrency')?.value || 'MO';
      const item = inv.normalizeLootItem({
        id:inv.newId('lootitem'),
        name: kind==='money' ? moneyNames[currency] : (document.getElementById('lootNewName')?.value?.trim() || 'Nuovo oggetto'),
        qty,
        currency: kind==='money' ? currency : '',
        itemRef: kind==='item' ? (document.getElementById('lootNewRef')?.value?.trim() || '') : '',
        image: document.getElementById('lootNewImage')?.value?.trim() || '',
        publicNotes: document.getElementById('lootNewNotes')?.value?.trim() || '',
        unique: !!document.getElementById('lootNewUnique')?.checked
      });
      sec.items.push(item);
      await saveDb('Loot aggiornato.');
      render();
    });
    document.getElementById('lootNewSectionOnly')?.addEventListener('click', async ()=>{ getOrCreateSection(); await saveDb('Contenitore loot creato.'); render(); });

    app.querySelectorAll('.loot-plus,.loot-minus').forEach(btn=>btn.addEventListener('click',()=>{
      const card = btn.closest('.loot-take-card'); const input = card.querySelector('.loot-qty');
      const max = Number(input.max)||999; let v = Number(input.value)||1;
      v += btn.classList.contains('loot-plus') ? 1 : -1;
      input.value = Math.max(1, Math.min(max, v));
    }));

    app.querySelectorAll('.loot-remove-btn').forEach(btn=>btn.addEventListener('click', async ()=>{
      const card = btn.closest('.loot-take-card'); const si = Number(card.dataset.sectionIndex); const ii = Number(card.dataset.itemIndex);
      const sec = state.db.sharedLoot.sections[si]; const item = sec?.items?.[ii];
      if(!item) return;
      if(!confirm('Togliere questo item dalla pagina Loot? Gli inventari dei personaggi NON verranno modificati.')) return;
      sec.items.splice(ii,1);
      sec.log = sec.log || [];
      sec.log.push({ when:new Date().toLocaleString('it-IT'), action:'removed-from-loot', actor:inv.currentActorLabel(), itemName:itemTitle(item), qty:item.qty||0 });
      await saveDb('Item tolto dal loot. Gli inventari non sono stati toccati.');
      render();
    }));

    app.querySelectorAll('.loot-delete-section').forEach(btn=>btn.addEventListener('click', async ()=>{
      const secEl = btn.closest('.loot-section'); const si = Number(secEl.dataset.sectionIndex);
      if(!confirm('Eliminare questo contenitore loot dalla pagina? Gli inventari già aggiornati non vengono toccati.')) return;
      state.db.sharedLoot.sections.splice(si,1);
      await saveDb('Loot eliminato dalla pagina.');
      render();
    }));

    app.querySelectorAll('.loot-take-btn').forEach(btn=>btn.addEventListener('click', async ()=>{
      const card = btn.closest('.loot-take-card'); const si = Number(card.dataset.sectionIndex); const ii = Number(card.dataset.itemIndex);
      const sec = state.db.sharedLoot.sections[si]; const item = sec?.items?.[ii];
      if(!item || state.busy) return;
      const qty = Math.max(1, Number(card.querySelector('.loot-qty')?.value)||1);
      const target = card.querySelector('.loot-target')?.value || inv.primaryAuthCharacter();
      if(!target){ notify('Nessun personaggio selezionato/assegnato all’account.', 'warn'); return; }
      if(qty > (Number(item.qty)||0)){ notify('Quantità non disponibile.', 'warn'); return; }
      state.busy = true; render(); notify('Aggiorno scheda e loot…');
      try{
        const base = await inv.loadSheet(target);
        if(!base) throw new Error('Scheda non trovata: '+target);
        const actor = isMaster() ? (state.characters.find(c=>c.slug===target)?.name || target) : inv.currentActorLabel();
        const opId = inv.queuePendingLoot(target, { action:'take', item:inv.normalizeLootItem(item), qty, actor, lootSectionId:sec.id||'', lootItemId:item.id||'' });
        const applied = inv.addStackToSheet(base, item, qty, actor, { opId });
        await inv.saveSheet(target, applied.sheet);
        item.qty = Math.max(0, (Number(item.qty)||0) - qty);
        item.taken = item.taken || [];
        item.taken.push({ when:new Date().toISOString(), actor:actor, targetSlug:target, qty, itemName:itemTitle(item), mode:applied.mode, currency:applied.currency||'' });
        sec.log = sec.log || [];
        sec.log.push({ when:new Date().toLocaleString('it-IT'), actor:actor, targetSlug:target, qty, itemName:itemTitle(item), mode:applied.mode, currency:applied.currency||'' });
        await saveDb('Loot preso e scheda aggiornata.');
      }catch(e){
        notify('Operazione non riuscita: '+(e.message||e), 'warn');
      }finally{
        state.busy = false; render();
      }
    }));

    app.querySelectorAll('.loot-return-btn').forEach(btn=>btn.addEventListener('click', async ()=>{
      const si = Number(btn.dataset.sectionIndex); const ii = Number(btn.dataset.itemIndex); const ti = Number(btn.dataset.takenIndex);
      const sec = state.db.sharedLoot.sections[si]; const item = sec?.items?.[ii]; const entry = item?.taken?.[ti];
      if(!item || !entry || state.busy) return;
      if(!canReturnEntry(entry)){ notify('Puoi restituire solo il loot preso dal tuo personaggio.', 'warn'); return; }
      const wrap = btn.closest('.loot-return-controls');
      const qty = Math.max(1, Math.min(Number(entry.qty)||1, Number(wrap?.querySelector('.loot-return-qty')?.value)||1));
      const target = entry.targetSlug || inv.primaryAuthCharacter();
      if(!target){ notify('Personaggio non trovato per la restituzione.', 'warn'); return; }
      state.busy = true; render(); notify('Restituisco loot e aggiorno scheda…');
      try{
        const base = await inv.loadSheet(target);
        const actor = isMaster() ? inv.currentActorLabel() : (entry.actor || inv.currentActorLabel());
        const opId = inv.queuePendingLoot(target, { action:'return', item:inv.normalizeLootItem(item), qty, actor, lootSectionId:sec.id||'', lootItemId:item.id||'' });
        const applied = inv.removeStackFromSheet(base, item, qty, actor, { opId });
        await inv.saveSheet(target, applied.sheet);
        item.qty = (Number(item.qty)||0) + qty;
        entry.qty = Math.max(0, (Number(entry.qty)||0) - qty);
        if(entry.qty <= 0) item.taken.splice(ti,1);
        sec.log = sec.log || [];
        sec.log.push({ when:new Date().toLocaleString('it-IT'), action:'returned', actor, targetSlug:target, qty, itemName:itemTitle(item), mode:applied.mode, currency:applied.currency||'' });
        await saveDb('Loot restituito e scheda aggiornata.');
      }catch(e){
        notify('Restituzione non riuscita: '+(e.message||e), 'warn');
      }finally{
        state.busy = false; render();
      }
    }));

  }

  async function loadCharacters(){
    let rows = [];
    try{ rows = await window.ThalorAuth?.listCharacterSheets?.({ timeoutMs:12000 }) || []; }catch(e){ rows = []; }
    const found = rows.map(r=>{
      const d = r.data || {};
      const slug = r.slug || d.meta?.slug || '';
      const name = d.identity?.name || d.name || slug;
      const isSheet = d.identity || d.inventorySections || d.money;
      return slug && isSheet && !String(slug).startsWith('__') ? {slug,name} : null;
    }).filter(Boolean);

    const bySlug = new Map(found.map(c=>[c.slug,c]));
    const staticSlugs = ['abraxas','arolf','igor','irven','ralph'];
    for(const slug of staticSlugs){
      if(bySlug.has(slug)) continue;
      try{
        const local = inv.readLocalSheet(slug);
        let data = local;
        if(!data){
          const res = await fetch('../assets/data/characters/'+slug+'.json', { cache:'no-store' });
          if(res.ok) data = await res.json();
        }
        const name = data?.identity?.name || data?.name || data?.meta?.slug || slug;
        bySlug.set(slug, { slug, name });
      }catch(e){
        bySlug.set(slug, { slug, name: slug });
      }
    }
    state.characters = Array.from(bySlug.values()).sort((a,b)=>String(a.name).localeCompare(String(b.name),'it'));
  }

  async function start(){
    if(!inv){ app.innerHTML = '<article class="card"><h3>Modulo inventario non caricato</h3></article>'; return; }
    try{
      forceOfflineMasterState();
      if(window.ThalorAuth?.init) await window.ThalorAuth.init();
      forceOfflineMasterState();
    }catch(e){ forceOfflineMasterState(); }
    state.db = inv.readLocal();
    state.source = 'localStorage';
    try{
      const online = await inv.loadOnline();
      if(online){ state.db = inv.writeLocal(online); state.source = 'Supabase'; }
    }catch(e){ console.warn('Loot globale: lettura online non riuscita', e); }
    try{ await loadCharacters(); }catch(e){ console.warn('Lista personaggi non disponibile', e); }
    render();
  }
  start();
})();
