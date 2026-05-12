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
    error: null
  };

  function norm(v){ return String(v || '').trim().toLowerCase(); }

  function statusText(){
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
    state.client = window.supabase.createClient(url, cfg.anonKey);
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
          state.session = session || null;
          state.user = session?.user || null;
          state.profile = null;
          state.access = [];

          if(state.user){
            try{
              await ensureProfile(client);
              await refreshAccess();
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
    return norm(state.profile?.role) === 'master';
  }

  function canEdit(slug){
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
    await init();
    if(!state.configured || !state.client) return { mode:'local' };
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
    statusText
  };
})();
