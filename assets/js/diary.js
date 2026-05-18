(()=>{
'use strict';
const app=document.getElementById('diaryApp');
const slug='diario';
const storageKey='thalor.diary.v1';
const esc=(v)=>String(v??'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
const internalHref=(href)=>{const raw=String(href||'').trim();if(!raw)return '#';if(/^(javascript:|data:|vbscript:|https?:|mailto:|tel:|\/\/)/i.test(raw))return '#';return raw.replace(/["'<>\s]/g,'');};
const richText=(v)=>esc(v).replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g,(_,label,href)=>`<a class="lore-link" href="${esc(internalHref(href))}">${esc(label)}</a>`);
const nl=(v)=>String(v??'').split(/\n+/).map(x=>x.trim()).filter(Boolean);
const makeSessionId=(value)=>String(value||'sessione').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,56)||('sessione-'+Date.now());
const sessionDetailHref=(id)=>`diario/sessione-dettaglio.html?id=${encodeURIComponent(String(id||''))}`;
const uniqueSessionId=(sessions,title)=>{const base=makeSessionId(title||'nuova-sessione');let id=base,n=2;const used=new Set((sessions||[]).map(s=>String(s.id||'')));while(used.has(id)){id=`${base}-${n++}`;}return id;};
const authAvailable=()=>!!(window.ThalorAuth&&typeof window.ThalorAuth.init==='function');
function canMasterEdit(){
  try{return authAvailable()&&window.ThalorAuth.isMaster&&window.ThalorAuth.isMaster();}catch(e){return false;}
}
function statusText(){
  if(!authAvailable())return 'Autenticazione non disponibile.';
  try{return window.ThalorAuth.statusText?window.ThalorAuth.statusText():(canMasterEdit()?'Accesso Master attivo.':'Solo lettura.');}catch(e){return 'Stato accesso non disponibile.';}
}
function fallbackData(){return {
  currentDate:'5 Genor · Veneris · 1345 D.B.',
  dateNote:'D.B. significa “dopo Birthomar”.',
  months:['Genor','Febrion','Marveth','Apryss','Majora','Juneth','Lugras','Aurest','Sether','Ottaryn','Novaris','Decemor'],
  weekdays:['Lunor','Martar','Mercor','Giovar','Veneris','Satur','Solaris'],
  sessions:[
    {tag:'Sessione I',title:'La Veglia del Mercante',href:'diario/sessione1.html',description:'Il funerale di Varek Thorm, il furto del Libro Mastro, la cappella abbandonata e il segreto del Mausoleo dei Thorm.'},
    {tag:'Sessione II',title:'Il Mare della Pioggia Nera',href:'diario/sessione2.html',description:'La trattativa con Lyria, il sacrificio dell’alchimista, il viaggio in mare e l’arrivo a Portogrigio.'},
    {tag:'Sessione III',title:'Il Laboratorio dell’Innesto',href:'diario/sessione3.html',description:'L’Accademia di Medicina, i laboratori di Otmar, la Crucimigrazione e l’incontro con Abdul Alhazred.'}
  ],
  dreamSections:[
    {character:'Irven Till',characterUrl:'personaggi/irven.html',title:'La quiete della piaga',body:`Non c’è cielo.
Non c’è terra.
Solo una distesa infinita, grigia… immobile.

Davanti a te, nel vuoto, tremolano piccole fiammelle bianche.
Sono ovunque. Silenziose. Vive.

Una si spegne.
Non del tutto… cambia.
Diventa nera.

Poi un’altra.
Poi altre ancora.
Sempre più velocemente.

Il bianco scompare. Il nero si diffonde come una malattia che non conosce cura.

Ti accorgi che… non c’è dolore in questo cambiamento.
Solo quiete.

E per la prima volta…
nessuna di quelle luci è diversa dalle altre.

Non c’è fuga.
Non c’è vergogna.

Sei… uguale a loro.`},
    {character:'Ralph Mengele',characterUrl:'personaggi/ralph.html',title:'Il perfezionamento',body:`Vedi la stessa distesa.
Le stesse fiammelle.
Lo stesso lento morire del bianco.

Ma questa volta… qualcosa è diverso.

Quando il nero si diffonde, non si ferma.

Vibra.
Si contorce.

E poi… cambia ancora.

Una fiammella nera diventa rossa.
Rosso vivo.
Rosso pulsante.

E con quel colore arriva qualcosa.

Un urlo — ma senza suono.
Una sofferenza che non si spegne.

Le altre seguono.
Nero… rosso… nero… rosso…

Un mare infinito di anime che bruciano senza consumarsi.
Eppure… nessuna si spegne davvero.

Il dolore le tiene insieme.
Le ancora.
Le rende eterne.

E per un istante… capisci:
questo non è un errore.

È un perfezionamento.`},
    {character:'Abraxas',characterUrl:'personaggi/abraxas.html',title:'Ciò che raccoglie',body:`Il rosso riempie ogni cosa.

Le fiammelle non sono più luce…
sono ferite che bruciano senza consumarsi.

Si muovono.
Non fuggono…
cercano.

Tutte nella stessa direzione.

In lontananza, qualcosa rompe l’uniformità del dolore.

Un punto scuro.
Immobile.
Silenzioso.

Più ti avvicini… più capisci.

Non emette luce.
Non brucia.

È… calmo.

Le anime rosse si accalcano attorno a esso.
Tremano. Si contorcono.

Poi una… si ferma.
Si avvicina lentamente.

Per un istante, il dolore sembra aumentare… come se esitasse.

Poi lo tocca.

Il rosso svanisce.

Non torna bianco.
Non torna nero.

Diventa… vuoto.
Silenzioso.
E immobile.

Le altre vedono.
E capiscono.

Una dopo l’altra… si avvicinano.

Non c’è più esitazione ora.
Solo bisogno.
Solo desiderio di smettere.

E mentre il mare rosso si assottiglia…
il punto scuro cresce.

Senza forma.
Senza volto.

Ma con una presenza che si impone su tutto.

E per un istante…
hai la certezza che non sta offrendo salvezza.

Sta… raccogliendo.`}
  ],
  loreSections:[
    {title:'Le Guerre Antiche',subtitle:'Delle Guerre Antiche e dell’Ombra che Ritorna',paragraphs:[
      'Molto prima della nascita dei regni moderni, prima che le città innalzassero mura e i popoli imparassero a convivere sotto gli stessi stendardi, il mondo conobbe un’epoca di guerra tanto antica da essere ormai divenuta leggenda.',
      'Le cronache più remote parlano di un conflitto che travolse il Piano Materiale stesso. Un’epoca in cui la vita e la morte smisero di essere parte dello stesso ciclo… e iniziarono a combattersi.',
      'Le armate della non morte si riversarono sul mondo come una piaga. Cadaveri rianimati marciavano senza sosta sotto cieli anneriti dalla cenere. Intere città sparivano nel silenzio. I grandi regni cadevano uno dopo l’altro mentre antichi signori delle tenebre trascinavano il mondo verso un’eternità di freddo e oscurità.',
      'A opporsi a loro sorsero campioni provenienti da ogni angolo del continente: paladini consacrati, ordini sacri, maghi capaci di piegare la luce stessa e creature leggendarie il cui nome è ormai stato perduto o deformato dal tempo.',
      'La guerra durò anni. Forse secoli. Nessuno lo sa davvero. Ma il mondo ne uscì spezzato.',
      'Ancora oggi esistono luoghi in cui quella battaglia sembra non essere mai terminata: foreste contaminate, terre sterili, cripte dimenticate e rovine nelle quali la morte continua a sussurrare sotto la pietra.',
      'La più vasta di queste cicatrici si trova nel nord-ovest di Thalor: una terra cupa, avvolta da superstizioni e lentamente consumata da una corruzione che continua ad espandersi anno dopo anno.',
      'Molti evitano quelle regioni. Altri vi si recano per cercare reliquie perdute, conoscenze proibite o antichi poteri dimenticati. Perché qualcosa dorme ancora sotto quelle terre. Qualcosa di antico. Qualcosa che non avrebbe mai dovuto sopravvivere.'
    ]},
    {title:'L’Era Attuale',subtitle:'1345 anni dopo Birthomar',paragraphs:[
      'Sono trascorsi 1345 anni dalla fondazione di Birthomar, il più grande crocevia del continente. Una città immensa, dove razze diverse convivono sotto una pace fragile, fatta più di interessi e paura che di vera fiducia.',
      'Le guerre non sono finite. Hanno solo cambiato volto.',
      'Nelle corti nobiliari si stringono accordi destinati a spezzarsi nel sangue. Nelle accademie si studiano arti che sarebbe meglio dimenticare. Nei sotterranei delle città, culti segreti venerano simboli che nessuno osa mostrare alla luce del sole.',
      'E intanto, tra rovine dimenticate e mercati clandestini, strani reperti iniziano a riemergere dal passato: ossa impossibili, pietre che pulsano come cuori vivi, oggetti capaci di attirare i morti o infestare i sogni di chi li possiede.',
      'Molti li considerano semplici reliquie maledette. Altri sono disposti a uccidere per ottenerli. Ma quasi nessuno comprende davvero ciò che sta accadendo.'
    ]},
    {title:'Il Mercante Morto',subtitle:'Varek Thorm e il funerale impossibile',paragraphs:[
      'Nel remoto nord-ovest di Thalor, nell’insenatura oscura di Valkren, la notizia della morte di un ricco mercante richiama individui provenienti da luoghi e vite molto diverse.',
      'Il suo nome era Varek Thorm. Collezionista. Benefattore. Mercante influente. Almeno in apparenza.',
      'Il suo funerale attira persone mosse da curiosità, interesse, avidità… o da motivazioni ben peggiori. Eppure qualcosa, fin dall’inizio, appare sbagliato.',
      'Troppi simboli antichi. Troppi segreti nascosti sotto una semplice veglia funebre. Troppi eventi inspiegabili iniziano a intrecciarsi attorno ai presenti.',
      'Poi arriva la lettera. Una lettera impossibile. Perché porta il sigillo di Thorm. E perché dimostra una sola, inquietante verità: Varek Thorm è vivo.',
      'Il corpo mostrato durante il funerale non era altro che un guscio privo di vita. Un sostituto. Un cadavere preparato per morire al suo posto.',
      'Mentre il mondo piangeva la sua scomparsa, Thorm svaniva nell’anonimato. Ora si trova da qualche parte a sud di Birthomar. Tra rovine dimenticate dal tempo. E lì… sta costruendo qualcosa.',
      'Qualcosa che richiede conoscenze proibite. Qualcosa che coinvolge antichi simboli, reliquie sepolte e forze che il mondo credeva ormai dimenticate.',
      'Solo pochi conoscono davvero il suo nome. Ancora meno comprendono cosa stia cercando di fare. Ma una cosa è certa: Thorm non voleva che i protagonisti della storia partecipassero al suo funerale per caso.',
      'Li stava osservando. Forse da molto prima di quanto loro stessi possano immaginare.'
    ]},
    {title:'L’Inizio della Campagna',subtitle:'Anti eroi nelle ombre di Thalor',paragraphs:[
      'È così che ha inizio la storia di Thalor. Non con eroi destinati a salvare il mondo. Ma con individui corrotti, spezzati, ambiziosi o attratti dall’oscurità.',
      'Anti eroi.',
      'Persone disposte ad avvicinarsi troppo a verità che sarebbe meglio lasciare sepolte.',
      'Mentre strani sogni iniziano a tormentare i vivi, mentre antichi simboli riemergono dalle cripte dimenticate, e mentre qualcuno, nel silenzio delle rovine a sud di Birthomar, continua la propria opera… una domanda torna lentamente a riaffiorare nelle ombre del continente.',
      'La guerra antica è davvero finita? Oppure il mondo si sta semplicemente preparando a viverla ancora una volta?'
    ]}
  ]
}}
function normalize(data){
  const fb=fallbackData();
  data=data&&typeof data==='object'?data:{};
  return {
    currentDate:String(data.currentDate||fb.currentDate),
    dateNote:String(data.dateNote||fb.dateNote),
    months:Array.isArray(data.months)&&data.months.length?data.months.map(String):fb.months,
    weekdays:Array.isArray(data.weekdays)&&data.weekdays.length?data.weekdays.map(String):fb.weekdays,
    sessions:Array.isArray(data.sessions)?data.sessions.map((s,i)=>({id:String(s.id||makeSessionId(s.title||('sessione-'+(i+1)))),tag:String(s.tag||'Sessione'),title:String(s.title||'Nuova sessione'),href:String(s.href||sessionDetailHref(s.id||makeSessionId(s.title||('sessione-'+(i+1))))),description:String(s.description||''),detailTitle:String(s.detailTitle||s.title||'Nuova sessione'),detailBody:String(s.detailBody||s.body||s.description||'')})):fb.sessions.map((s,i)=>({id:String(s.id||makeSessionId(s.title||('sessione-'+(i+1)))),...s})),
    dreamSections:Array.isArray(data.dreamSections)?data.dreamSections.map(x=>({character:String(x.character||'Personaggio'),characterUrl:String(x.characterUrl||'#'),title:String(x.title||'Nuova visione'),body:String(x.body||'')})):fb.dreamSections,
    loreSections:Array.isArray(data.loreSections)?data.loreSections.map(x=>({title:String(x.title||'Nuova sezione lore'),subtitle:String(x.subtitle||''),paragraphs:Array.isArray(x.paragraphs)?x.paragraphs.map(String):nl(x.body||'')})):fb.loreSections
  };
}
function editableAttrs(){return app.classList.contains('diary-editing')?' contenteditable="true" spellcheck="false"':'';}
function fieldAttrs(field,index,type){return ` data-diary-field="${esc(field)}" data-diary-index="${index}" data-diary-type="${esc(type)}"`;}
function paragraphText(paragraphs){return (paragraphs||[]).join('\n\n');}
function render(data,editing=false){
  data=normalize(data);
  app.classList.toggle('diary-editing',!!editing);
  const can=canMasterEdit();
  const edit=editing&&can;
  const eattr=edit?' contenteditable="true" spellcheck="false"':'';
  app.innerHTML=`
  <section class="hero diary-hero">
    <span class="tag">Cronache della campagna</span>
    <h1 class="hero-title">Diario</h1>
    <div class="diary-top-info">
      <article class="card diary-date-card"><div class="icon">☉</div><h3>Data attuale</h3><p${eattr} data-diary-field="currentDate">${edit?esc(data.currentDate):richText(data.currentDate)}</p><p class="muted"${eattr} data-diary-field="dateNote">${edit?esc(data.dateNote):richText(data.dateNote)}</p></article>
      <article class="card diary-calendar-card"><div class="icon">☽</div><h3>Calendario</h3><p${eattr} data-diary-field="months">${edit?esc(data.months.join(', ')):richText(data.months.join(', '))}</p><div class="meta" data-weekdays>${data.weekdays.map((d,i)=>`<span class="pill"${eattr} ${fieldAttrs('weekday',i,'weekday')}>${edit?esc(d):richText(d)}</span>`).join('')}</div></article>
    </div>
    <p class="hero-subtitle">Le sessioni giocate, raccolte come cronache consultabili dai personaggi.</p>
  </section>
  <section class="diary-section" data-diary-sessions>
    <h2 class="section-title">Sessioni</h2>
    <div class="session-grid diary-edit-grid">
      ${data.sessions.map((s,i)=>{const href=s.href&&s.href!=='#'?s.href:sessionDetailHref(s.id);return `<article class="session-card diary-session-card" data-session-index="${i}"><span class="tag"${eattr} ${fieldAttrs('tag',i,'session')}>${edit?esc(s.tag):richText(s.tag)}</span><h3${eattr} ${fieldAttrs('title',i,'session')}>${edit?esc(s.title):richText(s.title)}</h3><p${eattr} ${fieldAttrs('description',i,'session')}>${edit?esc(s.description):richText(s.description)}</p>${edit?`<label class="diary-edit-label">Link pagina <input value="${esc(href)}" ${fieldAttrs('href',i,'session')}></label><label class="diary-edit-label wide diary-session-detail-edit">Testo pagina dettaglio <textarea ${fieldAttrs('detailBody',i,'session')}>${esc(s.detailBody||s.description||'')}</textarea></label><a class="button ghost-button diary-open-detail" href="${esc(href)}">Apri pagina</a><button type="button" class="row-del diary-delete" data-delete-session="${i}">×</button>`:`<a class="diary-card-link" href="${esc(href)}" aria-label="Apri ${esc(s.title)}"></a>`}</article>`}).join('')}
    </div>
  </section>
  <section class="diary-section" data-diary-dreams>
    <details class="panel diary-lore-panel diary-dreams-shell">
      <summary><span>Sogni e visioni</span><small>Presagi, sogni e visioni ricevuti dai protagonisti durante la campagna.</small></summary>
      <div class="diary-lore-body diary-dreams-body">
        <div class="diary-lore-list diary-dream-list">
          ${data.dreamSections.map((d,i)=>`<details class="panel lore-panel diary-lore-panel diary-dream-panel" data-dream-index="${i}"><summary><span>${edit?`<span${eattr} ${fieldAttrs('character',i,'dream')}>${esc(d.character)}</span>`:`<a class="lore-link" href="${esc(internalHref(d.characterUrl))}">${richText(d.character)}</a>`}</span><small${eattr} ${fieldAttrs('title',i,'dream')}>${edit?esc(d.title):richText(d.title)}</small></summary><div class="diary-lore-body dream-box">${edit?`<label class="diary-edit-label">Link personaggio <input value="${esc(d.characterUrl)}" ${fieldAttrs('characterUrl',i,'dream')}></label><label class="diary-edit-label wide">Testo visione <textarea ${fieldAttrs('body',i,'dream')}>${esc(d.body)}</textarea></label><button type="button" class="row-del diary-delete" data-delete-dream="${i}">×</button>`:richText(d.body)}</div></details>`).join('')}
        </div>
      </div>
    </details>
  </section>
  <section class="diary-section">
    <h2 class="section-title">Lore</h2>
    <p class="section-note">Cronache pubbliche e riferimenti noti della campagna.</p>
    <div class="diary-lore-list">
      ${data.loreSections.map((l,i)=>`<details class="panel lore-panel diary-lore-panel" ${i===0?'open':''} data-lore-index="${i}"><summary><span${eattr} ${fieldAttrs('title',i,'lore')}>${edit?esc(l.title):richText(l.title)}</span><small${eattr} ${fieldAttrs('subtitle',i,'lore')}>${edit?esc(l.subtitle||''):richText(l.subtitle||'')}</small></summary><div class="diary-lore-body">${edit?`<label class="diary-edit-label wide">Testo sezione <textarea ${fieldAttrs('paragraphs',i,'lore')}>${esc(paragraphText(l.paragraphs))}</textarea></label><button type="button" class="row-del diary-delete" data-delete-lore="${i}">Elimina sezione</button>`:(l.paragraphs||[]).map(p=>`<p>${richText(p)}</p>`).join('')}</div></details>`).join('')}
    </div>
  </section>
  <footer>Thalor</footer>
  ${can?floatingActions(edit):''}`;
  bind(data);
}
function floatingActions(edit){return `<nav class="sheet-floating-actions diary-floating-actions" aria-label="Azioni diario"><button class="sheet-floating-toggle" id="sheetFloatingToggle" type="button" aria-label="Apri menu diario" aria-expanded="false"><span></span><span></span><span></span></button><div class="sheet-floating-menu" id="sheetFloatingMenu"><button class="button primary-action" id="diaryEditSave" type="button">${edit?'Salva':'Modifica'}</button>${edit?`<button class="button ghost-button" id="diaryAddSession" type="button">+ Sessione</button><button class="button ghost-button" id="diaryAddDream" type="button">+ Visione</button><button class="button ghost-button" id="diaryAddLore" type="button">+ Lore</button><button class="button ghost-button" id="diaryCancelEdit" type="button">Annulla</button>`:''}</div></nav>`}
function collect(prev){
  const d=normalize(prev);
  const simple=(name)=>app.querySelector(`[data-diary-field="${name}"]`)?.textContent?.trim();
  d.currentDate=simple('currentDate')||d.currentDate;
  d.dateNote=simple('dateNote')||'';
  const monthsText=simple('months')||'';
  d.months=monthsText.split(',').map(x=>x.trim()).filter(Boolean);
  app.querySelectorAll('[data-diary-type="weekday"]').forEach(el=>{d.weekdays[Number(el.dataset.diaryIndex)||0]=el.textContent.trim();});
  app.querySelectorAll('[data-diary-type="session"]').forEach(el=>{const i=Number(el.dataset.diaryIndex)||0;const f=el.dataset.diaryField;d.sessions[i]=d.sessions[i]||{id:uniqueSessionId(d.sessions,'Nuova sessione'),tag:'Sessione',title:'Nuova sessione',href:'#',description:'',detailBody:''};d.sessions[i][f]=(f==='href'||f==='detailBody'?el.value:el.textContent).trim();if(!d.sessions[i].id)d.sessions[i].id=uniqueSessionId(d.sessions,d.sessions[i].title);if(!d.sessions[i].href||d.sessions[i].href==='#')d.sessions[i].href=sessionDetailHref(d.sessions[i].id);});
  app.querySelectorAll('[data-diary-type="dream"]').forEach(el=>{const i=Number(el.dataset.diaryIndex)||0;const f=el.dataset.diaryField;d.dreamSections[i]=d.dreamSections[i]||{character:'Personaggio',characterUrl:'#',title:'Nuova visione',body:''};d.dreamSections[i][f]=(f==='characterUrl'||f==='body'?el.value:el.textContent).trim();});
  app.querySelectorAll('[data-diary-type="lore"]').forEach(el=>{const i=Number(el.dataset.diaryIndex)||0;const f=el.dataset.diaryField;d.loreSections[i]=d.loreSections[i]||{title:'Nuova lore',subtitle:'',paragraphs:[]};if(f==='paragraphs')d.loreSections[i].paragraphs=nl(el.value);else d.loreSections[i][f]=el.textContent.trim();});
  d.sessions=d.sessions.filter(Boolean);
  d.dreamSections=d.dreamSections.filter(Boolean);
  d.loreSections=d.loreSections.filter(Boolean);
  return normalize(d);
}
let saveInFlight=null;
async function saveDiary(data){
  if(saveInFlight)return saveInFlight;
  saveInFlight=(async()=>{
    const st=document.getElementById('diaryLocalStatus');
    const draft=collect(data);
    localStorage.setItem(storageKey,JSON.stringify(draft));
    if(!canMasterEdit()){return draft;}
    try{
      
      if(authAvailable()&&window.ThalorAuth.state.configured&&!window.ThalorAuth.state.localMaster){
        await window.ThalorAuth.saveCharacter(slug,draft);
        
      }else{
        
      }
      render(draft,false);
      return draft;
    }catch(err){
      
      alert('Salvataggio diario non riuscito: '+(err.message||err));
      return draft;
    }
  })();
  try{return await saveInFlight;}finally{saveInFlight=null;}
}
function bind(data){
  // In visualizzazione normale l'intero riquadro sessione apre la pagina dettaglio.
  // Non interviene in modalità modifica e non tocca salvataggi/auth/Supabase.
  if(!app.classList.contains('diary-editing')){
    app.querySelectorAll('.diary-session-card').forEach(card=>{
      const link=card.querySelector('.diary-card-link, .diary-open-detail');
      const href=link&&link.getAttribute('href');
      if(!href||href==='#')return;
      card.style.cursor='pointer';
      card.addEventListener('click',ev=>{
        if(ev.target.closest('a,button,input,textarea,select,label,[contenteditable="true"]'))return;
        window.location.href=href;
      });
    });
  }
  const nav=document.querySelector('.diary-floating-actions');
  const toggle=document.getElementById('sheetFloatingToggle');
  if(toggle)toggle.onclick=()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));};
  const editSave=document.getElementById('diaryEditSave');
  if(editSave)editSave.onclick=()=>{if(app.classList.contains('diary-editing'))saveDiary(data);else render(data,true);};
  const cancel=document.getElementById('diaryCancelEdit');
  if(cancel)cancel.onclick=()=>render(data,false);
  const addS=document.getElementById('diaryAddSession');
  if(addS)addS.onclick=()=>{const d=collect(data);const id=uniqueSessionId(d.sessions,'nuova-sessione');d.sessions.push({id,tag:'Nuova sessione',title:'Titolo sessione',href:sessionDetailHref(id),description:'Descrizione della sessione.',detailTitle:'Titolo sessione',detailBody:'Testo della nuova pagina sessione.'});render(d,true);};
  const addD=document.getElementById('diaryAddDream');
  if(addD)addD.onclick=()=>{const d=collect(data);d.dreamSections.push({character:'Personaggio',characterUrl:'#',title:'Nuova visione',body:'Testo della visione.'});render(d,true);};
  const addL=document.getElementById('diaryAddLore');
  if(addL)addL.onclick=()=>{const d=collect(data);d.loreSections.push({title:'Nuova lore',subtitle:'',paragraphs:['Testo della nuova sezione.']});render(d,true);};
  app.querySelectorAll('[data-delete-session]').forEach(b=>b.onclick=()=>{const d=collect(data);d.sessions.splice(Number(b.dataset.deleteSession)||0,1);render(d,true);});
  app.querySelectorAll('[data-delete-dream]').forEach(b=>b.onclick=()=>{const d=collect(data);d.dreamSections.splice(Number(b.dataset.deleteDream)||0,1);render(d,true);});
  app.querySelectorAll('[data-delete-lore]').forEach(b=>b.onclick=()=>{const d=collect(data);d.loreSections.splice(Number(b.dataset.deleteLore)||0,1);render(d,true);});
  app.querySelectorAll('[contenteditable="true"]').forEach(el=>{el.addEventListener('keydown',ev=>{if(ev.key==='Enter'&&!ev.shiftKey&&el.tagName!=='P'){ev.preventDefault();el.blur();}});});
}
(async function start(){
  let data=fallbackData();let freshLoaded=false;
  try{
    if(authAvailable()&&window.ThalorAuth.state.configured&&navigator.onLine!==false){
      const online=await window.ThalorAuth.loadCharacter(slug,null,{publicRead:true});
      if(online&&typeof online==='object'){
        data=normalize(online);freshLoaded=true;
        try{localStorage.setItem(storageKey,JSON.stringify(data));}catch(e){}
      }
    }
  }catch(e){console.warn('Diario load online:',e);}
  if(!freshLoaded){try{const local=localStorage.getItem(storageKey);if(local)data=normalize(JSON.parse(local));}catch(e){}}
  render(data,false);
})();
})();
