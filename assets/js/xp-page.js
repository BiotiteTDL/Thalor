(function(){
  const root=document.querySelector('[data-xp-page]');
  if(!root) return;

  const fmt=(v)=>{
    if(v===null||v===undefined||v==='') return '—';
    if(typeof v==='string' && v.trim()==='-') return '-';
    const n=Number(v);
    if(!Number.isFinite(n)) return String(v);
    return n.toLocaleString('it-IT');
  };
  const esc=(s)=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const internalHref=(href)=>{const raw=String(href||'').trim();if(!raw)return '#';if(/^(javascript:|data:|vbscript:|https?:|mailto:|tel:|\/\/)/i.test(raw))return '#';return raw.replace(/["'<>\s]/g,'');};
  const richText=(v)=>esc(v).replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g,(_,label,href)=>`<a class="lore-link" href="${esc(internalHref(href))}">${esc(label)}</a>`);
  const slugs=['ralph','abraxas','igor','arolf','irven'];
  const names={ralph:'Ralph',abraxas:'Abraxas',igor:'Igor',arolf:'Arolf',irven:'Irven'};

  function renderCurrent(data){
    const body=document.getElementById('xpCurrentBody');
    if(!body) return;
    const people=data.personaggi||{};
    body.innerHTML=slugs.map(slug=>{
      const p=people[slug]||{};
      return `<tr><td>${richText(p.giocatore||'')}</td><td><a class="lore-link" href="../personaggi/${slug}.html">${richText(p.personaggio||names[slug]||slug)}</a></td><td class="num">${fmt(p.xp_totali)}</td><td class="num">${fmt(p.livello)}</td><td class="num">${fmt(p.xp_mancanti)}</td></tr>`;
    }).join('');
  }

  function renderRegister(data){
    const body=document.getElementById('xpRegisterBody');
    if(!body) return;
    body.innerHTML=(data.registro_xp||[]).map(row=>`<tr><td>${richText(row.evento||'')}</td>${slugs.map(slug=>`<td class="num ${row[slug]==null?'muted':''}">${fmt(row[slug])}</td>`).join('')}</tr>`).join('');
  }

  function renderLevels(data){
    const body=document.getElementById('xpLevelsBody');
    if(!body) return;
    body.innerHTML=(data.tabella_xp||[]).map(row=>`<tr><td>${fmt(row.livello)}</td><td class="num">${fmt(row.xp_minimi)}</td><td class="num">${fmt(row.xp_per_arrivarci)}</td></tr>`).join('');
  }

  (async()=>{
    let data=null;
    try{data=await fetch('../assets/data/xp.json',{cache:'no-store'}).then(r=>r.ok?r.json():null);}catch(e){}
    try{
      if(window.ThalorAuth?.state?.configured && navigator.onLine!==false){
        const online=await window.ThalorAuth.loadCharacter('xp',null,{publicRead:true});
        if(online&&typeof online==='object') data=online;
      }
    }catch(err){console.warn('Registro XP online non aggiornato:',err);}
    if(data){renderCurrent(data);renderRegister(data);renderLevels(data);}
  })();
})();
