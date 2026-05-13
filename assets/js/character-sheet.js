(function(){
const app=document.getElementById('characterSheetApp'); if(!app) return;
const slug=app.dataset.character;
const params=new URLSearchParams(location.search);
const companionIndex=params.has('companion')?Number(params.get('companion')):null;
const isCompanion=Number.isInteger(companionIndex)&&companionIndex>=0;
const parentStorageKey=`thalor.sheet.${slug}.v5`;
const storageKey=isCompanion?`thalor.sheet.${slug}.companion.${companionIndex}.v1`:parentStorageKey;
const oldKeys=isCompanion?[]:[`thalor.sheet.${slug}.v4`,`thalor.sheet.${slug}.v3`,`thalor.sheet.${slug}.v2`];
let authState={configured:false,ready:false};
function authAvailable(){return !!window.ThalorAuth;}
function sheetCanEdit(){return !authAvailable() || window.ThalorAuth.canEdit(slug);}
async function refreshEditPermission(){
  if(!authAvailable()) return true;
  if(sheetCanEdit()) return true;
  try{ await window.ThalorAuth.init(true); }catch(e){ console.warn('Auth recheck failed:', e); }
  return sheetCanEdit();
}
function emergencyDraftKey(){return `thalor.unsaved.${slug}${isCompanion?'.companion.'+companionIndex:''}.v1`;}
function saveEmergencyDraft(data,reason){
  try{
    localStorage.setItem(emergencyDraftKey(), JSON.stringify({when:new Date().toISOString(), reason:reason||'', data:normalize(data)}));
  }catch(e){ console.warn('Emergency draft failed:', e); }
}
function authStatusText(){return authAvailable()?window.ThalorAuth.statusText():'Modalità locale.';}
function editDeniedMessage(){return 'Accesso richiesto: puoi modificare solo il personaggio assegnato, oppure tutto se sei Master. Ho creato una copia di emergenza locale per non perdere i dati.';}

// Permessi UI: in sola lettura mostra solo il ritorno al profilo/scheda principale.
(function(){
  if(document.getElementById('thalor-permission-ui-style')) return;
  const s=document.createElement('style');
  s.id='thalor-permission-ui-style';
  s.textContent=`
    #characterSheetApp.no-edit-permission button,
    #characterSheetApp.no-edit-permission .button:not(.profile-return),
    #characterSheetApp.no-edit-permission .section-controls,
    #characterSheetApp.no-edit-permission .mini-add,
    #characterSheetApp.no-edit-permission .mini-del,
    #characterSheetApp.no-edit-permission .portrait-edit-tools,
    #characterSheetApp.no-edit-permission input[type="file"],
    #characterSheetApp.no-edit-permission .sheet-tools {
      display: none !important;
    }
    #characterSheetApp.no-edit-permission input,
    #characterSheetApp.no-edit-permission select,
    #characterSheetApp.no-edit-permission textarea {
      pointer-events: none;
    }
  `;
  document.head.appendChild(s);
})();


const AB=[['FOR','Forza'],['DES','Destrezza'],['COS','Costituzione'],['INT','Intelligenza'],['SAG','Saggezza'],['CAR','Carisma']];
const BONUS_TYPES=[['alchemico','Alchemico'],['armatura','Armatura'],['bab','Bonus attacco base'],['circostanza','Circostanza'],['competenza','Competenza'],['deviazione','Deviazione'],['schivare','Schivare'],['potenziamento','Potenziamento'],['intrinseco','Intrinseco'],['intuizione','Intuizione'],['fortuna','Fortuna'],['morale','Morale'],['armatura naturale','Armatura naturale'],['profano','Profano'],['razziale','Razziale'],['resistenza','Resistenza'],['sacro','Sacro'],['scudo','Scudo'],['taglia','Taglia'],['senza tipo','Senza tipo / Innominato'],['eccelso','Eccelso / Perfezione'],['divino','Divino'],['vario','Vario']];
const STACKING_TYPES=new Set(['senza tipo','schivare','circostanza','bab','vario']);
const STANDARD_SKILLS=[['Acrobazia','DES',true],['Addestrare Animali','CAR',false],['Artigianato','INT',false],['Ascoltare','SAG',false],['Camuffare','CAR',false],['Cavalcare','DES',false],['Cercare','INT',false],['Concentrazione','COS',false],['Conoscenze Arcane','INT',false],['Conoscenze Dungeon','INT',false],['Conoscenze Locali','INT',false],['Conoscenze Natura','INT',false],['Conoscenze Nobiltà','INT',false],['Conoscenze Piani','INT',false],['Conoscenze Religioni','INT',false],['Decifrare Scritture','INT',false],['Diplomazia','CAR',false],['Disattivare Congegni','INT',false],['Equilibrio','DES',true],['Falsificare','INT',false],['Guarire','SAG',false],['Intimidire','CAR',false],['Intrattenere','CAR',false],['Muoversi Silenziosamente','DES',true],['Nascondersi','DES',true],['Nuotare','FOR',true],['Osservare','SAG',false],['Percepire Intenzioni','SAG',false],['Professione','SAG',false],['Raccogliere Informazioni','CAR',false],['Rapidità di Mano','DES',true],['Raggirare','CAR',false],['Saltare','FOR',true],['Sapienza Magica','INT',false],['Scalare','FOR',true],['Scassinare Serrature','DES',false],['Sopravvivenza','SAG',false],['Utilizzare Corde','DES',false],['Utilizzare Oggetti Magici','CAR',false],['Valutare','INT',false]];
const blank={condition:{name:'Custom',active:'Sì',duration:'',modifiers:[],strMod:0,desMod:0,cosMod:0,intMod:0,sagMod:0,carMod:0,attackMod:0,damageMod:0,acMod:0,saveMod:0,skillMod:0,notes:''},bonus:{target:'ac',save:'all',type:'senza tipo',value:0,source:'',note:''},attack:{name:'Nuovo attacco',attackAbility:'FOR',damageAbility:'FOR',damageDice:'',critical:'',range:'',type:'',magicBonus:0,attackMisc:0,damageMagic:0,damageMisc:0,bonuses:[],notes:''},defense:{name:'Nuova protezione',bonus:0,type:'armatura',maxDex:'',checkPenalty:0,spellFailure:0,weight:'',bonuses:[],notes:''},skill:{name:'Nuova abilità',ability:'INT',standardAbility:'INT',ranks:0,misc:0,classSkill:'No',armorApplies:false,notes:''},feat:{name:'Nuovo talento',description:'',source:'',bonuses:[]},feature:{name:'Nuova capacità / tratto',description:'',source:'',bonuses:[]},language:{name:'Nuovo linguaggio',notes:''},spell:{name:'Nuovo incantesimo/potere',components:'',castingTime:'',time:'',range:'',target:'',duration:'',save:'',sr:'No',school:'',description:''},spellCircle:{level:1,className:'',ability:'',misc:0,slots:0,prepared:0,used:0,spells:[]},classLevel:{name:'Nuova classe',level:1,notes:''},item:{name:'Nuovo oggetto',qty:1,weight:'',equipped:'No',bonuses:[],notes:''},inventorySection:{name:'Nuova sezione',notes:'',items:[]},companion:{kind:'Famiglio',notes:'',sheet:null}};

function companionTemplate(name='Nuova creatura',kind='Famiglio'){
  return {
    schemaVersion:9,
    meta:{theme:'default',crest:'✦',subtitle:kind,profileUrl:`scheda-${slug}.html`},
    identity:{name:name,player:'',race:kind,classLevel:kind,alignment:'',deity:'',xp:0,level:1},
    appearance:{size:'',age:'',sex:'',height:'',weight:'',eyes:'',hair:'',skin:'',marks:''},
    portrait:{image:'',alt:name,quote:''},
    abilities:{FOR:{score:10,base:10,temp:0,bonuses:[]},DES:{score:10,base:10,temp:0,bonuses:[]},COS:{score:10,base:10,temp:0,bonuses:[]},INT:{score:10,base:10,temp:0,bonuses:[]},SAG:{score:10,base:10,temp:0,bonuses:[]},CAR:{score:10,base:10,temp:0,bonuses:[]}},
    combat:{hpMax:1,hpCurrent:1,hpTemp:0,nonlethal:0,stable:'No',speed:'',bab:0,grappleMisc:0,initiativeMisc:0,tempBonuses:[]},
    armorClass:{base:10},
    saves:{fortitude:{base:0,magic:0,misc:0,ability:'COS'},reflex:{base:0,magic:0,misc:0,ability:'DES'},will:{base:0,magic:0,misc:0,ability:'SAG'}},
    attacks:[],defenses:[],skills:[],feats:[],features:[],languages:[],conditions:[],spellcasting:{defaultAbility:'',casterLevel:1,srMisc:0,groups:[]},inventorySections:[{name:'Inventario',notes:'',items:[]}],money:{MP:0,MO:0,MA:0,MR:0},narrative:{diary:'',bonds:''},secrets:{playerVisible:'',dmNotes:'',loginRequired:true},classLevels:[{name:kind,level:1,notes:''}],companions:[],changeLog:[]
  };
}
function parentSheetData(base){let raw=localStorage.getItem(parentStorageKey)||oldKeys.map(k=>localStorage.getItem(k)).find(Boolean);return normalize(raw?JSON.parse(raw):base);}
function companionLabel(c,i){const sh=c?.sheet||{};return (sh.identity?.name||c?.name||`Creatura ${i+1}`);}
const CONDITION_LIBRARY={
 'ABBAGLIATO':{attackMod:-1,skillMods:{'Osservare':-1,'Cercare':-1},description:'-1 tiri per colpire, Osservare e Cercare'},
 'ACCECATO':{acMod:-2,noDexToAC:true,speedHalf:true,skillMods:{'Osservare':-99,'Cercare':-99},skillAbilityMods:{FOR:-4,DES:-4},description:'-2 CA, nessun bonus di Des alla CA, velocità dimezzata, -4 prove di For e Des, fallimento automatico di prove sulla vista, gli avversari hanno occultamento totale (50% probabilità di mancare).'},
 'ACCOVACCIATO':{acMod:-2,noDexToAC:true,description:'Non può compiere azioni, -2 CA, nessun bonus di Des alla CA.'},
 'AFFASCINATO':{skillMods:{'Ascoltare':-4,'Osservare':-4},description:'Non effettua azioni tranne badare a chi lo ha affascinato, -4 Ascoltare e Osservare, ottiene un nuovo TS se potenzialmente minacciato; perde la condizione se direttamente minacciato; un alleato può far perdere la condizione come azione standard se lo scuote.'},
 'AFFATICATO':{strMod:-2,desMod:-2,description:'Non può correre o caricare, -2 For e Des, diventa ESAUSTO se dovesse essere nuovamente affaticato; perde la condizione dopo 8 ore di riposo.'},
 'ASSORDATO':{initMod:-4,spellFailureMod:20,skillMods:{'Ascoltare':-99},description:'-4 iniziativa, fallimento automatico di prove di Ascoltare, 20% fallimento incantesimi con componenti Verbali.'},
 'BARCOLLANTE':{description:'Può compiere solo un\'azione standard o di movimento ogni round.'},
 'BUTTATO A TERRA':{implies:['PRONO'],description:'PRONO se sul terreno, spinto di 1d6x3 m se in volo.'},
 'COLTO ALLA SPROVVISTA':{noDexToAC:true,description:'Nessun bonus di Des alla CA, non può effettuare attacchi di opportunità.'},
 'CONFUSO':{description:'Azioni casuali (1d100): 1-10 attacca l\'incantatore o si avvicina se non può attaccarlo, 11-20 agisce normalmente, 21-50 non effettua azioni, 51-70 fugge dall\'incantatore alla velocità massima possibile, 71-100 attacca la creatura più vicina.'},
 'DANNI ALLE CARATTERISTICHE':{description:'I modificatori si abbassano come di norma; a For 0 è A TERRA INDIFESO, a Des 0 è PARALIZZATO, a Cos 0 è MORTO, a Int, Sag o Car 0 è PRIVO DI SENSI; recupera 1 punto di caratteristica ogni 8 ore di riposo.'},
 'ESAUSTO':{strMod:-6,desMod:-6,speedHalf:true,description:'-6 For e Des, velocità dimezzata; perde la condizione dopo 1 ora di riposo e diventa AFFATICATO.'},
 'FRASTORNATO':{description:'Non può compiere azioni.'},
 'FRENATO':{description:'Ferma ogni suo movimento se sul terreno, torna indietro di una distanza dipendente dall\'effetto se in volo.'},
 'IMMOBILIZZATO':{description:'È immobile, ma non INDIFESO.'},
 'IN LOTTA':{noDexToAC:true,description:'Effettua solo le azioni consentite in una lotta, non minaccia alcun quadretto, nessun bonus di Des alla CA contro chi non sta lottando con lui.'},
 'IN PREDA AL PANICO':{saveMod:-2,skillMod:-2,abilityCheckMod:-2,implies:['ACCOVACCIATO'],description:'Lascia cadere oggetti impugnati, non può compiere azioni che non servano a fuggire al massimo della velocità possibile dalla fonte della paura e da altri pericoli, -2 TS, -2 prove di abilità e caratteristica, se non può fuggire diventa ACCOVACCIATO.'},
 'INABILE':{speedHalf:true,description:'Può compiere solo un\'azione standard o di movimento ogni round, velocità dimezzata, qualsiasi azione standard (o comunque stancante) infligge 1 danno al termine.'},
 'INCORPOREO':{description:'Immune a ogni forma di attacco non magico; ferito solo da altri incorporei, armi magiche +1 o migliori, incantesimi, effetti magici e soprannaturali; le fonti fisiche hanno comunque il 50% di probabilità di non infliggere danno.'},
 'INDIFESO':{setScore:{DES:0},description:'Des 0 (modificatore -5), gli attacchi in mischia ricevuti hanno +4, vulnerabile ad attacchi furtivi, vulnerabile ai colpi di grazia (tranne nel caso sia immune ai colpi critici).'},
 'INFERMO':{attackMod:-2,damageMod:-2,saveMod:-2,skillMod:-2,abilityCheckMod:-2,description:'-2 tiri per colpire, danni delle armi, TS, prove di abilità e di caratteristica.'},
 'INTRALCIATO':{attackMod:-2,desMod:-4,speedHalf:true,description:'Velocità dimezzata, non può correre o caricare, -2 tiri per colpire, -4 Des, prova di Concentrazione (CD 15+livello dell\'incantesimo) per lanciare incantesimi.'},
 'INVISIBILE':{attackMod:2,description:'+2 tiri per colpire contro avversari visibili, nega il bonus di Des alla CA.'},
 'MORENTE':{implies:['PRIVO DI SENSI'],description:'PRIVO DI SENSI e alla fine di ogni round tira 1d100: 1-10 diventa STABILE, 11-100 perde 1 punto ferita.'},
 'MORTO':{description:'L\'anima abbandona permanentemente il corpo, il corpo decade se non conservato.'},
 'NAUSEATO':{description:'Può compiere solo una azione di movimento per turno.'},
 'PARALIZZATO':{setScore:{FOR:0,DES:0},description:'For e Des 0, può compiere solo azioni mentali, interrompe movimenti fisici, il suo spazio può essere attraversato ma ogni quadretto occupato conta come 2 quadretti.'},
 'PIETRIFICATO':{implies:['PRIVO DI SENSI'],description:'PRIVO DI SENSI e trasformato in pietra, se rotto e non riparato quando la condizione termina riceve penalità a discrezione del DM.'},
 'PORTATO VIA':{implies:['BUTTATO A TERRA'],description:'BUTTATO A TERRA per 1d4x3 m se sul terreno e 1d4 danni non letali per ogni 3 m di spostamento, spinto per 2d6x3 m se in volo e 2d6 danni non letali.'},
 'PRIVO DI SENSI':{implies:['INDIFESO'],description:'Abbattuto e INDIFESO.'},
 'PRONO':{attackMod:-4,acMod:-4,description:'-4 ai tiri per colpire in mischia, non può usare armi a distanza eccetto le balestre, +4 CA contro attacchi a distanza, -4 CA contro attacchi in mischia; perde la condizione se si rialza come azione di movimento che provoca attacchi di opportunità.'},
 'RISUCCHIO DI CARATTERISTICHE':{description:'I modificatori si abbassano come di norma; a For 0 è A TERRA INDIFESO, a Des 0 è PARALIZZATO, a Cos 0 è MORTO, a Int, Sag o Car 0 è PRIVO DI SENSI.'},
 'RISUCCHIO DI ENERGIA':{attackMod:-1,saveMod:-1,skillMod:-1,description:'Anche LIVELLI NEGATIVI. Se ha livelli negativi pari ai DV è MORTO; ogni livello negativo impone -1 a tiri per colpire, TS, prove di abilità, prove di caratteristica, perdita di 5 punti ferita, -1 al livello effettivo per qualsiasi capacità lo richieda, perdita di uno slot o incantesimo preparato del livello massimo disponibile; i livelli negativi sono cumulativi. Per più livelli negativi usa i modificatori manuali.'},
 'SCACCIATO':{implies:['ACCOVACCIATO'],description:'Fugge per 10 round (1 minuto) nella maniera più rapida possibile, se non può fuggire diventa ACCOVACCIATO.'},
 'SCOSSO':{attackMod:-2,saveMod:-2,skillMod:-2,abilityCheckMod:-2,description:'-2 tiri per colpire, TS, prove di abilità e di caratteristica; se colpito da un altro effetto di paura diventa SPAVENTATO.'},
 'SPAVENTATO':{attackMod:-2,saveMod:-2,skillMod:-2,abilityCheckMod:-2,description:'Fugge con tutti i mezzi possibili dalla fonte della paura e da altri pericoli, se non può fuggire combatte, -2 tiri per colpire, TS, prove di abilità e di caratteristica; se colpito da un altro effetto di paura diventa IN PREDA AL PANICO.'},
 'STABILE':{implies:['PRIVO DI SENSI'],description:'PRIVO DI SENSI e se stabilizzato da aiuto esterno alla fine di ogni ora tira 1d100: 1-10 diventa INABILE, 11-100 nulla accade; se stabilizzato autonomamente alla fine di ogni ora tira 1d100: 1-10 diventa PRIVO DI SENSI, 11-100 perde 1 punto ferita.'},
 'STORDITO':{acMod:-2,noDexToAC:true,description:'Lascia cadere oggetti impugnati, non può compiere azioni, -2 CA, nessun bonus di Des alla CA.'},
 'Custom':{description:'Condizione personalizzata: usa i modificatori manuali della riga.'}
};
const conditionOptions=()=>Object.keys(CONDITION_LIBRARY).map(k=>`<option value="${esc(k)}"></option>`).join('');
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function num(v){const n=parseFloat(String(v??0).replace('+','').replace(',','.').replace(/[^0-9+\-.]/g,''));return isNaN(n)?0:n}
function sign(n){n=Math.trunc(Number(n)||0);return n>=0?'+'+n:String(n)}
function mod(score,temp=0){return Math.floor((num(score)+num(temp)-10)/2)}
function activeConditionRows(d){
 const rows=[]; const seen=new Set();
 function add(c,source){if(!c||String(c.active||'Sì').toLowerCase().startsWith('n'))return; const name=String(c.name||'Custom'); const key=name.toUpperCase(); if(!source&&seen.has(key))return; if(!source)seen.add(key); const lib=CONDITION_LIBRARY[name]||CONDITION_LIBRARY[key]||{}; rows.push({row:c,lib,name,source}); (lib.implies||[]).forEach(n=>add({name:n,active:'Sì',duration:c.duration||'',notes:'Auto da '+name},name));}
 (d.conditions||[]).forEach(c=>add(c,'')); const hp=num(d.combat?.hpCurrent), nl=num(d.combat?.nonlethal), stable=String(d.combat?.stable||'No'); if(hp<=-10)add({name:'MORTO',active:'Sì',notes:'Auto da PF'},'PF'); else if(hp<0)add({name:stable==='Sì'?'STABILE':'MORENTE',active:'Sì',notes:'Auto da PF'},'PF'); if(hp===0)add({name:'INABILE',active:'Sì',notes:'Auto da PF a 0'},'PF'); else if(hp>0 && nl>=hp)add({name:'PRIVO DI SENSI',active:'Sì',notes:'Auto da danni non letali'},'PF'); return rows;
}

function bonusTypeSelect(path,val){val=val||'senza tipo';return `<select data-path="${esc(path)}" disabled>${BONUS_TYPES.map(([k,l])=>`<option value="${k}" ${k===val?'selected':''}>${l}</option>`).join('')}</select><span class="display-value select-display">${esc((BONUS_TYPES.find(x=>x[0]===val)||['',val])[1])}</span>`}
function bonusTargetSelect(path,val){const opts=[['ac','CA'],['touch','CA contatto'],['flat','CA sprovvista'],['attack','Tiro per colpire'],['damage','Danni'],['save','Tiri salvezza'],['initiative','Iniziativa'],['grapple','Lotta'],['skill','Abilità'],['srCheck','Superare RI'],['FOR','FOR'],['DES','DES'],['COS','COS'],['INT','INT'],['SAG','SAG'],['CAR','CAR']];val=val||'ac';return `<select data-path="${esc(path)}" disabled>${opts.map(([k,l])=>`<option value="${k}" ${k===val?'selected':''}>${l}</option>`).join('')}</select><span class="display-value select-display">${esc((opts.find(x=>x[0]===val)||['',val])[1])}</span>`}
function bonusSaveSelect(path,val){const opts=[['all','Tutti'],['fortitude','Tempra'],['reflex','Riflessi'],['will','Volontà']];val=val||'all';return `<select data-path="${esc(path)}" disabled>${opts.map(([k,l])=>`<option value="${k}" ${k===val?'selected':''}>${l}</option>`).join('')}</select><span class="display-value select-display">${esc((opts.find(x=>x[0]===val)||['',val])[1])}</span>`}

function bonusTypeLabel(type){
  return (BONUS_TYPES.find(x=>x[0]===String(type||'senza tipo'))||['',type||'Senza tipo'])[1];
}
function bonusTargetLabel(target,save){
  const opts={ac:'CA',touch:'CA contatto',flat:'CA sprovvista',attack:'Tiro per colpire',damage:'Danni',save:'Tiri salvezza',initiative:'Iniziativa',grapple:'Lotta',skill:'Abilità',srCheck:'Superare RI',FOR:'FOR',DES:'DES',COS:'COS',INT:'INT',SAG:'SAG',CAR:'CAR',fortitude:'Tempra',reflex:'Riflessi',will:'Volontà'};
  if(target==='save' && save && save!=='all') return opts[save]||'Tiro salvezza';
  return opts[target]||target||'Bonus';
}
function bonusTip(b,forcedTarget){
  const label=forcedTarget||bonusTargetLabel(b?.target,b?.save);
  const value=sign(num(b?.value));
  const type=bonusTypeLabel(b?.type);
  const lines=[`${label} ${value} — ${type}`];
  if(b?.source) lines.push(`Fonte: ${b.source}`);
  if(b?.note) lines.push(`Note: ${b.note}`);
  return lines.join('\n');
}

function normalizeBonusList(list){return (Array.isArray(list)?list:[]).map(b=>Object.assign({},blank.bonus,b,{target:b.target||'ac',save:b.save||'all',type:b.type||'senza tipo',value:num(b.value)}))}
function stackBonuses(list){const grouped={};let total=0;normalizeBonusList(list).forEach(b=>{const v=num(b.value);if(!v)return;const t=String(b.type||'senza tipo').toLowerCase();if(STACKING_TYPES.has(t)){total+=v;return;}const key=t; if(grouped[key]==null)grouped[key]=v; else grouped[key]=v>=0?Math.max(grouped[key],v):Math.min(grouped[key],v);});return total+Object.values(grouped).reduce((a,b)=>a+num(b),0)}
function globalBonusTotals(d){const buckets={ac:[],touch:[],flat:[],attack:[],damage:[],initiative:[],grapple:[],skill:[],srCheck:[],fortitude:[],reflex:[],will:[],FOR:[],DES:[],COS:[],INT:[],SAG:[],CAR:[]};function add(b){b=Object.assign({},blank.bonus,b);if(b.target==='save'){if(!b.save||b.save==='all'){buckets.fortitude.push(b);buckets.reflex.push(b);buckets.will.push(b)}else if(buckets[b.save])buckets[b.save].push(b);return;} if(buckets[b.target])buckets[b.target].push(b);} (d.defenses||[]).forEach(x=>normalizeBonusList(x.bonuses).forEach(add));(d.feats||[]).forEach(x=>normalizeBonusList(x.bonuses).forEach(add));(d.features||[]).forEach(x=>normalizeBonusList(x.bonuses).forEach(add));(d.combat?.tempBonuses||[]).forEach(add);(d.inventorySections||[]).forEach(sec=>(sec.items||[]).forEach(it=>{if(String(it.equipped||'No').toLowerCase().startsWith('s')) normalizeBonusList(it.bonuses).forEach(add);}));AB.forEach(([k])=>normalizeBonusList(d.abilities?.[k]?.bonuses).forEach(b=>add(Object.assign({},b,{target:k}))));return Object.fromEntries(Object.entries(buckets).map(([k,v])=>[k,stackBonuses(v)]));}
function bonusRows(path,list){list=normalizeBonusList(list);let count=list.length;return `<div class="bonus-popup-compact edit-only"><button class="mini-add compact-bonus-open" type="button" data-open-bonus-modal="${esc(path)}"><span>Bonus avanzati</span><strong>${count}</strong></button></div>`}
function bonusSummary(list, forcedTarget){
  list=normalizeBonusList(list);
  if(!list.length)return '';
  return `<div class="bonus-summary compact-bonus-summary" aria-label="Bonus applicati">${list.map(b=>`<span class="bonus-chip info-card" tabindex="0" data-tip="${esc(bonusTip(b,forcedTarget))}">${esc(forcedTarget||bonusTargetLabel(b.target,b.save))} ${sign(b.value)} <small>${esc(bonusTypeLabel(b.type))}</small></span>`).join('')}</div>`
}

function formulaTip(title,value,lines){
  const text=[title,`Risultato attuale: ${value}`,'',...(Array.isArray(lines)?lines:[lines])].filter(x=>x!=null&&String(x).trim()!=='').join('\n');
  return `data-tip="${esc(text)}"`;
}
function formulaValue(value,title,lines,cls=''){
  return `<strong class="formula-value info-card ${esc(cls)}" tabindex="0" ${formulaTip(title,value,lines)}>${esc(value)}</strong>`;
}
function formulaReadonly(value,title,lines){
  return `<span class="formula-readonly info-card" tabindex="0" ${formulaTip(title,value,lines)}>${readonly(value)}</span>`;
}
function bonusFormulaText(d,target,label){
  const total=globalBonusTotals(d||{})[target]||0;
  return `${label||bonusTargetLabel(target)} dai bonus avanzati: ${sign(total)}. I bonus dello stesso tipo non si sommano, salvo senza tipo, schivare, circostanza, BAB e vario.`;
}
function babFormulaText(d){
  const cls=(d.classLevels||[]).filter(c=>String(c.name||'').trim()).map(c=>`${c.name||'Classe'} ${num(c.level)||1}`).join(' / ')||'nessuna classe indicata';
  return [`In D&D 3.5 il BAB deriva dalla progressione delle classi e si somma tra i livelli multiclassati.`, `Classi inserite: ${cls}.`, `Questa scheda mantiene il BAB come campo modificabile per coprire classi, CdP e homebrew; inserisci qui la somma finale.`];
}
function saveFormulaText(name,s,typed,cond,total,d){
  return [`${name} = base classe + modificatore caratteristica + magia + vari + bonus tipizzati + condizioni.`, `Base: ${sign(num(s.base))}`, `${s.ability||''}: ${sign(abilityMod(d,s.ability))}`, `Magia: ${sign(num(s.magic))}`, `Vari: ${sign(num(s.misc))}`, `Bonus avanzati tipizzati: ${sign(typed)}`, `Condizioni: ${sign(cond)}`];
}
function acFormulaText(d,c,kind){
  const base=num(d.armorClass?.base??10);
  if(kind==='touch')return [`CA contatto = base + DES utilizzabile + condizioni + bonus CA generici + bonus specifici contatto.`, `Base: ${base}`, `DES usata: ${sign(c.maxDex)}`, `Condizioni: ${sign(c.ct.acMod)}`, bonusFormulaText(d,'ac','Bonus CA generici'), bonusFormulaText(d,'touch','Bonus CA contatto')];
  if(kind==='flat')return [`CA sprovvista = base + protezioni/difese + DES negativa se presente + condizioni + bonus CA generici + bonus specifici sprovvista.`, `Base: ${base}`, `Protezioni/Difese: ${sign(c.pt.total)}`, `DES in sprovvista: ${sign(c.flatDex)}`, `Condizioni: ${sign(c.ct.acMod)}`, bonusFormulaText(d,'ac','Bonus CA generici'), bonusFormulaText(d,'flat','Bonus CA sprovvista')];
  return [`CA = base + protezioni/difese + DES utilizzabile + condizioni + bonus CA tipizzati.`, `Base: ${base}`, `Protezioni/Difese: ${sign(c.pt.total)}`, `DES usata: ${sign(c.maxDex)}`, `Condizioni: ${sign(c.ct.acMod)}`, bonusFormulaText(d,'ac','Bonus CA')];
}

function conditionTotals(d){let t={FOR:0,DES:0,COS:0,INT:0,SAG:0,CAR:0,attackMod:0,damageMod:0,acMod:0,saveMod:0,skillMod:0,initMod:0,spellFailureMod:0,abilityCheckMod:0,noDexToAC:false,speedHalf:false,skillMods:{},skillAbilityMods:{},setScore:{}};activeConditionRows(d||{}).forEach(({row:c,lib})=>{t.FOR+=num(lib.strMod)+num(c.strMod);t.DES+=num(lib.desMod)+num(c.desMod);t.COS+=num(lib.cosMod)+num(c.cosMod);t.INT+=num(lib.intMod)+num(c.intMod);t.SAG+=num(lib.sagMod)+num(c.sagMod);t.CAR+=num(lib.carMod)+num(c.carMod);t.attackMod+=num(lib.attackMod)+num(c.attackMod);t.damageMod+=num(lib.damageMod)+num(c.damageMod);t.acMod+=num(lib.acMod)+num(c.acMod);t.saveMod+=num(lib.saveMod)+num(c.saveMod);t.skillMod+=num(lib.skillMod)+num(c.skillMod);t.initMod+=num(lib.initMod)+num(c.initMod);t.spellFailureMod+=num(lib.spellFailureMod)+num(c.spellFailureMod);t.abilityCheckMod+=num(lib.abilityCheckMod)+num(c.abilityCheckMod);(c.modifiers||[]).forEach(m=>{let target=m.target||'',value=num(m.value);if(target in t && typeof t[target]==='number')t[target]+=value;});if(lib.noDexToAC)t.noDexToAC=true;if(lib.speedHalf)t.speedHalf=true;Object.entries(lib.skillMods||{}).forEach(([k,v])=>{t.skillMods[k]=(t.skillMods[k]||0)+num(v)});Object.entries(lib.skillAbilityMods||{}).forEach(([k,v])=>{t.skillAbilityMods[k]=(t.skillAbilityMods[k]||0)+num(v)});Object.entries(lib.setScore||{}).forEach(([k,v])=>{t.setScore[k]=Math.min(t.setScore[k]??num(v),num(v))});});return t}
function abilityScoreEffective(d,key){let ct=conditionTotals(d||{}),gb=globalBonusTotals(d||{});let score=num(d.abilities?.[key]?.score)+num(d.abilities?.[key]?.temp)+num(gb[key])+num(ct[key]);if(ct.setScore&&ct.setScore[key]!=null)score=Math.min(score,num(ct.setScore[key]));return score}
function abilityMod(d,key){return Math.floor((abilityScoreEffective(d,key)-10)/2)}
function conditionSkillMod(d,skill){const ct=conditionTotals(d||{});let name=String(skill?.name||'');let ab=skill?.ability||'INT';let specific=0;Object.entries(ct.skillMods||{}).forEach(([k,v])=>{if(name.toLowerCase()===String(k).toLowerCase())specific+=num(v)});specific+=num(ct.skillAbilityMods?.[ab]);return num(ct.skillMod)+specific}
function conditionDescription(name){const lib=CONDITION_LIBRARY[name]||{};return lib.description||lib.notes||'Descrizione da aggiungere.'}
function conditionEffectSummary(name){const lib=CONDITION_LIBRARY[name]||{};let bits=[];if(lib.attackMod)bits.push('Att. '+sign(lib.attackMod));if(lib.damageMod)bits.push('Danni '+sign(lib.damageMod));if(lib.acMod)bits.push('CA '+sign(lib.acMod));if(lib.saveMod)bits.push('TS '+sign(lib.saveMod));if(lib.skillMod)bits.push('Abil. '+sign(lib.skillMod));if(lib.strMod)bits.push('FOR '+sign(lib.strMod));if(lib.desMod)bits.push('DES '+sign(lib.desMod));if(lib.cosMod)bits.push('COS '+sign(lib.cosMod));if(lib.initMod)bits.push('Iniz. '+sign(lib.initMod));if(lib.spellFailureMod)bits.push('Fall. arc. +'+num(lib.spellFailureMod)+'%');if(lib.noDexToAC)bits.push('No bonus DES CA');if(lib.implies?.length)bits.push('Auto: '+lib.implies.join(', '));return bits.join(' · ')||'Effetto descrittivo / da gestire in gioco'}
function conditionModifierTargets(){return [['FOR','FOR'],['DES','DES'],['COS','COS'],['INT','INT'],['SAG','SAG'],['CAR','CAR'],['attackMod','Attacco'],['damageMod','Danni'],['acMod','CA'],['saveMod','Tiri salvezza'],['skillMod','Abilità'],['initMod','Iniziativa'],['spellFailureMod','Fallimento arcano %'],['abilityCheckMod','Prove caratteristica']]}
function conditionTargetSelect(id,selected){return `<select ${id?`id="${esc(id)}"`:''} class="condition-target-select">${conditionModifierTargets().map(([k,l])=>`<option value="${esc(k)}" ${k===selected?'selected':''}>${esc(l)}</option>`).join('')}</select>`}
function conditionManualSummary(c){let bits=[];(c.modifiers||[]).forEach(m=>{let lab=(conditionModifierTargets().find(x=>x[0]===m.target)||[])[1]||m.target;if(num(m.value))bits.push(`${sign(num(m.value))} ${lab}`)});['strMod:FOR','desMod:DES','cosMod:COS','intMod:INT','sagMod:SAG','carMod:CAR','attackMod:Att.','damageMod:Danni','acMod:CA','saveMod:TS','skillMod:Abil.'].forEach(x=>{const [k,l]=x.split(':');if(num(c[k]))bits.push(`${sign(num(c[k]))} ${l}`)});return bits.join(' · ')}
function parseClassLevels(raw){let s=String(raw||'').trim(); if(!s)return []; return s.split(/[\/,+;]+|\be\b/gi).map(x=>x.trim()).filter(Boolean).map(part=>{let m=part.match(/^(.*?)(\d+)\s*$/); return {name:(m?m[1].trim():part)||'Classe',level:m?Math.max(1,num(m[2])):1,notes:''};});}
function totalLevel(d){let arr=d.classLevels||[];let n=arr.reduce((a,c)=>a+Math.max(0,num(c.level)),0);return Math.max(1,n||num(d.identity?.level)||1)}
function effectiveClassLevel(d,pdata={}){return Math.max(1,totalLevel(d),num(d.identity?.level)||0,num(pdata.livello)||0)}
function classSummary(d){let arr=d.classLevels||[];return arr.length?arr.map(c=>`${c.name||'Classe'} ${num(c.level)||1}`).join(' / '):(d.identity?.classLevel||'Da compilare')}
function levelFrom(d){return Math.max(totalLevel(d),num(d.xpInfo?.xpLevel)||0)}
function defaultXpThreshold(level){level=Math.max(1,num(level)||1);return Math.floor((level*(level-1)/2)*1000)}
function xpThreshold(table,level){level=Math.max(1,num(level)||1);const row=(table||[]).find(r=>num(r.livello)===level);const val=num(row?.xp_minimi);if(row && (level===1 || val>0))return val;return defaultXpThreshold(level)}
function xpLevelFromXp(table,xp){xp=Math.max(0,num(xp));let lvl=1;const max=Math.max(20,...(table||[]).map(r=>num(r.livello)||0));for(let l=1;l<=max+1;l++){if(xp>=xpThreshold(table,l))lvl=l;else break;}return Math.max(1,lvl)}
function xpCalc(d,xpData){
  const pdata=xpData?.personaggi?.[slug]||{};
  const rawXp=String(d.identity?.xp??'').trim();
  const xp=/[0-9]/.test(rawXp)?num(rawXp):num(pdata.xp_totali);
  const table=(xpData?.tabella_xp||[]).slice().sort((a,b)=>num(a.livello)-num(b.livello));
  const classLevel=Math.max(1,totalLevel(d));
  const xpLevel=xpLevelFromXp(table,xp);
  const currentLevel=classLevel;
  const nextLevel=currentLevel+1;
  const currentXp=xpThreshold(table,currentLevel);
  const nextXp=xpThreshold(table,nextLevel);
  const span=Math.max(1,nextXp-currentXp);
  let progress=((xp-currentXp)/span)*100;
  if(!isFinite(progress))progress=0;
  progress=Math.max(0,Math.min(100,progress));
  return {
    level:classLevel, xpLevel, xp, currentLevel, currentXp, nextLevel, nextXp,
    missing:Math.max(0,nextXp-xp),
    gainedThisLevel:Math.max(0,xp-currentXp),
    neededThisLevel:span, progress, progressLabel:Math.round(progress)+'%',
    canLevel:xpLevel>classLevel, mismatch:xpLevel!==classLevel
  };
}
function inp(path,v,type='text',cls=''){return `<input class="${cls}" data-path="${esc(path)}" type="${type}" value="${esc(v??'')}" disabled><span class="display-value ${cls}">${esc(v??'')}</span>`}
function area(path,v,cls=''){return `<textarea class="${cls}" data-path="${esc(path)}" disabled>${esc(v??'')}</textarea><span class="display-value display-area ${cls}">${esc(v??'')}</span>`}
function sel(path,val,std,allowBlank=false){val=val||'';const label=AB.map(([k,l])=>`${k} - ${l}${k===std?' ★ standard':''} (${sign(window.__thalorCurrentData?abilityMod(window.__thalorCurrentData,k):0)})`);const blankOpt=allowBlank?`<option value="" ${!val?'selected':''}>— Nessuna caratteristica —</option>`:'';const shown=val?((AB.find(([k])=>k===val)?.[0]||val)+' '+(val===std&&std?'★ ':'')+'('+sign(window.__thalorCurrentData?abilityMod(window.__thalorCurrentData,val):0)+')'):'—';return `<select data-path="${esc(path)}" disabled>${blankOpt}${AB.map(([k,l],i)=>`<option value="${k}" ${k===val?'selected':''}>${label[i]}</option>`).join('')}</select><span class="display-value select-display">${esc(shown)}</span>`}
function yesNo(path,val){const v=String(val||'No'); const yes=(v==='Sì'||v==='true'||v===true); return `<select class="yes-no-select" data-path="${esc(path)}" disabled><option value="Sì" ${yes?'selected':''}>Sì</option><option value="No" ${!yes?'selected':''}>No</option></select><span class="display-value select-display yes-no-display ${yes?'is-yes':'is-no'}">${esc(yes?'Sì':'No')}</span>`}
function readonly(v){return `<output>${esc(v)}</output>`}
function tipText(x,f='Descrizione da aggiungere.'){const p=[];const desc=String(x?.description||x?.notes||'').trim();const source=String(x?.source||'').trim();if(desc)p.push(desc);if(source)p.push(`Fonte / note:\n${source}`);return p.length?p.join('\n\n'):f}
function setPath(obj,path,value){let p=path.split('.'),o=obj;for(let i=0;i<p.length-1;i++){let k=p[i],n=p[i+1];if(!(k in o)||o[k]==null)o[k]=/^\d+$/.test(n)?[]:{};o=o[k];}o[p.at(-1)]=value}
function collect(data){let c=JSON.parse(JSON.stringify(data));document.querySelectorAll('[data-path]').forEach(el=>{let val=(el.type==='number')?num(el.value):el.value;setPath(c,el.dataset.path,val)});return c}

function addImpliedConditionRows(d){
 const existing=new Map((d.conditions||[]).map(c=>[String(c.name||'').toUpperCase(),c]));
 let changed=true,guard=0;
 while(changed&&guard++<20){changed=false;(d.conditions||[]).slice().forEach(c=>{if(String(c.active||'Sì').toLowerCase().startsWith('n'))return;let lib=CONDITION_LIBRARY[c.name]||{};(lib.implies||[]).forEach(n=>{let key=String(n).toUpperCase();if(!existing.has(key)){let row=Object.assign({},blank.condition,{name:n,active:'Sì',duration:c.duration||'',notes:'Aggiunta automatica da '+c.name});d.conditions.push(row);existing.set(key,row);changed=true;}});});}
 return d;
}

function migrateLegacyAcBonuses(d){
  d.armorClass=d.armorClass||{}; d.combat=d.combat||{}; d.combat.tempBonuses=normalizeBonusList(d.combat.tempBonuses||[]);
  if(d.armorClass._legacyMigrated)return d;
  const legacy=[
    ['natural','ac','armatura naturale','Vecchio campo CA: armatura naturale'],
    ['natural','flat','armatura naturale','Vecchio campo CA: armatura naturale'],
    ['deflection','ac','deviazione','Vecchio campo CA: deviazione'],
    ['deflection','touch','deviazione','Vecchio campo CA: deviazione'],
    ['deflection','flat','deviazione','Vecchio campo CA: deviazione'],
    ['dodge','ac','schivare','Vecchio campo CA: schivare'],
    ['dodge','touch','schivare','Vecchio campo CA: schivare'],
    ['size','ac','taglia','Vecchio campo CA: taglia'],
    ['size','touch','taglia','Vecchio campo CA: taglia'],
    ['size','flat','taglia','Vecchio campo CA: taglia'],
    ['misc','ac','senza tipo','Vecchio campo CA: vari'],
    ['touchMisc','touch','senza tipo','Vecchio campo CA: vari contatto'],
    ['flatFootedMisc','flat','senza tipo','Vecchio campo CA: vari sprovvista']
  ];
  let moved=false;
  legacy.forEach(([field,target,type,note])=>{const v=num(d.armorClass[field]); if(v){d.combat.tempBonuses.push(Object.assign({},blank.bonus,{target,type,value:v,source:'Migrazione CA',note})); moved=true;}});
  ['natural','deflection','dodge','size','misc','touchMisc','flatFootedMisc'].forEach(k=>{if(d.armorClass[k]!=null)d.armorClass[k]=0;});
  d.armorClass._legacyMigrated=!!moved;
  return d;
}

function normalize(d){d=JSON.parse(JSON.stringify(d||{}));d.schemaVersion=9;d.identity=d.identity||{};d.armorClass=d.armorClass||{};d.combat=d.combat||{};d.combat.hpTemp=d.combat.hpTemp??0;d.combat.nonlethal=d.combat.nonlethal??0;d.combat.stable=d.combat.stable||'No';d.combat.tempBonuses=normalizeBonusList(d.combat.tempBonuses||[]);d=migrateLegacyAcBonuses(d);d.defenses=d.defenses||[];d.skills=d.skills||[];d.feats=d.feats||[];d.features=d.features||[];d.feats=d.feats.map(x=>Object.assign({},blank.feat,x,{bonuses:normalizeBonusList(x.bonuses||[])}));d.features=d.features.map(x=>Object.assign({},blank.feature,x,{bonuses:normalizeBonusList(x.bonuses||[])}));d.languages=d.languages||[];d.spells=d.spells||{};d.inventory=d.inventory||[];d.inventorySections=Array.isArray(d.inventorySections)?d.inventorySections:[];if(!d.inventorySections.length&&Array.isArray(d.inventory)&&d.inventory.length){d.inventorySections=[Object.assign({},blank.inventorySection,{name:'Inventario',items:d.inventory})];}d.inventorySections=d.inventorySections.map(sec=>Object.assign({},blank.inventorySection,sec,{items:(sec.items||[]).map(it=>Object.assign({},blank.item,it,{equipped:it.equipped||'No',bonuses:normalizeBonusList(it.bonuses||[])}))}));d.companions=Array.isArray(d.companions)?d.companions:[];d.companions=d.companions.map((c,i)=>{let cc=Object.assign({},blank.companion,c||{});cc.sheet=normalize(cc.sheet||companionTemplate(cc.name||('Creatura '+(i+1)),cc.kind||'Creatura'));cc.name=cc.sheet.identity?.name||cc.name||('Creatura '+(i+1));cc.kind=cc.kind||cc.sheet.meta?.subtitle||'Creatura';return cc;});d.money=d.money||{};d.conditions=(d.conditions||[]).filter(c=>!String(c.notes||'').startsWith('Aggiunta automatica da '));d.changeLog=d.changeLog||[];d.secrets=d.secrets||{playerVisible:'',dmNotes:'',loginRequired:true};d.classLevels=d.classLevels&&d.classLevels.length?d.classLevels:parseClassLevels(d.identity.classLevel);if(!d.classLevels.length)d.classLevels=[{name:d.identity.classLevel||'Classe da definire',level:num(d.identity.level)||3,notes:''}];d.classLevels=d.classLevels.map(c=>Object.assign({},blank.classLevel,c,{level:Math.max(1,num(c.level)||1)}));d.identity.classLevel=classSummary(d);d.identity.level=totalLevel(d);d.spellcasting=d.spellcasting||{};d.spellcasting.defaultAbility=d.spellcasting.defaultAbility||'';if(d.spellcasting.casterLevel==null||d.spellcasting.casterLevel==='')d.spellcasting.casterLevel=totalLevel(d);d.spellcasting.srMisc=d.spellcasting.srMisc??0;d.spellcasting.circles=d.spellcasting.circles||{};d.spellcasting.groups=Array.isArray(d.spellcasting.groups)?d.spellcasting.groups:[];
  if(!d.spellcasting.groups.length){
    const migrated=[];
    for(let lv=0;lv<=9;lv++){
      let k=String(lv), list=(d.spells&&Array.isArray(d.spells[k]))?d.spells[k]:[], cfg=d.spellcasting.circles[k]||{};
      const hasList=list.length>0;
      const hasCfg=['ability','misc','slots','prepared','used','className'].some(key=>cfg[key]!==undefined&&cfg[key]!==''&&num(cfg[key])!==0);
      if(hasList||hasCfg){migrated.push(Object.assign({},blank.spellCircle,cfg,{level:lv,className:cfg.className||'',spells:list}));}
    }
    d.spellcasting.groups=migrated;
  }
  d.spellcasting.groups=d.spellcasting.groups.map((g,idx)=>Object.assign({},blank.spellCircle,g,{level:Math.max(0,Math.min(9,num(g.level)||0)),className:g.className||g.class||'',spells:(g.spells||[]).map(sp=>Object.assign({},blank.spell,sp,{castingTime:sp.castingTime||sp.time||'',time:sp.castingTime||sp.time||''}))}));
  d.spells={};d.spellcasting.groups.forEach(g=>{let k=String(g.level);d.spells[k]=d.spells[k]||[];d.spells[k].push(...(g.spells||[]));});d.defenses.forEach(x=>{x.bonus=x.bonus==='Da compilare'?0:x.bonus;x.spellFailure=num(x.spellFailure);x.bonuses=normalizeBonusList(x.bonuses||[])});d.attacks=(d.attacks||[]).map(a=>Object.assign({},blank.attack,{prevBonus:a.bonus||'',damageDice:a.damage||a.damageDice||''},a,{attackAbility:a.attackAbility||'FOR',damageAbility:a.damageAbility||'FOR',magicBonus:a.magicBonus??a.damageMagic??0,attackMisc:a.attackMisc??0,damageMagic:a.damageMagic??0,damageMisc:a.damageMisc??0,bonuses:normalizeBonusList(a.bonuses||[])}));d.conditions=d.conditions.map(c=>Object.assign({name:'Custom',active:'Sì',duration:'',modifiers:[],strMod:0,desMod:0,cosMod:0,intMod:0,sagMod:0,carMod:0,attackMod:0,damageMod:0,acMod:0,saveMod:0,skillMod:0,notes:''},c,{modifiers:Array.isArray(c.modifiers)?c.modifiers:[]}));const byName=new Map(d.skills.map(s=>[String(s.name||'').toLowerCase(),s]));STANDARD_SKILLS.forEach(([name,ab,pen])=>{if(!byName.has(name.toLowerCase()))d.skills.push(Object.assign({},blank.skill,{name,ability:ab,standardAbility:ab,armorApplies:pen,classSkill:''}));});AB.forEach(([k])=>{d.abilities=d.abilities||{};d.abilities[k]=d.abilities[k]||{score:10,temp:0};d.abilities[k].bonuses=normalizeBonusList(d.abilities[k].bonuses||[])});d.skills.forEach(s=>{const std=STANDARD_SKILLS.find(x=>x[0].toLowerCase()===String(s.name||'').toLowerCase());s.standardAbility=s.standardAbility||std?.[1]||s.ability||'INT';if(s.armorApplies===undefined)s.armorApplies=!!std?.[2];});return d}
function protectionTotals(d){let total=0,armorPenalty=0,spellFailure=0,maxDexVals=[];(d.defenses||[]).forEach(x=>{total+=num(x.bonus);armorPenalty+=num(x.checkPenalty);spellFailure+=num(x.spellFailure);if(String(x.maxDex||'').trim()!=='')maxDexVals.push(num(x.maxDex))});return{total,armorPenalty,spellFailure,maxDexLimit:maxDexVals.length?Math.min(...maxDexVals):''}}
function calc(d){const ct=conditionTotals(d),gb=globalBonusTotals(d),dex=abilityMod(d,'DES'),str=abilityMod(d,'FOR'),ac=d.armorClass||{},pt=protectionTotals(d),rawMaxDex=pt.maxDexLimit===''?dex:Math.min(dex,pt.maxDexLimit),maxDex=ct.noDexToAC?Math.min(rawMaxDex,0):rawMaxDex,spellFailure=pt.spellFailure+ct.spellFailureMod;const flatDex=Math.min(dex,0);return{dex,str,ct,gb,pt,maxDex,flatDex,spellFailure,ca:num(ac.base??10)+pt.total+maxDex+ct.acMod+gb.ac,touch:num(ac.base??10)+maxDex+ct.acMod+gb.ac+gb.touch,flat:num(ac.base??10)+pt.total+flatDex+ct.acMod+gb.ac+gb.flat,init:dex+num(d.combat?.initiativeMisc)+ct.initMod+gb.initiative,grapple:num(d.combat?.bab)+str+num(d.combat?.grappleMisc)+gb.grapple}}
function section(title,inner,opts={}){const sid=String(title||'sezione').toLowerCase().replace(/[^a-z0-9àèéìòù]+/gi,'-');return `<details data-detail-id="${esc(sid)}" class="sheet-dropdown panel sheet-theme-panel ${opts.wide?'wide':''}" ${opts.open?'open':''}><summary><span>${title}</span>${opts.action||''}</summary><div class="dropdown-content">${inner}</div></details>`}
function hero(d){let can=sheetCanEdit();const returnLink=`<a class="button primary-action profile-return" href="${esc(isCompanion?`scheda-${slug}.html`:(d.meta?.profileUrl||'../personaggi.html'))}">${isCompanion?'Torna alla scheda principale':'Torna al profilo'}</a>`;const ownerTools=can?`<a class="button ghost-button primary-action" href="../auth.html">Accesso</a>`:'';return `<section class="dynamic-hero sheet-theme-panel"><div class="dynamic-crest">${esc(d.meta?.crest||'✦')}</div><div class="hero-main"><span class="tag">${isCompanion?'Scheda secondaria collegata':'Scheda personaggio — WorldAnvil style'}</span><h1 class="section-title">${inp('identity.name',d.identity?.name||'')}</h1><p class="section-note">${esc(d.meta?.subtitle||d.meta?.status||'')}</p><div class="actions sheet-actions">${returnLink}${ownerTools}</div><p class="sheet-status auth-status-line">${esc(authStatusText())}</p><p class="sheet-status" id="localStatus">${can?'Pronto.':'Solo lettura: accedi con il proprietario o Master.'}</p></div></section>`}
function statBlock(obj,prefix,keys){return `<div class="sheet-stat-grid">${keys.map(([k,l])=>`<div class="sheet-stat"><span>${l}</span>${inp(prefix+'.'+k,obj?.[k]||'')}</div>`).join('')}</div>`}
function xpPanel(d){const x=d.xpInfo;if(!x)return '';const pct=Math.max(0,Math.min(100,Number(x.progress)||0));return `<article class="panel sheet-theme-panel xp-panel"><h2>Esperienza e livello</h2><div class="computed-row"><div><span>Livello</span><strong>${x.level}</strong></div><div><span>PX totali</span><strong>${x.xp}</strong></div><div><span>Soglia liv. ${x.currentLevel}</span><strong>${x.currentXp}</strong></div><div><span>Soglia liv. ${x.nextLevel}</span><strong>${x.nextXp}</strong></div><div><span>Mancano</span><strong>${x.missing}</strong></div></div><div class="xpbar" title="${esc(x.progressLabel)} verso il prossimo livello" style="--xp:${pct}%"><i style="width:${pct}%"></i><span>${esc(x.progressLabel)}</span></div>${x.canLevel?`<p class="levelup-warning">Puoi salire di livello: i PX corrispondono almeno al livello ${x.xpLevel}.</p>`:''}<p class="section-mini-note">Barra calcolata dalla soglia del livello attuale alla soglia del prossimo livello, usando la somma di Classi/CdP come livello corrente.</p></article>`}
function identityProgressPanel(d){const x=d.xpInfo;if(!x)return '';const pct=Math.max(0,Math.min(100,Number(x.progress)||0));return `<div class="identity-progress-card"><div class="identity-progress-top"><div class="sheet-stat identity-xp-edit is-readonly"><span>Esperienza</span><strong>${esc(d.identity?.xp||0)}</strong><small>Gestita dal file sorgente</small></div><div class="identity-level-badge"><span>Livello</span><strong>${x.level}</strong></div></div><div class="xpbar compact" title="${esc(x.progressLabel)} verso il prossimo livello" style="--xp:${pct}%"><i style="width:${pct}%"></i><span>${esc(x.progressLabel)}</span></div><div class="identity-progress-meta"><span>Mancano ${esc(x.missing)}</span><span>Prossimo livello ${esc(x.nextLevel)}</span></div>${x.canLevel?`<p class="levelup-warning compact-warning">PX sufficienti per il livello ${x.xpLevel}.</p>`:''}</div>`}

function proIdentityLine(d){
  const parts=[classSummary(d), d.identity?.race, d.identity?.alignment].map(x=>String(x||'').trim()).filter(Boolean);
  return parts.length?parts.join(' · '):'Identità da completare';
}
function proTopStats(d){
  const c=calc(d), cb=d.combat||{}, hp=hpStatus(d);
  const stats=[
    ['PF', `${num(cb.hpCurrent)}/${num(cb.hpMax)}`, hp.status, `Temporanei ${num(cb.hpTemp)} · Non letali ${num(cb.nonlethal)}`],
    ['CA', c.ca, 'Armatura', 'Contatto '+c.touch+' · Sprovvista '+c.flat],
    ['BAB', sign(num(cb.bab)), 'Base attacco', 'Lotta '+sign(c.grapple)],
    ['Iniziativa', sign(c.init), 'Round', 'DES '+sign(c.dex)],
    ['Velocità', cb.speed||'—', 'Movimento', c.ct.speedHalf?'Dimezzata da condizione':'Normale'],
    ['Livello', totalLevel(d), 'Personaggio', `${esc(d.identity?.xp||0)} PX`]
  ];
  return `<section class="pro-stat-ribbon" aria-label="Statistiche principali">${stats.map(([label,value,sub,meta])=>`<article class="pro-stat-card"><span>${esc(label)}</span><strong>${esc(value)}</strong><small>${esc(sub)}</small><em>${esc(meta)}</em></article>`).join('')}</section>`;
}
function proHero(d){
  let can=sheetCanEdit();
  const returnLink=`<a class="button primary-action profile-return" href="${esc(isCompanion?`scheda-${slug}.html`:(d.meta?.profileUrl||'../personaggi.html'))}">${isCompanion?'Scheda principale':'Profilo'}</a>`;
  const ownerTools=can?`<a class="button ghost-button primary-action" href="../auth.html">Accesso</a>`:'';
  const portrait=d.portrait?.image||'';
  return `<section class="pro-hero sheet-theme-panel">
    <div class="pro-portrait-frame">${portrait?`<img src="${esc(portrait)}" alt="${esc(d.portrait?.alt||d.identity?.name||'Ritratto')}" loading="lazy">`:`<div class="pro-portrait-empty">${esc(d.meta?.crest||'✦')}</div>`}</div>
    <div class="pro-hero-copy">
      <span class="pro-kicker">${isCompanion?'Creatura collegata':'Scheda personaggio'}</span>
      <h1>${inp('identity.name',d.identity?.name||'')}</h1>
      <p class="pro-subtitle">${esc(proIdentityLine(d))}</p>
      <p class="pro-quote">${esc(d.portrait?.quote||d.meta?.subtitle||'')}</p>
      <div class="pro-hero-actions">${returnLink}${ownerTools}<span class="pro-auth-status" id="localStatus">${esc(can?'Pronto per la modifica.':'Solo lettura: accedi con il proprietario o Master.')}</span></div>
    </div>
    <div class="pro-hero-meta">
      ${identityProgressPanel(d)}
      <div class="portrait-edit-tools edit-only"><label class="portrait-upload-label">Cambia ritratto<input id="portraitImageUpload" type="file" accept="image/*"></label><small>Il ritratto non viene più zoomato: resta intero nel riquadro.</small></div>
    </div>
  </section>`;
}
function proSidebar(d){
  const active=(d.conditions||[]);
  const c=calc(d);
  return `<aside class="pro-sidebar">
    <section class="pro-side-card pro-quick-card"><h2>Uso rapido</h2><div class="pro-quick-grid"><button type="button" class="button ghost-button" data-scroll-to="attacchi-e-tecniche">Armi</button><button type="button" class="button ghost-button" data-scroll-to="incantesimi-poteri">Spell</button><button type="button" class="button ghost-button" data-scroll-to="inventario-e-denaro">Inventario</button><button type="button" class="button ghost-button" data-scroll-to="difese-protezioni">Difese</button></div></section>
    <section class="pro-side-card pro-conditions-card"><h2>Condizioni</h2><div class="pro-condition-tools"><button class="mini-add always-visible condition-add-button" data-open-condition-modal="1" type="button">+ Aggiungi condizione</button></div><datalist id="conditionOptions">${conditionOptions()}</datalist><div class="pro-condition-pills pro-condition-scroll">${active.length?active.map((c,i)=>{const idx=(d.conditions||[]).indexOf(c);return `<span class="pro-condition-pill ${String(c.active||'Sì').toLowerCase().startsWith('s')?'':'is-inactive'}"><label class="condition-toggle-pill" title="Attiva / disattiva"><input type="checkbox" class="condition-pill-toggle" data-condition-toggle="conditions.${idx}.active" ${String(c.active||'Sì').toLowerCase().startsWith('s')?'checked':''}><span></span></label><b>${esc(c.name||'Condizione')}</b>${c.duration?`<small>${esc(c.duration)}</small>`:''}<button class="condition-remove" data-del="conditions.${idx}" title="Elimina condizione">×</button></span>`}).join(''):'<em>Nessuna condizione attiva</em>'}</div></section>
    <section class="pro-side-card"><h2>Difese</h2><div class="pro-mini-stats"><span>Contatto <strong>${c.touch}</strong></span><span>Sprovvista <strong>${c.flat}</strong></span><span>Pen. arm. <strong>${sign(c.pt.armorPenalty)}</strong></span><span>Fall. arc. <strong>${c.spellFailure}%</strong></span></div></section>
    <section class="pro-side-card"><h2>Identità</h2>${classLevelsPanel(d)}${statBlock(d.identity,'identity',[['player','Giocatore'],['race','Razza'],['alignment','Allineamento'],['deity','Divinità']])}${languages(d)}</section>
  </aside>`;
}
function proCodexPanel(title,inner,id){
  return `<section class="pro-codex-panel" id="${esc(id||'')}"><header><h2>${esc(title)}</h2></header><div>${inner}</div></section>`;
}
function abilities(d){let gb=globalBonusTotals(d);return `<article class="panel sheet-theme-panel abilities-panel"><h2>Caratteristiche</h2><div class="ability-grid">${AB.map(([k,l])=>{let a=d.abilities?.[k]||{score:10,temp:0},eff=abilityScoreEffective(d,k),effMod=abilityMod(d,k);let ct=conditionTotals(d);return `<div class="ability-card"><span>${k}</span><strong>${inp(`abilities.${k}.score`,a.score,'number')}</strong>${formulaValue(sign(effMod),`Calcolo modificatore ${k}`,[`${l}: punteggio effettivo ${eff}.`,`Punteggio base: ${num(a.score)}`,`Temporaneo: ${sign(num(a.temp))}`,`Bonus avanzati tipizzati: ${sign(gb[k]||0)}`,`Condizioni: ${sign(ct[k]||0)}`,`Modificatore = pavimento((punteggio effettivo - 10) / 2).`],'ability-formula-value')}<small>${l}</small>${bonusSummary(a.bonuses||[],k)}${bonusRows(`abilities.${k}.bonuses`,a.bonuses||[])}</div>`}).join('')}</div></article>`}

function hpStatus(d){let hp=num(d.combat?.hpCurrent),max=num(d.combat?.hpMax),tmp=num(d.combat?.hpTemp),nl=num(d.combat?.nonlethal),stable=String(d.combat?.stable||'No');let status='Operativo';if(hp<=-10)status='Morto';else if(hp<0)status=stable==='Sì'?'Stabile':'Morente';else if(hp===0)status='Inabile';else if(hp>0 && nl>=hp)status='Privo di sensi per danni non letali';let effective=hp+tmp;return {status,effective};}
function combat(d){let c=calc(d),cb=d.combat||{};return `<article class="panel sheet-theme-panel combat-panel"><h2>Combattimento</h2><div class="computed-row formula-row"><div><span>CA</span>${formulaValue(c.ca,'Calcolo CA',acFormulaText(d,c,'ac'))}</div><div><span>Contatto</span>${formulaValue(c.touch,'Calcolo CA contatto',acFormulaText(d,c,'touch'))}</div><div><span>Sprovvista</span>${formulaValue(c.flat,'Calcolo CA sprovvista',acFormulaText(d,c,'flat'))}</div><div><span>Iniziativa</span>${formulaValue(sign(c.init),'Calcolo iniziativa',[`Iniziativa = DES + vari + condizioni + bonus avanzati.`,`DES: ${sign(c.dex)}`,`Vari: ${sign(num(cb.initiativeMisc))}`,`Condizioni: ${sign(c.ct.initMod)}`,bonusFormulaText(d,'initiative','Bonus iniziativa')])}</div><div><span>Lotta</span>${formulaValue(sign(c.grapple),'Calcolo lotta',[`Lotta = BAB + FOR + vari + bonus avanzati.`,`BAB: ${sign(num(cb.bab))}`,`FOR: ${sign(c.str)}`,`Vari: ${sign(num(cb.grappleMisc))}`,bonusFormulaText(d,'grapple','Bonus lotta')])}</div></div><div class="sheet-stat-grid combat-grid combat-core-grid">${[['hpCurrent','PF attuali'],['hpMax','PF massimi'],['hpTemp','PF temporanei'],['nonlethal','Danni non letali'],['speed','Velocità'],['bab','BAB'],['initiativeMisc','Iniziativa vari'],['grappleMisc','Lotta vari'],['resistances','Resistenze / note']].map(([k,l])=>`<div class="sheet-stat ${k==='bab'?'info-card formula-field':''}" ${k==='bab'?formulaTip('Cos’è il BAB?',num(cb[k]??0),babFormulaText(d)):''}><span>${l}</span>${inp('combat.'+k,cb[k]??'',k.includes('hp')||k==='nonlethal'||k==='bab'||k.includes('Misc')?'number':'text')}</div>`).join('')}</div>${bonusRows('combat.tempBonuses',cb.tempBonuses||[])}<h3>Riepilogo difese automatiche</h3><div class="sheet-stat-grid combat-grid combat-summary-grid"><div class="sheet-stat computed-small info-card" tabindex="0" ${formulaTip('Protezioni/Difese',sign(c.pt.total),['Somma i bonus CA degli elementi in Difese / Protezioni.','Qui entrano armature, scudi, armatura naturale e protezioni inserite nella sezione dedicata.'])}><span>Protezioni</span>${readonly(sign(c.pt.total))}</div><div class="sheet-stat computed-small info-card" tabindex="0" ${formulaTip('Bonus CA tipizzati',sign(c.gb.ac||0),[bonusFormulaText(d,'ac','Bonus CA')])}><span>Bonus CA tipizzati</span>${readonly(sign(c.gb.ac||0))}</div><div class="sheet-stat computed-small info-card" tabindex="0" ${formulaTip('DES usata alla CA',sign(c.maxDex),[`Parte dal modificatore DES: ${sign(c.dex)}.`,`Viene limitata dalla DES massima delle armature/scudi e annullata quando una condizione nega la DES alla CA.`])}><span>DES usata</span>${readonly(sign(c.maxDex))}</div><div class="sheet-stat computed-small info-card" tabindex="0" ${formulaTip('Penalità armatura',sign(c.pt.armorPenalty),['Somma le penalità alla prova delle protezioni equipaggiate/inserite.','Viene applicata alle abilità che hanno “Pen. armatura” attiva; Nuotare la conta doppia.'])}><span>Pen. armatura</span>${readonly(sign(c.pt.armorPenalty))}</div><div class="sheet-stat computed-small info-card" tabindex="0" ${formulaTip('Fallimento incantesimi arcani',c.spellFailure+'%',['Somma il fallimento incantesimi delle protezioni e gli eventuali modificatori da condizioni.'])}><span>Fall. inc. arcani</span>${readonly(c.spellFailure+'%')}</div></div></article>`}
function saves(d){let c=calc(d);const order=['fortitude','reflex','will'];const labels={fortitude:'Tempra',reflex:'Riflessi',will:'Volontà'};return `<article class="panel sheet-theme-panel"><h2>Tiri salvezza</h2><p class="section-mini-note">Tocca o passa il mouse sul totale per vedere come viene ottenuto: base classe + caratteristica + magia + vari + bonus avanzati + condizioni.</p><table class="sheet-table"><thead><tr><th>TS</th><th>Totale</th><th>Car.</th><th>Base</th><th>Magia</th><th>Vari</th><th>Bonus tip.</th><th>Cond.</th></tr></thead><tbody>${order.map(k=>{let s=(d.saves||{})[k]||{label:labels[k],ability:k==='fortitude'?'COS':k==='reflex'?'DES':'SAG',base:0,magic:0,misc:0};let typed=num(c.gb[k]||0);let total=num(s.base)+abilityMod(d,s.ability)+num(s.magic)+num(s.misc)+typed+c.ct.saveMod;return `<tr><td>${esc(labels[k]||s.label)}</td><td>${formulaReadonly(sign(total),`Calcolo ${labels[k]||s.label}`,saveFormulaText(labels[k]||s.label,s,typed,c.ct.saveMod,total,d))}</td><td>${sel(`saves.${k}.ability`,s.ability,s.ability)}</td><td class="info-card" tabindex="0" ${formulaTip('Base TS',num(s.base),['In D&D 3.5 la base del TS deriva dalla progressione delle classi e si somma tra i livelli multiclassati.','Questa scheda la lascia modificabile per classi, CdP e homebrew.'])}>${inp(`saves.${k}.base`,s.base,'number')}</td><td>${inp(`saves.${k}.magic`,s.magic,'number')}</td><td>${inp(`saves.${k}.misc`,s.misc,'number')}</td><td>${readonly(sign(typed))}</td><td>${readonly(sign(c.ct.saveMod))}</td></tr>`}).join('')}</tbody></table></article>`}

function attacks(d){let c=calc(d);let body=`<div class="section-head"><button class="mini-add" data-add="attacks" data-kind="attack" hidden>+ Attacco</button></div><p class="section-mini-note">Il bonus magico arma si applica automaticamente sia al tiro per colpire sia ai danni. Per altri modificatori usa i bonus avanzati: i bonus dello stesso tipo sulla stessa voce non si sommano.</p><div class="attack-card-list">${(d.attacks||[]).map((a,i)=>{let localAtk=stackBonuses(normalizeBonusList(a.bonuses).filter(b=>b.target==='attack'));let localDmg=stackBonuses(normalizeBonusList(a.bonuses).filter(b=>b.target==='damage'));let magic=num(a.magicBonus);let atk=num(d.combat?.bab)+abilityMod(d,a.attackAbility)+magic+num(c.gb.attack)+localAtk+c.ct.attackMod;let dmg=magic+abilityMod(d,a.damageAbility)+num(c.gb.damage)+localDmg+c.ct.damageMod;return `<article class="attack-card"${dragDropAttrs(`attacks.${i}`)}><div class="attack-card-main">${dragHandle(`attacks.${i}`)}<div class="attack-name">${inp(`attacks.${i}.name`,a.name)}</div><div class="attack-result"><span>TPC</span><strong>${sign(atk)}</strong></div><div class="attack-result"><span>Danni</span><strong>${esc(a.damageDice||'')} ${sign(dmg)}</strong></div><button class="row-del edit-only attack-delete" data-del="attacks.${i}">×</button></div><div class="attack-edit-grid edit-only"><label>Dadi danno ${inp(`attacks.${i}.damageDice`,a.damageDice||'')}</label><label>Car. attacco ${sel(`attacks.${i}.attackAbility`,a.attackAbility,'FOR')}</label><label>Car. danno ${sel(`attacks.${i}.damageAbility`,a.damageAbility,'FOR')}</label><label>Bonus magico arma ${inp(`attacks.${i}.magicBonus`,a.magicBonus,'number')}</label><label>Critico ${inp(`attacks.${i}.critical`,a.critical)}</label><label>Tipo ${inp(`attacks.${i}.type`,a.type||'')}</label></div><div class="attack-note-line">${a.critical?`<span>Critico: ${esc(a.critical)}</span>`:''}${a.type?`<span>${esc(a.type)}</span>`:''}${bonusSummary(a.bonuses)}</div><div class="attack-notes edit-only">${area(`attacks.${i}.notes`,a.notes||'')}</div>${bonusRows(`attacks.${i}.bonuses`,a.bonuses||[])}</article>`}).join('')||`<p class="empty-row">Nessun attacco inserito.</p>`}</div>`;return section('Attacchi e tecniche',body,{wide:true,open:true})}
function defenses(d){let body=`<div class="section-head"><button class="mini-add" data-add="defenses" data-kind="defense" hidden>+ Protezione</button></div><p class="section-mini-note">Bonus CA, penalità armatura e fallimento incantesimi arcani vengono sommati automaticamente. I bonus tipizzati aggiuntivi rispettano lo stacking 3.5.</p><table class="sheet-table"><thead><tr>${dragTh()}<th>Protezione</th><th>Bonus CA</th><th>Tipo</th><th>DES max</th><th>Pen. prova</th><th>Fall. inc.</th><th>Peso</th><th>Note / bonus</th><th class="edit-only">Azioni</th></tr></thead><tbody>${(d.defenses||[]).map((r,i)=>`<tr${dragDropAttrs(`defenses.${i}`)}>${dragTd(`defenses.${i}`)}<td>${inp(`defenses.${i}.name`,r.name)}</td><td>${inp(`defenses.${i}.bonus`,r.bonus,'number')}</td><td>${inp(`defenses.${i}.type`,r.type)}</td><td>${inp(`defenses.${i}.maxDex`,r.maxDex)}</td><td>${inp(`defenses.${i}.checkPenalty`,r.checkPenalty,'number')}</td><td>${inp(`defenses.${i}.spellFailure`,r.spellFailure,'number')}%</td><td>${inp(`defenses.${i}.weight`,r.weight)}</td><td>${area(`defenses.${i}.notes`,r.notes||'')}${bonusSummary(r.bonuses)}${bonusRows(`defenses.${i}.bonuses`,r.bonuses||[])}</td><td class="edit-only"><button class="row-del" data-del="defenses.${i}">×</button></td></tr>`).join('')}</tbody></table>`;return section('Difese / Protezioni',`<div class="scroll-box defense-scroll">${body}</div>`,{wide:true})}
function skills(d){let c=calc(d),lvl=levelFrom(d);let body=`<div class="section-head"><button class="mini-add" data-add="skills" data-kind="skill" hidden>+ Abilità</button></div><p class="section-mini-note">Totale: gradi + caratteristica + mod vari + penalità armatura automatica + condizioni. Max gradi: classe ${lvl+3}, incrociata ${(lvl+3)/2}.</p><table class="sheet-table skill-table"><thead><tr>${dragTh()}<th>Abilità</th><th>Totale</th><th>Car.</th><th>Gradi</th><th>Mod vari</th><th>Pen. arm.</th><th>Cond.</th><th>Classe</th><th>Note</th><th class="edit-only">Azioni</th></tr></thead><tbody>${(d.skills||[]).map((s,i)=>{let applies=s.armorApplies===true||String(s.armorApplies)==='Sì';let pen=applies?c.pt.armorPenalty*(String(s.name).toLowerCase()==='nuotare'?2:1):0;let condSkill=conditionSkillMod(d,s);let total=num(s.ranks)+abilityMod(d,s.ability)+num(s.misc)+pen+condSkill;let isClass=String(s.classSkill).toLowerCase().startsWith('s');let max=isClass?lvl+3:(lvl+3)/2;let warn=num(s.ranks)>max?' rank-warn':'';return `<tr class="${warn}"${dragDropAttrs(`skills.${i}`)}>${dragTd(`skills.${i}`)}<td>${inp(`skills.${i}.name`,s.name)}</td><td>${readonly(sign(total))}</td><td>${sel(`skills.${i}.ability`,s.ability,s.standardAbility)}</td><td>${inp(`skills.${i}.ranks`,s.ranks,'number')}</td><td>${inp(`skills.${i}.misc`,s.misc,'number')}</td><td>${readonly(sign(pen))}<span class="edit-only-inline">${yesNo(`skills.${i}.armorApplies`,applies?'Sì':'No')}</span></td><td>${readonly(sign(condSkill))}</td><td>${yesNo(`skills.${i}.classSkill`,isClass?'Sì':'No')}</td><td>${inp(`skills.${i}.notes`,s.notes)}</td><td class="edit-only"><button class="row-del" data-del="skills.${i}">×</button></td></tr>`}).join('')}</tbody></table>`;return section('Abilità',body,{wide:true})}
function tooltipCard(title,path,arr,kind){let allowBonuses=(path==='feats'||path==='features');let body=`<div class="section-head"><button class="mini-add" data-add="${path}" data-kind="${kind}" hidden>+ Aggiungi</button></div><div class="wa-cards tooltip-cards">${(arr&&arr.length?arr:[blank[kind]]).map((x,i)=>`<div class="wa-card info-card" tabindex="0" data-tip="${esc(tipText(x))}"${dragDropAttrs(`${path}.${i}`)}>${dragHandle(`${path}.${i}`)}<h3>${inp(`${path}.${i}.name`,x.name||'','text','compendium-name')}</h3>${area(`${path}.${i}.description`,x.description||x.notes||'','edit-description')}<div class="edit-description field-note-label">Fonte / note</div>${inp(`${path}.${i}.source`,x.source||'','text','edit-description')}<button class="row-del edit-only" data-del="${path}.${i}">×</button>${allowBonuses?bonusRows(`${path}.${i}.bonuses`,x.bonuses||[]):''}</div>`).join('')}</div>`;return section(title,body)}
function languages(d){let body=`<div class="section-head"><button class="mini-add" data-add="languages" data-kind="language" hidden>+ Linguaggio</button></div><div class="language-list">${(d.languages&&d.languages.length?d.languages:[blank.language]).map((x,i)=>`<div class="language-row"${dragDropAttrs(`languages.${i}`)}>${dragHandle(`languages.${i}`)}<div class="language-name">${inp(`languages.${i}.name`,x.name||'')}</div><div class="language-notes">${inp(`languages.${i}.notes`,x.notes||'')}</div><button class="row-del edit-only" data-del="languages.${i}">×</button></div>`).join('')}</div>`;return section('Linguaggi',body)}
function ordinalCircle(lv){lv=num(lv);return lv===0?'0ª cerchia / Trucchetti':lv+'ª cerchia'}
function spellGroupTitle(g){const cls=String(g.className||'').trim();return `${ordinalCircle(g.level)}${cls?' — '+cls:''}`}
function spellCircleOptions(selected){let out='';for(let lv=0;lv<=9;lv++)out+=`<option value="${lv}" ${num(selected)===lv?'selected':''}>${ordinalCircle(lv)}</option>`;return out}
function spellDC(d,g){const lv=num(g?.level),ab=g?.ability||'',abm=ab?abilityMod(d,ab):0,misc=num(g?.misc),total=10+lv+abm+misc;return{total,ab,abm,misc,short:`CD: ${total}`,text:`CD: ${total} = 10${ab?' + '+ab+' ('+sign(abm)+')':' + nessuna caratteristica'} + cerchia ${lv} + mod vari ${sign(misc)}`}}
function spells(d){let c=calc(d),sc=d.spellcasting||{},sr=num(sc.casterLevel)+num(sc.srMisc)+num(c.gb.srCheck||0),groups=sc.groups||[];let body=`<div class="spell-summary"><div class="info-card" tabindex="0" ${formulaTip('Fallimento incantesimi arcani',c.spellFailure+'%',['Somma il fallimento incantesimi delle protezioni e gli eventuali modificatori da condizioni.'])}><span>Fallimento inc. arcani</span><strong>${c.spellFailure}%</strong></div><div class="info-card" tabindex="0" ${formulaTip('Prova per superare la RI',sign(sr),[`Prova contro Resistenza agli Incantesimi = livello incantatore + modificatori vari + bonus avanzati “Superare RI”.`,`Livello incantatore: ${sign(num(sc.casterLevel))}`,`Mod RI vari: ${sign(num(sc.srMisc))}`,bonusFormulaText(d,'srCheck','Bonus Superare RI')])}><span>Superare RI</span><strong>${sign(sr)}</strong></div><div><span>Livello incantatore</span><div class="spell-summary-field">${inp('spellcasting.casterLevel',sc.casterLevel,'number')}</div></div><div><span>Mod RI vari</span><div class="spell-summary-field">${inp('spellcasting.srMisc',sc.srMisc,'number')}</div></div></div><p class="section-mini-note">Le cerchie sono dinamiche: aggiungi solo quelle che servono, scegliendo numero e classe di appartenenza. Gli slot usati si possono aumentare o togliere anche senza entrare in modifica. Per talenti/oggetti che aiutano a superare la Resistenza agli Incantesimi, usa Bonus avanzati → Applica a: Superare RI.</p><div class="spell-circle-adder edit-only"><label>Cerchia ${`<select id="newSpellCircleLevel">${spellCircleOptions(1)}</select>`}</label><label>Classe ${`<input id="newSpellCircleClass" type="text" placeholder="Es. Mago, Chierico, CdP...">`}</label><label>Inserisci ${`<select id="newSpellCirclePos"><option value="end">In fondo</option>${groups.map((g,i)=>`<option value="${i}">Prima di ${esc(spellGroupTitle(g))}</option>`).join('')}</select>`}</label><button class="mini-add" id="addSpellCircle" type="button">+ Aggiungi cerchia</button></div><div class="spell-circles">${groups.map((g,gi)=>{let dc=spellDC(d,g), used=num(g.used), slots=num(g.slots);return `<details class="spell-circle" data-spell-group="${gi}"${((g.spells||[]).length===0)?' open':''}${dragDropAttrs(`spellcasting.groups.${gi}`)}><summary>${dragHandle(`spellcasting.groups.${gi}`)}<span class="spell-circle-title">${esc(spellGroupTitle(g))}</span><span class="spell-dc-badge">${esc(dc.short)}</span><span class="spell-dc-edit edit-only" onclick="event.stopPropagation()"><span class="spell-dc-formula">${esc(dc.text)}</span><label class="spell-edit-field">Cerchia <select data-path="spellcasting.groups.${gi}.level" disabled>${spellCircleOptions(g.level)}</select></label><label class="spell-edit-field">Classe ${inp(`spellcasting.groups.${gi}.className`,g.className||'')}</label><label class="spell-edit-field">Car. ${sel(`spellcasting.groups.${gi}.ability`,dc.ab,'',true)}</label><label class="spell-edit-field">Mod CD ${inp(`spellcasting.groups.${gi}.misc`,dc.misc,'number')}</label><label class="spell-edit-field">Slot ${inp(`spellcasting.groups.${gi}.slots`,g.slots||0,'number')}</label><label class="spell-edit-field">Prep. ${inp(`spellcasting.groups.${gi}.prepared`,g.prepared||0,'number')}</label><label class="spell-edit-field">Usati ${inp(`spellcasting.groups.${gi}.used`,g.used||0,'number')}</label><button class="row-del spell-circle-delete" data-del="spellcasting.groups.${gi}" title="Elimina cerchia">×</button></span></summary><div class="spell-slots-read"><span>${esc(g.className||'Classe non indicata')}</span><span>Slot ${slots}</span><span>Preparati ${g.prepared||0}</span><span class="slot-used-control" onclick="event.stopPropagation()"><button type="button" class="slot-step" data-slot-step="spellcasting.groups.${gi}.used" data-step="-1" aria-label="Togli slot usato">−</button><strong>Usati ${used}</strong><button type="button" class="slot-step" data-slot-step="spellcasting.groups.${gi}.used" data-step="1" aria-label="Aggiungi slot usato">+</button></span></div><table class="sheet-table spell-table pro-spell-table"><thead><tr>${dragTh()}<th>Incantesimo</th><th>Componenti</th><th>Tempo di lancio</th><th>Gittata</th><th>Bersaglio</th><th>Durata</th><th>Tiro salvezza</th><th>RI</th><th class="edit-only spell-description-head">✎</th><th class="edit-only">Azioni</th></tr></thead><tbody>${((g.spells||[]).length?g.spells:[]).map((x,i)=>`<tr class="spell-row info-row" tabindex="0" data-tip="${esc(tipText(x))}"${dragDropAttrs(`spellcasting.groups.${gi}.spells.${i}`)}>${dragTd(`spellcasting.groups.${gi}.spells.${i}`)}<td>${inp(`spellcasting.groups.${gi}.spells.${i}.name`,x.name||'')}</td><td>${inp(`spellcasting.groups.${gi}.spells.${i}.components`,x.components||'')}</td><td>${inp(`spellcasting.groups.${gi}.spells.${i}.castingTime`,x.castingTime||x.time||'')}</td><td>${inp(`spellcasting.groups.${gi}.spells.${i}.range`,x.range||'')}</td><td>${inp(`spellcasting.groups.${gi}.spells.${i}.target`,x.target||'')}</td><td>${inp(`spellcasting.groups.${gi}.spells.${i}.duration`,x.duration||'')}</td><td>${inp(`spellcasting.groups.${gi}.spells.${i}.save`,x.save||'')}</td><td><span class="spell-ri-select">${yesNo(`spellcasting.groups.${gi}.spells.${i}.sr`,x.sr||'No')}</span></td><td class="edit-only spell-desc-cell"><button type="button" class="spell-desc-open" data-spell-desc-path="spellcasting.groups.${gi}.spells.${i}.description" data-spell-name-path="spellcasting.groups.${gi}.spells.${i}.name" title="Note">✎</button><textarea class="spell-description-store" data-path="spellcasting.groups.${gi}.spells.${i}.description" hidden disabled>${esc(x.description||'')}</textarea></td><td class="edit-only spell-action-cell"><button class="row-del spell-delete-button" data-del="spellcasting.groups.${gi}.spells.${i}" title="Elimina incantesimo">×</button></td></tr>`).join('')||`<tr><td colspan="11" class="empty-row">Nessun incantesimo inserito.</td></tr>`}</tbody></table><div class="spell-add-under edit-only"><button class="mini-add" data-add="spellcasting.groups.${gi}.spells" data-kind="spell" type="button">+ Nuova Spell</button></div></details>`}).join('')||`<div class="empty-row spell-empty">Nessuna cerchia inserita. Entra in modifica e aggiungi la prima cerchia utile al personaggio.</div>`}</div>`;return section('Incantesimi / Poteri',body,{wide:true})}

function companionsPanel(d){
  if(isCompanion)return '';
  const list=Array.isArray(d.companions)?d.companions:[];
  let body=`<p class="section-mini-note">Crea schede secondarie per famigli, compagni animali, forme selvatiche, evocazioni o servitori. Ogni scheda usa lo stesso sistema della scheda principale e resta collegata a questo personaggio.</p>
  <div class="companion-create edit-only">
    <label>Nome ${'<input id="newCompanionName" type="text" placeholder="Es. Corvo di Abraxas, Lupo, Forma d\'orso...">'}</label>
    <label>Tipo ${'<select id="newCompanionKind"><option>Famiglio</option><option>Compagno animale</option><option>Forma selvatica</option><option>Evocazione</option><option>Non morto controllato</option><option>Altro</option></select>'}</label>
    <label>Foto ${'<input id="newCompanionImage" type="file" accept="image/*">'}</label>
    <button class="mini-add" id="addCompanionSheet" type="button">+ Crea scheda</button>
  </div>
  <div class="companion-grid">${list.map((c,i)=>{const sh=c.sheet||{};const img=sh.portrait?.image||'';const name=companionLabel(c,i);const kind=c.kind||sh.meta?.subtitle||'Creatura';return `<article class="companion-card"><div class="companion-thumb">${img?`<img src="${esc(img)}" alt="${esc(name)}" loading="lazy">`:'<span>✦</span>'}</div><div class="companion-info"><strong>${esc(name)}</strong><small>${esc(kind)}</small><p>${esc(c.notes||sh.portrait?.quote||'Scheda secondaria modificabile.')}</p><div class="companion-actions"><a class="button ghost-button" href="scheda-${slug}.html?companion=${i}">Apri scheda</a><button class="row-del companion-delete edit-only" data-companion-del="${i}" type="button">×</button></div></div></article>`}).join('')||'<div class="empty-row">Nessuna scheda secondaria. Entra in modifica e creane una.</div>'}</div>`;
  return section('Famigli / Compagni / Forme selvatiche',body,{wide:true});
}
function inventoryItemTip(item){
  const bits=[];
  const notes=String(item?.notes||'').trim();
  if(notes)bits.push(notes);
  const bonuses=normalizeBonusList(item?.bonuses||[]);
  if(bonuses.length)bits.push('Bonus:\n'+bonuses.map(b=>`• ${bonusTargetLabel(b.target,b.save)} ${sign(b.value)} ${bonusTypeLabel(b.type)}${b.source?' — '+b.source:''}${b.note?' ('+b.note+')':''}`).join('\n'));
  return bits.join('\n\n')||'Nessuna nota.';
}
function inventory(d){let m=d.money||{},sections=Array.isArray(d.inventorySections)?d.inventorySections:[];let inv=`<div class="section-head inventory-section-adder edit-only"><label>Nome sezione ${`<input id="newInventorySectionName" type="text" placeholder="Pozioni, Pergamene, Gemme, Documenti...">`}</label><label>Inserisci ${`<select id="newInventorySectionPos"><option value="end">In fondo</option>${sections.map((sec,i)=>`<option value="${i}">Prima di ${esc(sec.name||'Sezione')}</option>`).join('')}</select>`}</label><button class="mini-add" id="addInventorySection" type="button">+ Sezione inventario</button></div><p class="section-mini-note">L'inventario è diviso in sezioni libere. Gli oggetti possono avere note, stato equipaggiato e bonus avanzati: i bonus vengono applicati solo se l'oggetto è equipaggiato.</p><div class="inventory-sections">${sections.map((sec,si)=>`<details class="inventory-section" data-inv-section="${si}" open${dragDropAttrs(`inventorySections.${si}`)}><summary>${dragHandle(`inventorySections.${si}`)}<span>${inp(`inventorySections.${si}.name`,sec.name||'Sezione')}</span><small>${(sec.items||[]).length} oggetti</small><button class="mini-add edit-only" data-add="inventorySections.${si}.items" data-kind="item" onclick="event.stopPropagation()" hidden>+ Oggetto</button><button class="row-del edit-only" data-del="inventorySections.${si}" onclick="event.stopPropagation()" title="Elimina sezione">×</button></summary><div class="inventory-section-body"><div class="inventory-section-notes edit-only"><label>Note sezione ${inp(`inventorySections.${si}.notes`,sec.notes||'')}</label></div><div class="inventory-item-list" data-reorder-zone="inventorySections.${si}.items">${((sec.items||[]).length?sec.items:[]).map((r,i)=>{const equipped=String(r.equipped||'No').toLowerCase().startsWith('s');const tip=inventoryItemTip(r);return `<article class="inventory-item-card ${equipped?'is-equipped':''}"${dragDropAttrs(`inventorySections.${si}.items.${i}`)}><div class="inventory-item-main">${dragHandle(`inventorySections.${si}.items.${i}`,'Sposta oggetto anche in un’altra categoria')}<div class="inventory-item-name info-card" tabindex="0" data-tip="${esc(tip)}">${inp(`inventorySections.${si}.items.${i}.name`,r.name||'')}</div><div class="inventory-item-meta"><span>Q.tà ${inp(`inventorySections.${si}.items.${i}.qty`,r.qty??1,'number')}</span><span>Peso ${inp(`inventorySections.${si}.items.${i}.weight`,r.weight||'')}</span><span class="inventory-equipped">Equip. ${yesNo(`inventorySections.${si}.items.${i}.equipped`,r.equipped||'No')}</span></div><div class="inventory-item-badges">${equipped?'<span class="equipped-badge">Equipaggiato</span>':'<span class="unequipped-badge">Non equipaggiato</span>'}${bonusSummary(r.bonuses)}</div><button class="row-del edit-only inventory-delete" data-del="inventorySections.${si}.items.${i}">×</button></div><div class="inventory-item-notes edit-only"><label>Note oggetto <small>(visibili in lettura solo con hover/tap sul nome)</small>${area(`inventorySections.${si}.items.${i}.notes`,r.notes||'','item-notes-editor')}</label></div>${bonusRows(`inventorySections.${si}.items.${i}.bonuses`,r.bonuses||[])}</article>`}).join('')||`<div class="empty-row">Nessun oggetto in questa sezione.</div>`}</div></div></details>`).join('')||`<div class="empty-row">Nessuna sezione inventario. Entra in modifica e aggiungi la prima sezione.</div>`}</div><h3>Denaro</h3><div class="money-grid sheet-stat-grid">${['MP','MO','MA','MR'].map(k=>`<div class="sheet-stat"><span>${k}</span>${inp('money.'+k,m[k]||0,'number')}</div>`).join('')}</div>`;return section('Inventario e denaro',inv,{wide:true})}
function narrative(d){let n=d.narrative||{};return `<article class="panel sheet-theme-panel wide"><h2>Diario e legami narrativi</h2><label>Riassunto</label>${area('narrative.summary',n.summary||'')}<label>Legami</label>${area('narrative.bondsText',Array.isArray(n.bonds)?n.bonds.join('\n'):n.bondsText||'')}<label>Visioni</label>${area('narrative.visionsText',Array.isArray(n.visions)?n.visions.join('\n'):n.visionsText||'')}<label>Appunti privati / giocatore</label>${area('narrative.privateNotes',n.privateNotes||'')}</article>`}
function classLevelsPanel(d){let list=(d.classLevels&&d.classLevels.length?d.classLevels:[blank.classLevel]);let body=`<div class="section-head identity-section-tools"><button class="mini-add" data-add="classLevels" data-kind="classLevel" hidden>+ Classe / CdP</button></div><div class="identity-class-list">${list.map((c,i)=>`<article class="identity-class-card"${dragDropAttrs(`classLevels.${i}`)}>${dragHandle(`classLevels.${i}`)}<div class="identity-class-content"><div class="identity-class-name">${inp(`classLevels.${i}.name`,c.name||'')}</div><div class="identity-class-subrow"><div class="identity-class-level"><span>Lv</span>${inp(`classLevels.${i}.level`,c.level||1,'number')}</div><div class="identity-class-notes">${inp(`classLevels.${i}.notes`,c.notes||'')}</div></div></div><button class="row-del edit-only" data-del="classLevels.${i}">×</button></article>`).join('')}</div>`;return section('Classi e livelli',body,{open:true})}
function secretsPanel(d){let sec=d.secrets||{};return `<article class="panel sheet-theme-panel wide secret-panel"><h2>Segreti</h2><p class="section-mini-note">Sezione predisposta per Supabase: sarà visibile solo al login del personaggio corretto e al Master. Per ora resta mascherata in lettura.</p><div class="secret-locked"><strong>🔒 Accesso riservato</strong><span>Questa parte verrà collegata al login del personaggio.</span></div><div class="secret-edit edit-only"><label>Segreti del personaggio</label>${area('secrets.playerVisible',sec.playerVisible||'')}<label>Note Master / riservate</label>${area('secrets.dmNotes',sec.dmNotes||'')}</div></article>`}
function conditionsPanel(d){let rows=(d.conditions&&d.conditions.length?d.conditions:[]);let body=`<div class="section-head condition-quick-add"><div class="condition-picker"><input id="quickConditionName" list="conditionOptions" autocomplete="off" placeholder="Aggiungi condizione..."><div id="quickConditionMenu" class="condition-menu" hidden></div></div><button class="mini-add always-visible" data-open-condition-modal="1" type="button">+ Condizione</button></div><p class="section-mini-note">Le condizioni si possono aggiungere, disattivare o rimuovere anche senza modalità modifica. In lettura viene mostrato solo il titolo: passa il mouse o tocca la condizione per leggere la descrizione.</p><datalist id="conditionOptions">${conditionOptions()}</datalist><table class="sheet-table conditions-table"><thead><tr>${dragTh()}<th>Condizione</th><th>Attiva</th><th>Durata</th><th>Effetti automatici</th><th class="edit-only">Mod manuali</th><th class="edit-only">Note</th><th>Azioni</th></tr></thead><tbody>${rows.map((c,i)=>{let desc=conditionDescription(c.name);let effects=conditionEffectSummary(c.name);let extra=String(c.notes||'').trim();let tip=desc+(effects?'\n\nEffetti automatici: '+effects:'')+(extra?'\n\nNote: '+extra:'');return `<tr class="info-row condition-row" tabindex="0" data-tip="${esc(tip)}"${dragDropAttrs(`conditions.${i}`)}>${dragTd(`conditions.${i}`)}<td><input class="condition-name-input" list="conditionOptions" data-path="conditions.${i}.name" value="${esc(c.name||'Custom')}" disabled><span class="display-value condition-title">${esc(c.name||'Custom')}</span></td><td><select class="condition-active-control" data-path="conditions.${i}.active"><option value="Sì" ${(String(c.active||'Sì')==='Sì'||String(c.active)==='true')?'selected':''}>Sì</option><option value="No" ${(String(c.active)==='No'||String(c.active)==='false')?'selected':''}>No</option></select></td><td>${inp(`conditions.${i}.duration`,c.duration||'')}</td><td><span class="condition-effects">${esc(effects)}</span></td><td class="edit-only condition-manual"><label>FOR ${inp(`conditions.${i}.strMod`,c.strMod||0,'number')}</label><label>DES ${inp(`conditions.${i}.desMod`,c.desMod||0,'number')}</label><label>COS ${inp(`conditions.${i}.cosMod`,c.cosMod||0,'number')}</label><label>INT ${inp(`conditions.${i}.intMod`,c.intMod||0,'number')}</label><label>SAG ${inp(`conditions.${i}.sagMod`,c.sagMod||0,'number')}</label><label>CAR ${inp(`conditions.${i}.carMod`,c.carMod||0,'number')}</label><label>Att. ${inp(`conditions.${i}.attackMod`,c.attackMod||0,'number')}</label><label>Danni ${inp(`conditions.${i}.damageMod`,c.damageMod||0,'number')}</label><label>CA ${inp(`conditions.${i}.acMod`,c.acMod||0,'number')}</label><label>TS ${inp(`conditions.${i}.saveMod`,c.saveMod||0,'number')}</label><label>Abil. ${inp(`conditions.${i}.skillMod`,c.skillMod||0,'number')}</label></td><td class="edit-only">${inp(`conditions.${i}.notes`,c.notes||'')}</td><td><button class="row-del condition-remove" data-del="conditions.${i}">×</button></td></tr>`}).join('')||`<tr><td colspan="7" class="empty-row">Nessuna condizione attiva.</td></tr>`}</tbody></table>`;return section('Condizioni temporanee',body,{wide:true})}
function logPanel(d){let rows=(d.changeLog||[]).slice().reverse().slice(0,30);let body=`<p class="section-mini-note">Registro locale delle modifiche. Con Supabase diventerà un log condiviso con utente e data.</p><table class="sheet-table log-table"><thead><tr><th>Quando</th><th>Azione</th><th>Dettaglio</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${esc(r.when||'')}</td><td>${esc(r.action||'')}</td><td>${esc(r.detail||'')}</td></tr>`).join('')||`<tr><td colspan="3" class="empty-row">Nessuna modifica registrata.</td></tr>`}</tbody></table>`;return section('Log modifiche',body,{wide:true})}

function snapshotKey(){return storageKey+'.snapshots'}
function getSnapshots(){try{return JSON.parse(localStorage.getItem(snapshotKey())||'[]')}catch(e){return []}}
function pushSnapshot(d,detail){let arr=getSnapshots();arr.unshift({when:new Date().toLocaleString('it-IT'),detail:detail||'Snapshot automatico',data:normalize(d)});arr=arr.slice(0,10);localStorage.setItem(snapshotKey(),JSON.stringify(arr));return arr}
function historyPanel(d){let snaps=getSnapshots();let body=`<p class="section-mini-note">Ultimi 10 salvataggi locali. Puoi ripristinare una versione precedente se qualcosa viene modificato per errore.</p><table class="sheet-table history-table"><thead><tr><th>Quando</th><th>Dettaglio</th><th>Azione</th></tr></thead><tbody>${snaps.map((s,i)=>`<tr><td>${esc(s.when||'')}</td><td>${esc(s.detail||'')}</td><td><button class="button ghost-button restore-snapshot" data-snapshot="${i}" type="button">Ripristina</button></td></tr>`).join('')||`<tr><td colspan="3" class="empty-row">Nessuno snapshot ancora disponibile.</td></tr>`}</tbody></table>`;return section('Backup / Undo',body,{wide:true})}

function render(data,xpData,compendium){
  const d=normalize(data);const can=sheetCanEdit();app.classList.toggle('no-edit-permission',!can);d.xpInfo=xpCalc(d,xpData);window.__thalorCurrentData=d;window.__thalorCompendium=compendium||window.__thalorCompendium||{};document.title=`Scheda — ${d.identity?.name||slug}`;document.body.className=`dynamic-sheet-body pro-sheet-body theme-${d.meta?.theme||'default'}`;
  app.innerHTML=floatingActions()+`<div class="pro-sheet-shell">
    ${proHero(d)}
    ${proTopStats(d)}
    <div class="pro-sheet-layout">
      ${proSidebar(d)}
      <main class="pro-main">
        <section class="pro-primary-grid"><div class="pro-left-stack">${abilities(d)}${saves(d)}</div><div class="pro-right-stack">${combat(d)}</div></section>
        ${attacks(d)}
        ${spells(d)}
        ${inventory(d)}
        <section class="pro-secondary-grid pro-independent-columns"><div class="pro-secondary-column">${defenses(d)}${tooltipCard('Talenti','feats',d.feats,'feat')}${companionsPanel(d)}${historyPanel(d)}</div><div class="pro-secondary-column">${skills(d)}${tooltipCard('Capacità / Tratti','features',d.features,'feature')}${narrative(d)}${secretsPanel(d)}</div></section>
      </main>
    </div>
  </div>`;
  bind(d,xpData,window.__thalorCompendium);
  document.querySelectorAll('[data-scroll-to]').forEach(btn=>btn.addEventListener('click',()=>{const id=btn.dataset.scrollTo;const target=document.querySelector(`[data-detail-id="${id}"], #${id}`);if(target){if(target.tagName==='DETAILS')target.open=true;target.scrollIntoView({behavior:'smooth',block:'start'});}}));
}
function enable(on){const can=sheetCanEdit();if(on&&!can){alert(editDeniedMessage());on=false;}document.querySelectorAll('[data-path]').forEach(el=>{if(el.classList.contains('condition-active-control'))el.disabled=!can;else el.disabled=!on});document.querySelectorAll('.mini-add').forEach(b=>{if(!can){b.hidden=true;return;}if(b.classList.contains('always-visible'))b.hidden=false;else b.hidden=!on});const floatEditSave=document.getElementById('floatEditSaveSheet');if(floatEditSave)floatEditSave.textContent=on?'Salva':'Modifica';app.classList.toggle('editing',on);document.body.classList.toggle('editing',on);}

