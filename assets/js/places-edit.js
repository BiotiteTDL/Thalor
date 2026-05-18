(function(){
'use strict';

const STORAGE_KEY = 'thalor.places.v1';
const PLACES_SLUG = '__places__';
let CURRENT_DATA = null;
const FALLBACK = {
  version: 2,
  places: [
    {
      slug: 'valkren', type: 'city', title: 'L’Insenno di Valkren', tag: 'Villaggio costiero',
      subtitle: 'Dove la nebbia salmastra copre i moli, e le cripte ricordano ciò che il villaggio preferirebbe dimenticare.',
      image: 'assets/img/valkren_mappa.png',
      summary: 'Piccolo villaggio marittimo avvolto dalla nebbia salmastra, dove ha avuto inizio la campagna.',
      description: 'Un piccolo villaggio marittimo aggrappato alle coste fredde dell’Insenno di Valkren. Nebbia salmastra, moli umidi e case di pietra annerite dal vento ne fanno un luogo apparentemente tranquillo… ma sotto la superficie, il villaggio è già stato contaminato da qualcosa di antico.\n\nÈ qui che ha avuto inizio la campagna. Tra funerali mai avvenuti davvero, cripte dimenticate, simboli incisi nella pietra e rituali incomprensibili, l’Insenno è diventato il primo tassello della discesa verso ciò che Varek Thorm sta tentando di costruire.',
      interests: [
        {title:'Villa Thorm', image:'assets/img/villa_thorm.png', text:'Una grande magione marmorea affacciata sul mare, circondata da un giardino vasto e innaturalmente perfetto. Statue, sentieri bianchi e alberi provenienti da terre lontane testimoniano l’enorme ricchezza accumulata dalla famiglia Thorm attraverso il commercio navale.\n\nQui si è tenuta la veglia funebre di Varek Thorm. O almeno… così sembrava.\n\nDurante quella notte il Libro Mastro venne trafugato, il caos travolse la villa, Abraxas incendiò il falso cadavere di Varek con una bottiglia incendiaria e Lyria Thorm rimase gravemente ustionata.\n\nQuando la ragazza riapparve giorni dopo, parte del suo volto e del suo corpo erano stati sostituiti da sottili venature e placche dorate, come se l’oro fosse cresciuto sopra la carne distrutta.'},
        {title:'Mausoleo dei Thorm', image:'assets/img/valkren_mausoleo.png', text:'Situato nel vecchio cimitero del villaggio, il Mausoleo dei Thorm è molto più antico della famiglia stessa. L’ingresso conduce a cripte in marmo nero e bianco ornate da incisioni dorate ormai annerite dal tempo.\n\nNel cuore del complesso si trova la sala delle statue gemelle: una figura umana inginocchiata e uno scheletro nella stessa posa. Le mani delle statue restavano leggermente aperte, come in attesa.\n\nI personaggi riuscirono a risolvere l’enigma delle pietre nere e del rituale incompleto, comprendendo che il mausoleo non celebrava la morte… ma la trasformazione.'},
        {title:'Cappella Abbandonata', image:'assets/img/valkren_cappella.png', text:'Poco fuori dal villaggio, oltre i campi e le scogliere, sorge una cappella dimenticata che nessuno utilizza più da anni.\n\nL’interno era stato trasformato in un luogo rituale. I personaggi vi trovarono il cadavere mutilato del fioraio del villaggio, simboli rituali incisi nella pietra, tracce di esperimenti necromantici e i primi segni concreti dell’opera di Thorm.'},
        {title:'Porto di Valkren', image:'', text:'Un porto piccolo ma molto attivo, costruito attorno al commercio marittimo controllato dai Thorm. Tra le strutture principali si trovano magazzini mercantili, banchine da carico, reti da pesca, gru arrugginite ed edifici abitativi per marinai e lavoratori.'},
        {title:'Casa di Arolf Thelir', image:'', text:'Una dimora isolata piena di strumenti medici, disegni anatomici e odore di reagenti.'},
        {title:'Casa di Ralph', image:'', text:'Più simile a uno studio clandestino che a una vera abitazione. Bende sporche, strumenti metallici e testi proibiti occupano quasi ogni superficie.'},
        {title:'La Taverna', image:'', text:'Piccola, rumorosa e sempre piena di marinai.'},
        {title:'L’Alchimista', image:'', text:'Una minuscola bottega di reagenti e veleni.\n\nLa notte prima della partenza verso Portogrigio, Abraxas decapitò l’alchimista all’interno del suo stesso negozio, lasciando il villaggio in uno stato di silenziosa tensione.'}
      ],
      conclusionTitle: 'Atmosfera del Villaggio',
      conclusion: 'L’Insenno di Valkren vive sospeso tra decadenza e ricchezza. Da lontano appare come un semplice villaggio costiero. Ma chi vi rimane abbastanza a lungo inizia a notare che troppe persone evitano certi simboli. Che alcune porte restano chiuse anche durante il giorno. Che la nebbia sembra fermarsi troppo a lungo sopra il vecchio cimitero. E che, dopo il tramonto, il mare restituisce a riva cose che nessuno osa reclamare.'
    },
    {
      slug: 'portogrigio', type: 'city', title: 'Portogrigio', tag: 'Città portuale',
      subtitle: 'Dove il mare incontra il ferro, e ogni nave porta con sé una storia.',
      image: 'assets/img/portogrigio_mappa.png',
      summary: 'Il più grande porto della costa occidentale di Thalor, avvolto dalla nebbia marina e dominato dal commercio.',
      description: 'Portogrigio è una delle città portuali più grandi e importanti di Thalor. Costruita attorno a un’enorme baia naturale, nel corso dei secoli è diventata il cuore commerciale della costa occidentale.\n\nLa città prende il nome dalla costante foschia marina che avvolge il porto per gran parte dell’anno, tingendo pietra, tetti e moli di sfumature grigie.\n\nOgni giorno centinaia di navi attraccano ai suoi moli, mentre mercanti, marinai e carovane provenienti dall’interno riempiono le sue strade.',
      interests: [
        {title:'Il Grande Porto', image:'', text:'Il cuore della città. Navi mercantili, flotte da pesca e imbarcazioni militari attraccano giorno e notte.'},
        {title:'Mercato delle Maree', image:'', text:'Uno dei mercati più grandi di Thalor, pieno di spezie, mappe, gioielli e merci provenienti da terre lontane.'},
        {title:'Distretto Accademico', image:'', text:'Zona elegante della città che ospita biblioteche, laboratori e l’Accademia di Medicina.'},
        {title:'Il Faro di Portogrigio', image:'', text:'Simbolo della città. La sua luce guida le navi attraverso le tempeste da secoli.'},
        {title:'I Canali Interni', image:'', text:'Una fitta rete di canali attraversa la città, usata per il trasporto merci e i collegamenti tra quartieri.'}
      ],
      sections: [
        {title:'Atmosfera', cards:[
          {title:'Di giorno', text:'Urla di marinai e mercanti riempiono il porto.\nI mercati traboccano di spezie, stoffe e pesce fresco.\nLe accademie attirano studenti da tutta Thalor.'},
          {title:'Di notte', text:'Lanterne illuminano i canali interni.\nTaverne e moli restano vivi fino all’alba.\nLa città si riflette sull’acqua tra nebbia e pioggia.'}
        ], text:'A Portogrigio conta più ciò che sai fare… che da dove provieni.'},
        {title:'Fazioni principali', cards:[
          {title:'I Becchini della Pioggia', text:'Organizzazione incaricata di funerali, recupero dei corpi e manutenzione dei cimiteri. Sono riconoscibili dai lunghi mantelli impermeabili grigi e dalle lanterne schermate.'},
          {title:'Accademia di Medicina', text:'La più importante istituzione medica della regione. Forma medici, anatomisti e chirurghi provenienti da tutto il continente.'},
          {title:'Gilda dei Mercanti', text:'La forza economica dominante della città. Controlla commercio navale, tasse portuali e magazzini.'},
          {title:'Gilda dei Marinai', text:'La voce del porto. Rappresenta capitani, pescatori, navigatori ed equipaggi mercantili.'}
        ]},
        {title:'Cultura cittadina', text:'Portogrigio è abituata al cambiamento. Qui convivono culture, lingue e religioni provenienti da tutto il continente.\n\nI cittadini tendono a rispettare abilità, esperienza e reputazione più del sangue o della nobiltà.'},
        {title:'Taverne famose', list:['La Sirena Spezzata — Frequentata da marinai e capitani.','Il Nodo Salato — Ritrovo della Gilda dei Marinai.','L’Ultima Marea — Taverna elegante vicina al porto privato.']},
        {title:'Curiosità', list:['A Portogrigio piove molto più spesso rispetto ad altre città costiere.','I bambini del porto imparano a nuotare prima ancora di leggere.','Campane sparse per la città segnalano tempeste e incendi navali.','Il pesce speziato locale è famoso in tutta Thalor.','Le gare di navigazione attirano equipaggi da ogni regione.']}
      ],
      conclusionTitle: 'Portogrigio nella campagna',
      conclusion: 'Il porto non dorme mai davvero, e ogni vicolo sembra custodire un accordo, un segreto o una promessa non mantenuta.'
    },
    {
      slug: 'accademia-medicina', type: 'dungeon', title: 'Accademia di Medicina', tag: 'Portogrigio · Distretto Accademico',
      subtitle: 'L’istituzione medica più prestigiosa della costa occidentale di Thalor. Dietro le sue aule illuminate e le immense biblioteche, qualcosa continua ancora a respirare sotto la pietra.',
      image: 'assets/img/stanze-otmar.png',
      summary: 'I laboratori proibiti di Otmar Van Verschuer nascosti sotto il distretto accademico di Portogrigio.',
      description: 'L’Accademia di Medicina domina il distretto accademico di Portogrigio con alte finestre gotiche, cortili interni e lunghi corridoi illuminati da lampade a olio. Ogni anno studenti provenienti da tutto Thalor attraversano le sue porte per studiare anatomia, chirurgia e le arti della guarigione.\n\nPer la città rappresenta progresso, conoscenza e prestigio. Per alcuni, invece, è soltanto una facciata.\n\nNei registri ufficiali il nome di Otmar Van Verschuer compare ancora accanto a decenni di ricerche mediche e studi sulle malattie ereditarie. Ma nei sotterranei dimenticati sotto l’istituto esistono tracce di qualcosa di diverso.\n\nPorte murate. Sale anatomiche non segnate sulle planimetrie. Strumenti chirurgici lasciati arrugginire accanto a tavoli ancora macchiati di sangue secco. E simboli che nessun insegnante dell’Accademia osa riconoscere apertamente.\n\nI documenti recuperati nei laboratori nascosti parlano di innesti necrotici, sostituzione dei tessuti vivi e di un concetto ricorrente chiamato soltanto: La Forma Finale.\n\nSecondo alcuni membri dei Becchini della Pioggia, durante le notti di tempesta si possono ancora udire rumori provenire dalle profondità dell’istituto. Catene. Metallo trascinato sulla pietra. E qualcosa che sembra tentare lentamente di rialzarsi.',
      interests: [
        {title:'Laboratori Proibiti', image:'', text:'Sale di preparazione, vivisezione e conservazione dei tessuti utilizzate per gli esperimenti sugli innesti necrotici.'},
        {title:'Camera del Frammento', image:'', text:'Una sala quasi vuota dominata da un grande spazio rituale centrale. Catene spezzate giacciono sparse sul pavimento mentre sottili incisioni attraversano la pietra come vene disseccate. L’ambiente trasmette una sensazione innaturale di silenzio, come se qualcosa fosse stato rimosso… o liberato.'},
        {title:'Sala degli Esperimenti', image:'', text:'Una vasta sala adibita agli esperimenti sui soggetti dell’Accademia. Lunghi tavoli operatori occupano la stanza, circondati da strumenti chirurgici, contenitori anatomici e resti di dissezioni mai completate. I corpi catalogati giacciono ancora sui letti metallici, marchiati con sigle e annotazioni lasciate dagli studiosi di Otmar.'},
        {title:'Deposito Organi e Tessuti', image:'', text:'Barattoli sigillati, campioni immersi in soluzioni sconosciute e registri ormai quasi illeggibili.'}
      ],
      sections: [
        {title:'Sale Principali', cards:[
          {title:'Sala degli Esperimenti', image:'assets/img/otmar_camera_frammento.png', text:'Una vasta sala adibita agli esperimenti sui soggetti dell’Accademia. Lunghi tavoli operatori occupano la stanza, circondati da strumenti chirurgici, contenitori anatomici e resti di dissezioni mai completate. I corpi catalogati giacciono ancora sui letti metallici, marchiati con sigle e annotazioni lasciate dagli studiosi di Otmar.'},
          {title:'Laboratorio di Vivisezione', image:'assets/img/otmar_vivisezione.png', text:'Il cuore chirurgico dei sotterranei. Tavoli operatori disposti con precisione quasi accademica occupano la sala, circondati da scaffali, campioni anatomici e strumenti metallici. Al centro, un corpo è ancora fissato al banco principale, come se l’ultima procedura fosse stata interrotta solo pochi istanti prima.'},
          {title:'Camera del Frammento', image:'assets/img/otmar_celle.png', text:'Una sala quasi vuota dominata da un grande spazio rituale centrale. Catene spezzate giacciono sparse sul pavimento mentre sottili incisioni attraversano la pietra come vene disseccate. L’ambiente trasmette una sensazione innaturale di silenzio, come se qualcosa fosse stato rimosso… o liberato.'}
        ]}
      ],
      conclusionTitle: 'Presenza nella campagna',
      conclusion: 'L’Accademia è il volto pubblico della conoscenza medica di Portogrigio, ma i suoi sotterranei hanno mostrato al gruppo una verità molto più oscura.'
    }
  ]
};

const esc = (v)=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const internalHref=(href)=>{
  const raw=String(href||'').trim();
  if(!raw) return '#';
  if(/^(javascript:|data:|vbscript:|https?:|mailto:|tel:|\/\/)/i.test(raw)) return '#';
  return raw.replace(/["'<>\s]/g,'');
};
const richText=(v)=>esc(v).replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g,(_,label,href)=>`<a class="lore-link" href="${esc(internalHref(href))}">${esc(label)}</a>`);
const slugify = (v)=>String(v||'luogo').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,60)||'luogo';
const nl2p = (v)=>String(v||'').split(/\n{2,}/).map(p=>`<p>${richText(p).replace(/\n/g,'<br>')}</p>`).join('');
const rootPrefix = ()=> document.body?.dataset?.rootPrefix || (location.pathname.includes('/luoghi/') ? '../' : '');
const asset = (url)=>{ if(!url) return ''; if(/^data:|^https?:|^\.\.?\//.test(url)) return url; return rootPrefix()+url.replace(/^\/+/, ''); };
const detailHref = (p)=> p.href || `luoghi/dettaglio-luogo.html?slug=${encodeURIComponent(p.slug)}`;
const localDetailHref = (p)=> p.href || `dettaglio-luogo.html?slug=${encodeURIComponent(p.slug)}`;

function enrichData(data){
  const copy = data && Array.isArray(data.places) ? JSON.parse(JSON.stringify(data)) : JSON.parse(JSON.stringify(FALLBACK));
  FALLBACK.places.forEach(fb=>{
    const idx = copy.places.findIndex(p=>p.slug===fb.slug);
    if(idx < 0){ copy.places.push(JSON.parse(JSON.stringify(fb))); return; }
    const cur = copy.places[idx] || {};
    const merged = {...fb, ...cur};
    if(!cur.description || String(cur.description).length < String(fb.description||'').length) merged.description = fb.description;
    if(!Array.isArray(cur.interests) || cur.interests.length < (fb.interests||[]).length) merged.interests = JSON.parse(JSON.stringify(fb.interests||[]));
    if(!cur.conclusion || String(cur.conclusion).length < String(fb.conclusion||'').length) merged.conclusion = fb.conclusion;
    if(!cur.conclusionTitle) merged.conclusionTitle = fb.conclusionTitle;
    if(!Array.isArray(cur.sections) || cur.sections.length < (fb.sections||[]).length) merged.sections = JSON.parse(JSON.stringify(fb.sections||[]));
    copy.places[idx] = merged;
  });
  copy.version = Math.max(Number(copy.version||1), Number(FALLBACK.version||1));
  return copy;
}
function load(){ return CURRENT_DATA || JSON.parse(JSON.stringify(FALLBACK)); }
async function loadFresh(){
  let data = JSON.parse(JSON.stringify(FALLBACK));
  let freshLoaded = false;
  try{
    if(window.ThalorAuth?.state?.configured && navigator.onLine !== false){
      const online = await window.ThalorAuth.loadCharacter(PLACES_SLUG, null,{publicRead:true});
      if(online && Array.isArray(online.places)){
        data = enrichData(online); freshLoaded = true;
        try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }catch(e){}
      }
    }
  }catch(e){ console.warn('Luoghi online non disponibili, uso fallback locale:', e); }
  if(!freshLoaded){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      if(raw){ const parsed = JSON.parse(raw); if(parsed && Array.isArray(parsed.places)) data = enrichData(parsed); }
    }catch(e){}
  }
  CURRENT_DATA = data;
  return CURRENT_DATA;
}
function save(data){ CURRENT_DATA = enrichData(data); localStorage.setItem(STORAGE_KEY, JSON.stringify(CURRENT_DATA)); if(window.ThalorAuth?.state?.configured && !window.ThalorAuth.state.localMaster && navigator.onLine !== false){ window.ThalorAuth.saveCharacter(PLACES_SLUG, CURRENT_DATA).catch(e=>console.warn('Salvataggio luoghi online non riuscito:', e)); } }
function findPlace(slug){ return load().places.find(p=>p.slug===slug) || FALLBACK.places.find(p=>p.slug===slug); }
function isLocalPreview(){
  try{
    const h = String(location.hostname || '').toLowerCase();
    const pr = String(location.protocol || '').toLowerCase();
    return pr === 'file:' || h === '' || h === 'localhost' || h === '127.0.0.1' || h === '::1' || /^192\.168\./.test(h) || /^10\./.test(h) || /^172\.(1[6-9]|2\d|3[0-1])\./.test(h);
  }catch(e){ return false; }
}
function offlineMasterFlag(){
  try{
    const params = new URLSearchParams(location.search);
    if(params.get('master') === 'offline' || params.get('thalorMaster') === '1') return true;
    return localStorage.getItem('thalor.offlineMaster') === '1' || sessionStorage.getItem('thalor.offlineMaster') === '1';
  }catch(e){ return false; }
}
async function canEdit(){
  try{ if(window.ThalorAuth?.init) await window.ThalorAuth.init(); }catch(e){}
  try{ if(window.ThalorAuth?.canEdit?.('__places__')) return true; }catch(e){}
  try{ if(window.ThalorAuth?.isMaster?.()) return true; }catch(e){}
  // Fallback indispensabile per pagine statiche dei luoghi aperte in file:// / localhost:
  // se il Master offline è attivo ma l'auth non è ancora pronta, il tondino deve comunque comparire.
  return isLocalPreview() && offlineMasterFlag();
}
function fileToData(input){
  return new Promise(resolve=>{
    const f=input.files&&input.files[0];
    if(!f) return resolve('');
    const r=new FileReader();
    r.onload=()=>resolve(String(r.result||''));
    r.onerror=()=>resolve('');
    r.readAsDataURL(f);
  });
}

function indexCard(p){
  const href=detailHref(p);
  return `<article class="city-card place-card-editable" data-place-card="${esc(p.slug)}">
    <h3>${richText(p.title)}</h3>
    <p>${richText(p.summary || p.subtitle || '')}</p>
    <a class="card-overlay-link" href="${esc(href)}" aria-label="Apri ${esc(p.title)}"></a>
  </article>`;
}
function renderIndex(){
  const app = document.querySelector('[data-places-index]');
  if(!app) return;
  const data=load();
  const cities=data.places.filter(p=>p.type!=='dungeon');
  const dungeons=data.places.filter(p=>p.type==='dungeon');
  app.innerHTML = `<section><h2 class="section-title">Esplorazione</h2><div class="grid places-grid-two">
    <article class="card places-category-card"><div class="icon">🏙</div><h3>Città</h3><p>Centri abitati, porti, capitali, roccaforti e crocevia commerciali.</p><div class="city-list compact-city-list">${cities.map(indexCard).join('')}</div></article>
    <article class="card places-category-card"><div class="icon">⛓</div><h3>Dungeon</h3><p>Cripte, grotte, rovine rituali, sotterranei e luoghi già esplorati durante la campagna.</p><div class="city-list compact-city-list">${dungeons.map(indexCard).join('')}</div></article>
    </div></section>`;
}
function interestCard(i, dungeon){
  return `<article class="card place-interest-card">${i.image?`<img src="${esc(asset(i.image))}" alt="${esc(i.title)}" loading="lazy" decoding="async"/>`:''}<h3>${richText(i.title)}</h3>${nl2p(i.text)}</article>`;
}
function renderExtraSection(sec){
  if(!sec || !sec.title) return '';
  const cards = Array.isArray(sec.cards) && sec.cards.length ? `<div class="grid-two">${sec.cards.map(c=>`<div class="info-card">${c.image?`<img src="${esc(asset(c.image))}" alt="${esc(c.title||'')}" loading="lazy" decoding="async" style="width:100%;margin-bottom:14px;border:1px solid rgba(200,164,93,.2);"/>`:''}<h3>${richText(c.title||'')}</h3>${nl2p(c.text||'')}</div>`).join('')}</div>` : '';
  const list = Array.isArray(sec.list) && sec.list.length ? `<ul class="styled-list">${sec.list.map(x=>`<li>${richText(x)}</li>`).join('')}</ul>` : '';
  const text = sec.text ? nl2p(sec.text) : '';
  return `<section class="panel place-extra-section"><h2 class="section-title">${richText(sec.title)}</h2>${cards}${text}${list}</section>`;
}
function renderDetail(place){
  const app=document.querySelector('[data-place-detail]');
  if(!app || !place) return;
  document.title = `${place.title} — Thalor`;
  const isDungeon=place.type==='dungeon';
  app.innerHTML = `<section class="hero place-hero-compact"><span class="tag">${richText(place.tag || (isDungeon?'Dungeon':'Città'))}</span><h1 class="hero-title">${richText(place.title)}</h1><p class="hero-subtitle">${richText(place.subtitle||'')}</p></section>
  <section class="panel place-map-panel"><h2 class="section-title">${isDungeon?'Mappa / struttura':'Mappa'}</h2>${place.image?`<div class="map-frame"><img src="${esc(asset(place.image))}" alt="${esc(place.title)}"/></div>`:`<p class="section-note">Nessuna immagine caricata.</p>`}</section>
  <section class="panel lore-section place-description-panel"><h2 class="section-title">Descrizione</h2>${nl2p(place.description)}</section>
  <section class="panel"><h2 class="section-title">${isDungeon?'Aree e sale principali':'Luoghi di interesse'}</h2><div class="grid place-interest-grid">${(place.interests||[]).map(i=>interestCard(i,isDungeon)).join('') || '<p class="section-note">Nessun elemento inserito.</p>'}</div></section>
  ${(place.sections||[]).map(renderExtraSection).join('')}
  <section class="panel lore-section place-conclusion-panel"><h2 class="section-title">${richText(place.conclusionTitle || 'Conclusione')}</h2>${nl2p(place.conclusion)}</section>
  <p class="place-top-actions"><a class="button" href="${rootPrefix()}luoghi.html">Torna ai luoghi</a></p>`;
}

function formPlace(place){
  const p=JSON.parse(JSON.stringify(place||{type:'city',title:'Nuovo luogo',tag:'',subtitle:'',summary:'',image:'',description:'',interests:[],conclusionTitle:'Conclusione',conclusion:''}));
  p.interests=Array.isArray(p.interests)?p.interests:[];
  return `<div class="place-editor-grid">
    <label>Tipo<select id="placeEditType"><option value="city" ${p.type!=='dungeon'?'selected':''}>Città</option><option value="dungeon" ${p.type==='dungeon'?'selected':''}>Dungeon</option></select></label>
    <label>Titolo<input id="placeEditTitle" value="${esc(p.title)}"></label>
    <label>Etichetta<input id="placeEditTag" value="${esc(p.tag||'')}"></label>
    <label>Riassunto card<input id="placeEditSummary" value="${esc(p.summary||'')}"></label>
    <label class="wide">Sottotitolo<textarea id="placeEditSubtitle">${esc(p.subtitle||'')}</textarea></label>
    <label class="wide">Mappa / immagine principale<input id="placeEditImageFile" type="file" accept="image/*"><input id="placeEditImage" value="${esc(p.image||'')}" placeholder="assets/img/... oppure immagine caricata"></label>
    <label class="wide">Descrizione<textarea id="placeEditDescription" rows="7">${esc(p.description||'')}</textarea></label>
    <div class="wide place-edit-list"><div class="place-edit-list-head"><h3>Luoghi/Aree interne</h3><button type="button" class="mini-add always-visible" id="placeAddInterest">+ Elemento</button></div><div id="placeInterestEditor">${p.interests.map((x,i)=>interestEditor(x,i)).join('')}</div></div>
    <label>Titolo sezione conclusiva<input id="placeEditConclusionTitle" value="${esc(p.conclusionTitle||'Conclusione')}"></label>
    <label class="wide">Testo conclusivo<textarea id="placeEditConclusion" rows="5">${esc(p.conclusion||'')}</textarea></label>
  </div>`;
}
function interestEditor(x,i){
  return `<div class="place-interest-editor" data-interest-row="${i}">
    <div class="place-interest-editor-top"><strong>Elemento ${i+1}</strong><button type="button" class="row-del" data-remove-interest="${i}">Elimina</button></div>
    <label>Titolo<input data-interest-title value="${esc(x.title||'')}"></label>
    <label>Immagine<input data-interest-file type="file" accept="image/*"><input data-interest-image value="${esc(x.image||'')}" placeholder="assets/img/... oppure immagine caricata"></label>
    <label class="wide">Descrizione<textarea data-interest-text rows="4">${esc(x.text||'')}</textarea></label>
  </div>`;
}
function readForm(oldSlug){
  const title=document.getElementById('placeEditTitle').value.trim() || 'Nuovo luogo';
  const slug = oldSlug || slugify(title);
  const rows=[...document.querySelectorAll('[data-interest-row]')].map(row=>({
    title: row.querySelector('[data-interest-title]').value.trim(),
    image: row.querySelector('[data-interest-image]').value.trim(),
    text: row.querySelector('[data-interest-text]').value.trim()
  })).filter(x=>x.title||x.text||x.image);
  const preserved = oldSlug ? findPlace(oldSlug) : null;
  const result = {slug,type:document.getElementById('placeEditType').value,title,tag:document.getElementById('placeEditTag').value.trim(),summary:document.getElementById('placeEditSummary').value.trim(),subtitle:document.getElementById('placeEditSubtitle').value.trim(),image:document.getElementById('placeEditImage').value.trim(),description:document.getElementById('placeEditDescription').value.trim(),interests:rows,conclusionTitle:document.getElementById('placeEditConclusionTitle').value.trim()||'Conclusione',conclusion:document.getElementById('placeEditConclusion').value.trim()};
  if(preserved && Array.isArray(preserved.sections)) result.sections = preserved.sections;
  return result;
}
function openModal(title,body,actions){
  document.querySelector('.place-modal-backdrop')?.remove();
  const wrap=document.createElement('div');
  wrap.className='place-modal-backdrop';
  wrap.innerHTML=`<div class="place-modal"><header><h2>${esc(title)}</h2><button type="button" class="modal-x" data-place-close>×</button></header><div class="place-modal-body">${body}</div><footer>${actions||''}</footer></div>`;
  document.body.appendChild(wrap);
  wrap.querySelectorAll('[data-place-close]').forEach(b=>b.onclick=()=>wrap.remove());
  return wrap;
}
async function collectUploads(scope){
  const mainFile=scope.querySelector('#placeEditImageFile');
  if(mainFile?.files?.length){ scope.querySelector('#placeEditImage').value = await fileToData(mainFile); }
  for(const row of scope.querySelectorAll('[data-interest-row]')){
    const f=row.querySelector('[data-interest-file]');
    if(f?.files?.length){ row.querySelector('[data-interest-image]').value = await fileToData(f); }
  }
}
function savePlace(place, oldSlug){
  const data=load();
  if(oldSlug && oldSlug!==place.slug){ data.places=data.places.filter(p=>p.slug!==oldSlug); }
  const idx=data.places.findIndex(p=>p.slug===place.slug);
  if(idx>=0) data.places[idx]=place; else data.places.push(place);
  save(data);
}
function deletePlace(slug){
  const data=load();
  data.places=data.places.filter(p=>p.slug!==slug);
  save(data);
}
function openEditor(place){
  const oldSlug=place?.slug||'';
  const modal=openModal(place?'Modifica luogo':'Nuovo luogo', formPlace(place), '<button type="button" class="button ghost-button" data-place-close>Annulla</button><button type="button" class="button save-button" id="placeSaveBtn">Salva</button>');
  const rerenderInterests=()=>{
    const temp=readForm(oldSlug); const box=modal.querySelector('#placeInterestEditor');
    box.innerHTML=temp.interests.map((x,i)=>interestEditor(x,i)).join(''); bindRows();
  };
  const bindRows=()=>{
    modal.querySelectorAll('[data-remove-interest]').forEach(btn=>btn.onclick=()=>{ btn.closest('[data-interest-row]').remove(); });
  };
  bindRows();
  modal.querySelector('#placeAddInterest').onclick=()=>{
    const box=modal.querySelector('#placeInterestEditor');
    const n=box.querySelectorAll('[data-interest-row]').length;
    box.insertAdjacentHTML('beforeend', interestEditor({title:'Nuovo elemento',image:'',text:''},n)); bindRows();
  };
  modal.querySelector('#placeSaveBtn').onclick=async()=>{
    await collectUploads(modal);
    const newPlace=readForm(oldSlug);
    savePlace(newPlace, oldSlug);
    modal.remove();
    if(document.querySelector('[data-places-index]')) renderIndex();
    if(document.querySelector('[data-place-detail]')) renderDetail(newPlace);
  };
}
function floatingEditor(place){
  const nav=document.createElement('nav');
  nav.className='places-floating-actions';
  const isDetail=!!place;
  nav.innerHTML=`<button type="button" class="places-float-toggle" aria-expanded="false">✦</button><div class="places-float-menu"><button type="button" data-place-new-city>+ Città</button><button type="button" data-place-new-dungeon>+ Dungeon</button>${isDetail?'<button type="button" data-place-edit>Modifica pagina</button><button type="button" data-place-delete>Elimina</button>':''}</div>`;
  document.body.appendChild(nav);
  const toggle=nav.querySelector('.places-float-toggle');
  toggle.onclick=()=>{ const open=!nav.classList.contains('open'); nav.classList.toggle('open',open); toggle.setAttribute('aria-expanded',open?'true':'false'); };
  nav.querySelector('[data-place-new-city]').onclick=()=>openEditor({type:'city',title:'Nuova città',tag:'Città',subtitle:'',summary:'',image:'',description:'',interests:[],conclusionTitle:'Conclusione',conclusion:''});
  nav.querySelector('[data-place-new-dungeon]').onclick=()=>openEditor({type:'dungeon',title:'Nuovo dungeon',tag:'Dungeon',subtitle:'',summary:'',image:'',description:'',interests:[],conclusionTitle:'Conclusione',conclusion:''});
  if(isDetail){
    nav.querySelector('[data-place-edit]').onclick=()=>openEditor(place);
    nav.querySelector('[data-place-delete]').onclick=()=>{ if(!confirm(`Eliminare "${place.title}" dai Luoghi?`)) return; if(!confirm('Confermi? Verrà rimossa anche la pagina dinamica collegata.')) return; deletePlace(place.slug); location.href=rootPrefix()+'luoghi.html'; };
  }
}
function currentSlug(){
  const q=new URLSearchParams(location.search).get('slug');
  if(q) return q;
  const ds=document.body?.dataset?.placeSlug;
  if(ds) return ds;
  const path=location.pathname;
  if(path.includes('valkren')) return 'valkren';
  if(path.includes('accademia-medicina')) return 'accademia-medicina';
  if(path.includes('portogrigio')) return 'portogrigio';
  return '';
}
function enhanceStaticPage(place){
  if(!place) return;
  const stored=findPlace(place.slug);
  if(stored && localStorage.getItem(STORAGE_KEY)){
    const app=document.createElement('div');
    app.setAttribute('data-place-detail','');
    const main=document.querySelector('main.page');
    if(main){ main.innerHTML=''; main.appendChild(app); const f=document.createElement('footer'); f.textContent='Thalor'; main.appendChild(f); renderDetail(stored); }
  }
}
async function ensureFloatingEditor(place){
  if(document.querySelector('.places-floating-actions')) return;
  if(await canEdit()) floatingEditor(place || null);
}
async function init(){
  document.body.classList.add('places-edit-ready');
  await loadFresh();
  if(document.querySelector('[data-places-index]')) renderIndex();
  const slug=currentSlug();
  let place=slug?findPlace(slug):null;
  if(document.querySelector('[data-place-detail]')) renderDetail(place);
  else if(document.body.dataset.placeSlug) enhanceStaticPage(place);
  await ensureFloatingEditor(place || null);
  // Alcune pagine statiche caricano/aggiornano lo stato master dopo questo script:
  // riprovo e ascolto i cambi di auth/offline master senza toccare il resto della pagina.
  setTimeout(()=>ensureFloatingEditor(place || null), 250);
  setTimeout(()=>ensureFloatingEditor(place || null), 1000);
  window.addEventListener('thalor-auth-changed', ()=>ensureFloatingEditor(place || null));
  window.addEventListener('thalor-local-master-changed', ()=>ensureFloatingEditor(place || null));
}
init();
})();
