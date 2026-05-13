(function(){
  const cfg = window.THALOR_SUPABASE || {};
  const configured = !!(
    cfg.url &&
    cfg.anonKey &&
    !String(cfg.url).includes('INSERISCI_') &&
    !String(cfg.anonKey).includes('INSERISCI_')
  );

  const state = {
    configured,
    client: null,
    session: null,
    user: null,
    profile: null,
    access: [],
    accessUserId: null,
    ready: false,
    loading: false,
    error: null,
    localMaster: localMasterEnabled(),
    saving: false,
    lastSessionCheck: 0,
    sessionPromise: null
  };


  const DEBUG_KEY = 'thalor.debug.save';
  function debugEnabled(){
    try{ return localStorage.getItem(DEBUG_KEY) === '1' || new URLSearchParams(location.search).get('debugSave') === '1'; }catch(e){ return false; }
  }
  function saveDebug(step, detail){
    const entry = { when: new Date().toISOString(), step, detail: detail || null };
    try{
      window.__thalorLastSaveDebug = window.__thalorLastSaveDebug || [];
      window.__thalorLastSaveDebug.push(entry);
      window.__thalorLastSaveDebug = window.__thalorLastSaveDebug.slice(-80);
      localStorage.setItem('thalor.lastSaveDebug', JSON.stringify(window.__thalorLastSaveDebug));
    }catch(e){}
    if(debugEnabled()) console.log('[Thalor save]', step, detail || '');
    window.dispatchEvent(new CustomEvent('thalor-save-debug', { detail: entry }));
  }

  function isLocalPreview(){
    const h = location.hostname;
    return location.protocol === 'file:' || h === 'localhost' || h === '127.0.0.1' || h === '';
  }

  function localMasterEnabled(){
    try{
      const params = new URLSearchParams(location.search);
      if(params.get('master') === 'offline' || params.get('thalorMaster') === '1'){
        localStorage.setItem('thalor.offlineMaster','1');
      }
      if(params.get('master') === 'off' || params.get('thalorMaster') === '0'){
        localStorage.removeItem('thalor.offlineMaster');
      }
      return isLocalPreview() && localStorage.getItem('thalor.offlineMaster') === '1';
    }catch(e){
      return false;
    }
  }

  function norm(v){ return String(v || '').trim().toLowerCase(); }

  function accessCacheKey(userId){
    return userId ? 'thalor.characterAccess.' + userId : '';
  }

  function readCachedAccess(userId){
    if(!userId) return [];
    try{
      const raw = localStorage.getItem(accessCacheKey(userId));
      const data = raw ? JSON.parse(raw) : [];
      return Array.isArray(data) ? data : [];
    }catch(e){
      return [];
    }
  }

  function writeCachedAccess(userId, access){
    if(!userId) return;
    try{
      localStorage.setItem(accessCacheKey(userId), JSON.stringify(Array.isArray(access) ? access : []));
    }catch(e){
      console.warn('character_access cache write error:', e);
    }
  }

  function clearRuntimeAccess(){
    state.access = [];
    state.accessUserId = null;
  }

  function setUserFromSession(session){
    const nextUser = session?.user || null;
    const nextUserId = nextUser?.id || null;
    const prevUserId = state.user?.id || null;

    state.session = session || null;
    state.user = nextUser;

    if(nextUserId !== prevUserId){
      state.profile = null;
      state.access = nextUserId ? readCachedAccess(nextUserId) : [];
      state.accessUserId = nextUserId;
    }else if(nextUserId && state.accessUserId !== nextUserId){
      state.access = readCachedAccess(nextUserId);
      state.accessUserId = nextUserId;
    }else if(!nextUserId){
      clearRuntimeAccess();
    }
  }


  function withTimeout(promise, ms, label){
    let timer;
    return Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error((label || 'Operazione Supabase') + ' non completata entro ' + Math.round(ms/1000) + ' secondi.')), ms);
      })
    ]).finally(() => clearTimeout(timer));
  }

  function sessionExpiresSoon(session, windowSeconds=300){
    const exp = Number(session?.expires_at || 0);
    if(!exp) return true;
    return exp - Math.floor(Date.now()/1000) < windowSeconds;
  }

  function cachedSessionUsable(windowSeconds=60){
    if(!state.session || !state.user) return false;
    const exp = Number(state.session.expires_at || 0);
    if(!exp) return true;
    return exp - Math.floor(Date.now()/1000) > windowSeconds;
  }

  async function ensureFreshSession(options={}){
    const client = makeClient();
    if(!client) return null;

    const timeoutMs = options.timeoutMs || 12000;
    const allowCached = options.allowCached !== false;
    const preferCached = options.preferCached !== false;
    const refreshWindowSeconds = options.refreshWindowSeconds ?? 300;

    // Punto chiave: durante un salvataggio NON interrogare Supabase Auth se abbiamo già
    // una sessione valida in memoria. Le chiamate auth.getSession/refreshSession possono
    // restare appese quando il browser ha appena risvegliato la tab; l'upsert invece può
    // usare direttamente il token gestito da supabase-js.
    if(preferCached && allowCached && cachedSessionUsable(refreshWindowSeconds)){
      saveDebug('session:cached:ok', { user: state.user?.id || null, expires_at: state.session?.expires_at || null });
      return state.session;
    }

    if(state.sessionPromise) return state.sessionPromise;

    state.sessionPromise = (async()=>{
      saveDebug('session:get:start', { timeoutMs });
      let session = null;
      try{
        const current = await withTimeout(client.auth.getSession(), timeoutMs, 'Controllo sessione');
        if(current.error) throw current.error;
        session = current.data.session || null;
        state.lastSessionCheck = Date.now();
        saveDebug('session:get:ok', { hasSession: !!session, user: session?.user?.id || null, expires_at: session?.expires_at || null });
      }catch(err){
        saveDebug('session:get:error', { message: err.message || String(err), cached: !!state.session });
        if(allowCached && state.session && state.user){
          return state.session;
        }
        throw err;
      }

      if(!session || sessionExpiresSoon(session, refreshWindowSeconds)){
        saveDebug('session:refresh:start', { hasSession: !!session });
        try{
          const refreshed = await withTimeout(client.auth.refreshSession(), timeoutMs, 'Rinnovo sessione');
          if(refreshed.error) throw refreshed.error;
          session = refreshed.data.session || session;
          state.lastSessionCheck = Date.now();
          saveDebug('session:refresh:ok', { hasSession: !!session, user: session?.user?.id || null, expires_at: session?.expires_at || null });
        }catch(err){
          saveDebug('session:refresh:error', { message: err.message || String(err), cached: !!session || !!state.session });
          if(allowCached && (session || state.session)){
            session = session || state.session;
          }else{
            throw err;
          }
        }
      }
      setUserFromSession(session || null);
      return state.session;
    })();

    try{
      return await state.sessionPromise;
    }finally{
      state.sessionPromise = null;
    }
  }

  let wakeTimer = null;
  let wakeRunning = false;
  async function warmSession(reason='focus'){
    if(!state.configured || !state.client || wakeRunning || state.saving) return state.session;
    if(Date.now() - (state.lastSessionCheck || 0) < 30000 && cachedSessionUsable(120)) return state.session;
    wakeRunning = true;
    try{
      const session = await ensureFreshSession({ timeoutMs: 8000, refreshWindowSeconds: 600, preferCached: true, allowCached: true });
      if(session && !state.profile){
        try{ await ensureProfile(state.client); }catch(e){ console.warn('warmSession profile:', e); }
      }
      state.error = null;
      window.dispatchEvent(new CustomEvent('thalor-auth-warmed', { detail: { reason, state } }));
      return session;
    }catch(err){
      console.warn('warmSession failed:', err);
      state.error = err.message || String(err);
      return null;
    }finally{
      wakeRunning = false;
    }
  }

  function scheduleWarmSession(reason){
    if(wakeTimer) clearTimeout(wakeTimer);
    wakeTimer = setTimeout(() => warmSession(reason), 150);
  }

  function attachWakeHandlers(){
    if(state._wakeHandlersAttached || typeof window === 'undefined') return;
    state._wakeHandlersAttached = true;
    window.addEventListener('focus', () => scheduleWarmSession('focus'));
    document.addEventListener('visibilitychange', () => {
      if(document.visibilityState === 'visible') scheduleWarmSession('visible');
    });
    window.addEventListener('pageshow', () => scheduleWarmSession('pageshow'));
  }

  function statusText(){
    state.localMaster = localMasterEnabled();
    if(state.localMaster) return 'Master offline attivo: puoi modificare tutto in locale senza cambiare i permessi online.';
    if(!state.configured) return 'Supabase non configurato: modalità locale.';
    if(state.error) return 'Supabase: ' + state.error;
    if(!state.user) return 'Non hai effettuato l’accesso.';
    if(norm(state.profile?.role) === 'master') return 'Accesso Master: puoi modificare tutto.';
    const chars = (state.access || []).map(a => a.character_slug).filter(Boolean).join(', ');
    return chars ? 'Accesso giocatore: ' + chars : 'Accesso effettuato, ma nessun personaggio assegnato.';
  }

  function makeClient(){
    if(!configured || !window.supabase || state.client) return state.client;
    const url = String(cfg.url).replace(/\/rest\/v1\/?$/,'').replace(/\/$/,'');
    state.client = window.supabase.createClient(url, cfg.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'thalor.supabase.auth'
      }
    });
    attachWakeHandlers();
    return state.client;
  }

  async function ensureProfile(client){
    if(!state.user) return null;

    const found = await client
      .from('profiles')
      .select('*')
      .eq('user_id', state.user.id)
      .maybeSingle();

    if(found.error) console.warn('profiles select error:', found.error);

    let p = found.data || null;

    if(!p){
      const displayName = state.user.user_metadata?.full_name || state.user.email || 'Giocatore';
      const created = await client
        .from('profiles')
        .insert({ user_id: state.user.id, display_name: displayName, role: 'player' })
        .select('*')
        .maybeSingle();

      if(created.error) console.warn('profiles insert error:', created.error);
      p = created.data || null;
    }

    state.profile = p;
    return p;
  }

  async function refreshAccess(options={}){
    const client = makeClient();
    const userId = state.user?.id || null;
    if(!client || !userId){
      clearRuntimeAccess();
      return [];
    }

    if(!options.force && state.accessUserId === userId && Array.isArray(state.access) && state.access.length){
      return state.access;
    }

    const cached = readCachedAccess(userId);
    if(!options.force && cached.length){
      state.access = cached;
      state.accessUserId = userId;
      return state.access;
    }

    const res = await withTimeout(
      client
        .from('character_access')
        .select('character_slug, can_edit')
        .eq('user_id', userId)
        .eq('can_edit', true),
      options.timeoutMs || 15000,
      'Lettura permessi personaggio'
    );

    if(res.error){
      console.warn('character_access select error:', res.error);
      // Non cancellare permessi già validi/cached per un errore temporaneo.
      state.access = cached.length ? cached : (state.accessUserId === userId ? (state.access || []) : []);
      state.accessUserId = userId;
      return state.access;
    }

    state.access = res.data || [];
    state.accessUserId = userId;
    writeCachedAccess(userId, state.access);
    return state.access;
  }

  async function ensureAccessLoaded(options={}){
    if(state.localMaster || !state.configured || !state.user || isMaster()) return state.access || [];
    if(state.accessUserId === state.user.id && Array.isArray(state.access) && state.access.length) return state.access;
    return refreshAccess({ force: true, timeoutMs: options.timeoutMs || 15000 });
  }

  async function init(force=false){
    state.localMaster = localMasterEnabled();
    if(state.ready && !force) return state;
    if(state.loading) return state;

    state.loading = true;
    try{
      const client = makeClient();
      if(!client){
        state.ready = true;
        return state;
      }

      await ensureFreshSession({ timeoutMs: 10000, refreshWindowSeconds: 300, preferCached: true, allowCached: true });

      if(state.user){
        if(state.accessUserId !== state.user.id){
          state.access = readCachedAccess(state.user.id);
          state.accessUserId = state.user.id;
        }
        await ensureProfile(client);
        if(!(state.access || []).length) await refreshAccess({ force: true });
      }else{
        clearRuntimeAccess();
      }

      state.error = null;
      state.ready = true;

      if(!state._listenerAttached){
        state._listenerAttached = true;
        client.auth.onAuthStateChange(async (event, session) => {
          const previousUserId = state.user?.id || null;
          setUserFromSession(session || null);

          if(event === 'SIGNED_OUT' || !state.user){
            state.profile = null;
            clearRuntimeAccess();
          }else{
            try{
              if(previousUserId !== state.user.id) state.profile = null;
              if(state.accessUserId !== state.user.id){
                state.access = readCachedAccess(state.user.id);
                state.accessUserId = state.user.id;
              }
              await ensureProfile(client);
              if(!(state.access || []).length) await refreshAccess({ force: true });
            }catch(err){
              console.warn('Auth refresh error:', err);
            }
          }

          window.dispatchEvent(new CustomEvent('thalor-auth-changed', { detail: state }));
        });
      }
    }catch(err){
      state.error = err.message || String(err);
      state.ready = true;
    }finally{
      state.loading = false;
    }

    return state;
  }

  function isMaster(){
    state.localMaster = localMasterEnabled();
    return state.localMaster || norm(state.profile?.role) === 'master';
  }

  function canEdit(slug){
    state.localMaster = localMasterEnabled();
    // In anteprima locale/offline la scheda deve restare modificabile: i permessi Supabase valgono solo online.
    if(isLocalPreview()) return true;
    if(state.localMaster) return true;
    if(!state.configured) return true;
    if(isMaster()) return true;

    const wanted = norm(slug);
    return !!(state.access || []).find(a =>
      norm(a.character_slug) === wanted &&
      a.can_edit === true
    );
  }

  async function loadCharacter(slug, fallback){
    await init();
    if(!state.configured || !state.client) return fallback;

    const res = await state.client
      .from('character_sheets')
      .select('data')
      .eq('slug', slug)
      .maybeSingle();

    if(res.error){
      console.warn('Supabase loadCharacter:', res.error);
      return fallback;
    }

    return res.data?.data || fallback;
  }

  async function saveCharacter(slug, data){
    saveDebug('save:start', { slug });
    const client = makeClient();
    if(isLocalPreview()) { saveDebug('save:local-preview'); return { mode:'local-preview' }; }
    if(state.localMaster) { saveDebug('save:local-master'); return { mode:'local-master' }; }
    if(!state.configured || !client) { saveDebug('save:local-no-config'); return { mode:'local' }; }

    state.saving = true;
    if(wakeTimer){ clearTimeout(wakeTimer); wakeTimer = null; }
    try{
      // Non richiamare init() durante il salvataggio: init può rilanciare getSession/profile/access
      // e creare una coda che si morde la coda quando il browser ha appena risvegliato la tab.
      // Usiamo la sessione già tenuta da supabase-js e facciamo un controllo auth solo se manca.
      if(!state.user || !state.session){
        await ensureFreshSession({ timeoutMs: 10000, refreshWindowSeconds: 60, preferCached: false, allowCached: true });
      }else{
        saveDebug('save:session-cached', { user: state.user.id, expires_at: state.session?.expires_at || null });
      }

      if(!state.user) throw new Error('Sessione non attiva: rifai login e riprova.');
      saveDebug('save:session-ready', { user: state.user.id });

      // Permessi: usa la cache già caricata. Rileggi da Supabase solo se non sappiamo nulla.
      if(!isMaster() && !(state.accessUserId === state.user.id && Array.isArray(state.access) && state.access.length)){
        const cached = readCachedAccess(state.user.id);
        if(cached.length){
          state.access = cached;
          state.accessUserId = state.user.id;
        }else{
          await refreshAccess({ force: true, timeoutMs: 10000 });
        }
      }
      saveDebug('save:access-ready', { access: (state.access || []).map(a => a.character_slug), master: isMaster() });
      if(!canEdit(slug)) throw new Error('Non hai i permessi per modificare questa scheda.');

      const row = { slug, data, updated_at: new Date().toISOString(), updated_by: state.user.id };
      saveDebug('save:upsert:start', { slug, bytes: (()=>{try{return JSON.stringify(data).length}catch(e){return 0}})() });

      let query = client
        .from('character_sheets')
        .upsert(row, { onConflict:'slug' })
        .select('slug, updated_at')
        .single();

      let aborter = null;
      if(typeof AbortController !== 'undefined' && typeof query.abortSignal === 'function'){
        aborter = new AbortController();
        query = query.abortSignal(aborter.signal);
      }
      const timer = aborter ? setTimeout(() => aborter.abort(), 60000) : null;
      let res;
      try{
        res = await withTimeout(query, 62000, 'Salvataggio online');
      }finally{
        if(timer) clearTimeout(timer);
      }

      if(res.error){
        saveDebug('save:upsert:error', { message: res.error.message || String(res.error), code: res.error.code || null });
        throw res.error;
      }
      saveDebug('save:upsert:ok', res.data || null);
      return { mode:'cloud', row: res.data };
    }finally{
      state.saving = false;
    }
  }

  async function signIn(email,password){
    const c = makeClient();
    if(!c) throw new Error('Supabase non configurato.');
    return c.auth.signInWithPassword({ email, password });
  }

  async function signUp(email,password){
    const c = makeClient();
    if(!c) throw new Error('Supabase non configurato.');
    return c.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'https://biotitetdl.github.io/Thalor/auth.html'
      }
    });
  }

  async function signOut(){
    const c = makeClient();
    const currentUserId = state.user?.id || null;
    clearRuntimeAccess();
    state.profile = null;
    state.session = null;
    state.user = null;
    if(!c) return;
    const res = await c.auth.signOut();
    return res;
  }

  window.ThalorAuth = {
    state,
    init,
    refreshAccess,
    ensureAccessLoaded,
    warmSession,
    ensureFreshSession,
    isMaster,
    canEdit,
    loadCharacter,
    saveCharacter,
    debugLog: () => { try{return JSON.parse(localStorage.getItem('thalor.lastSaveDebug')||'[]')}catch(e){return []} },
    enableDebug: () => { try{localStorage.setItem('thalor.debug.save','1')}catch(e){} },
    signIn,
    signUp,
    signOut,
    statusText,
    isLocalPreview,
    localMasterEnabled,
    enableLocalMaster(){ if(isLocalPreview()) localStorage.setItem('thalor.offlineMaster','1'); state.localMaster=localMasterEnabled(); return state.localMaster; },
    disableLocalMaster(){ localStorage.removeItem('thalor.offlineMaster'); state.localMaster=false; return false; }
  };
})();