function keepViewportStable(work){
  const probe=document.elementFromPoint(Math.min(window.innerWidth-8,Math.max(8,window.innerWidth/2)),Math.min(window.innerHeight-90,Math.max(80,window.innerHeight/2)));
  const anchor=probe?.closest?.('.sheet-theme-panel,.sheet-dropdown,.attack-card,.wa-card,.inventory-section,.spell-circle,[data-reorder-path]')||probe;
  const before=anchor?.getBoundingClientRect?.().top;
  const result=work();
  const restore=()=>{if(anchor&&Number.isFinite(before)){const after=anchor.getBoundingClientRect().top;window.scrollBy({top:after-before,left:0,behavior:'instant'});}};
  requestAnimationFrame(()=>requestAnimationFrame(restore));
  return result;
}
function delAt(obj,path){let p=path.split('.'),idx=+p.pop(),o=obj;for(const k of p)o=o[k];if(Array.isArray(o))o.splice(idx,1)}
function addAt(obj,path,kind){let p=path.split('.'),o=obj;for(const k of p){if(!(k in o)||o[k]==null)o[k]=/^\d+$/.test(k)?[]:{};o=o[k]}if(Array.isArray(o))o.push(JSON.parse(JSON.stringify(blank[kind])))}
function getAtPath(obj,path){return String(path||'').split('.').filter(Boolean).reduce((o,k)=>o&&o[k],obj)}
function arrayPathAndIndex(path){let p=String(path||'').split('.');let idx=Number(p.pop());return {arrPath:p.join('.'),index:idx}}
function sameReorderFamily(fromPath,toPath){
  const f=arrayPathAndIndex(fromPath),t=arrayPathAndIndex(toPath);
  if(!Number.isFinite(f.index)||!Number.isFinite(t.index))return false;
  if(f.arrPath===t.arrPath)return true;
  // Gli oggetti possono cambiare categoria, ma devono restare dentro arrays .items già esistenti.
  if(f.arrPath.startsWith('inventorySections.')&&t.arrPath.startsWith('inventorySections.')&&f.arrPath.endsWith('.items')&&t.arrPath.endsWith('.items'))return true;
  // Gli incantesimi possono cambiare cerchia già esistente, senza creare nuove cerchie.
  if(f.arrPath.startsWith('spellcasting.groups.')&&t.arrPath.startsWith('spellcasting.groups.')&&f.arrPath.endsWith('.spells')&&t.arrPath.endsWith('.spells'))return true;
  return false;
}
function canDropOnZone(fromPath,zonePath){
  const f=arrayPathAndIndex(fromPath);
  if(!Number.isFinite(f.index)||!zonePath)return false;
  if(f.arrPath===zonePath)return true;
  if(f.arrPath.startsWith('inventorySections.')&&zonePath.startsWith('inventorySections.')&&f.arrPath.endsWith('.items')&&zonePath.endsWith('.items'))return true;
  if(f.arrPath.startsWith('spellcasting.groups.')&&zonePath.startsWith('spellcasting.groups.')&&f.arrPath.endsWith('.spells')&&zonePath.endsWith('.spells'))return true;
  return false;
}
function moveArrayRow(obj,fromPath,toPath,position='before'){
  if(!sameReorderFamily(fromPath,toPath))return false;
  const from=arrayPathAndIndex(fromPath),to=arrayPathAndIndex(toPath);
  return moveArrayRowTo(obj,from.arrPath,from.index,to.arrPath,to.index+(position==='after'?1:0));
}
function moveArrayRowToZone(obj,fromPath,zonePath){
  if(!canDropOnZone(fromPath,zonePath))return false;
  const from=arrayPathAndIndex(fromPath),toArr=getAtPath(obj,zonePath);
  if(!Array.isArray(toArr))return false;
  return moveArrayRowTo(obj,from.arrPath,from.index,zonePath,toArr.length);
}
function moveArrayRowTo(obj,fromArrPath,fromIndex,toArrPath,toIndex){
  const fromArr=getAtPath(obj,fromArrPath),toArr=getAtPath(obj,toArrPath);
  if(!Array.isArray(fromArr)||!Array.isArray(toArr))return false;
  if(fromArr===toArr&&fromIndex===toIndex)return false;
  const [row]=fromArr.splice(fromIndex,1); if(!row)return false;
  let insert=toIndex;
  if(fromArr===toArr&&fromIndex<insert)insert--;
  toArr.splice(Math.max(0,Math.min(toArr.length,insert)),0,row);
  return true;
}
function dragHandle(path,label='Sposta'){return sheetCanEdit()?`<button type="button" class="drag-handle" draggable="true" data-drag-path="${esc(path)}" title="${esc(label)}" aria-label="${esc(label)}"><span></span><span></span><span></span></button>`:`<span class="drag-handle-spacer" aria-hidden="true"></span>`}
function dragTh(){return sheetCanEdit()?'<th class="drag-head" aria-label="Sposta"></th>':''}
function dragTd(path){return sheetCanEdit()?`<td class="drag-cell">${dragHandle(path)}</td>`:''}
function dragDropAttrs(path){return sheetCanEdit()?` data-reorder-path="${esc(path)}"`:''}
function bindReorderHandles(data,xpData,compendium){
  if(!sheetCanEdit())return;
  let draggedPath='',ghost=null,sourceEl=null,dropIndicator=null,lastTarget=null,lastZone=null,autoScrollTimer=null;
  const targets=()=>[...document.querySelectorAll('[data-reorder-path]')];
  const zones=()=>[...document.querySelectorAll('[data-reorder-zone]')];
  const clearTargets=()=>{
    targets().forEach(x=>{x.classList.remove('drop-target-row','drop-target-after','drop-target-before','drop-target-invalid');delete x.dataset.dropPosition;});
    zones().forEach(x=>x.classList.remove('drop-zone-active'));
    lastTarget=null;lastZone=null;
    if(dropIndicator)dropIndicator.hidden=true;
  };
  const stopAutoScroll=()=>{if(autoScrollTimer){clearInterval(autoScrollTimer);autoScrollTimer=null;}};
  const cleanup=()=>{draggedPath='';sourceEl=null;document.body.classList.remove('sheet-dragging');document.querySelectorAll('.drag-source-row').forEach(x=>x.classList.remove('drag-source-row'));clearTargets();stopAutoScroll();if(ghost){ghost.remove();ghost=null;}if(dropIndicator){dropIndicator.remove();dropIndicator=null;}};
  const ensureIndicator=()=>{if(dropIndicator)return dropIndicator;dropIndicator=document.createElement('div');dropIndicator.className='sheet-drop-indicator';dropIndicator.hidden=true;document.body.appendChild(dropIndicator);return dropIndicator;};
  const showIndicator=(target,position)=>{
    const ind=ensureIndicator(),r=target.getBoundingClientRect();
    const y=position==='after'?r.bottom:r.top;
    ind.style.left=Math.max(8,r.left+6)+'px';
    ind.style.top=Math.round(y-2)+'px';
    ind.style.width=Math.max(36,r.width-12)+'px';
    ind.hidden=false;
  };
  const makeGhost=(el)=>{
    const r=el.getBoundingClientRect();
    const g=document.createElement('div');
    g.className='drag-ghost-card';
    g.style.width=Math.min(Math.max(r.width,120),420)+'px';
    g.style.height=Math.min(Math.max(r.height,28),90)+'px';
    g.textContent='Sposta';
    document.body.appendChild(g);
    return g;
  };
  const nearestTarget=(x,y)=>{
    let best=null,bestDist=Infinity;
    for(const t of targets()){
      const p=t.dataset.reorderPath||'';
      if(!draggedPath||p===draggedPath||!sameReorderFamily(draggedPath,p))continue;
      const r=t.getBoundingClientRect();
      const inside=x>=r.left-10&&x<=r.right+10&&y>=r.top-10&&y<=r.bottom+10;
      if(!inside)continue;
      const cy=r.top+r.height/2,dist=Math.abs(y-cy);
      if(dist<bestDist){best=t;bestDist=dist;}
    }
    return best;
  };
  const nearestZone=(x,y)=>{
    let best=null,bestScore=Infinity;
    for(const z of zones()){
      const zp=z.dataset.reorderZone||'';
      if(!draggedPath||!canDropOnZone(draggedPath,zp))continue;
      const r=z.getBoundingClientRect();
      const isEmpty=!!z.querySelector('.empty-row');
      const pad=isEmpty?46:10;
      const inside=x>=r.left-pad&&x<=r.right+pad&&y>=r.top-pad&&y<=r.bottom+pad;
      if(!inside)continue;
      const cy=Math.max(r.top,Math.min(y,r.bottom));
      const cx=Math.max(r.left,Math.min(x,r.right));
      const dist=Math.hypot(x-cx,y-cy);
      const area=Math.max(1,r.width*r.height);
      const score=dist+(area/1000000);
      if(score<bestScore){best=z;bestScore=score;}
    }
    return best;
  };
  const markTarget=(target,e)=>{
    clearTargets();
    if(!target)return;
    const r=target.getBoundingClientRect();
    const after=e.clientY>r.top+r.height/2;
    target.dataset.dropPosition=after?'after':'before';
    target.classList.add('drop-target-row',after?'drop-target-after':'drop-target-before');
    lastTarget=target;
    showIndicator(target,after?'after':'before');
  };
  const markZone=(zone)=>{
    clearTargets();
    if(!zone)return;
    zone.classList.add('drop-zone-active');
    lastZone=zone;
    const ind=ensureIndicator(),r=zone.getBoundingClientRect();
    ind.style.left=Math.max(8,r.left+10)+'px';
    ind.style.top=Math.round(r.bottom-5)+'px';
    ind.style.width=Math.max(36,r.width-20)+'px';
    ind.hidden=false;
  };
  document.querySelectorAll('[data-drag-path]').forEach(h=>{
    h.addEventListener('dragstart',e=>{
      draggedPath=h.dataset.dragPath||'';
      sourceEl=h.closest('[data-reorder-path]');
      if(sourceEl)sourceEl.classList.add('drag-source-row');
      e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',draggedPath);
      ghost=makeGhost(sourceEl||h);
      e.dataTransfer.setDragImage(ghost,18,18);
      document.body.classList.add('sheet-dragging');
    });
    h.addEventListener('dragend',cleanup);
  });
  document.addEventListener('dragover',e=>{
    if(!draggedPath)return;
    const target=nearestTarget(e.clientX,e.clientY);
    const zone=!target?nearestZone(e.clientX,e.clientY):null;
    if(!target&&!zone)return;
    e.preventDefault();
    if(target)markTarget(target,e);else markZone(zone);
    stopAutoScroll();
    if(e.clientY<70||e.clientY>window.innerHeight-70){
      const dir=e.clientY<70?-1:1;
      autoScrollTimer=setInterval(()=>window.scrollBy(0,dir*10),32);
    }
  });
  document.addEventListener('drop',e=>{
    if(!draggedPath)return;
    const target=lastTarget||document.querySelector('.drop-target-row');
    const zone=lastZone||(!target?document.querySelector('.drop-zone-active'):null);
    if(!target&&!zone){cleanup();return;}
    e.preventDefault();
    const from=e.dataTransfer.getData('text/plain')||draggedPath;
    const c=normalize(collect(data));
    let ok=false;
    if(target){
      const to=target.dataset.reorderPath||'',pos=target.dataset.dropPosition||'before';
      if(from&&to&&from!==to)ok=moveArrayRow(c,from,to,pos);
    }else if(zone){
      const zp=zone.dataset.reorderZone||'';
      ok=moveArrayRowToZone(c,from,zp);
    }
    if(!ok){document.getElementById('localStatus').textContent='Spostamento non valido per questa lista.';cleanup();return;}
    const state=captureSheetUiState();
    const label=from.startsWith('inventorySections')?'Inventario riordinato.':from.startsWith('spellcasting')?'Incantesimi riordinati.':'Riga riordinata.';
    cleanup();
    saveCurrentSheet(c,xpData,label,false,app.classList.contains('editing'));
    restoreSheetUiState(state);
  });
}
function floatingActions(){if(!sheetCanEdit())return '';return `<nav class="sheet-floating-actions" aria-label="Azioni scheda"><button class="sheet-floating-toggle" id="sheetFloatingToggle" type="button" aria-label="Apri menu scheda" aria-expanded="false"><span></span><span></span><span></span></button><div class="sheet-floating-menu" id="sheetFloatingMenu"><button class="button primary-action" id="floatEditSaveSheet" type="button">Modifica</button><button class="button ghost-button" id="floatPrintSheet" type="button">Stampa PDF</button><details class="sheet-tools floating-tools"><summary class="button ghost-button">Strumenti</summary><div class="sheet-tools-grid"><button class="button ghost-button" id="exportSheet" type="button">Esporta JSON</button><button class="button ghost-button" id="copySheet" type="button">Copia backup</button><button class="button ghost-button" id="exportCompendium" type="button">Esporta compendio</button><label class="button ghost-button import-label">Importa JSON<input id="importSheet" type="file" accept="application/json" hidden></label><button class="button ghost-button danger-action" id="resetSheet" type="button">Ripristina JSON</button></div></details></div></nav>`}

