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
    localMaster: localMasterEnabled()
  };

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

  async function ensureFreshSession(options={}){
    const client = makeClient();
    if(!client) return null;
    const timeoutMs = options.timeoutMs || 12000;
    let current = await withTimeout(client.auth.getSession(), timeoutMs, 'Controllo sessione');
    if(current.error) throw current.error;
    let session = current.data.session || null;
    if(!session || sessionExpiresSoon(session, options.refreshWindowSeconds ?? 300)){
      const refreshed = await withTimeout(client.auth.refreshSession(), timeoutMs, 'Rinnovo sessione');
      if(refreshed.error) throw refreshed.error;
      session = refreshed.data.session || session;
    }
    setUserFromSession(session || null);
    return state.session;
  }

  let wakeTimer = null;
  let wakeRunning = false;
  async function warmSession(reason='focus'){
    if(!state.configured || !state.client || wakeRunning) return state.session;
    wakeRunning = true;
    try{
      const session = await ensureFreshSession({ timeoutMs: 10000, refreshWindowSeconds: 600 });
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

      await ensureFreshSession({ timeoutMs: 12000, refreshWindowSeconds: 300 });

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
    await init(false);

    // File aperto offline/localhost: salva solo in locale senza richiedere sessione o permessi online.
    if(isLocalPreview()) return { mode:'local-preview' };
    if(state.localMaster) return { mode:'local-master' };
    if(!state.configured || !state.client) return { mode:'local' };

    // Non rifare sempre il refresh sessione: con Supabase/GitHub Pages può restare pending
    // e bloccare il salvataggio online anche quando la sessione è ancora valida.
    if(!state.session || sessionExpiresSoon(state.session, 90)){
      await ensureFreshSession({ timeoutMs: 8000, refreshWindowSeconds: 90 });
    }

    if(!state.user) throw new Error('Sessione non attiva: rifai login e riprova.');

    // I permessi sono già caricati/cachati durante init/login. Ricaricali solo se mancano davvero.
    if(!isMaster() && !(state.access || []).length){
      await ensureAccessLoaded({ timeoutMs: 8000 });
    }

    if(!canEdit(slug)) throw new Error('Non hai i permessi per modificare questa scheda.');

    const row = {
      slug,
      data,
      updated_at: new Date().toISOString(),
      updated_by: state.user.id
    };

    const res = await withTimeout(
      state.client
        .from('character_sheets')
        .upsert(row, { onConflict:'slug' })
        .select('slug, updated_at')
        .single(),
      30000,
      'Salvataggio online'
    );

    if(res.error) throw res.error;
    return { mode:'cloud', row: res.data };
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
