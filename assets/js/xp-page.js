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
  const slugs=['ralph','abraxas','igor','arolf','irven'];
  const names={ralph:'Ralph',abraxas:'Abraxas',igor:'Igor',arolf:'Arolf',irven:'Irven'};

  function renderCurrent(data){
    const body=document.getElementById('xpCurrentBody');
    if(!body) return;
    const people=data.personaggi||{};
    body.innerHTML=slugs.map(slug=>{
      const p=people[slug]||{};
      return `<tr><td>${esc(p.giocatore||'')}</td><td><a class="lore-link" href="../personaggi/${slug}.html">${esc(p.personaggio||names[slug]||slug)}</a></td><td class="num">${fmt(p.xp_totali)}</td><td class="num">${fmt(p.livello)}</td><td class="num">${fmt(p.xp_mancanti)}</td></tr>`;
    }).join('');
  }

  function renderRegister(data){
    const body=document.getElementById('xpRegisterBody');
    if(!body) return;
    body.innerHTML=(data.registro_xp||[]).map(row=>`<tr><td>${esc(row.evento||'')}</td>${slugs.map(slug=>`<td class="num ${row[slug]==null?'muted':''}">${fmt(row[slug])}</td>`).join('')}</tr>`).join('');
  }

  function renderLevels(data){
    const body=document.getElementById('xpLevelsBody');
    if(!body) return;
    body.innerHTML=(data.tabella_xp||[]).map(row=>`<tr><td>${fmt(row.livello)}</td><td class="num">${fmt(row.xp_minimi)}</td><td class="num">${fmt(row.xp_per_arrivarci)}</td></tr>`).join('');
  }

  fetch('../assets/data/xp.json',{cache:'no-store'})
    .then(r=>r.ok?r.json():Promise.reject(new Error('XP JSON non raggiungibile')))
    .then(data=>{renderCurrent(data);renderRegister(data);renderLevels(data);})
    .catch(err=>console.warn('Registro XP non aggiornato dal JSON:',err));
})();