function localCompendiumKey(){return 'thalor.compendium.local.v1'}
function mergeCompendium(base){let local={};try{local=JSON.parse(localStorage.getItem(localCompendiumKey())||'{}')}catch(e){};return Object.assign({spells:[],feats:[],features:[]},base||{},local)}
function upsertComp(arr,item){if(!item||!String(item.name||'').trim())return;let name=String(item.name).trim().toLowerCase();let i=arr.findIndex(x=>String(x.name||'').trim().toLowerCase()===name);let clean=JSON.parse(JSON.stringify(item));if(i>=0)arr[i]=Object.assign({},arr[i],clean);else arr.push(clean)}
function updateCompendiumFromSheet(d){let comp=mergeCompendium(window.__thalorCompendium||{});comp.spells=comp.spells||[];comp.feats=comp.feats||[];comp.features=comp.features||[];(d.feats||[]).forEach(x=>upsertComp(comp.feats,x));(d.features||[]).forEach(x=>upsertComp(comp.features,x));(d.spellcasting?.groups||[]).flatMap(g=>g.spells||[]).forEach(x=>upsertComp(comp.spells,x));localStorage.setItem(localCompendiumKey(),JSON.stringify(comp));window.__thalorCompendium=comp;return comp}
function applyCompendiumHints(){const comp=window.__thalorCompendium||{};document.querySelectorAll('input.compendium-name[data-path]').forEach(el=>{el.addEventListener('change',()=>{let name=String(el.value||'').trim().toLowerCase();let path=el.dataset.path||'';let group=path.startsWith('feats')?'feats':path.startsWith('features')?'features':'';if(!group)return;let found=(comp[group]||[]).find(x=>String(x.name||'').trim().toLowerCase()===name);if(!found)return;let base=path.split('.').slice(0,2).join('.');let desc=document.querySelector(`[data-path=\"${base}.description\"]`);let src=document.querySelector(`[data-path=\"${base}.source\"]`);if(desc&&!desc.value)desc.value=found.description||found.notes||'';if(src&&!src.value)src.value=found.source||'';});});document.querySelectorAll('.spell-row input[data-path$=".name"]').forEach(el=>{el.addEventListener('change',()=>{let name=String(el.value||'').trim().toLowerCase();let found=(comp.spells||[]).find(x=>String(x.name||'').trim().toLowerCase()===name);if(!found)return;let parts=el.dataset.path.split('.');let base=parts.slice(0,-1).join('.');['school','castingTime','target','duration','description'].forEach(k=>{let f=document.querySelector(`[data-path=\"${base}.${k}\"]`);if(f&&!f.value)f.value=found[k]||found.time||'';});});});}

