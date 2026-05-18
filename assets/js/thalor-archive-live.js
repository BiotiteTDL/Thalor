(function(){
  'use strict';

  const app = document.getElementById('thalorLiveArchiveApp');
  if(!app) return;

  const ROOT = '../';
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

  let archive = null;
  let normalized = null;
  let activeFilter = 'all';
  let searchTerm = '';

  const esc = (v)=>String(v ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const safeParse = (raw, fallback=null)=>{ try{ return raw ? JSON.parse(raw) : fallback; }catch(e){ return fallback; } };
  const readLocal = (key)=>{ try{ return safeParse(localStorage.getItem(key), null); }catch(e){ return null; } };
  const slugify = (v)=>String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,80) || 'senza-slug';
  const isSystemSlug = (slug)=>Object.values(SYSTEM_SLUGS).includes(String(slug||'')) || String(slug||'').startsWith('__');
  const stripHtml = (html)=> window.ThalorNormalize ? window.ThalorNormalize.stripHtml(html) : String(html||'').replace(/<[^>]+>/g,' ');

  function log(message, detail){
    const box = document.getElementById('liveLog');
    if(!box) return;
    const row = document.createElement('div');
    row.className = 'export-log-row';
    row.innerHTML = `<span>${esc(new Date().toLocaleTimeString('it-IT'))}</span><strong>${esc(message)}</strong>${detail?`<small>${esc(detail)}</small>`:''}`;
    box.prepend(row);
  }

  async function fetchJson(path){
    try{
      const normalizedPath = String(path||'').replace(/^\/+/, '');
      const res = await fetch(ROOT + normalizedPath + '?_ts=' + Date.now(), { cache:'no-store' });
      if(!res.ok) return null;
      return await res.json();
    }catch(e){ return null; }
  }

  async function loadOnlineSlug(slug){
    try{
      if(!window.ThalorAuth || !window.ThalorAuth.loadCharacter) return null;
      return await window.ThalorAuth.loadCharacter(slug, null, { publicRead:true, skipInit:true, timeoutMs:15000 });
    }catch(e){ return null; }
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

  function groupSupabaseRows(rows){
    const out = {};
    rows.forEach(r=>{
      const slug = String(r.slug || '').trim();
      if(!slug) return;
      out[slug] = r.data ?? null;
    });
    return out;
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

  function normalizeCharacterType(item, slug){
    const raw = String(item?.type || item?.kind || item?.category || item?.tag || '').toLowerCase();
    if(PLAYABLE_SLUGS.has(slug)) return 'pg';
    if(raw === 'pg' || raw.includes('giocante') || raw.includes('player')) return 'pg';
    if(raw === 'png' || raw.includes('non giocante') || raw.includes('npc')) return 'png';
    return 'png';
  }

  function normalizeSheets(rows, registry){
    const bySlug = new Map();
    rows.forEach(row=>{
      const slug = String(row.slug || row.id || '').trim();
      if(!slug || isSystemSlug(slug)) return;
      bySlug.set(slug, row.data ?? row);
    });
    normalizeRegistry(registry).items.forEach(item=>{
      const slug = String(item.slug || '').trim();
      if(!slug || bySlug.has(slug)) return;
      const local = readLocal('thalor.sheet.' + slug + '.v5');
      if(local) bySlug.set(slug, local);
    });
    return [...bySlug.entries()].map(([slug,data])=>({ slug, data }));
  }

  function simplifyCharacters(registry, sheets){
    const sheetMap = new Map((sheets||[]).map(s=>[s.slug, s.data]));
    return normalizeRegistry(registry).items.map(item=>{
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
        detail: { longHtml: item.longHtml || '', eventsHtml: item.eventsHtml || '' },
        sheet
      };
    });
  }

  async function collectArchive(){
    log('Aggiorno Archivio Vivo', 'Leggo Supabase, cache locale e JSON statici.');
    if(window.ThalorAuth && window.ThalorAuth.init){
      try{ await window.ThalorAuth.init(); }catch(e){ log('Auth non inizializzata', e.message || String(e)); }
    }
    const onlineRows = await loadAllOnlineRows();
    const onlineBySlug = groupSupabaseRows(onlineRows);
    const loadPriority = async (slug, localKey)=>{
      if(Object.prototype.hasOwnProperty.call(onlineBySlug, slug)) return { source:'supabase-list', data:onlineBySlug[slug] };
      const direct = await loadOnlineSlug(slug);
      if(direct && typeof direct === 'object') return { source:'supabase-direct', data:direct };
      const local = readLocal(localKey);
      if(local && typeof local === 'object') return { source:'localStorage', data:local };
      return { source:'missing', data:null };
    };
    const [registryRes, placesRes, diaryRes, xpRes, documentsRes, symbolsRes] = await Promise.all([
      loadPriority(SYSTEM_SLUGS.personaggi, LOCAL_KEYS.personaggi),
      loadPriority(SYSTEM_SLUGS.luoghi, LOCAL_KEYS.luoghi),
      loadPriority(SYSTEM_SLUGS.diario, LOCAL_KEYS.diario),
      loadPriority(SYSTEM_SLUGS.xp, LOCAL_KEYS.xp),
      loadPriority(SYSTEM_SLUGS.documenti, LOCAL_KEYS.documenti),
      loadPriority(SYSTEM_SLUGS.simboli, LOCAL_KEYS.simboli)
    ]);
    const staticData = {};
    for(const path of STATIC_JSON){
      const data = await fetchJson(path);
      if(data) staticData[path] = data;
    }
    const registry = registryRes.data || { items:[] };
    const placesData = normalizePlacesData(placesRes.data, staticData['assets/data/places.json'] || null);
    const sheets = normalizeSheets(onlineRows, registry);
    const characters = simplifyCharacters(registry, sheets);
    const playableCharacters = characters.filter(c=>c.type === 'pg');
    const nonPlayerCharacters = characters.filter(c=>c.type !== 'pg');

    archive = {
      schema: 'thalor_archive_export_v1',
      exportedAt: new Date().toISOString(),
      sources: {
        personaggi: registryRes.source,
        luoghi: (placesRes.data && Array.isArray(placesRes.data.places) && placesRes.data.places.length) ? placesRes.source + '+static-json-merge' : 'static-json-fallback',
        diario: diaryRes.source,
        xp: xpRes.source,
        documenti: documentsRes.source,
        simboli: symbolsRes.source,
        staticJson: Object.keys(staticData)
      },
      summary: {
        characters: characters.length,
        playableCharacters: playableCharacters.length,
        nonPlayerCharacters: nonPlayerCharacters.length,
        places: Array.isArray(placesData?.places) ? placesData.places.length : 0,
        sessions: Array.isArray(diaryRes.data?.sessions) ? diaryRes.data.sessions.length : 0,
        xpEvents: Array.isArray(xpRes.data?.registro_xp) ? xpRes.data.registro_xp.length : 0
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
        staticCharacters: {
          abraxas: staticData['assets/data/characters/abraxas.json'] || null,
          arolf: staticData['assets/data/characters/arolf.json'] || null,
          igor: staticData['assets/data/characters/igor.json'] || null,
          irven: staticData['assets/data/characters/irven.json'] || null,
          ralph: staticData['assets/data/characters/ralph.json'] || null
        },
        rawSupabaseRows: groupSupabaseRows(onlineRows)
      }
    };

    normalized = window.ThalorNormalize && window.ThalorNormalize.build ? window.ThalorNormalize.build(archive) : null;
    if(archive && normalized) archive.data.normalized = normalized;
    log('Archivio Vivo pronto', `${normalized?.counts?.characters || 0} personaggi, ${normalized?.counts?.places || 0} luoghi, ${normalized?.counts?.relations || 0} relazioni.`);
    renderContent();
  }

  function hrefFor(item){
    let href = item?.href || '';
    if(!href) return '';
    if(/^https?:/i.test(href) || /^data:/i.test(href)) return href;
    if(href.startsWith('../')) return href;
    return ROOT + href.replace(/^\.\//,'');
  }

  function itemText(item){
    return [item?.name, item?.title, item?.summary, item?.text, item?.type, item?.category, ...(item?.tags||[])].join(' ').toLowerCase();
  }

  function allItems(){
    if(!normalized) return [];
    return [...(normalized.characters||[]), ...(normalized.places||[]), ...(normalized.sessions||[])];
  }

  function filteredItems(){
    const q = searchTerm.trim().toLowerCase();
    return allItems().filter(item=>{
      if(activeFilter !== 'all'){
        if(activeFilter === 'pg' && !(item.category === 'character' && item.type === 'pg')) return false;
        if(activeFilter === 'png' && !(item.category === 'character' && item.type === 'png')) return false;
        if(activeFilter === 'places' && item.category !== 'place') return false;
        if(activeFilter === 'sessions' && item.category !== 'session') return false;
      }
      if(q && !itemText(item).includes(q)) return false;
      return true;
    });
  }

  function renderStats(){
    const c = normalized?.counts || {};
    const stats = document.getElementById('liveStats');
    if(!stats) return;
    stats.innerHTML = [
      ['Personaggi', c.characters || 0],
      ['PG', c.playableCharacters || 0],
      ['PNG', c.nonPlayerCharacters || 0],
      ['Luoghi', c.places || 0],
      ['Sessioni', c.sessions || 0],
      ['Relazioni', c.relations || 0],
      ['Timeline', c.timeline || 0]
    ].map(([k,v])=>`<div class="export-stat"><span>${esc(k)}</span><strong>${esc(v)}</strong></div>`).join('');
  }

  function renderCard(item){
    const href = hrefFor(item);
    const typeLabel = item.category === 'character' ? (item.type === 'pg' ? 'PG' : 'PNG') : (item.category === 'place' ? 'Luogo' : 'Sessione');
    const summary = stripHtml(item.summary || item.description || item.text || '').slice(0, 260);
    const img = item.image ? `<img src="${esc(hrefFor({href:item.image}) || ROOT + item.image)}" alt="" loading="lazy"/>` : '';
    const title = esc(item.name || item.title || item.slug);
    const heading = href ? `<a href="${esc(href)}">${title}</a>` : title;
    return `<article class="live-card">
      ${img}
      <div class="live-card-body">
        <div class="live-pill">${esc(typeLabel)}</div>
        <h3>${heading}</h3>
        <p>${esc(summary)}${summary.length >= 260 ? '…' : ''}</p>
      </div>
    </article>`;
  }

  function renderResults(){
    const box = document.getElementById('liveResults');
    if(!box) return;
    const items = filteredItems();
    box.innerHTML = items.length ? items.map(renderCard).join('') : '<p class="section-note">Nessun risultato con questi filtri.</p>';
  }

  function renderTimeline(){
    const box = document.getElementById('liveTimeline');
    if(!box) return;
    const timeline = (normalized?.timeline || []).slice(0, 80);
    box.innerHTML = timeline.length ? timeline.map(ev=>{
      const involved = (ev.involved || []).slice(0,6).map(x=>`<span>${esc(x.name)}</span>`).join('');
      const href = ev.href ? `<a href="${esc(hrefFor({href:ev.href}))}">${esc(ev.title)}</a>` : esc(ev.title);
      return `<article class="live-timeline-row"><div><strong>${esc(ev.label || ev.type)}</strong><h3>${href}</h3><p>${esc(stripHtml(ev.summary || '').slice(0,220))}</p><div class="live-tags">${involved}</div></div></article>`;
    }).join('') : '<p class="section-note">Timeline non ancora disponibile.</p>';
  }

  function renderRelations(){
    const box = document.getElementById('liveRelations');
    if(!box) return;
    const relations = (normalized?.relations || []).slice(0, 60);
    box.innerHTML = relations.length ? relations.map(r=>`<div class="live-relation"><strong>${esc(r.sourceName)}</strong><span>→</span><strong>${esc(r.targetName)}</strong><small>${esc(r.strength)} cit.</small></div>`).join('') : '<p class="section-note">Relazioni automatiche non ancora disponibili.</p>';
  }

  function renderContent(){
    renderStats();
    renderResults();
    renderTimeline();
    renderRelations();
  }

  function downloadNormalized(){
    if(!archive){ log('Archivio non pronto', 'Prima aggiorna i dati.'); return; }
    const blob = new Blob([JSON.stringify(archive, null, 2)], { type:'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const d = new Date();
    const pad = n => String(n).padStart(2,'0');
    a.href = url;
    a.download = `thalor_archive_vivo_${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(()=>URL.revokeObjectURL(url), 1000);
  }

  function renderShell(){
    app.innerHTML = `
      <style>
        .live-toolbar{display:flex;gap:12px;flex-wrap:wrap;align-items:center;justify-content:center;margin:22px 0}.live-search{min-width:min(520px,100%);padding:12px 14px;border:1px solid rgba(218,184,108,.35);border-radius:14px;background:rgba(10,8,6,.7);color:#f6ead1}.live-tabs{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin:12px 0 22px}.live-tab{border:1px solid rgba(218,184,108,.35);border-radius:999px;padding:8px 12px;background:rgba(255,255,255,.04);color:#f6ead1;cursor:pointer}.live-tab.active{background:rgba(218,184,108,.18);border-color:rgba(218,184,108,.8)}.live-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px}.live-card{border:1px solid rgba(218,184,108,.25);border-radius:18px;overflow:hidden;background:rgba(12,10,8,.62);box-shadow:0 12px 30px rgba(0,0,0,.22)}.live-card img{width:100%;height:160px;object-fit:cover;display:block}.live-card-body{padding:16px}.live-card h3{margin:8px 0 8px}.live-card h3 a{color:inherit;text-decoration:none}.live-card h3 a:hover{text-decoration:underline}.live-card p{opacity:.86;line-height:1.55}.live-pill{display:inline-block;font-size:.78rem;letter-spacing:.08em;text-transform:uppercase;border:1px solid rgba(218,184,108,.32);border-radius:999px;padding:4px 8px;color:#dab86c}.live-split{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(280px,.8fr);gap:22px}@media(max-width:900px){.live-split{grid-template-columns:1fr}}.live-timeline-row,.live-relation{border:1px solid rgba(218,184,108,.22);border-radius:16px;background:rgba(255,255,255,.035);padding:14px;margin-bottom:10px}.live-timeline-row h3{margin:6px 0}.live-timeline-row a{color:inherit}.live-tags{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.live-tags span{font-size:.78rem;border:1px solid rgba(218,184,108,.25);border-radius:999px;padding:3px 7px;opacity:.9}.live-relation{display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap}.live-relation small{opacity:.7}.live-muted{opacity:.75;text-align:center}
      </style>
      <section class="hero export-hero"><div class="hero-box export-hero-box"><p class="eyebrow">Archivio Thalor</p><h1>Archivio Vivo</h1><p class="subtitle">Consulta i dati normalizzati del sito: personaggi, luoghi, sessioni, timeline e relazioni automatiche. Questa pagina è in sola lettura e non modifica salvataggi, login o Supabase.</p><div class="actions export-actions"><button class="button" id="refreshLiveBtn" type="button">Aggiorna Archivio Vivo</button><button class="button ghost-button" id="downloadLiveBtn" type="button">Scarica JSON normalizzato</button><a class="button ghost-button" href="esporta-json.html">Vai all’export completo</a></div></div></section>
      <section class="panel export-panel"><h2 class="section-title">Panoramica</h2><p class="section-note">Le relazioni sono inferite automaticamente dalle citazioni nei testi: sono collegamenti utili, non ancora verità narrativa definitiva.</p><div class="export-stats" id="liveStats"></div><div class="live-toolbar"><input id="liveSearch" class="live-search" type="search" placeholder="Cerca personaggi, luoghi, sessioni, parole chiave…"/></div><div class="live-tabs" id="liveTabs"><button class="live-tab active" data-filter="all">Tutto</button><button class="live-tab" data-filter="pg">PG</button><button class="live-tab" data-filter="png">PNG</button><button class="live-tab" data-filter="places">Luoghi</button><button class="live-tab" data-filter="sessions">Sessioni</button></div><div class="live-grid" id="liveResults"><p class="live-muted">Aggiorna l’archivio per caricare i dati.</p></div></section>
      <section class="live-split"><section class="panel"><h2 class="section-title">Timeline</h2><div id="liveTimeline"><p class="section-note">Aggiorna l’archivio per generare la timeline.</p></div></section><section class="panel"><h2 class="section-title">Relazioni automatiche</h2><div id="liveRelations"><p class="section-note">Aggiorna l’archivio per generare le relazioni.</p></div></section></section>
      <section class="panel"><h2 class="section-title">Log</h2><div class="export-log" id="liveLog" aria-live="polite"></div><p style="text-align:center;margin-top:28px"><a class="button ghost-button" href="../archivio.html">Torna all’Archivio</a></p></section><footer>Thalor</footer>`;

    document.getElementById('refreshLiveBtn').onclick = async ()=>{
      const btn = document.getElementById('refreshLiveBtn');
      btn.disabled = true;
      btn.textContent = 'Aggiorno…';
      try{ await collectArchive(); }
      finally{ btn.disabled = false; btn.textContent = 'Aggiorna Archivio Vivo'; }
    };
    document.getElementById('downloadLiveBtn').onclick = downloadNormalized;
    document.getElementById('liveSearch').addEventListener('input', (e)=>{ searchTerm = e.target.value || ''; renderResults(); });
    document.getElementById('liveTabs').addEventListener('click', (e)=>{
      const btn = e.target.closest('[data-filter]');
      if(!btn) return;
      activeFilter = btn.getAttribute('data-filter');
      document.querySelectorAll('.live-tab').forEach(x=>x.classList.toggle('active', x === btn));
      renderResults();
    });
  }

  renderShell();
  setTimeout(()=>collectArchive(), 250);
})();
