(function(){
  'use strict';

  const app = document.getElementById('thalorExportApp');
  if(!app) return;

  const ROOT = location.pathname.includes('/archivio/') ? '../' : '';
  const SYSTEM_SLUGS = {
    personaggi: '__personaggi__',
    luoghi: '__places__',
    diario: 'diario',
    xp: 'xp',
    documenti: 'archive-documents',
    simboli: 'archive-symbols'
  };
  const LOCAL_KEYS = {
    personaggi: 'thalor.personaggi.registry.v2',
    luoghi: 'thalor.places.v1',
    diario: 'thalor.diary.v1',
    xp: 'thalor.xp.v1',
    documenti: 'thalor.archive.documents.v1',
    simboli: 'thalor.archive.symbols.v1'
  };
  const PLAYABLE_SLUGS = new Set(['abraxas','igor','ralph','arolf','irven']);
  const STATIC_JSON = [
    'assets/data/places.json',
    'assets/data/xp.json',
    'assets/data/characters/abraxas.json',
    'assets/data/characters/arolf.json',
    'assets/data/characters/igor.json',
    'assets/data/characters/irven.json',
    'assets/data/characters/ralph.json',
    'assets/data/compendium/feats.json',
    'assets/data/compendium/features.json',
    'assets/data/compendium/spells.json'
  ];

  let currentArchive = null;

  const esc = (v)=>String(v ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const nowIso = ()=>new Date().toISOString();
  const safeParse = (raw, fallback=null)=>{ try{ return raw ? JSON.parse(raw) : fallback; }catch(e){ return fallback; } };
  const readLocal = (key)=>{ try{ return safeParse(localStorage.getItem(key), null); }catch(e){ return null; } };
  const slugify = (v)=>String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,80) || 'senza-slug';
  const isSystemSlug = (slug)=>Object.values(SYSTEM_SLUGS).includes(String(slug||'')) || String(slug||'').startsWith('__');

  function log(message, detail){
    const box = document.getElementById('exportLog');
    if(!box) return;
    const row = document.createElement('div');
    row.className = 'export-log-row';
    row.innerHTML = `<span>${esc(new Date().toLocaleTimeString('it-IT'))}</span><strong>${esc(message)}</strong>${detail?`<small>${esc(detail)}</small>`:''}`;
    box.prepend(row);
  }

  async function fetchJson(path){
    try{
      const normalized = String(path||'').replace(/^\/+/, '');
      const prefix = /^(assets\/|archivio\/|diario\/|luoghi\/|personaggi\/)/.test(normalized) ? ROOT : '';
      const res = await fetch(prefix + normalized + '?_ts=' + Date.now(), { cache:'no-store' });
      if(!res.ok) return null;
      return await res.json();
    }catch(e){ return null; }
  }

  async function fetchFirstJson(paths){
    for(const path of paths){
      const data = await fetchJson(path);
      if(data) return data;
    }
    return null;
  }

  function normalizePlacesData(primary, staticPlaces){
    const hasPlaces = (v)=>v && Array.isArray(v.places) && v.places.length;
    let base = hasPlaces(staticPlaces) ? JSON.parse(JSON.stringify(staticPlaces)) : { version: 1, places: [] };
    if(hasPlaces(primary)){
      const map = new Map(base.places.map(p=>[String(p.slug||''), p]));
      primary.places.forEach(p=>{
        const slug = String(p.slug||'').trim();
        if(!slug) return;
        const current = map.get(slug) || {};
        map.set(slug, Object.assign({}, current, p));
      });
      base = Object.assign({}, base, primary, { places: Array.from(map.values()) });
    }
    return base;
  }


  async function loadOnlineSlug(slug){
    try{
      if(!window.ThalorAuth || !window.ThalorAuth.loadCharacter) return null;
      return await window.ThalorAuth.loadCharacter(slug, null, { publicRead:true, skipInit:true, timeoutMs:15000 });
    }catch(e){
      log('Lettura online non riuscita', slug + ': ' + (e.message || e));
      return null;
    }
  }

  async function loadAllOnlineRows(){
    try{
      if(!window.ThalorAuth || !window.ThalorAuth.listCharacterSheets) return [];
      const rows = await window.ThalorAuth.listCharacterSheets({ timeoutMs:20000 });
      return Array.isArray(rows) ? rows : [];
    }catch(e){
      log('Lista Supabase non disponibile', e.message || String(e));
      return [];
    }
  }

  function normalizeRegistry(registry){
    if(!registry || typeof registry !== 'object') return { items:[] };
    const items = Array.isArray(registry.items) ? registry.items : (Array.isArray(registry.personaggi) ? registry.personaggi : []);
    return Object.assign({}, registry, { items });
  }

  function normalizeSheets(rows, registry){
    const bySlug = new Map();
    rows.forEach(row=>{
      const slug = String(row.slug || row.id || '').trim();
      if(!slug || isSystemSlug(slug)) return;
      bySlug.set(slug, row.data ?? row);
    });

    const reg = normalizeRegistry(registry).items;
    reg.forEach(item=>{
      const slug = String(item.slug || '').trim();
      if(!slug || bySlug.has(slug)) return;
      const local = readLocal('thalor.sheet.' + slug + '.v5');
      if(local) bySlug.set(slug, local);
    });

    return [...bySlug.entries()].map(([slug,data])=>({ slug, data }));
  }

  function normalizeCharacterType(item, slug){
    const raw = String(item?.type || item?.kind || item?.category || item?.tag || '').toLowerCase();
    if(PLAYABLE_SLUGS.has(slug)) return 'pg';
    if(raw === 'pg' || raw.includes('giocante') || raw.includes('player')) return 'pg';
    if(raw === 'png' || raw.includes('non giocante') || raw.includes('npc')) return 'png';
    return 'png';
  }

  function simplifyCharacters(registry, sheets){
    const items = normalizeRegistry(registry).items;
    const sheetMap = new Map((sheets||[]).map(s=>[s.slug, s.data]));
    return items.map(item=>{
      const slug = String(item.slug || slugify(item.name || '')).trim();
      const sheet = sheetMap.get(slug) || null;
      const identity = sheet && typeof sheet === 'object' ? (sheet.identity || sheet.meta || {}) : {};
      const type = normalizeCharacterType(item, slug);
      return {
        slug,
        type,
        typeLabel: type === 'pg' ? 'Personaggio giocante' : 'PNG',
        name: item.name || identity.name || slug,
        playerName: item.playerName || item.player || identity.player || '',
        shortDescription: item.desc || '',
        href: item.href || '',
        sheetHref: item.sheet || '',
        image: item.img || '',
        detail: {
          longHtml: item.longHtml || '',
          eventsHtml: item.eventsHtml || ''
        },
        sheet
      };
    });
  }

  function groupSupabaseRows(rows){
    const out = {};
    rows.forEach(r=>{
      const slug = String(r.slug || '').trim();
      if(!slug) return;
      out[slug] = r.data ?? null;
    });
    return out;
  }

  async function collectArchive(){
    log('Avvio esportazione', 'Leggo dati online, cache locale e JSON statici.');
    if(window.ThalorAuth && window.ThalorAuth.init){
      try{ await window.ThalorAuth.init(); }catch(e){ log('Auth non inizializzata', e.message || String(e)); }
    }

    const onlineRows = await loadAllOnlineRows();
    if(onlineRows.length) log('Righe Supabase lette', String(onlineRows.length));
    else log('Righe Supabase non disponibili', 'Uso fallback locali/statici dove possibile.');

    const onlineBySlug = groupSupabaseRows(onlineRows);
    const loadPriority = async (name, slug, localKey)=>{
      if(Object.prototype.hasOwnProperty.call(onlineBySlug, slug)) return { source:'supabase-list', data:onlineBySlug[slug] };
      const direct = await loadOnlineSlug(slug);
      if(direct && typeof direct === 'object') return { source:'supabase-direct', data:direct };
      const local = readLocal(localKey);
      if(local && typeof local === 'object') return { source:'localStorage', data:local };
      return { source:'missing', data:null };
    };

    const [registryRes, placesRes, diaryRes, xpRes, documentsRes, symbolsRes] = await Promise.all([
      loadPriority('personaggi', SYSTEM_SLUGS.personaggi, LOCAL_KEYS.personaggi),
      loadPriority('luoghi', SYSTEM_SLUGS.luoghi, LOCAL_KEYS.luoghi),
      loadPriority('diario', SYSTEM_SLUGS.diario, LOCAL_KEYS.diario),
      loadPriority('xp', SYSTEM_SLUGS.xp, LOCAL_KEYS.xp),
      loadPriority('documenti', SYSTEM_SLUGS.documenti, LOCAL_KEYS.documenti),
      loadPriority('simboli', SYSTEM_SLUGS.simboli, LOCAL_KEYS.simboli)
    ]);

    const staticData = {};
    for(const path of STATIC_JSON){
      const data = await fetchJson(path);
      if(data) staticData[path] = data;
    }
    log('JSON statici letti', Object.keys(staticData).length + ' file');

    const registry = registryRes.data || { items:[] };
    let staticPlaces = staticData['assets/data/places.json'] || null;
    if(!staticPlaces){
      staticPlaces = await fetchFirstJson(['assets/data/places.json','../assets/data/places.json','/assets/data/places.json']);
      if(staticPlaces) staticData['assets/data/places.json'] = staticPlaces;
    }
    const placesData = normalizePlacesData(placesRes.data, staticPlaces);
    const sheets = normalizeSheets(onlineRows, registry);
    const characters = simplifyCharacters(registry, sheets);
    const playableCharacters = characters.filter(c=>c.type === 'pg');
    const nonPlayerCharacters = characters.filter(c=>c.type !== 'pg');

    const unknownRows = onlineRows
      .filter(r=>r && r.slug && !isSystemSlug(r.slug) && !sheets.find(s=>s.slug===r.slug))
      .map(r=>({ slug:r.slug, data:r.data }));

    const archive = {
      schema: 'thalor_archive_export_v1',
      exportedAt: nowIso(),
      site: {
        title: 'Thalor',
        origin: location.origin || '',
        path: location.pathname || '',
        exportPage: location.href || ''
      },
      sources: {
        personaggi: registryRes.source,
        luoghi: (placesRes.data && Array.isArray(placesRes.data.places) && placesRes.data.places.length) ? placesRes.source + '+static-json-merge' : 'static-json-fallback',
        diario: diaryRes.source,
        xp: xpRes.source,
        documenti: documentsRes.source,
        simboli: symbolsRes.source,
        characterSheets: onlineRows.length ? 'supabase-list/localStorage-fallback' : 'localStorage/static-fallback',
        staticJson: Object.keys(staticData)
      },
      summary: {
        characters: characters.length,
        playableCharacters: playableCharacters.length,
        nonPlayerCharacters: nonPlayerCharacters.length,
        sheets: sheets.length,
        places: Array.isArray(placesData?.places) ? placesData.places.length : 0,
        sessions: Array.isArray(diaryRes.data?.sessions) ? diaryRes.data.sessions.length : 0,
        xpEvents: Array.isArray(xpRes.data?.registro_xp) ? xpRes.data.registro_xp.length : 0,
        documentsCategories: Array.isArray(documentsRes.data?.categories) ? documentsRes.data.categories.length : 0,
        symbolsCategories: Array.isArray(symbolsRes.data?.categories) ? symbolsRes.data.categories.length : 0
      },
      data: {
        registry: normalizeRegistry(registry),
        characters,
        playableCharacters,
        nonPlayerCharacters,
        characterSheets: sheets,
        places: placesData,
        diary: diaryRes.data || null,
        xp: xpRes.data || staticData['assets/data/xp.json'] || null,
        archiveDocuments: documentsRes.data || null,
        archiveSymbols: symbolsRes.data || null,
        compendium: {
          feats: staticData['assets/data/compendium/feats.json'] || null,
          features: staticData['assets/data/compendium/features.json'] || null,
          spells: staticData['assets/data/compendium/spells.json'] || null
        },
        staticCharacters: {
          abraxas: staticData['assets/data/characters/abraxas.json'] || null,
          arolf: staticData['assets/data/characters/arolf.json'] || null,
          igor: staticData['assets/data/characters/igor.json'] || null,
          irven: staticData['assets/data/characters/irven.json'] || null,
          ralph: staticData['assets/data/characters/ralph.json'] || null
        },
        rawSupabaseRows: groupSupabaseRows(onlineRows),
        unknownRows
      }
    };

    if(window.ThalorNormalize && typeof window.ThalorNormalize.build === 'function'){
      try{
        archive.data.normalized = window.ThalorNormalize.build(archive);
        archive.summary.normalizedRelations = archive.data.normalized.counts.relations;
        archive.summary.normalizedTimeline = archive.data.normalized.counts.timeline;
        archive.sources.normalized = 'thalor-normalize-v1';
        log('Normalizzazione completata', `${archive.data.normalized.counts.relations} relazioni, ${archive.data.normalized.counts.timeline} voci timeline.`);
      }catch(e){
        archive.sources.normalized = 'error';
        archive.normalizationError = e.message || String(e);
        log('Normalizzazione non riuscita', archive.normalizationError);
      }
    }else{
      archive.sources.normalized = 'missing-script';
      log('Normalizzatore non caricato', 'Il JSON verrà esportato senza data.normalized.');
    }

    currentArchive = archive;
    updatePreview(archive);
    log('Archivio pronto', `${archive.summary.characters} personaggi, ${archive.summary.sessions} sessioni, ${archive.summary.places} luoghi.`);
    return archive;
  }

  function updatePreview(archive){
    const stats = document.getElementById('exportStats');
    const preview = document.getElementById('exportPreview');
    if(stats){
      stats.innerHTML = [
        ['Personaggi', archive.summary.characters],
        ['PG', archive.summary.playableCharacters],
        ['PNG', archive.summary.nonPlayerCharacters],
        ['Schede', archive.summary.sheets],
        ['Luoghi', archive.summary.places],
        ['Sessioni', archive.summary.sessions],
        ['Eventi XP', archive.summary.xpEvents],
        ['Relazioni normalizzate', archive.summary.normalizedRelations || 0],
        ['Timeline normalizzata', archive.summary.normalizedTimeline || 0],
        ['Categorie documenti', archive.summary.documentsCategories],
        ['Categorie simboli', archive.summary.symbolsCategories]
      ].map(([k,v])=>`<div class="export-stat"><span>${esc(k)}</span><strong>${esc(v)}</strong></div>`).join('');
    }
    if(preview){
      preview.value = JSON.stringify(archive, null, 2);
    }
  }

  function filename(){
    const d = new Date();
    const pad = n => String(n).padStart(2,'0');
    return `thalor_archive_${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}.json`;
  }

  function downloadArchive(){
    if(!currentArchive){ log('Nessun archivio pronto', 'Prima genera l’archivio.'); return; }
    const blob = new Blob([JSON.stringify(currentArchive, null, 2)], { type:'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename();
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(()=>URL.revokeObjectURL(url), 1000);
    log('Download avviato', a.download);
  }

  async function copyArchive(){
    if(!currentArchive){ log('Nessun archivio pronto', 'Prima genera l’archivio.'); return; }
    const text = JSON.stringify(currentArchive, null, 2);
    try{
      await navigator.clipboard.writeText(text);
      log('JSON copiato negli appunti');
    }catch(e){
      const preview = document.getElementById('exportPreview');
      if(preview){ preview.focus(); preview.select(); }
      log('Copia automatica non riuscita', 'Ho selezionato il testo: premi Ctrl+C.');
    }
  }

  function render(){
    app.innerHTML = `
      <section class="hero export-hero">
        <div class="hero-box export-hero-box">
          <p class="eyebrow">Archivio Thalor</p>
          <h1>Esporta JSON</h1>
          <p class="subtitle">Genera un unico file leggibile con personaggi, schede, luoghi, diario, esperienza, documenti, simboli e compendi statici. Include anche una sezione normalizzata con slug coerenti, relazioni automatiche e timeline base.</p>
          <div class="actions export-actions">
            <button class="button" id="generateArchiveBtn" type="button">Genera archivio</button>
            <button class="button ghost-button" id="downloadArchiveBtn" type="button">Scarica JSON</button>
            <button class="button ghost-button" id="copyArchiveBtn" type="button">Copia JSON</button>
          </div>
        </div>
      </section>
      <section class="panel export-panel">
        <h2 class="section-title">Contenuto esportato</h2>
        <p class="section-note">Se sei online e Supabase è configurato, l’export prova prima a leggere i dati pubblicati. Se qualcosa non risponde, usa cache locale e file statici come fallback. La sezione <code>data.normalized</code> contiene la versione ordinata e standardizzata dell’archivio.</p>
        <div class="export-stats" id="exportStats"></div>
        <textarea id="exportPreview" class="export-preview" spellcheck="false" placeholder="Clicca “Genera archivio” per vedere qui il JSON."></textarea>
        <div class="export-log" id="exportLog" aria-live="polite"></div>
        <p style="text-align:center;margin-top:28px"><a class="button ghost-button" href="../archivio.html">Torna all’Archivio</a></p>
      </section>
      <footer>Thalor</footer>`;

    document.getElementById('generateArchiveBtn').onclick = async ()=>{
      const btn = document.getElementById('generateArchiveBtn');
      btn.disabled = true;
      btn.textContent = 'Genero…';
      try{ await collectArchive(); }
      finally{ btn.disabled = false; btn.textContent = 'Genera archivio'; }
    };
    document.getElementById('downloadArchiveBtn').onclick = downloadArchive;
    document.getElementById('copyArchiveBtn').onclick = copyArchive;
  }

  render();
})();