function detailStableKey(d,i){
  const id=d.dataset.detailId||d.dataset.spellGroup||'';
  if(id) return `id:${id}`;
  const summary=d.querySelector(':scope > summary');
  const title=(summary?.querySelector(':scope > span')?.textContent||summary?.textContent||'').replace(/\s+/g,' ').trim();
  const group=d.dataset.spellGroup!=null?`spell-${d.dataset.spellGroup}`:'';
  return `${d.className}|${group}|${title}`;
}
function captureOpenDetails(){
  return Array.from(document.querySelectorAll('details')).map((d,i)=>d.open?detailStableKey(d,i):null).filter(Boolean);
}
function restoreOpenDetails(keys){
  if(!keys||!keys.length)return;
  const set=new Set(keys);
  document.querySelectorAll('details').forEach((d,i)=>{if(set.has(detailStableKey(d,i)))d.open=true;});
}
function captureSheetUiState(){
  return {
    openDetails:captureOpenDetails(),
    scrollY:window.scrollY||document.documentElement.scrollTop||0,
    activePath:document.activeElement&&document.activeElement.dataset?document.activeElement.dataset.path:null,
    activeId:document.activeElement&&document.activeElement.id?document.activeElement.id:null
  };
}
function restoreSheetUiState(state){
  restoreOpenDetails(state?.openDetails||[]);
  const focusTarget=(state?.activePath&&document.querySelector(`[data-path=\"${state.activePath}\"]`))||(state?.activeId&&document.getElementById(state.activeId));
  if(focusTarget&&typeof focusTarget.focus==='function')setTimeout(()=>focusTarget.focus({preventScroll:true}),0);
  requestAnimationFrame(()=>window.scrollTo(0,state?.scrollY||0));
}
function rerender(data,xpData,compendium,editOn){
  const state=captureSheetUiState();
  render(data,xpData,compendium);
  restoreSheetUiState(state);
  enable(!!editOn);
}

