(function(){
  'use strict';

  const SYSTEM_SLUG = '__inventory__';
  const LOOT_SYSTEM_SLUG = '__loot__';
  const STORAGE_KEY = 'thalor.inventory.v1';
  const LOOT_STORAGE_KEY = 'thalor.loot.v1';
  const CURRENCY_KEYS = ['MP','MO','MA','MR'];

  const esc = (v)=>String(v ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const safeArray = (v)=>Array.isArray(v) ? v : [];
  const isObject = (v)=>v && typeof v === 'object' && !Array.isArray(v);
  const slugify = (v)=>String(v||'oggetto').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,90) || 'oggetto';
  const norm = (v)=>String(v||'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');

  function newId(prefix='item'){
    return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,8);
  }

  const blankItem = {
    id:'', name:'Nuovo oggetto', type:'generic', rarity:'', value:'', weight:'', image:'', page:'',
    identified:false, unidentifiedName:'Oggetto non identificato', identification:{ status:'unidentified', dc:'', method:'', notes:'' },
    unique:false, uniqueId:'', description:'', publicNotes:'', gmNotes:'', tags:[], bonuses:[], history:[]
  };

  const blankDatabase = {
    schema:'thalor_inventory_db_v1', version:1, updatedAt:'', items:{}, sharedLoot:{ sections:[] }
  };

  const blankStack = {
    entryType:'simple', itemType:'simple', itemRef:'', instanceId:'', name:'Nuovo oggetto', qty:1,
    weight:'', equipped:'No', identified:'Sì', image:'', page:'', bonuses:[], notes:'', history:[]
  };

  const blankLootItem = {
    id:'', name:'Nuovo oggetto', qty:1, itemRef:'', entryType:'simple', itemType:'simple',
    currency:'', unique:false, image:'', notes:'', publicNotes:'', taken:[], removed:false
  };

  function currencyFrom(input){
    if(!input) return '';
    const raw = norm(input).replace(/[._-]+/g,' ');
    if(['mp','platino','monete platino','moneta platino','monete di platino','moneta di platino'].includes(raw)) return 'MP';
    if(['mo','oro','monete oro','moneta oro','monete d oro','moneta d oro','monete di oro','moneta di oro','monete d\'oro','moneta d\'oro'].includes(raw)) return 'MO';
    if(['ma','argento','monete argento','moneta argento','monete d argento','moneta d argento','monete di argento','moneta di argento'].includes(raw)) return 'MA';
    if(['mr','rame','monete rame','moneta rame','monete di rame','moneta di rame'].includes(raw)) return 'MR';
    return '';
  }
  function lootCurrency(item){
    const explicit = currencyFrom(item?.currency || item?.coin || item?.moneyType || item?.denomination);
    if(explicit) return explicit;
    if(String(item?.type||'').toLowerCase()==='currency') return currencyFrom(item?.name);
    return '';
  }
  function isCurrencyItem(item){ return !!lootCurrency(item); }

  function normalizeDatabase(input){
    const db = Object.assign({}, blankDatabase, isObject(input) ? input : {});
    db.items = isObject(db.items) ? db.items : {};
    const out = {};
    Object.entries(db.items).forEach(([key,val])=>{
      if(!isObject(val)) return;
      const id = String(val.id || key || newId()).trim();
      out[id] = Object.assign({}, blankItem, val, {
        id,
        identified: val.identified === true || val.identification?.status === 'identified',
        identification: Object.assign({}, blankItem.identification, isObject(val.identification) ? val.identification : {}),
        tags: safeArray(val.tags),
        bonuses: safeArray(val.bonuses),
        history: safeArray(val.history)
      });
    });
    db.items = out;
    db.sharedLoot = isObject(db.sharedLoot) ? db.sharedLoot : { sections:[] };
    db.sharedLoot.sections = safeArray(db.sharedLoot.sections).map(sec=>Object.assign({ id:newId('loot'), name:'Loot condiviso', notes:'', items:[], log:[] }, sec || {}, {
      id: sec?.id || newId('loot'),
      items: safeArray(sec?.items).map(normalizeLootItem),
      log: safeArray(sec?.log)
    }));
    return db;
  }



  const blankLootDocument = { schema:'thalor_loot_db_v1', version:1, updatedAt:'', sharedLoot:{ sections:[] } };

  function normalizeLootDocument(input){
    let src = isObject(input) ? input : {};
    // Retrocompatibilità: se arriva il vecchio __inventory__, usa sharedLoot da lì.
    if(!isObject(src.sharedLoot) && isObject(src.data) && isObject(src.data.sharedLoot)) src = src.data;
    const doc = Object.assign({}, blankLootDocument, src);
    doc.sharedLoot = isObject(doc.sharedLoot) ? doc.sharedLoot : { sections:[] };
    doc.sharedLoot.sections = safeArray(doc.sharedLoot.sections).map(sec=>Object.assign({ id:newId('loot'), name:'Loot condiviso', notes:'', items:[], log:[] }, sec || {}, {
      id: sec?.id || newId('loot'),
      items: safeArray(sec?.items).map(normalizeLootItem),
      log: safeArray(sec?.log)
    }));
    return doc;
  }

  function mergeLootIntoDatabase(db, lootDoc){
    const out = normalizeDatabase(db);
    const loot = normalizeLootDocument(lootDoc);
    out.sharedLoot = loot.sharedLoot;
    return out;
  }

  function extractLootDocument(db){
    const data = normalizeDatabase(db);
    return normalizeLootDocument({ updatedAt:data.updatedAt || '', sharedLoot:data.sharedLoot || { sections:[] } });
  }


  function stripLootDocumentForSave(lootDoc){
    const doc = normalizeLootDocument(lootDoc);
    doc.sharedLoot.sections = safeArray(doc.sharedLoot.sections).map(sec=>Object.assign({}, sec, {
      items: safeArray(sec.items).map(it=>{
        const row = Object.assign({}, it);
        delete row.databaseItem;
        delete row.fullDescription;
        if(row.itemRef){
          // Gli oggetti complessi usano immagine/descrizioni da __inventory__, non duplicarle in __loot__.
          row.image = '';
          row.description = '';
          row.gmNotes = '';
        }else if(typeof row.image === 'string' && /^data:image\//i.test(row.image) && row.image.length > 900000){
          row.image = '';
        }
        return normalizeLootItem(row);
      }),
      log: safeArray(sec.log)
    }));
    return doc;
  }

  function normalizeLootItem(input){
    if(typeof input === 'string') input = { name: input };
    const row = Object.assign({}, blankLootItem, isObject(input) ? input : {});
    row.id = String(row.id || newId('lootitem')).trim();
    if(row.ref && !row.itemRef) row.itemRef = row.ref;
    if(row.itemId && !row.itemRef) row.itemRef = row.itemId;
    if(row.itemRef) row.entryType = row.itemType = 'complex';
    row.itemType = row.entryType === 'complex' || row.itemType === 'complex' ? 'complex' : 'simple';
    row.entryType = row.itemType;
    row.qty = Math.max(0, Number(row.qty ?? row.quantity ?? 1) || 0);
    row.currency = lootCurrency(row);
    row.unique = !!row.unique || row.qty === 1 && row.itemType === 'complex';
    row.taken = safeArray(row.taken);
    return row;
  }

  function normalizeStack(input){
    if(typeof input === 'string') input = { name: input };
    const row = Object.assign({}, blankStack, isObject(input) ? input : {});
    if(row.ref && !row.itemRef) row.itemRef = row.ref;
    if(row.itemId && !row.itemRef) row.itemRef = row.itemId;
    if(row.kind === 'complex' && row.entryType === 'simple') row.entryType = 'complex';
    if(row.itemRef) row.entryType = row.itemType = 'complex';
    row.itemType = row.entryType === 'complex' || row.itemType === 'complex' ? 'complex' : 'simple';
    row.entryType = row.itemType;
    row.qty = Math.max(0, Number(row.qty ?? row.quantity ?? 1) || 0);
    row.identified = String(row.identified ?? 'Sì');
    row.bonuses = safeArray(row.bonuses);
    row.history = safeArray(row.history);
    if(!String(row.name||'').trim() && row.itemRef) row.name = '';
    return row;
  }

  function normalizeSheetInventory(sheet){
    const d = isObject(sheet) ? sheet : {};
    d.inventoryDatabase = normalizeDatabase(d.inventoryDatabase);
    d.inventorySections = safeArray(d.inventorySections);
    if(!d.inventorySections.length && Array.isArray(d.inventory) && d.inventory.length){
      d.inventorySections = [{ name:'Inventario', notes:'', items:d.inventory }];
    }
    d.inventorySections = d.inventorySections.map(sec=>Object.assign({ name:'Inventario', notes:'', items:[] }, sec || {}, {
      items: safeArray(sec?.items).map(normalizeStack)
    }));
    d.inventory = safeArray(d.inventory).map(normalizeStack);
    d.money = Object.assign({MP:0,MO:0,MA:0,MR:0}, isObject(d.money)?d.money:{});
    CURRENCY_KEYS.forEach(k=>{ d.money[k] = Number(d.money[k] || 0) || 0; });
    return d;
  }

  function itemPageUrl(ref){
    const id = String(ref || '').trim();
    if(!id) return '';
    return '../archivio/item.html?id=' + encodeURIComponent(id);
  }

  function itemIdentified(refItem, stack){
    const ref = isObject(refItem) ? refItem : null;
    if(ref) return ref.identified === true || ref.identification?.status === 'identified';
    return String(stack?.identified || '').toLowerCase().startsWith('s');
  }

  function effectiveItem(stack, db){
    const s = normalizeStack(stack);
    const database = normalizeDatabase(db);
    const ref = s.itemRef ? database.items[s.itemRef] : null;
    if(!ref) return s;
    const identified = itemIdentified(ref, s);
    const merged = Object.assign({}, ref, s, {
      displayName: identified ? (ref.name || s.name || 'Oggetto') : (ref.unidentifiedName || s.name || 'Oggetto non identificato'),
      name: s.name || ref.name || 'Oggetto',
      image: s.image || ref.image || '',
      page: s.page || ref.page || itemPageUrl(s.itemRef),
      weight: s.weight || ref.weight || '',
      notes: identified ? [ref.publicNotes || '', s.notes || ''].filter(Boolean).join('\n\n') : (ref.publicNotes || s.notes || ''),
      fullDescription: ref.description || '',
      bonuses: identified ? safeArray(ref.bonuses).concat(safeArray(s.bonuses)) : safeArray(s.bonuses),
      identified: identified ? 'Sì' : 'No'
    });
    return merged;
  }

  function readLocal(){
    try{ return normalizeDatabase(JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')); }
    catch(e){ return normalizeDatabase(null); }
  }

  function stripOnlineImagesForLocal(value){
    try{
      const copy = JSON.parse(JSON.stringify(value || {}));
      const walk = (node)=>{
        if(!node || typeof node !== 'object') return;
        if(Array.isArray(node)){ node.forEach(walk); return; }
        Object.keys(node).forEach(k=>{
          if(k === 'image' && typeof node[k] === 'string' && node[k].startsWith('data:image/')) node[k] = '';
          else walk(node[k]);
        });
      };
      walk(copy);
      return copy;
    }catch(e){ return value; }
  }

  function writeLocal(db){
    const data = normalizeDatabase(db);
    data.updatedAt = new Date().toISOString();
    try{
      const localCopy = stripOnlineImagesForLocal(data);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(localCopy));
    }catch(e){
      console.warn('Inventario globale: cache locale saltata (probabile quota localStorage). I dati online restano usabili.', e);
    }
    return data;
  }



  function readLocalLoot(){
    try{
      const raw = localStorage.getItem(LOOT_STORAGE_KEY);
      if(raw) return normalizeLootDocument(JSON.parse(raw));
    }catch(e){}
    // Migrazione compatibile: vecchio loot dentro thalor.inventory.v1
    try{ return extractLootDocument(readLocal()); }catch(e){ return normalizeLootDocument(null); }
  }

  function writeLocalLoot(lootDoc){
    const data = stripLootDocumentForSave(lootDoc);
    data.updatedAt = new Date().toISOString();
    try{ localStorage.setItem(LOOT_STORAGE_KEY, JSON.stringify(data)); }
    catch(e){ console.warn('Loot globale: cache locale non scritta.', e); }
    return data;
  }

  async function loadOnline(options={}){
    try{
      if(!window.ThalorAuth || !window.ThalorAuth.loadCharacter) return null;
      const raw = await window.ThalorAuth.loadCharacter(SYSTEM_SLUG, null, Object.assign({ publicRead:true, skipInit:true, timeoutMs:15000 }, options));
      if(!raw) return null;
      return normalizeDatabase(raw);
    }catch(e){ return null; }
  }

  async function saveOnline(db){
    const data = normalizeDatabase(db);
    // Da ora __inventory__ è solo compendio oggetti: il loot condiviso vive in __loot__.
    data.sharedLoot = { sections:[] };
    data.updatedAt = new Date().toISOString();
    try{
      if(window.ThalorAuth && window.ThalorAuth.saveCharacter){
        await window.ThalorAuth.saveCharacter(SYSTEM_SLUG, data, { timeoutMs:20000 });
      }
      writeLocal(data);
    }catch(e){ console.warn('Inventario globale: salvataggio online non riuscito', e); throw e; }
    return data;
  }


  async function loadLootOnline(options={}){
    try{
      if(!window.ThalorAuth || !window.ThalorAuth.loadCharacter) return null;
      const raw = await window.ThalorAuth.loadCharacter(LOOT_SYSTEM_SLUG, null, Object.assign({ publicRead:true, skipInit:true, timeoutMs:15000 }, options));
      if(raw) return normalizeLootDocument(raw);
      // Migrazione: se __loot__ non esiste ancora, leggi il vecchio sharedLoot da __inventory__.
      const old = await loadOnline(options);
      if(old && Array.isArray(old.sharedLoot?.sections)) return extractLootDocument(old);
      return null;
    }catch(e){ return null; }
  }

  async function saveLootOnline(lootDoc){
    const data = stripLootDocumentForSave(lootDoc);
    data.updatedAt = new Date().toISOString();
    try{
      if(window.ThalorAuth && window.ThalorAuth.saveCharacter){
        await window.ThalorAuth.saveCharacter(LOOT_SYSTEM_SLUG, data, { timeoutMs:20000 });
      }
      writeLocalLoot(data);
    }catch(e){ console.warn('Loot globale: salvataggio online non riuscito', e); throw e; }
    return data;
  }


  async function fetchStaticSheet(slug){
    const s = String(slug||'').trim();
    if(!s) return null;
    const candidates = [
      '../assets/data/characters/' + encodeURIComponent(s) + '.json',
      './assets/data/characters/' + encodeURIComponent(s) + '.json',
      'assets/data/characters/' + encodeURIComponent(s) + '.json'
    ];
    for(const url of candidates){
      try{
        const res = await fetch(url, { cache:'no-store' });
        if(res && res.ok){
          const data = await res.json();
          if(data && typeof data === 'object') return data;
        }
      }catch(e){}
    }
    return null;
  }

  function hasRealSheetIdentity(sheet){
    return !!(sheet && typeof sheet === 'object' && sheet.identity && (sheet.identity.name || sheet.meta || sheet.combat || sheet.abilities));
  }

  function mergeSheetKeepingLootAndMoney(base, local){
    const out = Object.assign({}, base || {});
    const loc = local && typeof local === 'object' ? local : {};
    Object.keys(loc).forEach(k=>{
      if(['inventorySections','inventory','inventoryDatabase','money'].includes(k)) return;
      if(out[k] === undefined) out[k] = loc[k];
    });
    out.inventorySections = safeArray(loc.inventorySections).length ? loc.inventorySections : safeArray(out.inventorySections);
    out.inventory = safeArray(loc.inventory).length ? loc.inventory : safeArray(out.inventory);
    out.inventoryDatabase = loc.inventoryDatabase || out.inventoryDatabase;
    out.money = Object.assign({}, out.money || {}, loc.money || {});
    return out;
  }


  function sheetStorageKey(slug){ return 'thalor.sheet.' + String(slug||'').trim() + '.v5'; }
  function sheetStorageKeys(slug){
    const s = String(slug||'').trim();
    return ['v5','v4','v3','v2','v1'].map(v=>'thalor.sheet.' + s + '.' + v);
  }

  function readLocalSheet(slug){
    for(const key of sheetStorageKeys(slug)){
      try{
        const raw = localStorage.getItem(key);
        if(raw) return JSON.parse(raw);
      }catch(e){}
    }
    return null;
  }

  function stripHeavyInventoryPayload(value){
    if(Array.isArray(value)) return value.map(stripHeavyInventoryPayload);
    if(!isObject(value)) return value;
    const out = {};
    Object.entries(value).forEach(([key,val])=>{
      const k = String(key || '');
      if(k === 'databaseItem' || k === 'inventoryDatabase' || k === 'fullDescription') return;
      if((k === 'image' || k === 'img' || k === 'imageData' || k === 'dataUrl') && typeof val === 'string' && /^data:image\//i.test(val)) return;
      out[key] = stripHeavyInventoryPayload(val);
    });
    return out;
  }

  function stripSheetForSave(sheet){
    const data = normalizeSheetInventory(stripHeavyInventoryPayload(sheet || {}));
    data.inventoryDatabase = Object.assign({}, blankDatabase, { items:{}, sharedLoot:{ sections:[] } });
    data.inventorySections = safeArray(data.inventorySections).map(sec=>Object.assign({}, sec, {
      items: safeArray(sec.items).map(it=>{
        const row = stripHeavyInventoryPayload(it || {});
        delete row.databaseItem;
        delete row.fullDescription;
        if(typeof row.image === 'string' && /^data:image\//i.test(row.image)) row.image = '';
        if(row.itemRef){
          row.entryType = row.itemType = 'complex';
          row.page = row.page || itemPageUrl(row.itemRef);
        }
        return normalizeStack(row);
      })
    }));
    data.inventory = safeArray(data.inventory).map(it=>normalizeStack(stripHeavyInventoryPayload(it || {})));
    return data;
  }

  function writeLocalSheet(slug, sheet){
    const data = stripSheetForSave(sheet || {});
    try{
      localStorage.setItem(sheetStorageKey(slug), JSON.stringify(data));
      ['v4','v3','v2','v1'].forEach(v=>localStorage.removeItem('thalor.sheet.' + String(slug||'').trim() + '.' + v));
    }catch(e){
      console.warn('Impossibile salvare la scheda in cache locale:', slug, e);
    }
    return data;
  }

  async function loadSheet(slug){
    const local = readLocalSheet(slug);
    let staticSheet = null;
    try{ staticSheet = await fetchStaticSheet(slug); }catch(e){}
    try{
      if(shouldUseOnline() && window.ThalorAuth && window.ThalorAuth.loadCharacter){
        const online = await window.ThalorAuth.loadCharacter(slug, local || staticSheet, { publicRead:true, skipInit:true, timeoutMs:15000 });
        if(online) return normalizeSheetInventory(online);
      }
    }catch(e){}
    if(local && staticSheet && !hasRealSheetIdentity(local)) return normalizeSheetInventory(mergeSheetKeepingLootAndMoney(staticSheet, local));
    if(local) return normalizeSheetInventory(local);
    if(staticSheet) return normalizeSheetInventory(staticSheet);
    return normalizeSheetInventory({});
  }

  async function saveSheet(slug, sheet){
    const data = writeLocalSheet(slug, sheet);
    if(!shouldUseOnline()) return data;
    try{
      if(window.ThalorAuth && window.ThalorAuth.saveCharacter){
        await window.ThalorAuth.saveCharacter(slug, data, { timeoutMs:20000 });
      }
    }catch(e){
      console.warn('Scheda salvata in locale, ma non online:', slug, e);
      data.__lootOnlineSaveError = e && (e.message || String(e));
    }
    return data;
  }

  function primaryAuthCharacter(){
    const auth = window.ThalorAuth;
    const st = auth?.state || {};
    const access = safeArray(st.access).filter(a=>a && a.can_edit && a.character_slug && !String(a.character_slug).startsWith('__'));
    if(access.length === 1) return String(access[0].character_slug);
    return '';
  }

  function currentActorLabel(){
    const auth = window.ThalorAuth;
    const st = auth?.state || {};
    try{
      if(auth?.localMasterEnabled?.() || st.localMaster) return 'Master offline';
    }catch(e){}
    if(auth?.isMaster?.() && !st.user) return 'Master';
    return st.profile?.display_name || st.user?.user_metadata?.full_name || st.user?.email || 'Giocatore';
  }

  function isLocalPreview(){
    try{
      if(window.ThalorAuth?.isLocalPreview?.()) return true;
      const h = String(location.hostname || '').toLowerCase();
      const p = String(location.protocol || '').toLowerCase();
      return p === 'file:' || h === '' || h === 'localhost' || h === '127.0.0.1' || h === '::1' ||
        /^192\.168\./.test(h) || /^10\./.test(h) || /^172\.(1[6-9]|2\d|3[0-1])\./.test(h);
    }catch(e){ return false; }
  }

  function isOfflineMaster(){
    try{
      return !!(window.ThalorAuth?.state?.localMaster || window.ThalorAuth?.localMasterEnabled?.() ||
        localStorage.getItem('thalor.offlineMaster') === '1' || sessionStorage.getItem('thalor.offlineMaster') === '1');
    }catch(e){ return false; }
  }

  function shouldUseOnline(){
    return !isLocalPreview() && !isOfflineMaster() && navigator.onLine !== false;
  }

  function lootPendingKey(slug){ return 'thalor.loot.pending.' + String(slug||'').trim(); }
  function lootAppliedKey(op){ return String(op || '').trim(); }
  function readPendingLoot(slug){
    try{
      const arr = JSON.parse(localStorage.getItem(lootPendingKey(slug)) || '[]');
      return Array.isArray(arr) ? arr : [];
    }catch(e){ return []; }
  }
  function writePendingLoot(slug, arr){
    try{ localStorage.setItem(lootPendingKey(slug), JSON.stringify(safeArray(arr))); }catch(e){}
  }
  function queuePendingLoot(slug, entry){
    const opId = lootAppliedKey(entry && entry.opId) || newId('lootop');
    const arr = readPendingLoot(slug).filter(x=>lootAppliedKey(x && x.opId) !== opId);
    arr.push(Object.assign({}, entry || {}, { opId, queuedAt:new Date().toISOString() }));
    writePendingLoot(slug, arr);
    return opId;
  }
  function markLootApplied(sheet, opId){
    const id = lootAppliedKey(opId);
    if(!id) return sheet;
    const d = sheet && typeof sheet === 'object' ? sheet : {};
    d.__lootAppliedIds = safeArray(d.__lootAppliedIds);
    if(!d.__lootAppliedIds.includes(id)) d.__lootAppliedIds.push(id);
    d.__lootUpdatedAt = new Date().toISOString();
    d.__thalorLocalUpdatedAt = d.__lootUpdatedAt;
    return d;
  }
  function isLootApplied(sheet, opId){
    const id = lootAppliedKey(opId);
    return !!(id && sheet && Array.isArray(sheet.__lootAppliedIds) && sheet.__lootAppliedIds.includes(id));
  }
  function consumePendingLootUpdates(slug, sheet){
    let d = normalizeSheetInventory(sheet || {});
    const pending = readPendingLoot(slug);
    if(!pending.length) return d;
    const keep = [];
    pending.forEach(entry=>{
      const opId = lootAppliedKey(entry && entry.opId);
      if(!opId) return;
      if(isLootApplied(d, opId)) return;
      try{
        const item = entry.item || {};
        const qty = Math.max(1, Number(entry.qty)||1);
        const actor = entry.actor || 'Loot offline';
        if(entry.action === 'return') d = removeStackFromSheet(d, item, qty, actor, { opId }).sheet;
        else d = addStackToSheet(d, item, qty, actor, { opId }).sheet;
      }catch(e){ keep.push(entry); }
    });
    writePendingLoot(slug, keep);
    if(keep.length !== pending.length) writeLocalSheet(slug, d);
    return d;
  }

  function normalizeDatabaseItemFromLoot(item){
    const ref = String(item?.itemRef || item?.itemId || item?.ref || '').trim();
    if(!ref) return null;
    const identified = item?.identified === true || item?.identification?.status === 'identified' || String(item?.identified||'').toLowerCase().startsWith('s');
    return Object.assign({}, blankItem, item.databaseItem || {}, {
      id: ref,
      name: item.name || item.databaseItem?.name || 'Oggetto',
      image: '',
      page: item.page || item.databaseItem?.page || itemPageUrl(ref),
      publicNotes: item.publicNotes || item.notes || item.databaseItem?.publicNotes || '',
      description: item.description || item.databaseItem?.description || '',
      unique: !!item.unique,
      identified,
      identification: Object.assign({}, blankItem.identification, item.identification || {}, { status: identified ? 'identified' : 'unidentified' })
    });
  }

  function mergeDatabaseItemIntoSheet(sheet, item){
    const d = normalizeSheetInventory(sheet || {});
    const dbItem = normalizeDatabaseItemFromLoot(item);
    if(!dbItem) return d;
    d.inventoryDatabase = normalizeDatabase(d.inventoryDatabase);
    const old = d.inventoryDatabase.items[dbItem.id] || {};
    d.inventoryDatabase.items[dbItem.id] = Object.assign({}, old, dbItem, {
      history: safeArray(old.history).concat(safeArray(dbItem.history))
    });
    return d;
  }

  function addStackToSheet(sheet, item, qty, actor, meta={}){
    let d = mergeDatabaseItemIntoSheet(sheet || {}, item);
    if(meta && meta.opId && isLootApplied(d, meta.opId)) return { sheet:d, mode:'already-applied' };
    const n = Math.max(1, Number(qty)||1);
    const currency = lootCurrency(item);
    if(currency){
      d.money[currency] = (Number(d.money[currency]) || 0) + n;
      markLootApplied(d, meta && meta.opId);
      return { sheet:d, mode:'money', currency };
    }
    const ref = String(item.itemRef||'').trim();
    let section = d.inventorySections.find(s=>String(s.name||'').toLowerCase()==='loot');
    if(!section){ section = { name:'Loot', notes:'Oggetti presi dalla pagina Loot. Puoi spostarli in qualsiasi categoria dell’inventario in modalità modifica.', items:[] }; d.inventorySections.unshift(section); }
    const match = section.items.find(x=>{
      if(ref) return String(x.itemRef||'') === ref;
      return !x.itemRef && norm(x.name) === norm(item.name);
    });
    if(match && !item.unique){
      match.qty = (Number(match.qty)||0) + n;
      match.history = safeArray(match.history);
      match.history.push({ when:new Date().toISOString(), action:'loot-add', actor, qty:n });
    }else{
      section.items.unshift(normalizeStack({
        entryType: ref ? 'complex' : 'simple', itemType: ref ? 'complex' : 'simple', itemRef: ref,
        sourceLootItemId: item.id || '', sourceLootName: item.name || '',
        name: item.name || item.itemRef || 'Oggetto', qty:n, image:ref ? '' : (item.image||''), page:item.page || (ref ? itemPageUrl(ref) : ''), notes:item.notes||item.publicNotes||'',
        identified: ref ? ((item.identified === true || item.identification?.status === 'identified') ? 'Sì' : 'No') : 'Sì',
        instanceId: item.unique ? newId('instance') : '', history:[{ when:new Date().toISOString(), action:'loot-add', actor, qty:n }]
      }));
    }
    markLootApplied(d, meta && meta.opId);
    return { sheet:d, mode:'item' };
  }

  function removeStackFromSheet(sheet, item, qty, actor, meta={}){
    const d = normalizeSheetInventory(sheet || {});
    if(meta && meta.opId && isLootApplied(d, meta.opId)) return { sheet:d, mode:'already-applied', removed:0 };
    const n = Math.max(1, Number(qty)||1);
    const currency = lootCurrency(item);
    if(currency){
      d.money[currency] = Math.max(0, (Number(d.money[currency]) || 0) - n);
      markLootApplied(d, meta && meta.opId);
      return { sheet:d, mode:'money', currency, removed:n };
    }
    const ref = String(item.itemRef||'').trim();
    let left = n;
    for(const section of d.inventorySections){
      section.items = safeArray(section.items);
      for(let i=section.items.length-1;i>=0 && left>0;i--){
        const x = section.items[i];
        const same = ref ? String(x.itemRef||'') === ref : (!x.itemRef && norm(x.name) === norm(item.name));
        if(!same) continue;
        const have = Math.max(0, Number(x.qty)||0);
        const take = Math.min(have || 1, left);
        if(have <= take) section.items.splice(i,1);
        else { x.qty = have - take; x.history = safeArray(x.history); x.history.push({ when:new Date().toISOString(), action:'loot-return', actor, qty:take }); }
        left -= take;
      }
    }
    markLootApplied(d, meta && meta.opId);
    return { sheet:d, mode:'item', removed:n-left };
  }

  window.ThalorInventory = {
    SYSTEM_SLUG, LOOT_SYSTEM_SLUG, STORAGE_KEY, LOOT_STORAGE_KEY, CURRENCY_KEYS, blankItem, blankStack, blankLootItem,
    esc, slugify, newId, norm,
    normalizeDatabase, normalizeLootDocument, mergeLootIntoDatabase, extractLootDocument, stripLootDocumentForSave, normalizeStack, normalizeLootItem, normalizeSheetInventory, stripSheetForSave, effectiveItem, itemPageUrl, itemIdentified, normalizeDatabaseItemFromLoot, mergeDatabaseItemIntoSheet,
    currencyFrom, lootCurrency, isCurrencyItem,
    readLocal, writeLocal, readLocalLoot, writeLocalLoot, loadOnline, saveOnline, loadLootOnline, saveLootOnline,
    sheetStorageKey, sheetStorageKeys, readLocalSheet, writeLocalSheet, loadSheet, saveSheet,
    fetchStaticSheet, primaryAuthCharacter, currentActorLabel, isLocalPreview, isOfflineMaster, shouldUseOnline, addStackToSheet, removeStackFromSheet,
    lootPendingKey, readPendingLoot, writePendingLoot, queuePendingLoot, consumePendingLootUpdates, isLootApplied
  };
})();
