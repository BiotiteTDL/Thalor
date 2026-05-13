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
    accessLoaded: false,
    permissionsStale: false,
    lastUserId: null,
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
        storageKey: 'thalor.supabase.auth',
        flowType: 'pkce'
      }
    });
    return state.client;
  }

  async function ensureProfile(client){
    if(!state.user) return null;

    const found = await client
      .from('profiles')
      .select('*')
      .eq('user_id', state.user.id)
      .maybeSingle();

    if(found.error){
      console.warn('profiles select error:', found.error);
      return state.profile || null;
    }

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

  async function refreshAccess(){
    const client = makeClient();
    if(!client || !state.user){
      state.access = [];
      state.accessLoaded = false;
      state.permissionsStale = false;
      return [];
    }

    const res = await client
      .from('character_access')
      .select('character_slug, can_edit')
      .eq('user_id', state.user.id)
      .eq('can_edit', true);

    if(res.error){
      console.warn('character_access select error:', res.error);
      // Non azzerare i permessi già caricati: un errore temporaneo di rete/RLS
      // non deve far perdere la modifica al giocatore mentre sta lavorando.
      state.permissionsStale = true;
      return state.access || [];
    }

    state.access = res.data || [];
    state.accessLoaded = true;
    state.permissionsStale = false;
    return state.access;
  }

  async function ensureFreshSession(){
    const client = makeClient();
    if(!client) return null;

    // Dopo molti minuti di modifica o dopo aver cambiato scheda del browser,
    // lo stato in memoria può essere vecchio anche se il refresh token è ancora valido.
    // Prima di salvare rileggo sempre la sessione reale da Supabase e, se sta per
    // scadere, forzo un refresh. Questo evita i "salvataggi fantasma" dopo 15/20 minuti.
    let result = await client.auth.getSession();
    if(result.error) throw result.error;

    let session = result.data.session || null;
    const expiresAt = Number(session?.expires_at || 0);
    const secondsLeft = expiresAt ? expiresAt - Math.floor(Date.now()/1000) : 0;

    if(session && secondsLeft < 120){
      const refreshed = await client.auth.refreshSession();
      if(refreshed.error) throw refreshed.error;
      session = refreshed.data.session || session;
    }

    state.session = session;
    const nextUser = session?.user || null;
    const userChanged = (nextUser?.id || null) !== state.lastUserId;
    state.user = nextUser;
    state.lastUserId = nextUser?.id || null;

    if(!state.user){
      state.profile = null;
      state.access = [];
      state.accessLoaded = false;
      state.permissionsStale = false;
      return null;
    }

    if(userChanged){
      state.profile = null;
      state.access = [];
      state.accessLoaded = false;
      state.permissionsStale = false;
    }

    await ensureProfile(client);
    await refreshAccess();
    state.error = null;
    state.ready = true;
    return state.session;
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

      const s = await client.auth.getSession();
      if(s.error) throw s.error;

      state.session = s.data.session || null;
      const nextUser = state.session?.user || null;
      const userChanged = (nextUser?.id || null) !== state.lastUserId;
      state.user = nextUser;
      state.lastUserId = nextUser?.id || null;

      if(!state.user){
        state.profile = null;
        state.access = [];
        state.accessLoaded = false;
        state.permissionsStale = false;
      }else{
        // Se è lo stesso utente, conserva profilo e accessi finché il refresh non riesce.
        // Così un controllo temporaneamente fallito non blocca il salvataggio in corso.
        if(userChanged){
          state.profile = null;
          state.access = [];
          state.accessLoaded = false;
          state.permissionsStale = false;
        }
        await ensureProfile(client);
        await refreshAccess();
      }

      state.error = null;
      state.ready = true;

      if(!state._listenerAttached){
        state._listenerAttached = true;
        client.auth.onAuthStateChange(async (_event, session) => {
          state.session = session || null;
          const nextUser = session?.user || null;
          const userChanged = (nextUser?.id || null) !== state.lastUserId;
          state.user = nextUser;
          state.lastUserId = nextUser?.id || null;

          if(!state.user){
            state.profile = null;
            state.access = [];
            state.accessLoaded = false;
            state.permissionsStale = false;
          }else{
            if(userChanged){
              state.profile = null;
              state.access = [];
              state.accessLoaded = false;
              state.permissionsStale = false;
            }
            try{
              await ensureProfile(client);
              await refreshAccess();
            }catch(err){
              console.warn('Auth refresh error:', err);
              state.permissionsStale = true;
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

    // Non interrogare character_sheets da anonimo: con RLS genera 401 e può
    // mandare la scheda in stati incoerenti. Prima recupera/aggiorna la sessione.
    try{
      await ensureFreshSession();
    }catch(err){
      console.warn('Supabase loadCharacter refresh:', err);
      return fallback;
    }

    if(!state.user){
      console.warn('Supabase loadCharacter: sessione assente, uso dati locali/statici.');
      return fallback;
    }

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
    state.localMaster = localMasterEnabled();
    if(state.localMaster) return { mode:'local-master' };
    if(!state.configured || !makeClient()) return { mode:'local' };

    // Salvataggio = controllo fresco, non stato cache. Serve soprattutto dopo
    // lunghe modifiche o dopo cambio tab, quando il token può essere stato rinnovato
    // ma la variabile state.user/session è rimasta vecchia.
    await ensureFreshSession();

    if(!state.user) throw new Error('Accesso richiesto: sessione non trovata. Rientra con login e riprova.');
    if(!canEdit(slug)){
      await refreshAccess();
      if(!canEdit(slug)) throw new Error('Non hai i permessi per modificare questa scheda.');
    }

    const row = {
      slug,
      data,
      updated_at: new Date().toISOString(),
      updated_by: state.user?.id || null
    };

    const res = await state.client
      .from('character_sheets')
      .upsert(row, { onConflict:'slug' });

    if(res.error) throw res.error;
    return { mode:'cloud' };
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
    if(!c) return;
    return c.auth.signOut();
  }


  // Quando il browser sospende la tab o il player resta fermo a lungo, riallinea
  // la sessione appena torna attivo. Evita richieste Supabase senza JWT.
  if(typeof window !== 'undefined' && !window.__thalorAuthFocusRefresh){
    window.__thalorAuthFocusRefresh = true;
    let lastFocusRefresh = 0;
    const refreshOnFocus = () => {
      if(document.hidden) return;
      if(Date.now() - lastFocusRefresh < 10000) return;
      lastFocusRefresh = Date.now();
      if(state.configured && state.client){
        ensureFreshSession().catch(err => console.warn('Focus auth refresh:', err));
      }
    };
    window.addEventListener('focus', refreshOnFocus, { passive:true });
    document.addEventListener('visibilitychange', refreshOnFocus, { passive:true });
  }

  window.ThalorAuth = {
    state,
    init,
    refreshAccess,
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