function download(name,text){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:'application/json'}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)}
let floatingTip=null, floatingTipSource=null;
function hideFloatingTip(){if(floatingTip){floatingTip.remove();floatingTip=null;floatingTipSource=null}}
function placeFloatingTip(source){if(!floatingTip)return;const r=source.getBoundingClientRect();floatingTip.style.left='0px';floatingTip.style.top='0px';const w=floatingTip.offsetWidth||420,h=floatingTip.offsetHeight||120;let left=r.left;left=Math.max(12,Math.min(left,window.innerWidth-w-12));let top=r.bottom+10;if(top+h>window.innerHeight-12)top=r.top-h-10;if(top<12)top=12;floatingTip.style.left=left+'px';floatingTip.style.top=top+'px'}
function showFloatingTip(source){if(app.classList.contains('editing'))return;const text=source.dataset.tip||'';if(!text.trim())return;hideFloatingTip();floatingTip=document.createElement('div');floatingTip.className='thalor-floating-tip';floatingTip.textContent=text;document.body.appendChild(floatingTip);floatingTipSource=source;placeFloatingTip(source)}
function bindTooltips(){hideFloatingTip();document.querySelectorAll('.info-row,.info-card').forEach(el=>{el.addEventListener('mouseenter',()=>showFloatingTip(el));el.addEventListener('mouseleave',hideFloatingTip);el.addEventListener('focus',()=>showFloatingTip(el));el.addEventListener('blur',hideFloatingTip);el.addEventListener('click',ev=>{if(app.classList.contains('editing'))return;ev.stopPropagation();if(floatingTipSource===el)hideFloatingTip();else showFloatingTip(el);});});document.addEventListener('click',hideFloatingTip,{once:true});window.addEventListener('scroll',hideFloatingTip,{passive:true,once:true});window.addEventListener('resize',hideFloatingTip,{passive:true,once:true});}


