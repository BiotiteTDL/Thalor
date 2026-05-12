
(function(){
  const cfg = window.THALOR_SUPABASE || {};
  const configured = !!(cfg.url && cfg.anonKey && !String(cfg.url).includes('INSERISCI_') && !String(cfg.anonKey).includes('INSERISCI_'));
  const state = { configured, client:null, session:null, user:null, profile:null, access:[], ready:false, error:null };
  function statusText(){
    if(!state.configured) return 'Supabase non configurato: modalità locale.';
    if(state.error) return 'Supabase: '+state.error;
    if(!state.user) return 'Non hai effettuato l’accesso.';
    if(state.profile?.role==='master') return 'Accesso Master: puoi modificare tutto.';
    const chars=(state.access||[]).map(a=>a.character_slug).join(', ');
    return chars ? 'Accesso giocatore: '+chars : 'Accesso effettuato, ma nessun personaggio assegnato.';
  }
  function makeClient(){
    if(!configured || !window.supabase || state.client) return state.client;
    state.client = window.supabase.createClient(cfg.url, cfg.anonKey);
    return state.client;
  }
  async function init(){
    if(state.ready) return state;
    try{
      const client=makeClient();
      if(!client){ state.ready=true; return state; }
      const {data:sdata,error:serr}=await client.auth.getSession();
      if(serr) throw serr;
      state.session=sdata.session||null; state.user=state.session?.user||null;
      if(state.user){
        let {data:p}=await client.from('profiles').select('*').eq('user_id',state.user.id).maybeSingle();
        if(!p){
          const displayName = state.user.user_metadata?.full_name || state.user.email || 'Giocatore';
          const ins = await client.from('profiles').insert({user_id:state.user.id, display_name:displayName, role:'player'}).select('*').maybeSingle();
          p = ins.data || null;
        }
        state.profile=p||null;
        const {data:a}=await client.from('character_access').select('character_slug, can_edit').eq('user_id',state.user.id).eq('can_edit',true);
        state.access=a||[];
      }
      state.ready=true;
      client.auth.onAuthStateChange(async (_event, session) => {
  state.session = session || null;
  state.user = session?.user || null;
});
    }catch(err){ state.error=err.message||String(err); state.ready=true; }
    return state;
  }
  function isMaster(){ return state.profile && state.profile.role === 'master'; }
  function canEdit(slug){
    if(!state.configured) return true; // sviluppo locale prima di Supabase
    if(isMaster()) return true;
    return !!state.access.find(a=>a.character_slug===slug && a.can_edit);
  }
  async function loadCharacter(slug, fallback){
    await init();
    if(!state.configured || !state.client) return fallback;
    const {data,error}=await state.client.from('character_sheets').select('data').eq('slug',slug).maybeSingle();
    if(error){ console.warn('Supabase loadCharacter:',error); return fallback; }
    return data?.data || fallback;
  }
  async function saveCharacter(slug, data){
    await init();
    if(!state.configured || !state.client) return {mode:'local'};
    if(!canEdit(slug)) throw new Error('Non hai i permessi per modificare questa scheda.');
    const row={slug,data,updated_at:new Date().toISOString(),updated_by:state.user?.id||null};
    const {error}=await state.client.from('character_sheets').upsert(row,{onConflict:'slug'});
    if(error) throw error;
    return {mode:'cloud'};
  }
  async function signIn(email,password){ const c=makeClient(); if(!c) throw new Error('Supabase non configurato.'); return c.auth.signInWithPassword({email,password}); }
  async function signUp(email,password){ const c=makeClient(); if(!c) throw new Error('Supabase non configurato.'); return c.auth.signUp({email,password}); }
  async function signOut(){ const c=makeClient(); if(!c) return; return c.auth.signOut(); }
  window.ThalorAuth={state,init,isMaster,canEdit,loadCharacter,saveCharacter,signIn,signUp,signOut,statusText};
})();
