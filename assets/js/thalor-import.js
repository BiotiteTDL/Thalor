(function(){
  'use strict';

  const app = document.getElementById('thalorImportApp');
  if(!app) return;

  const SYSTEM_SLUGS = {
    personaggi: '__personaggi__',
    luoghi: '__places__',
    diario: 'diario',
    xp: 'xp',
    documenti: 'archive-documents',
    simboli: 'archive-symbols'
  };
  const LOCAL_KEYS = {
    [SYSTEM_SLUGS.personaggi]: 'thalor.personaggi.registry.v2',
    [SYSTEM_SLUGS.luoghi]: 'thalor.places.v1',
    [SYSTEM_SLUGS.diario]: 'thalor.diary.v1',
    [SYSTEM_SLUGS.xp]: 'thalor.xp.v1',
    [SYSTEM_SLUGS.documenti]: 'thalor.archive.documents.v1',
    [SYSTEM_SLUGS.simboli]: 'thalor.archive.symbols.v1'
  };

  let parsedArchive = null;
  let importPlan = [];

  const esc = (v)=>String(v ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const safeArray = (v)=>Array.isArray(v) ? v : [];
  const isObject = (v)=>v && typeof v === 'object' && !Array.isArray(v);
  const safeStringify = (v)=>JSON.stringify(v, null, 2);

  function log(message, detail){
    const box = document.getElementById('importLog');
    if(!box) return;
    const row = document.createElement('div');
    row.className = 'export-log-row';
    row.innerHTML = `<span>${esc(new Date().toLocaleTimeString('it-IT'))}</span><strong>${esc(message)}</strong>${detail?`<small>${esc(detail)}</small>`:''}`;
    box.prepend(row);
  }

  async function ensureMasterAccess(){
    if(!window.ThalorAuth || typeof window.ThalorAuth.init !== 'function') return false;
    try{ await window.ThalorAuth.init(); }catch(e){}
    try{ return !!window.ThalorAuth.isMaster(); }catch(e){ return false; }
  }

  function setLocal(slug, data){
    try{
      const localKey = LOCAL_KEYS[slug] || ('thalor.sheet.' + slug + '.v5');
      localStorage.setItem(localKey, JSON.stringify(data));
      return localKey;
    }catch(e){
      log('Cache locale non aggiornata', slug + ': ' + (e.message || e));
      return '';
    }
  }

  function downloadText(filename, text){
    const blob = new Blob([text], { type:'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(()=>URL.revokeObjectURL(url), 1000);
  }

  function planPush(slug, data, label, source){
    if(!slug || !isObject(data)) return;
    importPlan.push({ slug, data, label: label || slug, source: source || 'archive' });
  }

  function buildRegistryFromCharacters(characters){
    const items = safeArray(characters).map(c=>({
      img: c.image || c.img || '',
      tag: c.type === 'pg' ? 'Personaggio giocante' : (c.tag || c.typeLabel || 'PNG'),
      desc: c.shortDescription || c.summary || c.desc || c.description || '',
      href: c.href || `personaggi/dettaglio.html?id=${encodeURIComponent(c.slug || c.id || c.name || '')}`,
      name: c.name || c.title || c.slug || c.id || '',
      slug: c.slug || c.id || '',
      type: c.type || 'png',
      sheet: c.sheetHref || c.sheet || '',
      events: c.events || '',
      longDesc: c.longDesc || '',
      longHtml: c.detail?.longHtml || c.longHtml || c.contentHtml || '',
      roleSlug: c.roleSlug || c.slug || c.id || '',
      eventsHtml: c.detail?.eventsHtml || c.eventsHtml || '',
      permissionRole: c.permissionRole || c.slug || c.id || ''
    })).filter(x=>x.slug || x.name);
    return { items };
  }

  function buildPlan(archive){
    const data = archive?.data || {};
    const plan = [];
    importPlan = plan;

    // Registri principali. Sono la parte che aggiorna descrizioni, descrizioni brevi ed eventi in campagna.
    if(isObject(data.registry)) planPush(SYSTEM_SLUGS.personaggi, data.registry, 'Registro personaggi', 'data.registry');
    else if(safeArray(data.characters).length) planPush(SYSTEM_SLUGS.personaggi, buildRegistryFromCharacters(data.characters), 'Registro personaggi ricostruito', 'data.characters');

    if(isObject(data.places)) planPush(SYSTEM_SLUGS.luoghi, data.places, 'Luoghi', 'data.places');
    if(isObject(data.diary)) planPush(SYSTEM_SLUGS.diario, data.diary, 'Diario / sessioni', 'data.diary');
    if(isObject(data.xp)) planPush(SYSTEM_SLUGS.xp, data.xp, 'Tabella esperienza', 'data.xp');
    if(isObject(data.archiveDocuments)) planPush(SYSTEM_SLUGS.documenti, data.archiveDocuments, 'Documenti archivio', 'data.archiveDocuments');
    if(isObject(data.archiveSymbols)) planPush(SYSTEM_SLUGS.simboli, data.archiveSymbols, 'Simboli archivio', 'data.archiveSymbols');

    // Schede personaggio: importiamo solo se presenti come coppie slug/data.
    safeArray(data.characterSheets).forEach(row=>{
      const slug = String(row?.slug || '').trim();
      const sheetData = row?.data;
      if(slug && isObject(sheetData)) planPush(slug, sheetData, 'Scheda ' + slug, 'data.characterSheets');
    });

    // Se il JSON è stato modificato solo nella sezione rawSupabaseRows, accettiamo anche quei dati,
    // ma senza sovrascrivere una voce già pianificata da fonti più esplicite.
    if(isObject(data.rawSupabaseRows)){
      const known = new Set(importPlan.map(x=>x.slug));
      Object.entries(data.rawSupabaseRows).forEach(([slug,rowData])=>{
        if(!known.has(slug) && isObject(rowData)) planPush(slug, rowData, 'Riga Supabase ' + slug, 'data.rawSupabaseRows');
      });
    }

    return importPlan;
  }

  function updatePreview(){
    const stats = document.getElementById('importStats');
    const preview = document.getElementById('importPreview');
    const importBtn = document.getElementById('importArchiveBtn');
    const normalized = parsedArchive?.data?.normalized || null;
    const registryCount = safeArray(parsedArchive?.data?.registry?.items).length;
    const plan = buildPlan(parsedArchive);
    if(stats){
      stats.innerHTML = [
        ['Azioni previste', plan.length],
        ['Personaggi registro', registryCount || safeArray(parsedArchive?.data?.characters).length],
        ['Schede', safeArray(parsedArchive?.data?.characterSheets).length],
        ['Luoghi', safeArray(parsedArchive?.data?.places?.places).length],
        ['Sessioni', safeArray(parsedArchive?.data?.diary?.sessions).length],
        ['Relazioni normalizzate', safeArray(normalized?.relations).length]
      ].map(([k,v])=>`<div class="import-stat"><span>${esc(k)}</span><strong>${esc(v)}</strong></div>`).join('');
    }
    if(preview){
      preview.value = plan.map(x=>`${x.slug} — ${x.label} (${x.source})`).join('\n');
    }
    if(importBtn) importBtn.disabled = !plan.length;
  }

  async function readFile(file){
    const text = await file.text();
    const json = JSON.parse(text);
    if(!json || typeof json !== 'object') throw new Error('Il file non contiene un oggetto JSON valido.');
    parsedArchive = json;
    updatePreview();
    log('JSON caricato', file.name);
  }

  async function backupCurrent(){
    const backup = {
      schema: 'thalor_import_backup_v1',
      createdAt: new Date().toISOString(),
      rows: {}
    };
    try{
      for(const entry of importPlan){
        const localKey = LOCAL_KEYS[entry.slug] || ('thalor.sheet.' + entry.slug + '.v5');
        const raw = localStorage.getItem(localKey);
        if(raw) backup.rows[entry.slug] = JSON.parse(raw);
      }
      localStorage.setItem('thalor.import.lastBackup', JSON.stringify(backup));
      downloadText('thalor_backup_prima_import_' + new Date().toISOString().slice(0,16).replace(/[:T]/g,'-') + '.json', safeStringify(backup));
      log('Backup locale creato', 'Scaricato e salvato anche in localStorage.');
    }catch(e){
      log('Backup parziale/non riuscito', e.message || String(e));
    }
  }

  async function importArchive(){
    const ok = await ensureMasterAccess();
    if(!ok){
      log('Import bloccato', 'Devi essere Master per importare un JSON.');
      return;
    }
    if(!parsedArchive){ log('Nessun JSON caricato'); return; }
    buildPlan(parsedArchive);
    if(!importPlan.length){ log('Nessuna azione', 'Il JSON non contiene sezioni importabili.'); return; }

    const btn = document.getElementById('importArchiveBtn');
    btn.disabled = true;
    btn.textContent = 'Importo…';
    try{
      await backupCurrent();
      let okCount = 0;
      let failCount = 0;
      for(const entry of importPlan){
        setLocal(entry.slug, entry.data);
        try{
          if(window.ThalorAuth && typeof window.ThalorAuth.saveCharacter === 'function'){
            await window.ThalorAuth.saveCharacter(entry.slug, entry.data);
          }
          okCount++;
          log('Importato', entry.slug + ' — ' + entry.label);
        }catch(e){
          failCount++;
          log('Import locale completato, online non riuscito', entry.slug + ': ' + (e.message || e));
        }
      }
      try{ localStorage.setItem('thalor.lastImportedArchive', JSON.stringify(parsedArchive)); }catch(e){}
      log('Import concluso', `${okCount} aggiornamenti completati, ${failCount} solo locali/non riusciti online.`);
    }finally{
      btn.disabled = false;
      btn.textContent = 'Importa e aggiorna il sito';
    }
  }

  function renderLocked(){
    app.innerHTML = `
      <section class="hero export-hero">
        <div class="hero-box export-hero-box">
          <p class="eyebrow">Strumenti Master</p>
          <h1>Importa JSON</h1>
          <p class="subtitle">Questa sezione è riservata al Master. Accedi con un account Master da Auth per importare gli aggiornamenti dell’archivio.</p>
          <div class="actions import-actions">
            <a class="button ghost-button" href="../auth.html">Vai ad Auth</a>
            <a class="button ghost-button" href="../archivio.html">Torna all’Archivio</a>
          </div>
        </div>
      </section>
      <footer>Thalor</footer>`;
  }

  function render(){
    app.innerHTML = `
      <section class="hero export-hero">
        <div class="hero-box export-hero-box">
          <p class="eyebrow">Archivio Thalor</p>
          <h1>Importa JSON</h1>
          <p class="subtitle">Carica un JSON esportato da Thalor e aggiornato fuori dal sito. L’import aggiorna registro personaggi, luoghi, diario, XP, documenti, simboli e schede presenti nel file.</p>
          <div class="actions import-actions">
            <a class="button ghost-button" href="esporta-json.html">Vai all’export</a>
            <a class="button ghost-button" href="../auth.html">Auth Master</a>
          </div>
        </div>
      </section>
      <section class="panel export-panel">
        <h2 class="section-title">Import sicuro</h2>
        <p class="section-note">Prima dell’import viene creato un backup locale. I dati vengono scritti anche in cache locale; se sei online e hai permessi Master, vengono salvati anche su Supabase.</p>
        <div class="import-warning"><strong>Nota:</strong> importa solo JSON che hai esportato da Thalor o che ti ho restituito io. Non usare file sconosciuti.</div>
        <label class="import-drop">Scegli il file JSON da importare
          <input id="importFile" type="file" accept="application/json,.json">
        </label>
        <div class="import-summary" id="importStats"></div>
        <textarea id="importPreview" class="export-preview" spellcheck="false" placeholder="Dopo aver caricato il JSON vedrai qui le sezioni che verranno aggiornate." readonly></textarea>
        <div class="actions import-actions">
          <button class="button" id="importArchiveBtn" type="button" disabled>Importa e aggiorna il sito</button>
          <button class="button ghost-button" id="downloadLoadedBtn" type="button">Scarica copia del JSON caricato</button>
        </div>
        <div class="export-log" id="importLog" aria-live="polite"></div>
        <p style="text-align:center;margin-top:28px"><a class="button ghost-button" href="../auth.html">Torna ad Auth</a></p>
      </section>
      <footer>Thalor</footer>`;

    document.getElementById('importFile').addEventListener('change', async (e)=>{
      const file = e.target.files && e.target.files[0];
      if(!file) return;
      try{ await readFile(file); }
      catch(err){ parsedArchive = null; importPlan = []; updatePreview(); log('Errore lettura JSON', err.message || String(err)); }
    });
    document.getElementById('importArchiveBtn').onclick = importArchive;
    document.getElementById('downloadLoadedBtn').onclick = ()=>{
      if(!parsedArchive){ log('Nessun JSON caricato'); return; }
      downloadText('thalor_archive_caricato.json', safeStringify(parsedArchive));
    };
  }

  (async()=>{
    const ok = await ensureMasterAccess();
    if(!ok){ renderLocked(); return; }
    render();
  })();
})();