let spellDescModal=null;
let spellDescActiveStore=null;
function closeSpellDescriptionPopovers(){
  if(spellDescModal){
    const editor=spellDescModal.querySelector('.spell-desc-modal-editor');
    if(editor && spellDescActiveStore){
      spellDescActiveStore.value=editor.value;
      spellDescActiveStore.dispatchEvent(new Event('input',{bubbles:true}));
      spellDescActiveStore.dispatchEvent(new Event('change',{bubbles:true}));
    }
    if(spellDescModal.__escHandler){
      document.removeEventListener('keydown', spellDescModal.__escHandler);
    }
    spellDescModal.remove();
    spellDescModal=null;
    spellDescActiveStore=null;
    document.body.classList.remove('spell-desc-modal-open');
  }
}
function openSpellDescriptionModal(btn){
  closeSpellDescriptionPopovers();
  const path=btn.dataset.spellDescPath||'';
  const store=document.querySelector(`textarea.spell-description-store[data-path="${path}"]`);
  if(!store)return;
  spellDescActiveStore=store;
  const namePath=btn.dataset.spellNamePath||'';
  const nameField=document.querySelector(`[data-path="${namePath}"]`);
  const spellName=(nameField&&('value' in nameField)?nameField.value:nameField?.textContent)||'Incantesimo';
  spellDescModal=document.createElement('div');
  spellDescModal.className='spell-desc-modal-root';
  spellDescModal.innerHTML=`
    <div class="spell-desc-modal-backdrop" data-close-spell-desc="1"></div>
    <section class="spell-desc-modal" role="dialog" aria-modal="true" aria-label="Descrizione incantesimo">
      <header class="spell-desc-modal-header">
        <div>
          <span class="spell-desc-modal-kicker">Descrizione incantesimo</span>
          <h3>${esc(spellName||'Incantesimo')}</h3>
        </div>
        <button type="button" class="spell-desc-modal-close" data-close-spell-desc="1" aria-label="Chiudi descrizione">×</button>
      </header>
      <div class="spell-desc-modal-body">
        <label class="spell-desc-modal-label" for="spellDescModalEditor">Testo descrizione</label>
        <textarea id="spellDescModalEditor" class="spell-desc-modal-editor" spellcheck="true" maxlength="5000">${esc(store.value||'')}</textarea>
        <div class="spell-desc-modal-help"><span>Il testo viene mantenuto nella scheda e salvato con il pulsante Salva.</span><span class="spell-desc-modal-count">${String(store.value||'').length} caratteri</span></div>
      </div>
      <footer class="spell-desc-modal-footer">
        <button type="button" class="spell-desc-modal-secondary" data-close-spell-desc="1">Chiudi</button>
        <button type="button" class="spell-desc-modal-primary" data-close-spell-desc="1">Conferma</button>
      </footer>
    </section>`;
  document.body.appendChild(spellDescModal);
  document.body.classList.add('spell-desc-modal-open');
  spellDescModal.__escHandler=(ev)=>{
    if(ev.key==='Escape'){
      ev.preventDefault();
      closeSpellDescriptionPopovers();
    }
  };
  document.addEventListener('keydown', spellDescModal.__escHandler);
  const editor=spellDescModal.querySelector('.spell-desc-modal-editor');
  const count=spellDescModal.querySelector('.spell-desc-modal-count');
  editor.addEventListener('input',()=>{store.value=editor.value;if(count)count.textContent=editor.value.length+' caratteri';});
  // Chiusura reale del modal: uso la fase di capture così i click su X/Chiudi/Conferma
  // vengono intercettati prima dello stopPropagation del pannello interno.
  spellDescModal.addEventListener('click',e=>{
    const closeBtn=e.target.closest('[data-close-spell-desc], .spell-desc-modal-close');
    if(closeBtn){
      e.preventDefault();
      e.stopPropagation();
      closeSpellDescriptionPopovers();
    }
  }, true);
  spellDescModal.querySelector('.spell-desc-modal').addEventListener('click',e=>e.stopPropagation());
  setTimeout(()=>{editor.focus();editor.setSelectionRange(editor.value.length,editor.value.length);},30);
}
function bindSpellDescriptionEditors(){
  closeSpellDescriptionPopovers();
  document.querySelectorAll('.spell-description-popover[open]').forEach(el=>{try{el.open=false;}catch(e){}});
  document.querySelectorAll('.spell-desc-open').forEach(btn=>{
    btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();openSpellDescriptionModal(btn);});
  });
}

