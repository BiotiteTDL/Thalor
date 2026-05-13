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
    ready: false,
    loading: false,
    initPromise: null,
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
        storageKey: 'thalor.supabase.auth'
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

  async function refreshAccess(){
    const client = makeClient();
    if(!client || !state.user){
      state.access = [];
      return [];
    }

    const res = await client
      .from('character_access')
      .select('character_slug, can_edit')
      .eq('user_id', state.user.id)
      .eq('can_edit', true);

    if(res.error){
      console.warn('character_access select error:', res.error);
      state.access = [];
      return [];
    }

    state.access = res.data || [];
    return state.access;
  }

  async function init(force=false){
    state.localMaster = localMasterEnabled();
    if(state.ready && !force) return state;
    if(state.loading && state.initPromise) return state.initPromise;

    state.loading = true;
    state.initPromise = (async()=>{
      try{
        const client = makeClient();
        if(!client){
          state.ready = true;
          return state;
        }

        const s = await client.auth.getSession();
        if(s.error) throw s.error;

        state.session = s.data.session || null;
        state.user = state.session?.user || null;
        state.profile = null;
        state.access = [];

        if(state.user){
          await ensureProfile(client);
          await refreshAccess();
        }

        state.error = null;
        state.ready = true;

        if(!state._listenerAttached){
          state._listenerAttached = true;
          client.auth.onAuthStateChange(async (_event, session) => {
            const previousAccess = state.access || [];
            const previousProfile = state.profile || null;
            state.session = session || null;
            state.user = session?.user || null;

            if(!state.user){
              state.profile = null;
              state.access = [];
            }else{
              try{
                await ensureProfile(client);
                await refreshAccess();
              }catch(err){
                // Durante il refresh token Supabase può rispondere in ritardo: non svuotare
                // subito i permessi, altrimenti la scheda sembra perdere l'accesso mentre si salva.
                console.warn('Auth refresh error:', err);
                state.profile = previousProfile;
                state.access = previousAccess;
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
        state.initPromise = null;
      }

      return state;
    })();

    return state.initPromise;
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
    if(state.localMaster) return { mode:'local-master' };
    if(!state.configured || !state.client) return { mode:'local' };

    // Non forzare un refresh completo a ogni salvataggio: è proprio lì che, dopo
    // qualche minuto di modifica, la sessione poteva risultare temporaneamente vuota.
    if(!state.user){
      const s = await state.client.auth.getSession();
      if(s.error) throw s.error;
      state.session = s.data.session || null;
      state.user = state.session?.user || null;
      if(state.user){
        await ensureProfile(state.client);
        await refreshAccess();
      }
    }

    if(!canEdit(slug)) throw new Error('Non hai i permessi per modificare questa scheda.');

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

  window.ThalorAuth = {
    state,
    init,
    refreshAccess,
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
