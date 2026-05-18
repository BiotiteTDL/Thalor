(function(){
  'use strict';

  const PLAYABLE_SLUGS = new Set(['abraxas','igor','ralph','arolf','irven']);
  const STOPWORDS = new Set(['il','lo','la','l','gli','le','un','una','uno','di','del','della','dei','degli','delle','a','ad','al','alla','ai','agli','alle','da','dal','dalla','in','nel','nella','con','per','tra','fra','che','non','come','piu','più','dove','quando','sono','era','alla','dell']);

  const safeArray = (v)=>Array.isArray(v) ? v : [];
  const asText = (v)=>String(v ?? '').trim();
  const lower = (v)=>asText(v).toLowerCase();
  const unique = (arr)=>[...new Set(safeArray(arr).map(x=>asText(x)).filter(Boolean))];
  const slugify = (v)=>asText(v)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-z0-9]+/g,'-')
    .replace(/^-+|-+$/g,'')
    .slice(0,80) || 'senza-slug';

  function stripHtml(html){
    const raw = asText(html)
      .replace(/<script[\s\S]*?<\/script>/gi,' ')
      .replace(/<style[\s\S]*?<\/style>/gi,' ')
      .replace(/<br\s*\/?>/gi,'\n')
      .replace(/<\/p>|<\/h[1-6]>|<\/li>|<\/div>/gi,'\n')
      .replace(/<[^>]+>/g,' ')
      .replace(/&nbsp;/g,' ')
      .replace(/&amp;/g,'&')
      .replace(/&lt;/g,'<')
      .replace(/&gt;/g,'>')
      .replace(/&quot;/g,'"')
      .replace(/&#39;/g,"'")
      .replace(/\s+/g,' ')
      .trim();
    return raw;
  }

  function compactText(parts){
    return safeArray(parts).map(x=>stripHtml(x)).filter(Boolean).join('\n\n').trim();
  }

  function normalizeType(raw, slug){
    const r = lower(raw);
    if(PLAYABLE_SLUGS.has(slug)) return 'pg';
    if(r === 'pg' || r.includes('giocante') || r.includes('player')) return 'pg';
    if(r === 'city' || r === 'settlement' || r.includes('villaggio') || r.includes('città') || r.includes('citta')) return 'city';
    if(r === 'dungeon' || r.includes('dungeon') || r.includes('accademia')) return 'dungeon';
    if(r === 'place' || r.includes('luogo')) return 'place';
    return r === 'png' || r === 'npc' || r.includes('png') || r.includes('non giocante') ? 'png' : (r || 'unknown');
  }

  function normalizeCharacter(c){
    const slug = slugify(c?.slug || c?.id || c?.name);
    const type = normalizeType(c?.type || c?.typeLabel || c?.tag, slug);
    const contentHtml = asText(c?.detail?.longHtml || c?.longHtml || c?.contentHtml);
    const eventsHtml = asText(c?.detail?.eventsHtml || c?.eventsHtml);
    const summary = asText(c?.shortDescription || c?.desc || c?.description);
    return {
      id: slug,
      slug,
      category: 'character',
      type: type === 'pg' ? 'pg' : 'png',
      group: type === 'pg' ? 'playableCharacters' : 'nonPlayerCharacters',
      name: asText(c?.name) || slug,
      title: asText(c?.name) || slug,
      playerName: asText(c?.playerName || c?.player),
      image: asText(c?.image || c?.img),
      href: asText(c?.href) || `personaggi/dettaglio.html?id=${encodeURIComponent(slug)}`,
      sheetHref: asText(c?.sheetHref || c?.sheet),
      summary,
      contentHtml,
      eventsHtml,
      text: compactText([summary, contentHtml, eventsHtml]),
      tags: unique([type === 'pg' ? 'pg' : 'png', c?.tag, c?.typeLabel]),
      aliases: unique([c?.name, slug, asText(c?.name).split(/\s+/)[0]])
    };
  }

  function normalizePlace(p){
    const slug = slugify(p?.slug || p?.id || p?.title || p?.name);
    const interests = safeArray(p?.interests || p?.sections).map((s, i)=>({
      id: slugify(s?.slug || s?.id || s?.title || `sezione-${i+1}`),
      title: asText(s?.title || s?.name || `Sezione ${i+1}`),
      image: asText(s?.image || s?.img),
      text: asText(s?.text || s?.body || s?.description),
      textPlain: stripHtml(s?.text || s?.body || s?.description)
    }));
    const type = normalizeType(p?.type || p?.tag, slug);
    const title = asText(p?.title || p?.name) || slug;
    const summary = asText(p?.summary || p?.subtitle || p?.description);
    return {
      id: slug,
      slug,
      category: 'place',
      type: type === 'unknown' ? 'place' : type,
      group: 'places',
      name: title,
      title,
      tag: asText(p?.tag),
      subtitle: asText(p?.subtitle),
      image: asText(p?.image || p?.img),
      href: asText(p?.href) || `luoghi/dettaglio-luogo.html?id=${encodeURIComponent(slug)}`,
      summary,
      description: asText(p?.description),
      sections: interests,
      conclusionTitle: asText(p?.conclusionTitle),
      conclusion: asText(p?.conclusion),
      text: compactText([p?.title, p?.subtitle, p?.summary, p?.description, ...interests.map(s=>`${s.title}\n${s.text}`), p?.conclusionTitle, p?.conclusion]),
      tags: unique(['luogo', type, p?.tag, title])
    };
  }

  function normalizeSession(s, index){
    const title = asText(s?.title || s?.detailTitle || `Sessione ${index+1}`);
    const id = slugify(s?.id || title || `sessione-${index+1}`);
    const body = asText(s?.detailBody || s?.body || s?.description);
    return {
      id,
      slug: id,
      category: 'session',
      type: 'session',
      group: 'sessions',
      order: index + 1,
      tag: asText(s?.tag || `Sessione ${index+1}`),
      title,
      name: title,
      href: asText(s?.href) || `diario/sessione-dettaglio.html?id=${encodeURIComponent(id)}`,
      summary: asText(s?.description || body),
      body,
      text: compactText([s?.tag, title, s?.description, body]),
      tags: unique(['sessione', s?.tag])
    };
  }

  function normalizeXpEvent(x, index){
    const title = asText(x?.title || x?.name || x?.evento || x?.descrizione || x?.description || `Evento XP ${index+1}`);
    return {
      id: slugify(x?.id || title || `xp-${index+1}`),
      category: 'xp',
      type: 'xp-event',
      group: 'xpEvents',
      order: index + 1,
      title,
      raw: x,
      text: compactText([JSON.stringify(x || {})]),
      tags: unique(['xp'])
    };
  }

  function buildEntityIndex(characters, places, sessions){
    const entities = [...characters, ...places, ...sessions];
    const nameIndex = [];
    entities.forEach(e=>{
      const aliases = unique([e.name, e.title, e.slug, ...(e.aliases || [])])
        .filter(a=>a.length >= 3)
        .filter(a=>!STOPWORDS.has(slugify(a)));
      aliases.forEach(alias=>{
        nameIndex.push({ alias, aliasSlug: slugify(alias), targetId: e.id, targetCategory: e.category, targetType: e.type, targetName: e.name || e.title });
      });
    });
    return { entities, nameIndex };
  }

  function countMentions(text, alias){
    const cleanText = stripHtml(text);
    const safe = asText(alias).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    if(!safe) return 0;
    const re = new RegExp(`(^|[^\\p{L}\\p{N}])${safe}([^\\p{L}\\p{N}]|$)`, 'giu');
    return (cleanText.match(re) || []).length;
  }

  function inferRelations(sources, nameIndex){
    const relationMap = new Map();
    safeArray(sources).forEach(source=>{
      const text = source.text || source.body || source.summary || '';
      if(!text) return;
      nameIndex.forEach(ref=>{
        if(ref.targetId === source.id) return;
        const count = countMentions(text, ref.alias);
        if(!count) return;
        const key = `${source.id}::${ref.targetId}`;
        const prev = relationMap.get(key) || {
          id: `${source.id}__mentions__${ref.targetId}`,
          source: source.id,
          sourceName: source.name || source.title,
          sourceCategory: source.category,
          target: ref.targetId,
          targetName: ref.targetName,
          targetCategory: ref.targetCategory,
          type: 'mentions',
          strength: 0,
          evidence: []
        };
        prev.strength += count;
        prev.evidence.push(ref.alias);
        relationMap.set(key, prev);
      });
    });
    return [...relationMap.values()]
      .map(r=>Object.assign(r, { evidence: unique(r.evidence).slice(0,8) }))
      .sort((a,b)=>b.strength-a.strength || a.source.localeCompare(b.source));
  }

  function inferInvolved(entity, relations){
    return relations
      .filter(r=>r.source === entity.id)
      .sort((a,b)=>b.strength-a.strength)
      .slice(0,20)
      .map(r=>({ id:r.target, name:r.targetName, category:r.targetCategory, strength:r.strength }));
  }

  function buildTimeline(sessions, xpEvents, relations){
    const sessionEvents = sessions.map(s=>({
      id: `timeline-${s.id}`,
      type: 'session',
      order: s.order,
      title: s.title,
      label: s.tag,
      href: s.href,
      summary: s.summary,
      involved: inferInvolved(s, relations),
      sourceId: s.id
    }));
    const xpTimeline = xpEvents.map((x, i)=>({
      id: `timeline-${x.id}`,
      type: 'xp',
      order: 1000 + i + 1,
      title: x.title,
      label: 'Evento XP',
      summary: '',
      involved: inferInvolved(x, relations),
      sourceId: x.id
    }));
    return [...sessionEvents, ...xpTimeline].sort((a,b)=>a.order-b.order);
  }

  function normalizeArchive(archive){
    const data = archive?.data || {};
    const rawCharacters = safeArray(data.characters || data.registry?.items);
    const characters = rawCharacters.map(normalizeCharacter);
    const places = safeArray(data.places?.places || data.places).map(normalizePlace);
    const sessions = safeArray(data.diary?.sessions).map(normalizeSession);
    const xpEvents = safeArray(data.xp?.registro_xp || data.xp?.events || data.xp).map(normalizeXpEvent);
    const { entities, nameIndex } = buildEntityIndex(characters, places, sessions);
    const relationSources = [...characters, ...places, ...sessions, ...xpEvents];
    const relations = inferRelations(relationSources, nameIndex);
    const timeline = buildTimeline(sessions, xpEvents, relations);

    const playableCharacters = characters.filter(c=>c.type === 'pg');
    const nonPlayerCharacters = characters.filter(c=>c.type !== 'pg');

    return {
      schema: 'thalor_normalized_v1',
      generatedAt: new Date().toISOString(),
      counts: {
        characters: characters.length,
        playableCharacters: playableCharacters.length,
        nonPlayerCharacters: nonPlayerCharacters.length,
        places: places.length,
        sessions: sessions.length,
        xpEvents: xpEvents.length,
        relations: relations.length,
        timeline: timeline.length
      },
      characters,
      playableCharacters,
      nonPlayerCharacters,
      places,
      sessions,
      xpEvents,
      relations,
      timeline,
      index: {
        entities: entities.map(e=>({ id:e.id, category:e.category, type:e.type, name:e.name || e.title, href:e.href || '' })),
        aliases: nameIndex.map(x=>({ alias:x.alias, target:x.targetId }))
      },
      quality: {
        notes: [
          'Relazioni e coinvolgimenti sono inferiti automaticamente dalle citazioni nei testi: vanno considerati collegamenti utili, non verità narrativa definitiva.',
          'La timeline normalizzata usa le sessioni e gli eventi XP disponibili; le date fantasy precise possono essere aggiunte in seguito ai dati del diario.'
        ],
        warnings: []
      }
    };
  }

  window.ThalorNormalize = {
    slugify,
    stripHtml,
    build: normalizeArchive
  };
})();