async function saveCurrentSheet(data,xpData,detail,fromDom=true,keepEdit=null){
  closeSpellDescriptionPopovers();
  // fromDom=true: normale salvataggio dagli input visibili.
  // fromDom=false: salvataggio diretto dell'oggetto già modificato, utile per azioni rapide
  // come aggiungi/rimuovi condizione o +/- slot, evitando che il vecchio DOM riaggiunga righe cancellate.
  let draft=normalize(fromDom?collect(data):data);
  saveEmergencyDraft(draft, detail||'Bozza prima del salvataggio');
  if(!await refreshEditPermission()){
    try{ localStorage.setItem(storageKey,JSON.stringify(draft)); }catch(e){}
    alert(editDeniedMessage());
    const ls=document.getElementById('localStatus'); if(ls)ls.textContent='Sessione non valida: copia locale/emergenza salvata, ma non pubblicata online.';
    return draft;
  }
  let previous=null;try{previous=JSON.parse(localStorage.getItem(storageKey)||'null')}catch(e){}
  if(isCompanion){try{let pp=JSON.parse(localStorage.getItem(parentStorageKey)||'null');if(pp&&pp.companions&&pp.companions[companionIndex]&&pp.companions[companionIndex].sheet)previous=pp.companions[companionIndex].sheet;}catch(e){}}
  if(previous)pushSnapshot(previous,detail||'Prima del salvataggio');
  let u=draft;
  u.changeLog=u.changeLog||[];
  u.changeLog.push({when:new Date().toLocaleString('it-IT'),action:'Salvataggio scheda',detail:detail||'Modifiche salvate nel browser e compendio locale aggiornato.'});
  let parentForCloud=null;
  if(isCompanion){
    let parent=null;try{parent=JSON.parse(localStorage.getItem(parentStorageKey)||'null')}catch(e){}
    if(!parent&&window.__thalorParentBase)parent=window.__thalorParentBase;
    parent=normalize(parent||{});
    parent.companions=Array.isArray(parent.companions)?parent.companions:[];
    parent.companions[companionIndex]=parent.companions[companionIndex]||Object.assign({},blank.companion);
    parent.companions[companionIndex].sheet=u;
    parent.companions[companionIndex].name=u.identity?.name||parent.companions[companionIndex].name||'Creatura';
    parent.companions[companionIndex].kind=parent.companions[companionIndex].kind||u.meta?.subtitle||'Creatura';
    localStorage.setItem(parentStorageKey,JSON.stringify(parent));
    parentForCloud=parent;
  } else {
    localStorage.setItem(storageKey,JSON.stringify(u));
    oldKeys.forEach(k=>localStorage.removeItem(k));
  }
  try{
    if(authAvailable() && window.ThalorAuth.state.configured && !window.ThalorAuth.state.localMaster){
      const ls0=document.getElementById('localStatus'); if(ls0)ls0.textContent='Salvataggio online in corso…';
      const saved = await window.ThalorAuth.saveCharacter(slug, isCompanion ? parentForCloud : u);
      const ls=document.getElementById('localStatus'); if(ls)ls.textContent='Modifiche salvate online.'+(saved?.attempt>1?' Tentativo '+saved.attempt+'.':'');
    }else{
      const ls=document.getElementById('localStatus'); if(ls)ls.textContent=authAvailable()&&window.ThalorAuth.state.localMaster?'Modifiche salvate in locale come Master offline.':'Modifiche salvate nel browser.';
    }
  }catch(err){
    saveEmergencyDraft(u,'Salvataggio online fallito');
    const ls=document.getElementById('localStatus');
    if(ls)ls.textContent='Salvataggio online non riuscito: resta in modifica, i dati sono in emergenza locale.';
    alert('Salvataggio online non riuscito: '+(err.message||err)+'\nLa scheda NON è stata confermata online. Resta in modifica: riprova senza chiudere la pagina.');
    throw err;
  }
  let comp=updateCompendiumFromSheet(u);
  rerender(u,xpData,comp,keepEdit===null?app.classList.contains('editing'):!!keepEdit);
  return u;
}
function nearestSection(el){return el.closest('.sheet-dropdown,.section-panel,.xp-panel,.dynamic-portrait,.dynamic-hero,.panel');}
function setSectionEdit(section,on){
  if(!section)return;
  section.classList.toggle('section-editing',on);
  section.querySelectorAll('[data-path]').forEach(el=>el.disabled=!on);
  section.querySelectorAll('.mini-add').forEach(b=>b.hidden=!on);
}

function findSectionByTitle(title){
  return [...document.querySelectorAll('.sheet-dropdown,.panel,.dynamic-portrait')].find(x=>{
    const t=x.querySelector('summary > span, h2')?.textContent?.trim()||'';
    return t===title;
  });
}
function keepSectionEditing(title){
  const fresh=findSectionByTitle(title);
  if(!fresh)return;
  setSectionEdit(fresh,true);
  const edit=fresh.querySelector('.section-edit-btn');
  const save=fresh.querySelector('.section-save-btn');
  if(edit)edit.hidden=true;
  if(save)save.hidden=false;
}
function isInventoryPath(path){return String(path||'').startsWith('inventorySections');}
function injectSectionControls(){
  document.querySelectorAll('.dynamic-sheet-page .sheet-dropdown').forEach((sec,i)=>{
    const sum=sec.querySelector(':scope > summary'); if(!sum||sum.querySelector('.section-controls'))return;
    const title=sum.querySelector('span')?.textContent?.trim()||'Sezione';
    if(title==='Condizioni temporanee'||!sheetCanEdit())return;
    sum.insertAdjacentHTML('beforeend',`<span class="section-controls"><button type="button" class="section-edit-btn" data-section-title="${esc(title)}">Modifica</button><button type="button" class="section-save-btn" data-section-title="${esc(title)}" hidden>Salva</button></span>`);
  });
  document.querySelectorAll('.dynamic-sheet-page article.panel.sheet-theme-panel,.dynamic-sheet-page aside.dynamic-portrait').forEach((sec,i)=>{
    if(sec.classList.contains('dynamic-hero')||sec.classList.contains('xp-panel')||sec.classList.contains('log-panel')||!sheetCanEdit())return;
    if(sec.querySelector(':scope > .section-controls'))return;
    const h=sec.querySelector(':scope > h2')||sec.querySelector(':scope h2');
    const title=h?.textContent?.trim()||'Sezione';
    const html=`<div class="section-controls panel-controls"><button type="button" class="section-edit-btn" data-section-title="${esc(title)}">Modifica</button><button type="button" class="section-save-btn" data-section-title="${esc(title)}" hidden>Salva</button></div>`;
    if(h) h.insertAdjacentHTML('afterend',html); else sec.insertAdjacentHTML('afterbegin',html);
  });
}

function bindConditionPicker(data,xpData,compendium){
  const input=document.getElementById('quickConditionName');
  const menu=document.getElementById('quickConditionMenu');
  if(!input||!menu)return;
  const names=Object.keys(CONDITION_LIBRARY).filter(n=>n!=='Custom');
  const renderMenu=()=>{
    const q=String(input.value||'').trim().toLowerCase();
    const filtered=names.filter(n=>!q||n.toLowerCase().includes(q)).slice(0,18);
    menu.innerHTML=filtered.map(n=>`<button type="button" data-condition-choice="${esc(n)}">${esc(n)}</button>`).join('')||`<div class="condition-menu-empty">Nessuna condizione trovata</div>`;
    menu.hidden=false;
    menu.querySelectorAll('[data-condition-choice]').forEach(btn=>btn.onclick=e=>{e.preventDefault();e.stopPropagation();input.value=btn.dataset.conditionChoice||'';menu.hidden=true;input.focus({preventScroll:true});});
  };
  input.addEventListener('focus',renderMenu);
  input.addEventListener('click',e=>{e.stopPropagation();renderMenu();});
  input.addEventListener('input',renderMenu);
  menu.addEventListener('click',e=>e.stopPropagation());
  document.addEventListener('click',()=>{menu.hidden=true;},{once:true});
}
function protectSummaryInteractions(){
  document.querySelectorAll('details > summary input, details > summary select, details > summary textarea, details > summary button, details > summary label').forEach(el=>{
    ['click','mousedown','mouseup','keydown'].forEach(evt=>el.addEventListener(evt,e=>e.stopPropagation()));
  });
}

function resizeImageFile(file,maxSide=900,quality=.82){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onerror=()=>reject(reader.error||new Error('Impossibile leggere immagine'));
    reader.onload=()=>{
      const img=new Image();
      img.onerror=()=>reject(new Error('Formato immagine non leggibile'));
      img.onload=()=>{
        let w=img.width,h=img.height,scale=Math.min(1,maxSide/Math.max(w,h));
        w=Math.max(1,Math.round(w*scale)); h=Math.max(1,Math.round(h*scale));
        const canvas=document.createElement('canvas'); canvas.width=w; canvas.height=h;
        const ctx=canvas.getContext('2d'); ctx.drawImage(img,0,0,w,h);
        resolve(canvas.toDataURL('image/jpeg',quality));
      };
      img.src=reader.result;
    };
    reader.readAsDataURL(file);
  });
}
function bindPortraitUpload(data,xpData){
  const input=document.getElementById('portraitImageUpload');
  if(!input)return;
  input.onchange=async()=>{
    const file=input.files&&input.files[0]; if(!file)return;
    try{
      document.getElementById('localStatus').textContent='Compressione immagine…';
      const img=await resizeImageFile(file);
      const c=normalize(collect(data));
      c.portrait=c.portrait||{}; c.portrait.image=img;
      saveCurrentSheet(c,xpData,'Foto scheda aggiornata.',false,app.classList.contains('editing'));
      document.getElementById('localStatus').textContent='Foto aggiornata e salvata.';
    }catch(err){alert('Non riesco a caricare questa immagine: '+(err.message||err));}
  };
}
function bind(data,xpData,compendium){
  const floatToggle=document.getElementById('sheetFloatingToggle'); if(floatToggle) floatToggle.onclick=()=>{const nav=floatToggle.closest('.sheet-floating-actions');const open=!nav.classList.contains('open');nav.classList.toggle('open',open);floatToggle.setAttribute('aria-expanded',open?'true':'false');};
  const floatEditSave=document.getElementById('floatEditSaveSheet'); if(floatEditSave) floatEditSave.onclick=async()=>{
    if(app.classList.contains('editing')){
      floatEditSave.disabled=true;
      const oldText=floatEditSave.textContent;
      floatEditSave.textContent='Salvataggio…';
      try{
        await saveCurrentSheet(normalize(collect(data)),xpData,'Salvataggio completo dal menu flottante.',true,false);
        keepViewportStable(()=>enable(false));
      }catch(err){
        keepViewportStable(()=>enable(true));
      }finally{
        floatEditSave.disabled=false;
        if(app.classList.contains('editing')) floatEditSave.textContent='Salva';
        else floatEditSave.textContent='Modifica';
      }
    }else{
      if(await refreshEditPermission())keepViewportStable(()=>enable(true));else alert(editDeniedMessage());
    }
  };
  const resetSheetBtn=document.getElementById('resetSheet'); if(resetSheetBtn) resetSheetBtn.onclick=()=>{if(!sheetCanEdit()){alert(editDeniedMessage());return;}if(isCompanion){alert('Questa è una scheda secondaria: per eliminarla torna alla scheda principale e usa la X sulla card. Per azzerarla puoi importare un JSON vuoto/template.');return;}localStorage.removeItem(storageKey);oldKeys.forEach(k=>localStorage.removeItem(k));location.reload()};
  const exportSheetBtn=document.getElementById('exportSheet'); if(exportSheetBtn) exportSheetBtn.onclick=()=>download(`thalor-${slug}${isCompanion?'-creatura-'+companionIndex:''}-scheda.json`,JSON.stringify(normalize(collect(data)),null,2));
  const copySheetBtn=document.getElementById('copySheet'); if(copySheetBtn) copySheetBtn.onclick=async()=>{await navigator.clipboard.writeText(JSON.stringify(normalize(collect(data)),null,2));document.getElementById('localStatus').textContent='Backup JSON copiato negli appunti.'};
  const exportCompendiumBtn=document.getElementById('exportCompendium'); if(exportCompendiumBtn) exportCompendiumBtn.onclick=()=>download('thalor-compendio-locale.json',JSON.stringify(mergeCompendium(window.__thalorCompendium||{}),null,2));
  const printSheetBtn=document.getElementById('floatPrintSheet'); if(printSheetBtn) printSheetBtn.onclick=()=>{document.querySelectorAll('details').forEach(d=>d.open=true);window.print();};
  const importSheetInput=document.getElementById('importSheet'); if(importSheetInput) importSheetInput.onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const u=normalize(JSON.parse(r.result));u.changeLog=u.changeLog||[];u.changeLog.push({when:new Date().toLocaleString('it-IT'),action:'Import JSON',detail:'Scheda importata manualmente.'});saveCurrentSheet(u,xpData,'Scheda importata manualmente.',false,false);enable(false);document.getElementById('localStatus').textContent='Scheda importata e salvata nel browser.'}catch(err){alert('JSON non valido')}};r.readAsText(f)};
  document.querySelectorAll('.restore-snapshot').forEach(btn=>btn.onclick=e=>{e.preventDefault();e.stopPropagation();let arr=getSnapshots();let snap=arr[num(btn.dataset.snapshot)];if(!snap||!snap.data)return;let u=normalize(snap.data);u.changeLog=u.changeLog||[];u.changeLog.push({when:new Date().toLocaleString('it-IT'),action:'Ripristino snapshot',detail:'Ripristinata versione del '+(snap.when||'')});saveCurrentSheet(u,xpData,'Snapshot ripristinato.',false,false);enable(false);document.getElementById('localStatus').textContent='Snapshot ripristinato.';});
  document.querySelectorAll('[data-add]').forEach(b=>b.onclick=e=>{
    e.preventDefault();e.stopPropagation();
    const sec=nearestSection(b);
    const title=sec?.querySelector('summary > span, h2')?.textContent?.trim()||'';
    const wasGlobal=app.classList.contains('editing');
    const wasSection=!!sec?.classList.contains('section-editing');
    let c=normalize(collect(data));
    addAt(c,b.dataset.add,b.dataset.kind);
    const state=captureSheetUiState();
    if(isInventoryPath(b.dataset.add)){
      saveCurrentSheet(c,xpData,'Inventario aggiornato: elemento aggiunto.',false,wasGlobal);
      restoreSheetUiState(state);
      if(wasSection&&!wasGlobal)keepSectionEditing(title);
      document.getElementById('localStatus').textContent='Inventario aggiornato e salvato.';
      return;
    }
    render(c,xpData,compendium);
    restoreSheetUiState(state);
    if(wasGlobal){enable(true);}
    else if(wasSection){
      const fresh=[...document.querySelectorAll('.sheet-dropdown,.panel,.dynamic-portrait')].find(x=>{
        const t=x.querySelector('summary > span, h2')?.textContent?.trim()||'';
        return t===title;
      });
      setSectionEdit(fresh,true);
      const edit=fresh?.querySelector('.section-edit-btn');
      const save=fresh?.querySelector('.section-save-btn');
      if(edit)edit.hidden=true;
      if(save)save.hidden=false;
      // Dopo l'aggiunta di una riga, mantieni aperto l'editor bonus interessato.
      const reopened=fresh?.querySelector(`[data-detail-id="bonus-${CSS.escape(b.dataset.add)}"]`);
      if(reopened)reopened.open=true;
    }
    document.getElementById('localStatus').textContent='Elemento aggiunto. Ricorda di salvare.';
  });
  document.querySelectorAll('[data-del]').forEach(b=>b.onclick=e=>{
    e.preventDefault();e.stopPropagation();
    const sec=nearestSection(b);
    const title=sec?.querySelector('summary > span, h2')?.textContent?.trim()||'';
    const wasGlobal=app.classList.contains('editing');
    const wasSection=!!sec?.classList.contains('section-editing');
    let c=normalize(collect(data));
    delAt(c,b.dataset.del);
    if(b.classList.contains('condition-remove')){saveCurrentSheet(c,xpData,'Condizione rimossa.',false);document.getElementById('localStatus').textContent='Condizione rimossa.';return;}
    const state=captureSheetUiState();
    if(isInventoryPath(b.dataset.del)){
      saveCurrentSheet(c,xpData,'Inventario aggiornato: elemento rimosso.',false,wasGlobal);
      restoreSheetUiState(state);
      if(wasSection&&!wasGlobal)keepSectionEditing(title);
      document.getElementById('localStatus').textContent='Inventario aggiornato e salvato.';
      return;
    }
    render(c,xpData,compendium);
    restoreSheetUiState(state);
    if(wasGlobal){enable(true);}
    else if(wasSection){
      const fresh=[...document.querySelectorAll('.sheet-dropdown,.panel,.dynamic-portrait')].find(x=>{const t=x.querySelector('summary > span, h2')?.textContent?.trim()||'';return t===title;});
      setSectionEdit(fresh,true);
      const edit=fresh?.querySelector('.section-edit-btn');
      const save=fresh?.querySelector('.section-save-btn');
      if(edit)edit.hidden=true;
      if(save)save.hidden=false;
      const parentPath=(b.dataset.del||'').split('.').slice(0,-1).join('.');
      const reopened=fresh?.querySelector(`[data-detail-id="bonus-${CSS.escape(parentPath)}"]`);
      if(reopened)reopened.open=true;
    }
    document.getElementById('localStatus').textContent='Elemento rimosso. Ricorda di salvare.';
  });
  const addInvSection=document.getElementById('addInventorySection');if(addInvSection)addInvSection.onclick=e=>{
    e.preventDefault();e.stopPropagation();
    const sec=nearestSection(addInvSection);
    const wasGlobal=app.classList.contains('editing');
    const wasSection=!!sec?.classList.contains('section-editing');
    const state=captureSheetUiState();
    let c=normalize(collect(data));
    let name=(document.getElementById('newInventorySectionName')?.value||'Nuova sezione').trim()||'Nuova sezione';
    let pos=document.getElementById('newInventorySectionPos')?.value||'end';
    let row=Object.assign({},blank.inventorySection,{name,items:[]});
    c.inventorySections=Array.isArray(c.inventorySections)?c.inventorySections:[];
    if(pos==='end')c.inventorySections.push(row);else c.inventorySections.splice(Math.max(0,Math.min(c.inventorySections.length,num(pos))),0,row);
    saveCurrentSheet(c,xpData,'Inventario aggiornato: sezione aggiunta.',false,wasGlobal);
    restoreSheetUiState(state);
    if(wasSection&&!wasGlobal)keepSectionEditing('Inventario e denaro');
    document.getElementById('localStatus').textContent='Sezione inventario aggiunta e salvata.';
  };

  const addCompanion=document.getElementById('addCompanionSheet');if(addCompanion)addCompanion.onclick=e=>{
    e.preventDefault();e.stopPropagation();
    const name=(document.getElementById('newCompanionName')?.value||'Nuova creatura').trim()||'Nuova creatura';
    const kind=(document.getElementById('newCompanionKind')?.value||'Famiglio').trim()||'Famiglio';
    const file=document.getElementById('newCompanionImage')?.files?.[0];
    const finish=(img)=>{let c=normalize(collect(data));c.companions=Array.isArray(c.companions)?c.companions:[];let sheet=companionTemplate(name,kind);sheet.portrait.image=img||'';sheet.meta.profileUrl=`scheda-${slug}.html`;c.companions.push({kind,name,notes:'',sheet});saveCurrentSheet(c,xpData,'Scheda secondaria creata: '+name+'.',false,app.classList.contains('editing'));document.getElementById('localStatus').textContent='Scheda secondaria creata: '+name+'.';};
    if(file){const r=new FileReader();r.onload=()=>finish(r.result);r.readAsDataURL(file);}else finish('');
  };
  document.querySelectorAll('[data-companion-del]').forEach(btn=>btn.onclick=e=>{e.preventDefault();e.stopPropagation();let i=num(btn.dataset.companionDel);let c=normalize(collect(data));let label=companionLabel(c.companions?.[i],i);if(!confirm(`Eliminare definitivamente la scheda secondaria "${label}"? L'operazione verrà salvata nel browser.`))return;c.companions.splice(i,1);saveCurrentSheet(c,xpData,'Scheda secondaria eliminata: '+label+'.',false,app.classList.contains('editing'));document.getElementById('localStatus').textContent='Scheda secondaria eliminata.';});
  const addCircle=document.getElementById('addSpellCircle');if(addCircle)addCircle.onclick=e=>{e.preventDefault();e.stopPropagation();let c=normalize(collect(data));let lv=num(document.getElementById('newSpellCircleLevel')?.value||1);let cls=document.getElementById('newSpellCircleClass')?.value||'';let pos=document.getElementById('newSpellCirclePos')?.value||'end';let row=Object.assign({},blank.spellCircle,{level:lv,className:cls,spells:[]});c.spellcasting=c.spellcasting||{};c.spellcasting.groups=Array.isArray(c.spellcasting.groups)?c.spellcasting.groups:[];if(pos==='end')c.spellcasting.groups.push(row);else c.spellcasting.groups.splice(Math.max(0,Math.min(c.spellcasting.groups.length,num(pos))),0,row);rerender(c,xpData,compendium,true)};
  document.querySelectorAll('#quickAddCondition,[data-open-condition-modal]').forEach(quickAddCondition=>{quickAddCondition.onclick=e=>{e.preventDefault();e.stopPropagation();showConditionModal(data,xpData,compendium);};});
  document.querySelectorAll('[data-open-bonus-modal]').forEach(btn=>btn.onclick=e=>{e.preventDefault();e.stopPropagation();showBonusModal(btn.dataset.openBonusModal,data,xpData,compendium);});
  document.querySelectorAll('.condition-active-control').forEach(el=>el.onchange=e=>{let c=normalize(collect(data));let saved=saveCurrentSheet(c,xpData,'Condizioni aggiornate.');document.getElementById('localStatus').textContent='Condizioni aggiornate.';});
  document.querySelectorAll('.condition-pill-toggle').forEach(el=>el.onchange=e=>{if(!sheetCanEdit()){alert(editDeniedMessage());el.checked=!el.checked;return;}let c=normalize(collect(data));setPath(c,el.dataset.conditionToggle,el.checked?'Sì':'No');saveCurrentSheet(c,xpData,'Condizione aggiornata.',false,app.classList.contains('editing'));document.getElementById('localStatus').textContent='Condizione aggiornata.';});
  document.querySelectorAll('.slot-step').forEach(btn=>btn.onclick=e=>{e.preventDefault();e.stopPropagation();let c=normalize(collect(data));let path=btn.dataset.slotStep;let cur=num(path.split('.').reduce((o,k)=>o&&o[k],c));let next=Math.max(0,cur+num(btn.dataset.step));setPath(c,path,next);let saved=saveCurrentSheet(c,xpData,'Slot usati aggiornati.',false);document.getElementById('localStatus').textContent='Slot usati aggiornati.';});
  // I pulsanti modifica/salva per sezione sono stati rimossi: resta solo il menu flottante.
  document.querySelectorAll('.section-controls').forEach(x=>x.remove());
  bindReorderHandles(data,xpData,compendium);
  bindConditionPicker(data,xpData,compendium);
  protectSummaryInteractions();
  document.querySelectorAll('[data-bonus-row] select[data-path$=".target"]').forEach(sel=>{sel.addEventListener('change',()=>{const row=sel.closest('[data-bonus-row]');const wrap=row?.querySelector('[data-bonus-save-wrap]');if(wrap)wrap.classList.toggle('hidden-field',sel.value!=='save');});});
  bindPortraitUpload(data,xpData);
  bindTooltips();
  bindSpellDescriptionEditors();
  applyCompendiumHints();
}
function getAtPath(obj,path){return String(path||'').split('.').filter(Boolean).reduce((o,k)=>o&&o[k],obj)}
function closeSheetModal(){document.querySelectorAll('.sheet-modal-backdrop').forEach(x=>x.remove());}
function modalField(label,html,cls=''){return `<label class="modal-field ${cls}"><span>${label}</span>${html}</label>`}
function showConditionModal(baseData,xpData,compendium){
  if(!sheetCanEdit()){alert(editDeniedMessage());return;}
  closeSheetModal();
  const names=Object.keys(CONDITION_LIBRARY).filter(x=>x!=='Custom').sort((a,b)=>a.localeCompare(b,'it'));
  const rowTpl=(i,m={target:'acMod',value:0})=>`<div class="condition-effect-row" data-cond-effect-row="${i}"><label><span>Valore</span><input type="number" data-cond-effect-value value="${esc(m.value||0)}"></label><label class="condition-target-field"><span>Applica a</span>${conditionTargetSelect('',m.target||'acMod')}</label><button type="button" class="row-del modal-condition-effect-delete" data-cond-effect-delete="${i}" title="Elimina modificatore">×</button></div>`;
  let modifiers=[{target:'acMod',value:0}];
  const html=`<div class="sheet-modal-backdrop" role="dialog" aria-modal="true"><div class="sheet-modal condition-modal advanced-condition-modal"><header><h2>Aggiungi condizione</h2><button type="button" class="modal-x" data-modal-cancel>×</button></header><div class="sheet-modal-body"><p class="section-mini-note">Puoi scegliere una condizione standard o scrivere un nome personalizzato, utile per incantesimi ed effetti ricorrenti.</p><div class="condition-modal-grid">${modalField('Nome condizione',`<input id="modalCondName" list="modalConditionNames" placeholder="Es. Benedizione, Ira, Maledizione..."><datalist id="modalConditionNames">${names.map(n=>`<option value="${esc(n)}"></option>`).join('')}</datalist>`)}${modalField('Attiva',`<select id="modalCondActive"><option value="Sì" selected>Sì</option><option value="No">No</option></select>`)}${modalField('Dettagli',`<input id="modalCondDuration" placeholder="Es. 3 round, concentrazione, fine incontro...">`,'wide')}${modalField('Note',`<textarea id="modalCondNotes" placeholder="Fonte, eccezioni, descrizione breve..."></textarea>`,'wide')}</div><div class="condition-effects-editor"><div id="modalConditionEffects"></div><button type="button" class="mini-add always-visible modal-inline-add condition-add-field-button" id="modalAddConditionEffect">+ Campo</button></div></div><footer><button type="button" class="button ghost-button modal-cancel-button" data-modal-cancel>Annulla</button><button type="button" class="button save-button" id="modalConfirmCondition">Conferma</button></footer></div></div>`;
  document.body.insertAdjacentHTML('beforeend',html);
  const holder=document.getElementById('modalConditionEffects');
  function redraw(){holder.innerHTML=modifiers.map((m,i)=>rowTpl(i,m)).join('');holder.querySelectorAll('.modal-condition-effect-delete').forEach(btn=>btn.onclick=()=>{modifiers.splice(num(btn.dataset.condEffectDelete),1);redraw();});}
  redraw();
  document.querySelectorAll('[data-modal-cancel]').forEach(b=>b.onclick=closeSheetModal);
  document.getElementById('modalAddConditionEffect').onclick=()=>{modifiers.push({target:'acMod',value:0});redraw();};
  document.getElementById('modalConfirmCondition').onclick=()=>{
    let c=normalize(collect(baseData));
    const row=Object.assign({},blank.condition,{name:(document.getElementById('modalCondName').value||'Custom').trim()||'Custom',active:document.getElementById('modalCondActive').value||'Sì',duration:document.getElementById('modalCondDuration').value||'',notes:document.getElementById('modalCondNotes').value||'',modifiers:[]});
    holder.querySelectorAll('[data-cond-effect-row]').forEach(r=>{const value=num(r.querySelector('[data-cond-effect-value]')?.value||0);const target=r.querySelector('.condition-target-select')?.value||'acMod';if(value)row.modifiers.push({target,value});});
    c.conditions=c.conditions||[];c.conditions.push(row);closeSheetModal();saveCurrentSheet(c,xpData,'Condizione aggiunta: '+row.name+'.',false,app.classList.contains('editing'));document.getElementById('localStatus').textContent='Condizione aggiunta: '+row.name+'.';
  };
}

function showBonusModal(path,baseData,xpData,compendium){
  if(!sheetCanEdit()){alert(editDeniedMessage());return;}
  closeSheetModal();
  let c=normalize(collect(baseData));
  let list=normalizeBonusList(getAtPath(c,path)||[]);
  const abilityKey=(path.match(/^abilities\.([A-Z]{3})\./)||[])[1]||'';
  const defaultTarget=abilityKey||'ac';
  function targetField(b){const opts=[['ac','CA'],['touch','CA contatto'],['flat','CA sprovvista'],['attack','Tiro per colpire'],['damage','Danni'],['save','Tiri salvezza'],['initiative','Iniziativa'],['grapple','Lotta'],['skill','Abilità'],['srCheck','Superare RI'],['FOR','FOR'],['DES','DES'],['COS','COS'],['INT','INT'],['SAG','SAG'],['CAR','CAR']];const val=b.target||defaultTarget;return abilityKey?`<input type="hidden" data-mb="target" value="${esc(abilityKey)}"><span class="locked-target">${esc(abilityKey)}</span>`:`<select data-mb="target">${opts.map(([k,l])=>`<option value="${esc(k)}" ${k===val?'selected':''}>${esc(l)}</option>`).join('')}</select>`}
  function rowHtml(b,i){return `<div class="modal-bonus-row" data-modal-bonus-row="${i}"><div class="modal-bonus-title"><strong>Bonus ${i+1}</strong><button type="button" class="row-del modal-bonus-delete" data-modal-bonus-delete="${i}">×</button></div>${modalField('Applica a',targetField(b))}${modalField('Tipo',`<select data-mb="type">${BONUS_TYPES.map(([k,l])=>`<option value="${esc(k)}" ${k===(b.type||'senza tipo')?'selected':''}>${esc(l)}</option>`).join('')}</select>`)}${modalField('Valore',`<input data-mb="value" type="number" value="${esc(b.value||0)}">`)}${modalField('Fonte',`<input data-mb="source" value="${esc(b.source||'')}">`)}${modalField('Note',`<input data-mb="note" value="${esc(b.note||'')}">`)}</div>`}
  const html=`<div class="sheet-modal-backdrop" role="dialog" aria-modal="true"><div class="sheet-modal bonus-modal"><header><h2>Bonus avanzati ${abilityKey?abilityKey:''}</h2><button type="button" class="modal-x" data-modal-cancel>×</button></header><div class="sheet-modal-body"><p class="section-mini-note">Gestisci qui i bonus tipizzati senza allargare o deformare la scheda. I bonus dello stesso tipo non si sommano, salvo i tipi cumulabili.</p><div id="modalBonusRows">${list.map(rowHtml).join('')||'<p class="empty-row">Nessun bonus avanzato inserito.</p>'}</div><button type="button" class="mini-add always-visible" id="modalAddBonus">+ Bonus</button></div><footer><button type="button" class="button ghost-button modal-cancel-button" data-modal-cancel>Annulla</button><button type="button" class="button save-button" id="modalConfirmBonus">Conferma</button></footer></div></div>`;
  document.body.insertAdjacentHTML('beforeend',html);
  const rows=document.getElementById('modalBonusRows');
  function redraw(){rows.innerHTML=list.map(rowHtml).join('')||'<p class="empty-row">Nessun bonus avanzato inserito.</p>';wireDeletes();}
  function wireDeletes(){rows.querySelectorAll('.modal-bonus-delete').forEach(btn=>btn.onclick=()=>{list.splice(num(btn.dataset.modalBonusDelete),1);redraw();});}
  wireDeletes();
  document.querySelectorAll('[data-modal-cancel]').forEach(b=>b.onclick=closeSheetModal);
  document.getElementById('modalAddBonus').onclick=()=>{list.push(Object.assign({},blank.bonus,{target:defaultTarget}));redraw();};
  document.getElementById('modalConfirmBonus').onclick=()=>{
    const final=[];
    rows.querySelectorAll('[data-modal-bonus-row]').forEach(row=>{final.push({target:row.querySelector('[data-mb="target"]')?.value||defaultTarget,save:'all',type:row.querySelector('[data-mb="type"]')?.value||'senza tipo',value:num(row.querySelector('[data-mb="value"]')?.value),source:row.querySelector('[data-mb="source"]')?.value||'',note:row.querySelector('[data-mb="note"]')?.value||''});});
    let fresh=normalize(collect(baseData));setPath(fresh,path,final);closeSheetModal();rerender(fresh,xpData,compendium,true);document.getElementById('localStatus').textContent='Bonus avanzati aggiornati. Ricorda di salvare.';
  };
}

function loadJson(url){return fetch(url).then(r=>r.ok?r.json():null).catch(()=>null)}

// v104 — mobile performance hint: evita repaint inutili sui telefoni e segnala viewport compatta al CSS.
(function(){
  const setMobileFlag=()=>document.documentElement.classList.toggle('sheet-mobile-view', window.matchMedia('(max-width: 760px)').matches);
  setMobileFlag();
  window.addEventListener('resize', setMobileFlag, {passive:true});
})();

(async function startSheet(){
  try{
    if(authAvailable()) await window.ThalorAuth.init();
    let [base,xp,spells,feats,features]=await Promise.all([loadJson(`../assets/data/characters/${slug}.json`),loadJson(`../assets/data/xp.json`),loadJson(`../assets/data/compendium/spells.json`),loadJson(`../assets/data/compendium/feats.json`),loadJson(`../assets/data/compendium/features.json`)]);
    base=base||(window.THALOR_CHARACTER_DATA&&window.THALOR_CHARACTER_DATA[slug]);
    if(!base)throw new Error('Dati scheda non trovati.');
    window.__thalorParentBase=normalize(base);
    let comp=mergeCompendium({spells:spells||[],feats:feats||[],features:features||[]});
    let local=localStorage.getItem(parentStorageKey)||oldKeys.map(k=>localStorage.getItem(k)).find(Boolean);
    let sheetData=local?JSON.parse(local):base;
    if(authAvailable() && window.ThalorAuth.state.configured){
      sheetData=await window.ThalorAuth.loadCharacter(slug, sheetData);
      localStorage.setItem(parentStorageKey,JSON.stringify(normalize(sheetData)));
    }
    if(isCompanion){let parent=normalize(sheetData);let row=parent.companions&&parent.companions[companionIndex];if(!row||!row.sheet)throw new Error('Scheda secondaria non trovata. Torna alla scheda principale e creala di nuovo.');render(row.sheet,xp,comp)}else{render(sheetData,xp,comp)}
  }catch(err){app.innerHTML=`<section class="panel"><h1>Errore scheda</h1><p>${esc(err.message)}</p></section>`;}
})();
})()
