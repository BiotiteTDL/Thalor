(function(){
  const app=document.getElementById('tabletopApp');
  if(!app)return;
  const params=new URLSearchParams(location.search);
  const isDisplay=params.get('display')==='1';
  const channel=('BroadcastChannel' in window)?new BroadcastChannel('thalor-tabletop-display'):null;
  const STORAGE='thalor.tabletop.workspace.v3';
  const OLD_STORAGE='thalor.tabletop.workspace.v2';
  const LEGACY='thalor.tabletop.scene.v1';
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  const uid=()=>`id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
  const freshScene=(name='Scena')=>({id:uid(),name,map:'',mapType:'image',mapName:'',grid:true,gridSize:64,gridCellSize:64,gridCols:21,gridRows:12,gridOpacity:.35,gridColor:'#ead59a',gridOffsetX:0,gridOffsetY:0,mapZoom:1,mapOffsetX:0,mapOffsetY:0,fog:.68,fogOn:false,visionRadius:260,showBarriers:true,tokens:[],effects:[],barriers:[],revealed:[],selectedToken:null,selectedEffect:null,selectedBarrier:null,effectColor:'#b83a22',effectVfx:'fog',effectOpacity:.46,effectThickness:18,effectSizeCells:3});
  let workspace={currentSceneId:null,displaySceneId:null,scenes:[]};
  let tool='move';
  let drawing=null;
  let resizeObserver=null;
  let fogMemoryCanvas=null;
  let fogMemoryCtx=null;
  let pendingToken=null;
  let suppressStageSelectionUntil=0;
  let tokenCursor=null;
  const EFFECT_TYPES=['line','rect','circle','freehand','fire','mist','ritual'];
  const VFX_TYPES=['fog','rain','bloodRitual','fire','magicAura','shadows','ritualCircle','torchLight','poison','spellArea'];
  const VFX_LABELS={fog:'Nebbia',rain:'Pioggia',bloodRitual:'Sangue / rituale',fire:'Fuoco',magicAura:'Aura magica',shadows:'Ombre',ritualCircle:'Cerchi rituali',torchLight:'Luce torcia',poison:'Zona velenosa',spellArea:'Area incantesimo'};
  const VFX_FILES={fog:'assets/vfx/fog.webm',rain:'assets/vfx/rain.webm',bloodRitual:'assets/vfx/blood-ritual.webm',fire:'assets/vfx/fire.webm',magicAura:'assets/vfx/magic-aura.webm',shadows:'assets/vfx/shadows.webm',ritualCircle:'assets/vfx/ritual-circle.webm',torchLight:'assets/vfx/torch-light.webm',poison:'assets/vfx/poison.webm',spellArea:'assets/vfx/spell-area.webm'};
  const VFX_FALLBACK_COLORS={fog:['rgba(210,220,225,.34)','rgba(255,255,255,.06)'],rain:['rgba(150,190,255,.28)','rgba(255,255,255,.05)'],bloodRitual:['rgba(150,5,15,.42)','rgba(255,160,80,.10)'],fire:['rgba(255,105,10,.56)','rgba(255,235,120,.18)'],magicAura:['rgba(115,90,255,.48)','rgba(70,220,255,.14)'],shadows:['rgba(0,0,0,.56)','rgba(90,60,140,.12)'],ritualCircle:['rgba(180,0,25,.48)','rgba(255,215,120,.14)'],torchLight:['rgba(255,190,70,.50)','rgba(255,255,170,.14)'],poison:['rgba(60,190,70,.45)','rgba(210,255,110,.12)'],spellArea:['rgba(70,170,255,.42)','rgba(255,255,255,.12)']};
  const vfxVideos={};
  let vfxLoopStarted=false;
  let vfxFrame=0;
  const TOKEN_SYMBOLS={player:['◎','✦','◆','✚','⚔','☽','☼','⬟'],enemy:['☠','✦','◆','✘','⚔','☾','⬟','✹']};
  const TOKEN_SIZES=[1,2,3,4,5,6,8,10];
  const accordionState=JSON.parse(sessionStorage.getItem('thalor.tabletop.accordions')||'{}');
  function accOpen(id,def=true){return Object.prototype.hasOwnProperty.call(accordionState,id)?!!accordionState[id]:def;}
  function accAttr(id,def=true){return `data-accordion="${id}" ${accOpen(id,def)?'open':''}`;}
  function rememberAccordions(){app.querySelectorAll('[data-accordion]').forEach(d=>{accordionState[d.dataset.accordion]=d.open;});try{sessionStorage.setItem('thalor.tabletop.accordions',JSON.stringify(accordionState));}catch(e){}}

  function normalizeSelectionIndex(value){
    if(value===null||value===undefined||value==='')return null;
    const n=Number(value);
    return Number.isInteger(n)&&n>=0?n:null;
  }

  function normalize(){
    if(!workspace||typeof workspace!=='object')workspace={currentSceneId:null,displaySceneId:null,scenes:[],initiative:{entries:[],active:0}};
    if(!workspace.initiative||typeof workspace.initiative!=='object')workspace.initiative={entries:[],active:0};
    if(!Array.isArray(workspace.initiative.entries))workspace.initiative.entries=[];
    workspace.initiative.active=Number.isInteger(Number(workspace.initiative.active))?Math.max(0,Number(workspace.initiative.active)):0;
    workspace.initiative.entries=workspace.initiative.entries.map((e,i)=>({
      id:e.id||uid(),
      type:e.type==='enemy'?'enemy':'ally',
      name:String(e.name||`${e.type==='enemy'?'Nemico':'Alleato'} ${i+1}`),
      init:Number.isFinite(Number(e.init))?Number(e.init):0,
      ac:String(e.ac??''),
      hp:String(e.hp??''),
      hpMax:String(e.hpMax??''),
      conditions:Array.isArray(e.conditions)
        ?e.conditions.map(c=>({id:c.id||uid(),name:String(c.name||'Condizione'),description:String(c.description||'')}))
        :(String(e.conditions||'').trim()?String(e.conditions).split(/[;,]/).map(x=>({id:uid(),name:x.trim(),description:''})).filter(c=>c.name):[])
    }));
    if(workspace.initiative.active>=workspace.initiative.entries.length)workspace.initiative.active=Math.max(0,workspace.initiative.entries.length-1);
    if(!Array.isArray(workspace.scenes))workspace.scenes=[];
    if(!workspace.scenes.length)workspace.scenes=[freshScene('Scena 1')];
    workspace.scenes.forEach((s,i)=>{
      s.id=s.id||uid();
      s.name=s.name||`Scena ${i+1}`;
      s.map=s.map||'';
      s.mapType=(s.mapType==='video'||String(s.map).startsWith('data:video/'))?'video':'image';
      s.mapName=s.mapName||'';
      s.grid=s.grid!==false;
      s.gridSize=Number(s.gridSize)||64;
      s.gridCellSize=Number.isFinite(Number(s.gridCellSize))?clamp(Number(s.gridCellSize),16,180):s.gridSize;
      s.gridCols=Number.isFinite(Number(s.gridCols))?clamp(Math.round(Number(s.gridCols)),8,60):21;
      s.gridRows=Number.isFinite(Number(s.gridRows))?clamp(Math.round(Number(s.gridRows)),6,40):12;
      s.gridOpacity=Number.isFinite(Number(s.gridOpacity))?Number(s.gridOpacity):.35;
      s.gridColor=/^#[0-9a-f]{6}$/i.test(String(s.gridColor||''))?s.gridColor:'#ead59a';
      s.gridOffsetX=Number.isFinite(Number(s.gridOffsetX))?clamp(Number(s.gridOffsetX),-240,240):0;
      s.gridOffsetY=Number.isFinite(Number(s.gridOffsetY))?clamp(Number(s.gridOffsetY),-240,240):0;
      s.mapZoom=Number.isFinite(Number(s.mapZoom))?clamp(Number(s.mapZoom),.25,4):1;
      s.mapOffsetX=Number.isFinite(Number(s.mapOffsetX))?clamp(Number(s.mapOffsetX),-100,100):0;
      s.mapOffsetY=Number.isFinite(Number(s.mapOffsetY))?clamp(Number(s.mapOffsetY),-100,100):0;
      s.fog=Number.isFinite(Number(s.fog))?Number(s.fog):.68;
      s.fogOn=!!s.fogOn;
      s.visionRadius=Number(s.visionRadius)||260;
      s.showBarriers=s.showBarriers!==false;
      s.selectedEffect=normalizeSelectionIndex(s.selectedEffect);
      s.selectedBarrier=normalizeSelectionIndex(s.selectedBarrier);
      s.effectColor=/^#[0-9a-f]{6}$/i.test(String(s.effectColor||''))?s.effectColor:'#b83a22';
      s.effectVfx=VFX_TYPES.includes(s.effectVfx)?s.effectVfx:'fog';
      s.effectOpacity=Number.isFinite(Number(s.effectOpacity))?clamp(Number(s.effectOpacity),.05,1):.46;
      s.effectThickness=Number.isFinite(Number(s.effectThickness))?clamp(Number(s.effectThickness),1,140):18;
      s.effectSizeCells=Number.isFinite(Number(s.effectSizeCells))?clamp(Number(s.effectSizeCells),1,12):3;
      s.tokens=Array.isArray(s.tokens)?s.tokens:[];
      s.effects=Array.isArray(s.effects)?s.effects:[];
      s.barriers=Array.isArray(s.barriers)?s.barriers:[];
      s.revealed=Array.isArray(s.revealed)?s.revealed:[];
      s.tokens.forEach((t,ti)=>{t.label=t.label||`T${ti+1}`;t.kind=t.kind==='enemy'?'enemy':'player';t.x=Number.isFinite(Number(t.x))?Number(t.x):50;t.y=Number.isFinite(Number(t.y))?Number(t.y):50;t.size=TOKEN_SIZES.includes(Number(t.size))?Number(t.size):1;});
      s.effects=s.effects.map(normalizeEffect).filter(Boolean);
      s.barriers=s.barriers.map(normalizeBarrier).filter(Boolean);
      if(s.selectedEffect!=null&&(s.selectedEffect<0||s.selectedEffect>=s.effects.length))s.selectedEffect=null;
      if(s.selectedBarrier!=null&&(s.selectedBarrier<0||s.selectedBarrier>=s.barriers.length))s.selectedBarrier=null;
      if(s.selectedToken!=null&&(s.selectedToken<0||s.selectedToken>=s.tokens.length))s.selectedToken=null;
    });
    if(!workspace.currentSceneId||!workspace.scenes.some(s=>s.id===workspace.currentSceneId))workspace.currentSceneId=workspace.scenes[0].id;
    if(!workspace.displaySceneId||!workspace.scenes.some(s=>s.id===workspace.displaySceneId))workspace.displaySceneId=workspace.currentSceneId;
  }
  function normalizeBarrier(b){
    if(!b||typeof b!=='object')return null;
    if(b.type==='rect')return {type:'rect',x:Number(b.x)||0,y:Number(b.y)||0,w:Number(b.w)||0,h:Number(b.h)||0};
    if(b.type==='circle')return {type:'circle',cx:Number(b.cx)||50,cy:Number(b.cy)||50,r:Number(b.r)||5};
    if(b.type==='freehand'){
      const pts=(Array.isArray(b.points)?b.points:[]).map(p=>({x:Number(p.x)||0,y:Number(p.y)||0}));
      return pts.length>1?{type:'freehand',points:pts}:null;
    }
    if(b.type==='line'||('x1'in b))return {type:'line',x1:Number(b.x1)||0,y1:Number(b.y1)||0,x2:Number(b.x2)||0,y2:Number(b.y2)||0};
    return null;
  }
  function normalizeEffect(e){
    if(!e||typeof e!=='object')return null;
    const base={type:EFFECT_TYPES.includes(e.type)?e.type:'circle',vfx:VFX_TYPES.includes(e.vfx)?e.vfx:(VFX_TYPES.includes(e.effectVfx)?e.effectVfx:'fog'),color:/^#[0-9a-f]{6}$/i.test(String(e.color||''))?e.color:'#b83a22',opacity:Number.isFinite(Number(e.opacity))?clamp(Number(e.opacity),.05,1):.46,thickness:Number.isFinite(Number(e.thickness))?clamp(Number(e.thickness),1,140):18};
    if(['fire','mist','ritual'].includes(base.type))return {...base,type:e.type,x:Number.isFinite(Number(e.x))?Number(e.x):50,y:Number.isFinite(Number(e.y))?Number(e.y):50,size:Number(e.size)||180,sizeCells:Number.isFinite(Number(e.sizeCells))?clamp(Number(e.sizeCells),1,12):Math.max(1,Math.min(12,Math.round((Number(e.size)||180)/64)))};
    if(e.type==='rect')return {...base,type:'rect',x:Number(e.x)||0,y:Number(e.y)||0,w:Number(e.w)||0,h:Number(e.h)||0};
    if(e.type==='circle')return {...base,type:'circle',cx:Number(e.cx)||50,cy:Number(e.cy)||50,r:Number(e.r)||5};
    if(e.type==='freehand'){
      const pts=(Array.isArray(e.points)?e.points:[]).map(p=>({x:Number(p.x)||0,y:Number(p.y)||0}));
      return pts.length>1?{...base,type:'freehand',points:pts}:null;
    }
    if(e.type==='line'||('x1'in e))return {...base,type:'line',x1:Number(e.x1)||0,y1:Number(e.y1)||0,x2:Number(e.x2)||0,y2:Number(e.y2)||0};
    return {...base,type:'circle',cx:Number(e.cx)||50,cy:Number(e.cy)||50,r:Number(e.r)||8};
  }
  function currentScene(){normalize();return workspace.scenes.find(s=>s.id===workspace.currentSceneId)||workspace.scenes[0];}
  function displayScene(){normalize();return workspace.scenes.find(s=>s.id===workspace.displaySceneId)||currentScene();}
  function save(){normalize();try{localStorage.setItem(STORAGE,JSON.stringify(workspace));}catch(e){} broadcast();}
  function load(){
    try{const raw=localStorage.getItem(STORAGE)||localStorage.getItem(OLD_STORAGE);if(raw)workspace=Object.assign(workspace,JSON.parse(raw));}catch(e){}
    try{if(!workspace.scenes.length){const raw=localStorage.getItem(LEGACY);if(raw){const old=JSON.parse(raw);const s=freshScene('Scena 1');Object.assign(s,old);s.id=uid();s.name='Scena 1';workspace={currentSceneId:s.id,displaySceneId:s.id,scenes:[s]};}}}catch(e){}
    normalize();
  }
  function broadcast(){if(channel)channel.postMessage({type:'workspace',workspace});}
  function requestWorkspaceFromMaster(){if(channel)channel.postMessage({type:'display-ready'});}
  function resendWorkspaceToDisplay(){setTimeout(()=>broadcast(),80);setTimeout(()=>broadcast(),450);setTimeout(()=>broadcast(),1200);}
  function isMaster(){try{return !!(window.ThalorAuth&&window.ThalorAuth.isMaster&&window.ThalorAuth.isMaster());}catch(e){return false;}}
  async function guard(){
    try{if(window.ThalorAuth&&window.ThalorAuth.init)await window.ThalorAuth.init();}catch(e){}
    if(isMaster()||isDisplay)return true;
    app.innerHTML=`<section class="tabletop-denied sheet-theme-panel"><div class="dynamic-crest">☽</div><h1 class="section-title">Tavolo Master</h1><p class="section-note">Questa sezione è riservata ai Master. Effettua l'accesso con un profilo Master per visualizzarla.</p><div class="actions"><a class="button" href="auth.html">Vai ad Accesso</a><a class="button ghost-button" href="index.html">Torna alla Home</a></div></section>`;
    document.body.classList.remove('tabletop-display-mode');
    return false;
  }

  function sceneOptions(selectedId){return workspace.scenes.map((s,i)=>`<option value="${esc(s.id)}" ${s.id===selectedId?'selected':''}>${esc(s.name||`Scena ${i+1}`)}</option>`).join('');}

  function initiativeTrackerHTML(){
    normalize();
    const init=workspace.initiative;
    const rows=init.entries.map((e,i)=>`<div class="initiative-row ${i===init.active?'is-current':''}" data-init-row="${i}">
      <button type="button" class="initiative-turn" data-init-set-current="${i}" title="Imposta turno">${i===init.active?'▶':'•'}</button>
      <select data-init-field="type" aria-label="Tipo"><option value="ally" ${e.type==='ally'?'selected':''}>Alleato</option><option value="enemy" ${e.type==='enemy'?'selected':''}>Nemico</option></select>
      <input data-init-field="name" value="${esc(e.name)}" placeholder="Nome" aria-label="Nome">
      <input data-init-field="init" type="number" value="${esc(e.init)}" aria-label="Iniziativa">
      <input data-init-field="ac" value="${esc(e.ac)}" placeholder="CA" aria-label="CA">
      <input data-init-field="hp" value="${esc(e.hp)}" placeholder="PF" aria-label="PF">
      <input data-init-field="hpMax" value="${esc(e.hpMax)}" placeholder="Max" aria-label="PF massimi">
      <div class="initiative-conditions" data-init-conditions="${i}">${(e.conditions||[]).map((c,ci)=>`<button type="button" class="initiative-condition-chip" data-init-edit-condition="${i}:${ci}" title="${esc(c.description||'Nessuna descrizione')}">${esc(c.name||'Condizione')}</button>`).join('')}<button type="button" class="initiative-condition-add" data-init-add-condition="${i}" title="Aggiungi condizione">+ condizione</button></div>
      <div class="initiative-row-actions"><button type="button" data-init-up="${i}" title="Su">↑</button><button type="button" data-init-down="${i}" title="Giù">↓</button><button type="button" class="initiative-delete-row-btn" data-init-remove="${i}" title="Elimina riga" aria-label="Elimina riga">✕</button></div>
    </div>`).join('')||`<p class="initiative-empty">Nessuna creatura in iniziativa.</p>`;
    return `<section class="initiative-tracker sheet-theme-panel" data-initiative-tracker>
      <div class="initiative-head"><div><span class="tag">Solo Master</span><h2>Tracker Iniziativa</h2></div><div class="initiative-actions"><button class="button" type="button" data-init-add="ally">+ Alleato</button><button class="button danger-button" type="button" data-init-add="enemy">+ Nemico</button><button class="button ghost-button" type="button" data-init-sort>Ordina</button><button class="button" type="button" data-init-next>Fine turno</button></div></div>
      <div class="initiative-grid-head"><span></span><span>Tipo</span><span>Nome</span><span>Init</span><span>CA</span><span>PF</span><span>Max</span><span>Condizioni</span><span></span></div>
      <div class="initiative-list">${rows}</div>
    </section>`;
  }
  function captureVideoState(){
    const v=app.querySelector('video.tabletop-map-video');
    if(!v)return null;
    return {src:v.currentSrc||v.src||'',time:Number.isFinite(v.currentTime)?v.currentTime:0,paused:v.paused,muted:v.muted,playbackRate:v.playbackRate||1};
  }
  function restoreVideoState(state){
    if(!state||!state.src)return;
    const v=app.querySelector('video.tabletop-map-video');
    if(!v)return;
    const same=(v.currentSrc||v.src||'')===state.src;
    if(!same)return;
    v.muted=state.muted!==false;
    v.loop=true;
    v.playsInline=true;
    v.autoplay=true;
    if(state.playbackRate)v.playbackRate=state.playbackRate;
    const applyTime=()=>{
      try{
        if(Number.isFinite(state.time)&&Math.abs((v.currentTime||0)-state.time)>.35)v.currentTime=state.time;
      }catch(e){}
      if(!state.paused)v.play&&v.play().catch(()=>{});
    };
    if(v.readyState>=1)applyTime();
    else v.addEventListener('loadedmetadata',applyTime,{once:true});
    setTimeout(applyTime,80);
  }
  function render(){
    const videoState=captureVideoState();
    const previousControlsScroll=app.querySelector('.tabletop-controls')?.scrollTop||0;
    const previousWindowScroll=window.scrollY||0;
    normalize();
    const s=isDisplay?displayScene():currentScene();
    document.body.classList.toggle('tabletop-display-mode',isDisplay);document.documentElement.classList.toggle('tabletop-display-mode',isDisplay);
    app.innerHTML=`
      <section class="tabletop-hero sheet-theme-panel">
        <div><span class="tag">Area riservata Master</span><h1 class="section-title">Tavolo Master</h1><p class="section-note">Mappe, griglia, nebbia, token, barriere visive ed effetti scenici. Il Display è pensato per secondo monitor/TV.</p></div>
        <div class="tabletop-hero-actions"><button class="button" data-open-display>Apri Display</button><button class="button ghost-button" data-save-group>Salva gruppo</button><button class="button ghost-button" data-save-group-as>Salva come gruppo</button><label class="button ghost-button tabletop-import-btn">Carica gruppo<input type="file" accept="application/json,.json" data-import-scenes hidden></label><button class="button ghost-button" data-save>Salva locale</button><button class="button danger-button" data-reset>Reset totale</button></div>
      </section>
      <section class="tabletop-shell">
        <aside class="tabletop-controls sheet-theme-panel">
          <details class="tabletop-accordion" ${accAttr('scene',true)}><summary>Scene e Display</summary>
            <label><span>Scena in modifica</span><select data-current-scene>${sceneOptions(workspace.currentSceneId)}</select></label>
            <label><span>Scena mostrata sul Display</span><select data-display-scene>${sceneOptions(workspace.displaySceneId)}</select></label>
            <div class="tabletop-tools"><button class="button" data-add-scene>+ Scena</button><button class="button ghost-button" data-rename-scene>Rinomina</button><button class="button danger-button" data-delete-scene>Elimina scena</button><button class="button ghost-button" data-clone-scene>Duplica</button></div>
          </details>
          <details class="tabletop-accordion" ${accAttr('map',true)}><summary>Mappa</summary>
            <label class="tabletop-file"><span>Mappa / video</span><input type="file" accept="image/*,video/*" data-map-file></label>
            <label><span>Dimensione schermo lato Master <output data-grid-size-out>${s.gridSize}px</output></span><input type="range" min="24" max="180" value="${s.gridSize}" data-grid-size></label>
            <label><span>Zoom mappa <output data-map-zoom-out>${Math.round(s.mapZoom*100)}%</output></span><input type="range" min="25" max="400" value="${Math.round(s.mapZoom*100)}" data-map-zoom></label>
            <label><span>Aggiustamento mappa orizzontale <output data-map-x-out>${s.mapOffsetX}%</output></span><input type="range" min="-100" max="100" value="${s.mapOffsetX}" data-map-x></label>
            <label><span>Aggiustamento mappa verticale <output data-map-y-out>${s.mapOffsetY}%</output></span><input type="range" min="-100" max="100" value="${s.mapOffsetY}" data-map-y></label>
          </details>
          <details class="tabletop-accordion" ${accAttr('grid',true)}><summary>Griglia</summary>
            <label class="tabletop-inline"><span>Griglia</span><input type="checkbox" data-grid ${s.grid?'checked':''}></label>
            <label><span>Colore griglia</span><input type="color" value="${esc(s.gridColor)}" data-grid-color></label>
            <label><span>Dimensione quadretti griglia <output data-grid-cell-size-out>${s.gridCellSize}px</output></span><input type="range" min="16" max="180" value="${s.gridCellSize}" data-grid-cell-size></label>
            <label><span>Quadretti orizzontali <output data-grid-cols-out>${s.gridCols}</output></span><input type="range" min="8" max="60" value="${s.gridCols}" data-grid-cols></label>
            <label><span>Quadretti verticali <output data-grid-rows-out>${s.gridRows}</output></span><input type="range" min="6" max="40" value="${s.gridRows}" data-grid-rows></label>
            <label><span>Opacità griglia <output data-grid-opacity-out>${Math.round(s.gridOpacity*100)}%</output></span><input type="range" min="0" max="100" value="${Math.round(s.gridOpacity*100)}" data-grid-opacity></label>
            <label><span>Adjust griglia orizzontale <output data-grid-x-out>${s.gridOffsetX}px</output></span><input type="range" min="-240" max="240" value="${s.gridOffsetX}" data-grid-x></label>
            <label><span>Adjust griglia verticale <output data-grid-y-out>${s.gridOffsetY}px</output></span><input type="range" min="-240" max="240" value="${s.gridOffsetY}" data-grid-y></label>
          </details>
          <details class="tabletop-accordion" ${accAttr('fog',true)}><summary>Fog of War</summary>
            <label class="tabletop-inline"><span>Nebbia di guerra</span><input type="checkbox" data-fog ${s.fogOn?'checked':''}></label>
            <label><span>Opacità nebbia <output data-fog-out>${Math.round(s.fog*100)}%</output></span><input type="range" min="0" max="95" value="${Math.round(s.fog*100)}" data-fog-value></label>
            <label><span>Campo visivo token <output data-vision-out>${s.visionRadius}px</output></span><input type="range" min="80" max="900" value="${s.visionRadius}" data-vision-radius></label>
            <label class="tabletop-inline"><span>Mostra barriere master</span><input type="checkbox" data-show-barriers ${s.showBarriers?'checked':''}></label>
            <div class="tabletop-tools tabletop-tools-wide"><button class="button ${tool==='barrier-line'?'is-active':''}" data-tool="barrier-line">Barriera linea</button><button class="button ${tool==='barrier-rect'?'is-active':''}" data-tool="barrier-rect">Barriera forma</button><button class="button ${tool==='barrier-circle'?'is-active':''}" data-tool="barrier-circle">Barriera cerchio</button><button class="button ${tool==='barrier-freehand'?'is-active':''}" data-tool="barrier-freehand">Mano libera</button><button class="button danger-button" data-clear-barriers>Cancella barriere</button><button class="button ghost-button" data-clear-reveal>Reset nebbia</button></div>
            <div class="tabletop-list"><h3>Barriere</h3>${barrierListHTML(s)}</div>
          </details>
          <details class="tabletop-accordion" ${accAttr('tokens',true)}><summary>Miniature</summary>
            <div class="tabletop-tools"><button class="button" data-add-token-kind="player">+ Alleato</button><button class="button danger-button" data-add-token-kind="enemy">+ Nemico</button></div><div class="tabletop-token-symbols" data-token-symbols hidden></div>
            <div class="tabletop-list"><h3>Miniature</h3>${tokenListHTML(s)}</div>
          </details>
          <details class="tabletop-accordion" ${accAttr('effects',false)}><summary>Effetti</summary>
            <label><span>Tipo effetto animato</span><select data-effect-vfx>${VFX_TYPES.map(v=>`<option value="${v}" ${s.effectVfx===v?'selected':''}>${esc(VFX_LABELS[v])}</option>`).join('')}</select></label>
            <label><span>Opacità effetto <output data-effect-opacity-out>${Math.round(s.effectOpacity*100)}%</output></span><input type="range" min="5" max="100" value="${Math.round(s.effectOpacity*100)}" data-effect-opacity></label>
            <label><span>Spessore effetto <output data-effect-thickness-out>${s.effectThickness}px</output></span><input type="range" min="1" max="140" value="${s.effectThickness}" data-effect-thickness></label>
            <div class="tabletop-tools tabletop-tools-wide"><button class="button ${tool==='effect-line'?'is-active':''}" data-tool="effect-line">Effetto linea</button><button class="button ${tool==='effect-rect'?'is-active':''}" data-tool="effect-rect">Effetto quadrato</button><button class="button ${tool==='effect-circle'?'is-active':''}" data-tool="effect-circle">Effetto cerchio</button><button class="button ${tool==='effect-freehand'?'is-active':''}" data-tool="effect-freehand">Effetto mano libera</button></div>
            <div class="tabletop-tools"><button class="button danger-button" data-clear-effects>Cancella effetti</button></div>
            <div class="tabletop-list"><h3>Effetti</h3>${effectListHTML(s)}</div>
          </details>
          <p class="tabletop-help">Le miniature nemiche non generano campo visivo. Barriere linea/forma/cerchio/mano libera bloccano il campo visivo; ciò che è già stato visto resta più scuro.</p>
        </aside>
        <section class="tabletop-master-workspace"><section class="tabletop-stage-card sheet-theme-panel">${stageHTML(s)}</section>${isDisplay?'':initiativeTrackerHTML()}</section>
      </section>`;
    if(isDisplay){
      app.querySelector('.tabletop-hero')?.remove();
      app.querySelector('.tabletop-controls')?.remove();
      app.querySelector('.tabletop-stage-card')?.classList.remove('sheet-theme-panel');
      const stageCard=app.querySelector('.tabletop-stage-card');
      if(stageCard&&!stageCard.querySelector('[data-display-fullscreen]'))stageCard.insertAdjacentHTML('beforeend','<button class="tabletop-display-fullscreen" data-display-fullscreen title="Fullscreen">⛶</button>');
    }
    bind();
    observeStage();
    requestAnimationFrame(()=>{const controls=app.querySelector('.tabletop-controls');if(controls)controls.scrollTop=previousControlsScroll;window.scrollTo({top:previousWindowScroll,left:0,behavior:'instant'});restoreVideoState(videoState);fitDisplayStage();refreshBarrierOverlay(app.querySelector('[data-stage]'),isDisplay?displayScene():currentScene());drawFog();});
  }
  function renderDisplayOnly(){
    const videoState=captureVideoState();
    normalize();
    document.body.classList.add('tabletop-display-mode');
    document.documentElement.classList.add('tabletop-display-mode');
    let stageCard=app.querySelector('.tabletop-stage-card');
    if(!stageCard){render();return;}
    stageCard.classList.remove('sheet-theme-panel');
    stageCard.innerHTML=stageHTML(displayScene())+'<button class="tabletop-display-fullscreen" data-display-fullscreen title="Fullscreen">⛶</button>';
    bind();
    observeStage();
    requestAnimationFrame(()=>{restoreVideoState(videoState);fitDisplayStage();refreshBarrierOverlay(app.querySelector('[data-stage]'),displayScene());drawFog();});
  }
  function tokenListHTML(s){return s.tokens.length?s.tokens.map((t,i)=>`<button class="tabletop-list-row ${s.selectedToken===i?'is-selected':''}" data-select-token="${i}"><span>${t.kind==='enemy'?'Nemico':'Miniatura'} — ${esc(t.label)} (${t.size||1}×${t.size||1})</span><b data-delete-token="${i}" title="Elimina">✕</b></button>`).join(''):'<p>Nessuna miniatura.</p>';}
  function effectListHTML(s){return s.effects.length?s.effects.map((e,i)=>`<button class="tabletop-list-row ${s.selectedEffect===i?'is-selected':''}" data-select-effect="${i}"><span>${esc(effectName(e,i))}</span><b data-delete-effect="${i}" title="Elimina">✕</b></button>`).join(''):'<p>Nessun effetto.</p>';}
  function barrierListHTML(s){return s.barriers.length?s.barriers.map((b,i)=>`<button class="tabletop-list-row ${s.selectedBarrier===i?'is-selected':''}" data-select-barrier="${i}"><span>${esc(barrierName(b,i))}</span><b data-delete-barrier="${i}" title="Elimina">✕</b></button>`).join(''):'<p>Nessuna barriera.</p>';}
  function effectName(e,i){return `${i+1}. ${VFX_LABELS[e.vfx]||'Effetto'} — ${e.type==='line'?'Linea':e.type==='rect'?'Quadrato':e.type==='circle'?'Cerchio':e.type==='freehand'?'Mano libera':'Effetto'}`;}
  function barrierName(b,i){return `${i+1}. ${b.type==='line'?'Linea':b.type==='rect'?'Forma':b.type==='circle'?'Cerchio':'Mano libera'}`;}
  function selectedStageToolsHTML(s){
    if(isDisplay)return '';
    const hasToken=s.selectedToken!=null&&s.tokens[s.selectedToken];
    const hasEffect=s.selectedEffect!=null&&s.effects[s.selectedEffect];
    const hasBarrier=s.selectedBarrier!=null&&s.barriers[s.selectedBarrier];
    if(!hasToken&&!hasEffect&&!hasBarrier)return '';
    const label=hasToken?'Miniatura selezionata':hasEffect?'Effetto selezionato':'Barriera selezionata';
    const attr=hasToken?`data-delete-token="${s.selectedToken}"`:hasEffect?`data-delete-effect="${s.selectedEffect}"`:`data-delete-barrier="${s.selectedBarrier}"`;
    return `<div class="tabletop-stage-selection-tools"><span>${label}</span><button type="button" class="tabletop-stage-delete" ${attr} title="Elimina selezionato">✕</button></div>`;
  }
  function mapMediaHTML(s){
    if(!s.map)return `<div class="tabletop-empty"><strong>Nessuna mappa caricata</strong><span>Carica un'immagine o un video dai controlli Master.</span></div>`;
    if(s.mapType==='video')return `<video class="tabletop-map tabletop-map-video" src="${esc(s.map)}" autoplay muted loop playsinline preload="auto" aria-label="Video del tavolo"></video>`;
    return `<img class="tabletop-map" src="${esc(s.map)}" alt="Mappa del tavolo">`;
  }
  function stageHTML(s){
    return `<div class="tabletop-stage" data-stage data-media-key="${esc(stageMediaKey(s))}" style="--grid-size:64px;--master-stage-scale:${(Number(s.gridSize)||64)/64};--grid-cell-size:${s.gridCellSize}px;--grid-cols:${s.gridCols};--grid-rows:${s.gridRows};--grid-opacity:${s.gridOpacity};--grid-line:${esc(s.gridColor)};--grid-x:${s.gridOffsetX}px;--grid-y:${s.gridOffsetY}px;--stage-fit:1;--map-zoom:${s.mapZoom};--map-x:${s.mapOffsetX}%;--map-y:${s.mapOffsetY}%;--fog:${s.fog};">
      ${mapMediaHTML(s)}
      <div class="tabletop-grid ${s.grid?'is-visible':''}"></div>
      <canvas class="tabletop-vfx-canvas" data-vfx-canvas></canvas>
      <svg class="tabletop-effects-svg is-visible" data-effects preserveAspectRatio="none"></svg>
      <canvas class="tabletop-fog-canvas ${s.fogOn?'is-visible':''}" data-fog-canvas></canvas>
      <svg class="tabletop-barriers ${s.showBarriers&&!isDisplay?'is-visible':''}" data-barriers preserveAspectRatio="none"></svg>
      <div class="tabletop-layer" data-layer>
        ${s.tokens.map((t,i)=>`<div class="tabletop-token ${t.kind==='enemy'?'is-enemy':''} ${s.selectedToken===i?'is-selected':''}" data-kind="token" data-i="${i}" style="left:${t.x}%;top:${t.y}%;--token-cells:${t.size||1}"><span>${esc(t.label)}</span><button class="tabletop-delete" data-delete-token="${i}" title="Elimina token">✕</button></div>`).join('')}
      </div>
      ${selectedStageToolsHTML(s)}
    </div>`;
  }
  function stageMediaKey(s){return `${s.id||''}|${s.mapType||'image'}|${s.map||''}`;}
  function applyStageVars(stage,s){
    if(!stage||!s)return;
    stage.dataset.mediaKey=stageMediaKey(s);
    stage.style.setProperty('--master-stage-scale',(Number(s.gridSize)||64)/64);
    stage.style.setProperty('--grid-cell-size',`${Number(s.gridCellSize)||64}px`);
    stage.style.setProperty('--grid-cols',Number(s.gridCols)||21);
    stage.style.setProperty('--grid-rows',Number(s.gridRows)||12);
    stage.style.setProperty('--grid-opacity',Number(s.gridOpacity)||0);
    stage.style.setProperty('--grid-line',s.gridColor||'#ead59a');
    stage.style.setProperty('--grid-x',`${Number(s.gridOffsetX)||0}px`);
    stage.style.setProperty('--grid-y',`${Number(s.gridOffsetY)||0}px`);
    stage.style.setProperty('--map-zoom',Number(s.mapZoom)||1);
    stage.style.setProperty('--map-x',`${Number(s.mapOffsetX)||0}%`);
    stage.style.setProperty('--map-y',`${Number(s.mapOffsetY)||0}%`);
    stage.style.setProperty('--fog',Number(s.fog)||0);
    stage.querySelector('.tabletop-grid')?.classList.toggle('is-visible',!!s.grid);
    stage.querySelector('[data-fog-canvas]')?.classList.toggle('is-visible',!!s.fogOn);
    stage.querySelector('[data-barriers]')?.classList.toggle('is-visible',!!s.showBarriers&&!isDisplay);
  }
  function tokenHTML(t,i,s){return `<div class="tabletop-token ${t.kind==='enemy'?'is-enemy':''} ${s.selectedToken===i?'is-selected':''}" data-kind="token" data-i="${i}" style="left:${t.x}%;top:${t.y}%;--token-cells:${t.size||1}"><span>${esc(t.label)}</span><button class="tabletop-delete" data-delete-token="${i}" title="Elimina token">✕</button></div>`;}
  function updateToolButtons(){
    app.querySelectorAll('[data-tool]').forEach(btn=>btn.classList.toggle('is-active',btn.dataset.tool===tool));
  }
  function refreshListSelection(s){
    app.querySelectorAll('[data-select-token]').forEach(btn=>btn.classList.toggle('is-selected',Number(btn.dataset.selectToken)===s.selectedToken));
    app.querySelectorAll('[data-select-effect]').forEach(btn=>btn.classList.toggle('is-selected',Number(btn.dataset.selectEffect)===s.selectedEffect));
    app.querySelectorAll('[data-select-barrier]').forEach(btn=>btn.classList.toggle('is-selected',Number(btn.dataset.selectBarrier)===s.selectedBarrier));
  }
  function refreshStageTools(stage,s){
    stage.querySelectorAll('.tabletop-stage-selection-tools').forEach(el=>el.remove());
    const html=selectedStageToolsHTML(s);
    if(html)stage.insertAdjacentHTML('beforeend',html);
    const del=stage.querySelector('.tabletop-stage-selection-tools [data-delete-token],.tabletop-stage-selection-tools [data-delete-effect],.tabletop-stage-selection-tools [data-delete-barrier]');
    if(del)del.addEventListener('click',ev=>{ev.preventDefault();ev.stopPropagation();deleteFromButton(del,s,true);});
  }
  function refreshTokensLayer(stage,s){
    const layer=stage?.querySelector('[data-layer]');
    if(!layer)return;
    layer.innerHTML=(s.tokens||[]).map((t,i)=>tokenHTML(t,i,s)).join('');
  }
  function softRefreshStage(s=stageScene(),opts={}){
    normalize();
    const stage=app.querySelector('[data-stage]');
    if(!stage)return render();
    const mediaKey=stageMediaKey(s);
    if(stage.dataset.mediaKey&&stage.dataset.mediaKey!==mediaKey){return isDisplay?renderDisplayOnly():render();}
    applyStageVars(stage,s);
    if(opts.tokens!==false)refreshTokensLayer(stage,s);
    refreshBarrierOverlay(stage,s);
    refreshStageTools(stage,s);
    if(opts.fit!==false)fitDisplayStage();
    drawFog();
    refreshListSelection(s);
    updateToolButtons();
    broadcast();
  }
  function deleteFromButton(btn,s,live=false){
    if(btn.dataset.deleteToken!==undefined){const i=Number(btn.dataset.deleteToken);s.tokens.splice(i,1);if(s.selectedToken===i)s.selectedToken=null;else if(s.selectedToken>i)s.selectedToken--;}
    else if(btn.dataset.deleteEffect!==undefined){const i=Number(btn.dataset.deleteEffect);s.effects.splice(i,1);if(s.selectedEffect===i)s.selectedEffect=null;else if(s.selectedEffect>i)s.selectedEffect--;}
    else if(btn.dataset.deleteBarrier!==undefined){const i=Number(btn.dataset.deleteBarrier);s.barriers.splice(i,1);if(s.selectedBarrier===i)s.selectedBarrier=null;else if(s.selectedBarrier>i)s.selectedBarrier--;}
    save();
    if(live)softRefreshStage(s);else render();
  }
  function barriersSVG(s){return barriersSVGPx(s,app.querySelector('[data-stage]')?.getBoundingClientRect()||{width:100,height:100});}
  function barriersSVGPx(s,rect){const w=Math.max(1,rect.width||100),h=Math.max(1,rect.height||100);return (s.barriers||[]).map((b,i)=>barrierShapePx(b,i,w,h,s.selectedBarrier===i?'is-selected':'')).join('');}
  function stageDrawRect(stage){
    const w=Math.max(1,stage?.clientWidth||stage?.offsetWidth||100);
    const h=Math.max(1,stage?.clientHeight||stage?.offsetHeight||100);
    return {width:w,height:h,left:0,top:0};
  }
  function barrierShapePx(b,i,w,h,extraClass=''){
    const cls=extraClass?` class="${extraClass}"`:'';
    if(b.type==='rect')return `<rect${cls} data-i="${i}" x="${b.x/100*w}" y="${b.y/100*h}" width="${b.w/100*w}" height="${b.h/100*h}"/>`;
    if(b.type==='circle'){const r=b.r/100*Math.min(w,h);return `<circle${cls} data-i="${i}" cx="${b.cx/100*w}" cy="${b.cy/100*h}" r="${r}"/>`;}
    if(b.type==='freehand')return `<polyline${cls} data-i="${i}" points="${b.points.map(p=>`${p.x/100*w},${p.y/100*h}`).join(' ')}"/>`;
    return `<line${cls} data-i="${i}" x1="${b.x1/100*w}" y1="${b.y1/100*h}" x2="${b.x2/100*w}" y2="${b.y2/100*h}"/>`;
  }
  function refreshBarrierOverlay(stage,s){const svg=stage?.querySelector('[data-barriers]');if(!svg)return;const r=stageDrawRect(stage);svg.setAttribute('viewBox',`0 0 ${Math.max(1,r.width)} ${Math.max(1,r.height)}`);svg.innerHTML=barriersSVGPx(s,r);refreshEffectsOverlay(stage,s,r);}
  function refreshEffectsOverlay(stage,s,rect=null){const svg=stage?.querySelector('[data-effects]');if(!svg)return;const r=rect||stageDrawRect(stage);svg.setAttribute('viewBox',`0 0 ${Math.max(1,r.width)} ${Math.max(1,r.height)}`);svg.innerHTML=effectsSVGPx(s,r);drawVfxOverlay(stage,s,r);ensureVfxLoop();}
  function effectsSVGPx(s,rect){const w=Math.max(1,rect.width||100),h=Math.max(1,rect.height||100);return (s.effects||[]).map((e,i)=>effectShapePx(e,i,w,h,s.selectedEffect===i?'is-selected':'')).join('');}
  function effectShapePx(e,i,w,h,extraClass=''){
    if(['fire','mist','ritual'].includes(e.type))return '';
    const cls=`tabletop-effect-shape ${extraClass} effect-${esc(e.type)}`.trim();
    const common=`data-kind="effect-shape" data-i="${i}" class="${cls}" style="--effect-color:${esc(e.color||'#b83a22')};--effect-opacity:${Number(e.opacity)||.46};--effect-thickness:${Number(e.thickness)||18}"`;
    if(e.type==='rect')return `<rect ${common} x="${e.x/100*w}" y="${e.y/100*h}" width="${e.w/100*w}" height="${e.h/100*h}"/>`;
    if(e.type==='circle'){const r=e.r/100*Math.min(w,h);return `<circle ${common} cx="${e.cx/100*w}" cy="${e.cy/100*h}" r="${r}"/>`;}
    if(e.type==='freehand')return `<polyline ${common} points="${(e.points||[]).map(p=>`${p.x/100*w},${p.y/100*h}`).join(' ')}"/>`;
    return `<line ${common} x1="${e.x1/100*w}" y1="${e.y1/100*h}" x2="${e.x2/100*w}" y2="${e.y2/100*h}"/>`;
  }


  function getVfxVideo(type){
    type=VFX_TYPES.includes(type)?type:'fog';
    if(vfxVideos[type])return vfxVideos[type];
    const video=document.createElement('video');
    const src=VFX_FILES[type];
    video.src=src;
    video.muted=true;video.defaultMuted=true;video.volume=0;video.loop=true;video.playsInline=true;video.autoplay=true;video.preload='auto';
    if(/^https?:/i.test(src))video.crossOrigin='anonymous';
    video.dataset.ready='0';
    const mark=()=>{video.dataset.ready='1';video.dataset.error='0';video.play&&video.play().catch(()=>{});};
    video.addEventListener('loadeddata',mark,{once:true});
    video.addEventListener('canplay',mark,{once:true});
    video.addEventListener('playing',mark,{once:true});
    video.addEventListener('error',()=>{video.dataset.error='1';},{once:true});
    try{video.load();}catch(e){}
    setTimeout(()=>video.play&&video.play().catch(()=>{}),40);
    vfxVideos[type]=video;
    return video;
  }
  function vfxPattern(ctx,type,t){
    const video=getVfxVideo(type);
    if(video.dataset.ready==='1'&&!video.dataset.error&&video.readyState>=2){
      try{const p=ctx.createPattern(video,'repeat');if(p)return p;}catch(e){}
    }
    const cols=VFX_FALLBACK_COLORS[type]||VFX_FALLBACK_COLORS.fog;
    const size=90;
    const c=document.createElement('canvas');c.width=size;c.height=size;
    const g=c.getContext('2d');
    const ox=(t*.035)%size,oy=(t*.02)%size;
    const grad=g.createRadialGradient(size*.45+Math.sin(t*.002)*18,size*.45+Math.cos(t*.002)*18,4,size*.5,size*.5,size*.65);
    grad.addColorStop(0,cols[0]);grad.addColorStop(1,cols[1]);
    g.fillStyle=grad;g.fillRect(0,0,size,size);
    g.strokeStyle=cols[0];g.globalAlpha=.55;g.lineWidth=2;
    for(let i=-size;i<size*2;i+=18){g.beginPath();g.moveTo(i+ox,-10);g.lineTo(i+oy,size+10);g.stroke();}
    try{return ctx.createPattern(c,'repeat');}catch(e){return cols[0];}
  }
  function effectPathPx(ctx,e,w,h){
    ctx.beginPath();
    if(e.type==='rect')ctx.rect(e.x/100*w,e.y/100*h,e.w/100*w,e.h/100*h);
    else if(e.type==='circle')ctx.arc(e.cx/100*w,e.cy/100*h,e.r/100*Math.min(w,h),0,Math.PI*2);
    else if(e.type==='freehand'){
      const pts=e.points||[];if(!pts.length)return false;ctx.moveTo(pts[0].x/100*w,pts[0].y/100*h);pts.slice(1).forEach(p=>ctx.lineTo(p.x/100*w,p.y/100*h));
    }else{ctx.moveTo(e.x1/100*w,e.y1/100*h);ctx.lineTo(e.x2/100*w,e.y2/100*h);}
    return true;
  }
  function drawVfxOverlay(stage,s,rect=null){
    const canvas=stage?.querySelector('[data-vfx-canvas]');if(!canvas)return;
    const r=rect||stageDrawRect(stage);const dpr=Math.max(1,window.devicePixelRatio||1);const w=Math.max(1,Math.round(r.width)),h=Math.max(1,Math.round(r.height));
    if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);canvas.style.width=w+'px';canvas.style.height=h+'px';}
    const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
    const effects=s.effects||[];if(!effects.length)return;
    const t=performance.now();
    effects.forEach(e=>{
      ctx.save();ctx.globalAlpha=clamp(Number(e.opacity)||.46,.05,1);ctx.globalCompositeOperation=vfxBlendMode(e.vfx);
      const pat=vfxPattern(ctx,e.vfx||'fog',t);
      if(e.type==='rect'||e.type==='circle'){
        if(effectPathPx(ctx,e,w,h)){ctx.fillStyle=pat;ctx.fill();ctx.strokeStyle=pat;ctx.lineWidth=Math.max(2,(Number(e.thickness)||18)*.18);ctx.stroke();}
      }else{
        if(effectPathPx(ctx,e,w,h)){ctx.strokeStyle=pat;ctx.lineWidth=Number(e.thickness)||18;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();}
      }
      ctx.restore();
    });
  }
  function vfxBlendMode(type){
    if(type==='fire'||type==='torchLight'||type==='magicAura'||type==='spellArea')return 'screen';
    if(type==='shadows')return 'multiply';
    return 'source-over';
  }
  function ensureVfxLoop(){
    if(vfxLoopStarted)return;vfxLoopStarted=true;
    const tick=()=>{vfxFrame=requestAnimationFrame(tick);const stage=app.querySelector('[data-stage]');if(stage){const s=stageScene();if(s&&(s.effects||[]).length)drawVfxOverlay(stage,s);}};
    vfxFrame=requestAnimationFrame(tick);
  }

  function bind(){
    const s=currentScene();const stage=app.querySelector('[data-stage]');
    app.querySelectorAll('[data-accordion]').forEach(d=>d.addEventListener('toggle',()=>{accordionState[d.dataset.accordion]=d.open;try{sessionStorage.setItem('thalor.tabletop.accordions',JSON.stringify(accordionState));}catch(e){}}));
    app.querySelector('.tabletop-controls')?.addEventListener('scroll',ev=>{ev.currentTarget.dataset.scrollTop=String(ev.currentTarget.scrollTop);},{passive:true});
    app.querySelector('[data-open-display]')?.addEventListener('click',()=>{window.open(location.pathname+'?display=1','thalor-display','popup=yes,width=1280,height=720');resendWorkspaceToDisplay();});
    app.querySelector('[data-display-fullscreen]')?.addEventListener('click',()=>requestFullscreenSafe());
    app.querySelector('[data-save]')?.addEventListener('click',()=>{save();noticeInPage('Tavolo salvato in locale.',{title:'Salva locale'});});
    app.querySelector('[data-reset]')?.addEventListener('click',()=>{confirmInPage('Resettare tutto il Tavolo Master?',()=>{workspace={currentSceneId:null,displaySceneId:null,scenes:[freshScene('Scena 1')]};normalize();save();render();},{title:'Reset Tavolo Master',okText:'Resetta'});});
    app.querySelector('[data-save-group]')?.addEventListener('click',()=>saveScenesFile(false));
    app.querySelector('[data-save-group-as]')?.addEventListener('click',()=>saveScenesFile(true));
    app.querySelector('[data-import-scenes]')?.addEventListener('change',importScenesFile);
    app.querySelector('[data-current-scene]')?.addEventListener('change',ev=>{workspace.currentSceneId=ev.target.value;save();render();});
    app.querySelector('[data-display-scene]')?.addEventListener('change',ev=>{workspace.displaySceneId=ev.target.value;save();render();});
    app.querySelector('[data-add-scene]')?.addEventListener('click',()=>{rememberAccordions();const ns=freshScene(`Scena ${workspace.scenes.length+1}`);workspace.scenes.push(ns);workspace.currentSceneId=ns.id;workspace.displaySceneId=ns.id;save();render();});
    app.querySelector('[data-clone-scene]')?.addEventListener('click',()=>{const base=currentScene();const copy=JSON.parse(JSON.stringify(base));copy.id=uid();copy.name=(base.name||'Scena')+' copia';workspace.scenes.push(copy);workspace.currentSceneId=copy.id;save();render();});
    app.querySelector('[data-rename-scene]')?.addEventListener('click',()=>{const scene=currentScene();const name=prompt('Nuovo nome scena:',scene.name);if(name!==null){scene.name=name.trim()||scene.name;save();render();}});
    app.querySelector('[data-delete-scene]')?.addEventListener('click',()=>{if(workspace.scenes.length<=1){noticeInPage('Deve rimanere almeno una scena.',{title:'Elimina scena'});return;}confirmInPage('Eliminare questa scena?',()=>{workspace.scenes=workspace.scenes.filter(x=>x.id!==workspace.currentSceneId);workspace.currentSceneId=workspace.scenes[0].id;if(workspace.displaySceneId===s.id)workspace.displaySceneId=workspace.currentSceneId;save();render();},{title:'Elimina scena',okText:'Elimina'});});
    app.querySelector('[data-map-file]')?.addEventListener('change',ev=>{const file=ev.target.files&&ev.target.files[0];if(!file)return;const isVideo=String(file.type||'').startsWith('video/');const isImage=String(file.type||'').startsWith('image/');if(!isVideo&&!isImage){noticeInPage('Formato non supportato: carica un’immagine o un video.',{title:'Mappa / video'});return;}const reader=new FileReader();reader.onload=()=>{s.map=reader.result;s.mapType=isVideo?'video':'image';s.mapName=file.name||'';save();render();};reader.onerror=()=>noticeInPage('Impossibile caricare il file selezionato.',{title:'Mappa / video'});reader.readAsDataURL(file);});
    app.querySelector('[data-grid]')?.addEventListener('change',ev=>{s.grid=ev.target.checked;save();softRefreshStage(s);});
    app.querySelector('[data-grid-color]')?.addEventListener('input',ev=>{s.gridColor=ev.target.value;const stage=app.querySelector('[data-stage]');if(stage)stage.style.setProperty('--grid-line',s.gridColor);broadcast();});
    app.querySelector('[data-grid-color]')?.addEventListener('change',ev=>{s.gridColor=ev.target.value;save();softRefreshStage(s);});
    app.querySelector('[data-fog]')?.addEventListener('change',ev=>{s.fogOn=ev.target.checked;revealFromSelected(s);save();softRefreshStage(s);});
    app.querySelector('[data-show-barriers]')?.addEventListener('change',ev=>{s.showBarriers=ev.target.checked;save();softRefreshStage(s);});
    app.querySelectorAll('[data-tool]').forEach(btn=>btn.addEventListener('click',()=>{const next=btn.dataset.tool;tool=(tool===next?'move':next);updateToolButtons();}));
    app.querySelector('[data-clear-reveal]')?.addEventListener('click',()=>{confirmInPage('Cancellare le zone già esplorate della nebbia?',()=>{s.revealed=[];save();drawFog();},{title:'Cancella memoria nebbia',okText:'Cancella'});});
    app.querySelector('[data-clear-barriers]')?.addEventListener('click',()=>{confirmInPage('Cancellare tutte le barriere della scena?',()=>{s.barriers=[];s.selectedBarrier=null;save();render();},{title:'Cancella barriere',okText:'Cancella'});});
    app.querySelector('[data-clear-effects]')?.addEventListener('click',()=>{confirmInPage('Cancellare tutti gli effetti della scena?',()=>{s.effects=[];s.selectedEffect=null;save();render();},{title:'Cancella effetti',okText:'Cancella'});});
    bindMasterScreenSlider();
    bindSlider('[data-grid-cell-size]','gridCellSize','[data-grid-cell-size-out]',v=>`${v}px`,null,'--grid-cell-size');
    bindSlider('[data-grid-cols]','gridCols','[data-grid-cols-out]',v=>`${v}`,v=>Math.round(v),'--grid-cols');
    bindSlider('[data-grid-rows]','gridRows','[data-grid-rows-out]',v=>`${v}`,v=>Math.round(v),'--grid-rows');
    bindSlider('[data-grid-opacity]','gridOpacity','[data-grid-opacity-out]',v=>`${v}%`,v=>v/100,'--grid-opacity');
    bindSlider('[data-grid-x]','gridOffsetX','[data-grid-x-out]',v=>`${v}px`,null,'--grid-x');
    bindSlider('[data-grid-y]','gridOffsetY','[data-grid-y-out]',v=>`${v}px`,null,'--grid-y');
    bindSlider('[data-map-zoom]','mapZoom','[data-map-zoom-out]',v=>`${v}%`,v=>v/100,'--map-zoom');
    bindSlider('[data-map-x]','mapOffsetX','[data-map-x-out]',v=>`${v}%`,null,'--map-x');
    bindSlider('[data-map-y]','mapOffsetY','[data-map-y-out]',v=>`${v}%`,null,'--map-y');
    bindSlider('[data-fog-value]','fog','[data-fog-out]',v=>`${v}%`,v=>v/100,'--fog',true);
    bindSlider('[data-vision-radius]','visionRadius','[data-vision-out]',v=>`${v}px`,null,null,true);
    bindSlider('[data-effect-opacity]','effectOpacity','[data-effect-opacity-out]',v=>`${v}%`,v=>v/100,null);
    bindSlider('[data-effect-thickness]','effectThickness','[data-effect-thickness-out]',v=>`${v}px`,null,null);
    app.querySelectorAll('[data-add-token-kind]').forEach(btn=>btn.addEventListener('click',()=>showTokenSymbolPicker(btn.dataset.addTokenKind==='enemy'?'enemy':'player')));
    app.querySelector('[data-effect-vfx]')?.addEventListener('change',ev=>{s.effectVfx=VFX_TYPES.includes(ev.target.value)?ev.target.value:'fog';save();softRefreshStage(s);});
    app.querySelector('[data-effect-color]')?.addEventListener('input',ev=>{s.effectColor=ev.target.value;broadcast();});
    app.querySelector('[data-effect-color]')?.addEventListener('change',ev=>{s.effectColor=ev.target.value;save();softRefreshStage(s);});
    app.querySelectorAll('[data-delete-token],[data-delete-effect],[data-delete-barrier]').forEach(btn=>btn.addEventListener('click',ev=>{ev.preventDefault();ev.stopPropagation();deleteFromButton(btn,s,!!ev.target.closest('[data-stage]'));}));
    app.querySelectorAll('[data-select-token]').forEach(btn=>btn.addEventListener('click',ev=>{if(ev.target.closest('[data-delete-token]'))return;selectOnly(s,'token',Number(btn.dataset.selectToken));if(s.tokens[s.selectedToken]?.kind!=='enemy')revealFromSelected(s);save();softRefreshStage(s);}));
    app.querySelectorAll('[data-select-effect]').forEach(btn=>btn.addEventListener('click',ev=>{if(ev.target.closest('[data-delete-effect]'))return;selectOnly(s,'effect',Number(btn.dataset.selectEffect));save();softRefreshStage(s);}));
    app.querySelectorAll('[data-select-barrier]').forEach(btn=>btn.addEventListener('click',ev=>{if(ev.target.closest('[data-delete-barrier]'))return;selectOnly(s,'barrier',Number(btn.dataset.selectBarrier));save();softRefreshStage(s);}));
    if(!isDisplay)bindInitiativeTracker();
    if(stage&&!isDisplay)bindStage(stage,s);
  }

  function openInitiativeConditionDialog(entry,index){
    if(!entry)return;
    if(!Array.isArray(entry.conditions))entry.conditions=[];
    const existing=Number.isInteger(index)?entry.conditions[index]:null;
    document.querySelectorAll('.initiative-condition-backdrop').forEach(x=>x.remove());
    const wrap=document.createElement('div');
    wrap.className='initiative-condition-backdrop';
    wrap.innerHTML=`<div class="initiative-condition-modal" role="dialog" aria-modal="true" aria-label="Condizione">
      <button type="button" class="initiative-condition-x" data-cond-close aria-label="Chiudi">✕</button>
      <h3>${existing?'Modifica condizione':'Nuova condizione'}</h3>
      <label>Nome condizione<input data-cond-name value="${esc(existing?.name||'')}" placeholder="Es. Accecato, Stordito..."></label>
      <label>Descrizione<textarea data-cond-description rows="6" placeholder="Descrizione o appunti rapidi">${esc(existing?.description||'')}</textarea></label>
      <div class="initiative-condition-modal-actions">
        ${existing?'<button type="button" class="button danger-button" data-cond-delete>Elimina</button>':''}
        <button type="button" class="button ghost-button" data-cond-cancel>Annulla</button>
        <button type="button" class="button" data-cond-save>Salva</button>
      </div>
    </div>`;
    document.body.appendChild(wrap);
    const close=()=>wrap.remove();
    const name=wrap.querySelector('[data-cond-name]');
    const desc=wrap.querySelector('[data-cond-description]');
    setTimeout(()=>name?.focus(),20);
    wrap.querySelector('[data-cond-close]')?.addEventListener('click',close);
    wrap.querySelector('[data-cond-cancel]')?.addEventListener('click',close);
    wrap.addEventListener('click',ev=>{if(ev.target===wrap)close();});
    wrap.addEventListener('keydown',ev=>{if(ev.key==='Escape')close();});
    wrap.querySelector('[data-cond-delete]')?.addEventListener('click',()=>{
      if(existing)entry.conditions.splice(index,1);
      close();save();render();
    });
    wrap.querySelector('[data-cond-save]')?.addEventListener('click',()=>{
      const data={id:existing?.id||uid(),name:String(name?.value||'').trim()||'Condizione',description:String(desc?.value||'').trim()};
      if(existing)entry.conditions[index]=data;
      else entry.conditions.push(data);
      close();save();render();
    });
  }

  function bindInitiativeTracker(){
    const root=app.querySelector('[data-initiative-tracker]');
    if(!root)return;
    const init=workspace.initiative;
    const rerender=()=>{save();render();};
    root.querySelectorAll('[data-init-add]').forEach(btn=>btn.addEventListener('click',()=>{
      const type=btn.dataset.initAdd==='enemy'?'enemy':'ally';
      init.entries.push({id:uid(),type,name:type==='enemy'?'Nemico':'Alleato',init:0,ac:'',hp:'',hpMax:'',conditions:[]});
      init.active=Math.max(0,init.entries.length-1);
      rerender();
    }));
    root.querySelector('[data-init-next]')?.addEventListener('click',()=>{if(!init.entries.length)return;init.active=(init.active+1)%init.entries.length;rerender();});
    root.querySelector('[data-init-sort]')?.addEventListener('click',()=>{init.entries.sort((a,b)=>(Number(b.init)||0)-(Number(a.init)||0));init.active=0;rerender();});
    root.querySelectorAll('[data-init-set-current]').forEach(btn=>btn.addEventListener('click',()=>{init.active=Number(btn.dataset.initSetCurrent)||0;rerender();}));
    root.querySelectorAll('[data-init-up]').forEach(btn=>btn.addEventListener('click',()=>{const i=Number(btn.dataset.initUp);if(i<=0)return;[init.entries[i-1],init.entries[i]]=[init.entries[i],init.entries[i-1]];if(init.active===i)init.active=i-1;else if(init.active===i-1)init.active=i;rerender();}));
    root.querySelectorAll('[data-init-down]').forEach(btn=>btn.addEventListener('click',()=>{const i=Number(btn.dataset.initDown);if(i>=init.entries.length-1)return;[init.entries[i+1],init.entries[i]]=[init.entries[i],init.entries[i+1]];if(init.active===i)init.active=i+1;else if(init.active===i+1)init.active=i;rerender();}));
    root.querySelectorAll('[data-init-remove]').forEach(btn=>btn.addEventListener('click',ev=>{ev.preventDefault();ev.stopPropagation();const i=Number(btn.dataset.initRemove);if(!Number.isFinite(i)||i<0||i>=init.entries.length)return;init.entries.splice(i,1);if(init.active>=init.entries.length)init.active=Math.max(0,init.entries.length-1);rerender();}));
    root.querySelectorAll('[data-init-add-condition]').forEach(btn=>btn.addEventListener('click',ev=>{ev.stopPropagation();const i=Number(btn.dataset.initAddCondition);openInitiativeConditionDialog(init.entries[i],null);}));
    root.querySelectorAll('[data-init-edit-condition]').forEach(btn=>btn.addEventListener('click',ev=>{ev.stopPropagation();const [i,ci]=String(btn.dataset.initEditCondition||'').split(':').map(Number);openInitiativeConditionDialog(init.entries[i],ci);}));
    root.querySelectorAll('[data-init-row]').forEach(row=>{
      const i=Number(row.dataset.initRow);
      row.querySelectorAll('[data-init-field]').forEach(input=>{
        input.addEventListener('input',()=>{
          const entry=init.entries[i];if(!entry)return;
          const key=input.dataset.initField;
          entry[key]=key==='init'?(Number(input.value)||0):input.value;
          clearTimeout(input.__saveTimer);input.__saveTimer=setTimeout(save,250);
        });
        input.addEventListener('change',save);
        input.addEventListener('pointerdown',ev=>ev.stopPropagation());
      });
    });
  }
  function bindSlider(sel,key,outSel,format=x=>x,mapper=null,cssVar=null,redrawFog=false){
    const input=app.querySelector(sel);if(!input)return;const s=currentScene();const stage=app.querySelector('[data-stage]');
    app.querySelector('.tabletop-controls')?.addEventListener('scroll',ev=>{ev.currentTarget.dataset.scrollTop=String(ev.currentTarget.scrollTop);},{passive:true});const out=app.querySelector(outSel);
    let saveTimer=null;
    const apply=()=>{const raw=Number(input.value)||0;const val=mapper?mapper(raw):raw;s[key]=val;if(out)out.textContent=format(raw);if(cssVar&&stage)stage.style.setProperty(cssVar,(cssVar==='--grid-size'||cssVar==='--grid-cell-size'||cssVar==='--grid-x'||cssVar==='--grid-y')?`${val}px`:(cssVar==='--map-x'||cssVar==='--map-y'?`${val}%`:val));if(redrawFog){revealFromSelected(s);drawFog();}broadcast();clearTimeout(saveTimer);saveTimer=setTimeout(save,220);};
    input.addEventListener('input',apply,{passive:true});
    input.addEventListener('change',()=>{apply();save();});
    input.addEventListener('pointerdown',ev=>ev.stopPropagation());
  }

  function bindMasterScreenSlider(){
    const input=app.querySelector('[data-grid-size]');
    if(!input)return;
    const out=app.querySelector('[data-grid-size-out]');
    const scene=currentScene();
    const stage=app.querySelector('[data-stage]');
    let saveTimer=null;
    const apply=()=>{
      const raw=Number(input.value)||64;
      scene.gridSize=raw;
      if(out)out.textContent=`${raw}px`;
      if(stage&&!isDisplay)stage.style.setProperty('--master-stage-scale',String(raw/64));
      clearTimeout(saveTimer);
      saveTimer=setTimeout(save,220);
    };
    input.addEventListener('input',apply);
    input.addEventListener('change',()=>{apply();save();});
    input.addEventListener('pointerdown',ev=>ev.stopPropagation());
  }

  function dialogInPage(message,onOk,opts={}){
    const title=opts.title||'Conferma';
    const okText=opts.okText||'Conferma';
    const cancelText=opts.cancelText||'Annulla';
    document.querySelectorAll('.tabletop-confirm-backdrop').forEach(x=>x.remove());
    const wrap=document.createElement('div');
    wrap.className='tabletop-confirm-backdrop';
    wrap.innerHTML=`<div class="tabletop-confirm-box" role="dialog" aria-modal="true" aria-label="${esc(title)}">
      <button type="button" class="tabletop-confirm-x" data-confirm-cancel aria-label="Chiudi">✕</button>
      <h3>${esc(title)}</h3>
      <p>${esc(message)}</p>
      <div class="tabletop-confirm-actions">
        <button type="button" class="button ghost-button" data-confirm-cancel>${esc(cancelText)}</button>
        <button type="button" class="button danger-button" data-confirm-ok>${esc(okText)}</button>
      </div>
    </div>`;
    const close=()=>{wrap.remove();document.removeEventListener('keydown',onKey,true);};
    const onKey=ev=>{if(ev.key==='Escape'){ev.preventDefault();close();} if(ev.key==='Enter'){ev.preventDefault();wrap.querySelector('[data-confirm-ok]')?.click();}};
    wrap.addEventListener('click',ev=>{if(ev.target===wrap)close();});
    wrap.querySelectorAll('[data-confirm-cancel]').forEach(btn=>btn.addEventListener('click',ev=>{ev.preventDefault();close();}));
    wrap.querySelector('[data-confirm-ok]')?.addEventListener('click',ev=>{ev.preventDefault();const fn=onOk;close();if(typeof fn==='function')fn();});
    document.addEventListener('keydown',onKey,true);
    document.body.appendChild(wrap);
    requestAnimationFrame(()=>wrap.querySelector('[data-confirm-ok]')?.focus());
  }
  const confirmInPage=dialogInPage;
  function noticeInPage(message,opts={}){dialogInPage(message,null,{title:opts.title||'Avviso',okText:opts.okText||'Ok',cancelText:''});const modal=document.querySelector('.tabletop-confirm-backdrop');if(modal){const cancel=modal.querySelector('[data-confirm-cancel]');if(cancel)cancel.style.display='none';}}

  function requestFullscreenSafe(){const el=document.documentElement;if(!document.fullscreenElement){(el.requestFullscreen||el.webkitRequestFullscreen||el.msRequestFullscreen)?.call(el);}else{(document.exitFullscreen||document.webkitExitFullscreen||document.msExitFullscreen)?.call(document);}}
  async function saveScenesFile(saveAs=true){normalize();const data=JSON.stringify(workspace,null,2);const name=`thalor-scene-${new Date().toISOString().slice(0,10)}.json`;if(window.showSaveFilePicker){try{const handle=await window.showSaveFilePicker({suggestedName:name,types:[{description:'Gruppo scene Thalor',accept:{'application/json':['.json']}}]});const writable=await handle.createWritable();await writable.write(data);await writable.close();return;}catch(e){if(e&&e.name==='AbortError')return;}}const blob=new Blob([data],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},0);}
  function importScenesFile(ev){const file=ev.target.files&&ev.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{try{const data=JSON.parse(reader.result);if(data&&Array.isArray(data.scenes)){workspace=data;}else if(data&&typeof data==='object'){workspace={currentSceneId:null,displaySceneId:null,scenes:[Object.assign(freshScene('Scena importata'),data)]};}normalize();save();render();}catch(e){noticeInPage('File scene non valido.',{title:'Carica gruppo'});}};reader.readAsText(file);ev.target.value='';}


  function showTokenSymbolPicker(kind){
    const box=app.querySelector('[data-token-symbols]');
    if(!box)return startPendingToken(kind,TOKEN_SYMBOLS[kind][0]);
    box.hidden=false;
    box.innerHTML=`<p>Scegli simbolo e taglia ${kind==='enemy'?'nemico':'alleato'}, poi clicca sulla mappa.</p><label class="tabletop-token-size-picker"><span>Taglia</span><select data-token-size>${TOKEN_SIZES.map(n=>`<option value="${n}">${n}×${n} quadretti</option>`).join('')}</select></label><div class="tabletop-symbol-grid">${TOKEN_SYMBOLS[kind].map(sym=>`<button type="button" class="tabletop-symbol ${kind==='enemy'?'is-enemy':'is-player'}" data-pick-token-symbol="${esc(sym)}">${esc(sym)}</button>`).join('')}</div>`;
    box.querySelectorAll('[data-pick-token-symbol]').forEach(btn=>btn.addEventListener('click',()=>{const size=Number(box.querySelector('[data-token-size]')?.value)||1;startPendingToken(kind,btn.dataset.pickTokenSymbol||btn.textContent.trim()||TOKEN_SYMBOLS[kind][0],size);}));
  }
  function startPendingToken(kind,symbol,size=1){
    pendingToken={kind,symbol,size};
    tool='move';
    document.body.classList.add('tabletop-placing-token');
    tokenCursor=document.querySelector('.tabletop-token-cursor')||document.createElement('div');
    tokenCursor.className=`tabletop-token-cursor ${kind==='enemy'?'is-enemy':'is-player'}`;
    tokenCursor.textContent=symbol;
    tokenCursor.style.setProperty('--token-cells',String(size));
    document.body.appendChild(tokenCursor);
    window.addEventListener('pointermove',moveTokenCursor,{passive:true});
    window.addEventListener('keydown',cancelPendingTokenOnEsc);
  }
  function moveTokenCursor(ev){if(tokenCursor){tokenCursor.style.left=ev.clientX+'px';tokenCursor.style.top=ev.clientY+'px';}}
  function cancelPendingTokenOnEsc(ev){if(ev.key==='Escape')clearPendingToken();}
  function clearPendingToken(){pendingToken=null;document.body.classList.remove('tabletop-placing-token');if(tokenCursor){tokenCursor.remove();tokenCursor=null;}window.removeEventListener('pointermove',moveTokenCursor);window.removeEventListener('keydown',cancelPendingTokenOnEsc);}

  function selectOnly(s,type,i){
    s.selectedToken=null;
    s.selectedEffect=null;
    s.selectedBarrier=null;
    if(type==='token')s.selectedToken=i;
    if(type==='effect')s.selectedEffect=i;
    if(type==='barrier')s.selectedBarrier=i;
  }
  function clearAllSelection(s,stage=null){
    if(!s)return;
    s.selectedToken=null;
    s.selectedEffect=null;
    s.selectedBarrier=null;
    if(stage){
      stage.querySelectorAll('.is-selected').forEach(el=>el.classList.remove('is-selected'));
      stage.querySelectorAll('.tabletop-stage-selection-tools').forEach(el=>el.remove());
    }
  }
  function clearVisualSelection(stage){
    stage.querySelectorAll('.is-selected').forEach(el=>el.classList.remove('is-selected'));
  }
  function markVisualSelection(stage,type,i){
    clearVisualSelection(stage);
    const selector=type==='token'?`.tabletop-token[data-i="${i}"]`:type==='effect'?`[data-effects] [data-i="${i}"], .tabletop-effect[data-i="${i}"]`:`[data-barriers] [data-i="${i}"]`;
    stage.querySelectorAll(selector).forEach(el=>el.classList.add('is-selected'));
  }


  function pointInShapePercent(shape,p,stage){
    if(!shape||!p)return false;
    const hitPad=1.2;
    const distToSeg=(px,py,x1,y1,x2,y2)=>{
      const dx=x2-x1,dy=y2-y1,len2=dx*dx+dy*dy||1;
      const t=Math.max(0,Math.min(1,((px-x1)*dx+(py-y1)*dy)/len2));
      const x=x1+t*dx,y=y1+t*dy;
      return Math.hypot(px-x,py-y);
    };
    if(shape.type==='line'){
      const tol=Math.max(hitPad,(Number(shape.thickness)||18)/Math.max(1,stage.getBoundingClientRect().width)*100*.55);
      return distToSeg(p.x,p.y,Number(shape.x1)||0,Number(shape.y1)||0,Number(shape.x2)||0,Number(shape.y2)||0)<=tol;
    }
    if(shape.type==='rect'){
      const x=Number(shape.x)||0,y=Number(shape.y)||0,w=Number(shape.w)||0,h=Number(shape.h)||0;
      return p.x>=Math.min(x,x+w)-hitPad&&p.x<=Math.max(x,x+w)+hitPad&&p.y>=Math.min(y,y+h)-hitPad&&p.y<=Math.max(y,y+h)+hitPad;
    }
    if(shape.type==='circle'){
      const cx=Number(shape.cx)||0,cy=Number(shape.cy)||0,r=Math.max(0,Number(shape.r)||0);
      return Math.hypot(p.x-cx,p.y-cy)<=r+hitPad;
    }
    if(shape.type==='freehand'){
      const pts=Array.isArray(shape.points)?shape.points:[];
      const tol=Math.max(hitPad,(Number(shape.thickness)||18)/Math.max(1,stage.getBoundingClientRect().width)*100*.55);
      for(let i=1;i<pts.length;i++)if(distToSeg(p.x,p.y,pts[i-1].x,pts[i-1].y,pts[i].x,pts[i].y)<=tol)return true;
      return false;
    }
    return false;
  }
  function stageScene(){return isDisplay?displayScene():currentScene();}
  function pointInTokenPercent(token,p,stage){
    if(!token||!p)return false;
    const rect=stage.getBoundingClientRect();
    const cell=Number(stageScene()?.gridCellSize)||64;
    const size=Math.max(1,Number(token.size)||1);
    const halfX=(cell*size/Math.max(1,rect.width))*50;
    const halfY=(cell*size/Math.max(1,rect.height))*50;
    const x=Number(token.x)||0,y=Number(token.y)||0;
    return p.x>=x-halfX&&p.x<=x+halfX&&p.y>=y-halfY&&p.y<=y+halfY;
  }
  function pointInQuickEffectPercent(effect,p,stage){
    if(!effect||!p||!['fire','mist','ritual'].includes(effect.type))return false;
    const rect=stage.getBoundingClientRect();
    const cell=Number(stageScene()?.gridCellSize)||64;
    const cells=Math.max(1,Number(effect.sizeCells)||3);
    const halfX=(cell*cells/Math.max(1,rect.width))*50;
    const halfY=(cell*cells/Math.max(1,rect.height))*50;
    const x=Number(effect.x)||0,y=Number(effect.y)||0;
    return p.x>=x-halfX&&p.x<=x+halfX&&p.y>=y-halfY&&p.y<=y+halfY;
  }
  function stageHitAt(stage,s,p){
    /* Hit-test stretto e unico: nessun elemento viene selezionato se il click non cade davvero sopra la sua forma. */
    for(let i=(s.tokens||[]).length-1;i>=0;i--)if(pointInTokenPercent(s.tokens[i],p,stage))return {kind:'token',i};
    for(let i=(s.effects||[]).length-1;i>=0;i--){
      const e=s.effects[i];
      if(pointInShapePercent(e,p,stage))return {kind:'effect-shape',i};
    }
    for(let i=(s.barriers||[]).length-1;i>=0;i--)if(pointInShapePercent(s.barriers[i],p,stage))return {kind:'barrier',i};
    return null;
  }

  function bindStage(stage,s){
    let drag=null;
    stage.addEventListener('pointerdown',ev=>{
      if(ev.target.closest('.tabletop-delete')||ev.target.closest('.tabletop-stage-selection-tools'))return;
      if(performance.now()<suppressStageSelectionUntil){
        ev.preventDefault();
        ev.stopPropagation();
        clearAllSelection(s,stage);
        return;
      }
      const p=pointPercent(stage,ev);
      if(pendingToken){
        ev.preventDefault();ev.stopPropagation();
        selectOnly(s,null,null);
        s.tokens.push({label:pendingToken.symbol,kind:pendingToken.kind,x:p.x,y:p.y,size:pendingToken.size||1});
        if(pendingToken.kind!=='enemy'){s.selectedToken=s.tokens.length-1;revealFromSelected(s);selectOnly(s,null,null);}
        clearPendingToken();save();softRefreshStage(s);return;
      }
      if(tool!=='move'){
        const isEffect=tool.startsWith('effect-');
        drawing={category:isEffect?'effect':'barrier',type:tool.replace('barrier-','').replace('effect-',''),start:p,points:[p]};
        clearAllSelection(s,stage);
        ev.preventDefault();ev.stopPropagation();return;
      }
      const hit=stageHitAt(stage,s,p);
      if(!hit){ev.preventDefault();ev.stopPropagation();clearAllSelection(s,stage);save();softRefreshStage(s);return;}
      ev.preventDefault();ev.stopPropagation();
      if(hit.kind==='token'){
        selectOnly(s,'token',hit.i);markVisualSelection(stage,'token',hit.i);if(s.tokens[hit.i]?.kind!=='enemy')revealFromSelected(s);softRefreshStage(s,{tokens:false,fit:false});
        drag={kind:'token',i:hit.i,start:p,snapshot:cloneShape(s.tokens[hit.i])};
      }else if(hit.kind==='barrier'){
        selectOnly(s,'barrier',hit.i);markVisualSelection(stage,'barrier',hit.i);softRefreshStage(s,{tokens:false,fit:false});
        drag={kind:'barrier',i:hit.i,start:p,snapshot:cloneShape(s.barriers[hit.i])};
      }else{
        selectOnly(s,'effect',hit.i);markVisualSelection(stage,'effect',hit.i);softRefreshStage(s,{tokens:false,fit:false});
        drag={kind:hit.kind,i:hit.i,start:p,snapshot:cloneShape(s.effects[hit.i])};
      }
    });
    stage.addEventListener('pointermove',ev=>{
      if(drag){
        const p=pointPercent(stage,ev), dx=p.x-drag.start.x, dy=p.y-drag.start.y;
        if(drag.kind==='token'||drag.kind==='effect'){
          const arr=drag.kind==='token'?s.tokens:s.effects;
          if(arr[drag.i]){
            const base=drag.snapshot||arr[drag.i];
            const nx=clamp((Number(base.x)||0)+dx,0,100);
            const ny=clamp((Number(base.y)||0)+dy,0,100);
            arr[drag.i].x=nx;arr[drag.i].y=ny;
            const el=stage.querySelector(`${drag.kind==='token'?'.tabletop-token':'.tabletop-effect'}[data-i="${drag.i}"]`);
            if(el){el.style.left=nx+'%';el.style.top=ny+'%';}
            if(drag.kind==='token'&&arr[drag.i].kind!=='enemy')revealFromSelected(s);
            drawFog();broadcast();
          }
        }else if(drag.kind==='barrier'&&s.barriers[drag.i]){
          s.barriers[drag.i]=moveShape(drag.snapshot,dx,dy);refreshBarrierOverlay(stage,s);drawFog();broadcast();
        }else if(drag.kind==='effect-shape'&&s.effects[drag.i]){
          s.effects[drag.i]=moveShape(drag.snapshot,dx,dy);refreshEffectsOverlay(stage,s);broadcast();
        }
      }
      if(drawing){const p=pointPercent(stage,ev);if(drawing.type==='freehand'){const last=drawing.points[drawing.points.length-1];if(!last||Math.hypot(p.x-last.x,p.y-last.y)>.55)drawing.points.push(p);}drawShapePreview(stage,s,drawing,p);}
    });
    const finish=ev=>{
      if(drag){save();drag=null;softRefreshStage(s);return;}
      if(drawing){const end=pointPercent(stage,ev);const st=drawing.start;let b=null;
        if(drawing.type==='line'&&distPct(st,end)>.4)b={type:'line',x1:st.x,y1:st.y,x2:end.x,y2:end.y};
        if(drawing.type==='rect'&&distPct(st,end)>.4)b={type:'rect',x:Math.min(st.x,end.x),y:Math.min(st.y,end.y),w:Math.abs(end.x-st.x),h:Math.abs(end.y-st.y)};
        if(drawing.type==='circle'&&distPct(st,end)>.4){const rect=stage.getBoundingClientRect();b={type:'circle',cx:st.x,cy:st.y,r:circleRadiusPct(st,end,rect)};}
        if(drawing.type==='freehand'&&drawing.points.length>2)b={type:'freehand',points:drawing.points};
        if(b){
          if(drawing.category==='effect'){
            b={...b,color:s.effectColor,vfx:s.effectVfx,opacity:s.effectOpacity,thickness:s.effectThickness};
            s.effects.push(b);
          }else{
            s.barriers.push(b);
          }
          clearAllSelection(s,stage);
          suppressStageSelectionUntil=performance.now()+350;
        }
        drawing=null;tool='move';clearAllSelection(s,stage);save();softRefreshStage(s);}
    };
    stage.addEventListener('pointerup',finish);
    stage.addEventListener('pointercancel',()=>{drag=null;drawing=null;clearAllSelection(s,stage);softRefreshStage(s);});
  }
  function cloneShape(shape){return shape?JSON.parse(JSON.stringify(shape)):null;}
  function moveShape(shape,dx,dy){
    if(!shape)return shape;
    const b=cloneShape(shape);const addX=v=>clamp((Number(v)||0)+dx,0,100),addY=v=>clamp((Number(v)||0)+dy,0,100);
    if(b.type==='line'){b.x1=addX(b.x1);b.y1=addY(b.y1);b.x2=addX(b.x2);b.y2=addY(b.y2);}
    else if(b.type==='rect'){b.x=addX(b.x);b.y=addY(b.y);}
    else if(b.type==='circle'){b.cx=addX(b.cx);b.cy=addY(b.cy);}
    else if(b.type==='freehand'){b.points=(b.points||[]).map(p=>({x:addX(p.x),y:addY(p.y)}));}
    return b;
  }
  function pointPercent(stage,ev){
    const r=stage.getBoundingClientRect();
    const scene=isDisplay?displayScene():currentScene();
    const zoom=Math.max(.05,Number(scene.mapZoom)||1);
    const ox=(Number(scene.mapOffsetX)||0)/100*r.width;
    const oy=(Number(scene.mapOffsetY)||0)/100*r.height;
    const rawX=ev.clientX-r.left;
    const rawY=ev.clientY-r.top;
    const logicalX=(rawX-r.width/2-ox)/zoom+r.width/2;
    const logicalY=(rawY-r.height/2-oy)/zoom+r.height/2;
    return{x:clamp((logicalX/r.width)*100,0,100),y:clamp((logicalY/r.height)*100,0,100)};
  }
  function distPct(a,b){return Math.hypot((a.x-b.x),(a.y-b.y));}
  function drawBarrierPreview(stage,s,d,p){drawShapePreview(stage,s,{...d,category:'barrier'},p);}
  function drawShapePreview(stage,s,d,p){const svg=stage.querySelector(d.category==='effect'?'[data-effects]':'[data-barriers]');if(!svg)return;svg.classList.add('is-visible');const r=stageDrawRect(stage);svg.setAttribute('viewBox',`0 0 ${Math.max(1,r.width)} ${Math.max(1,r.height)}`);const w=Math.max(1,r.width),h=Math.max(1,r.height);let prev='';const cls=d.category==='effect'?'tabletop-effect-shape is-preview':'is-preview';const baseEffect={color:s.effectColor,vfx:s.effectVfx,opacity:s.effectOpacity,thickness:s.effectThickness};if(d.type==='line')prev=`<line class="${cls}" style="--effect-color:${esc(s.effectColor)};--effect-opacity:${s.effectOpacity};--effect-thickness:${s.effectThickness}" x1="${d.start.x/100*w}" y1="${d.start.y/100*h}" x2="${p.x/100*w}" y2="${p.y/100*h}"/>`;if(d.type==='rect')prev=`<rect class="${cls}" style="--effect-color:${esc(s.effectColor)};--effect-opacity:${s.effectOpacity};--effect-thickness:${s.effectThickness}" x="${Math.min(d.start.x,p.x)/100*w}" y="${Math.min(d.start.y,p.y)/100*h}" width="${Math.abs(p.x-d.start.x)/100*w}" height="${Math.abs(p.y-d.start.y)/100*h}"/>`;if(d.type==='circle'){const b={...baseEffect,type:'circle',cx:d.start.x,cy:d.start.y,r:circleRadiusPct(d.start,p,r)};prev=d.category==='effect'?effectShapePx(b,'preview',w,h,'is-preview'):barrierShapePx(b,'preview',w,h,'is-preview');}if(d.type==='freehand')prev=`<polyline class="${cls}" style="--effect-color:${esc(s.effectColor)};--effect-opacity:${s.effectOpacity};--effect-thickness:${s.effectThickness}" points="${d.points.map(q=>`${q.x/100*w},${q.y/100*h}`).join(' ')}"/>`;svg.innerHTML=(d.category==='effect'?effectsSVGPx(s,r):barriersSVGPx(s,r))+prev;}
  function circleRadiusPct(a,b,rect){const px=(a.x-b.x)/100*(rect.width||100),py=(a.y-b.y)/100*(rect.height||100);return Math.hypot(px,py)/Math.max(1,Math.min(rect.width||100,rect.height||100))*100;}
  function revealFromSelected(s){if(s.selectedToken==null||!s.tokens[s.selectedToken]||s.tokens[s.selectedToken].kind==='enemy')return;const t=s.tokens[s.selectedToken];const key=`${Math.round(t.x*10)/10},${Math.round(t.y*10)/10},${Math.round(s.visionRadius)}`;if(!s.revealed.some(r=>r.k===key))s.revealed.push({k:key,x:t.x,y:t.y,r:s.visionRadius});if(s.revealed.length>500)s.revealed=s.revealed.slice(-500);}

  function fitDisplayStage(){
    if(!isDisplay)return;
    const stage=app.querySelector('[data-stage]');
    if(!stage)return;
    const s=displayScene();
    const logicalW=Math.max(1,64*(Number(s.gridCols)||21));
    const logicalH=Math.max(1,64*(Number(s.gridRows)||12));
    const fit=Math.min(window.innerWidth/logicalW,window.innerHeight/logicalH);
    stage.style.setProperty('--stage-fit',String(Math.max(.01,fit)));
  }
  function observeStage(){const stage=app.querySelector('[data-stage]');if(!stage)return;if(resizeObserver)resizeObserver.disconnect();if('ResizeObserver'in window){resizeObserver=new ResizeObserver(()=>requestAnimationFrame(()=>{fitDisplayStage();refreshBarrierOverlay(stage,isDisplay?displayScene():currentScene());drawFog();}));resizeObserver.observe(stage);}const media=stage.querySelector('.tabletop-map');if(media){const refresh=()=>requestAnimationFrame(()=>{fitDisplayStage();refreshBarrierOverlay(stage,isDisplay?displayScene():currentScene());drawFog();});media.addEventListener('load',refresh,{once:true});media.addEventListener('loadedmetadata',refresh,{once:true});media.addEventListener('loadeddata',refresh,{once:true});if(media.tagName==='VIDEO'){media.muted=true;media.loop=true;media.playsInline=true;media.autoplay=true;const play=()=>media.play&&media.play().catch(()=>{});media.addEventListener('loadedmetadata',play,{once:true});media.addEventListener('canplay',play,{once:true});setTimeout(play,50);setTimeout(play,300);}}}
  function drawFog(){
    const stage=app.querySelector('[data-stage]');const canvas=app.querySelector('[data-fog-canvas]');if(!stage||!canvas)return;
    const s=isDisplay?displayScene():currentScene();
    const rect=stageDrawRect(stage);if(rect.width<2||rect.height<2)return;
    const dpr=window.devicePixelRatio||1;const w=Math.max(1,Math.round(rect.width*dpr));const h=Math.max(1,Math.round(rect.height*dpr));
    if(canvas.width!==w)canvas.width=w;if(canvas.height!==h)canvas.height=h;canvas.style.width=rect.width+'px';canvas.style.height=rect.height+'px';
    const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,rect.width,rect.height);if(!s.fogOn)return;
    ctx.fillStyle='rgba(0,0,0,1)';ctx.fillRect(0,0,rect.width,rect.height);

    // Memoria esplorata a luminosità fissa: le aree rivelate non si schiariscono più
    // cumulando passaggi sovrapposti del campo visivo.
    if(!fogMemoryCanvas)fogMemoryCanvas=document.createElement('canvas');
    fogMemoryCanvas.width=w;fogMemoryCanvas.height=h;
    const memoryMask=fogMemoryCanvas;
    const mctx=fogMemoryCtx&&fogMemoryCtx.canvas===memoryMask?fogMemoryCtx:(fogMemoryCtx=memoryMask.getContext('2d'));
    mctx.setTransform(dpr,0,0,dpr,0,0);
    mctx.clearRect(0,0,rect.width,rect.height);
    mctx.fillStyle='#fff';mctx.globalAlpha=1;
    (s.revealed||[]).forEach(r=>drawVisionArea(mctx,s,rect,r.x,r.y,r.r||s.visionRadius,false));
    const memoryClear=Math.max(.10,Math.min(.55,1-clamp(s.fog,0,1)));
    ctx.save();
    ctx.globalCompositeOperation='destination-out';
    ctx.globalAlpha=memoryClear;
    ctx.drawImage(memoryMask,0,0,rect.width,rect.height);
    ctx.restore();

    if(s.selectedToken!=null&&s.tokens[s.selectedToken]&&s.tokens[s.selectedToken].kind!=='enemy'){
      const t=s.tokens[s.selectedToken];
      ctx.save();
      ctx.globalCompositeOperation='destination-out';
      ctx.globalAlpha=1;
      drawVisionArea(ctx,s,rect,t.x,t.y,s.visionRadius,true);
      ctx.restore();
    }
    ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
  }
  function drawVisionArea(ctx,s,rect,xPct,yPct,radius,includeBarrierFill){
    const cx=xPct/100*rect.width,cy=yPct/100*rect.height;const segments=barrierSegmentsPx(s,rect);const points=[];const touched=new Set();
    const angles=[];for(let a=0;a<Math.PI*2;a+=Math.PI/120)angles.push(a);
    segments.forEach(seg=>{[[seg.x1,seg.y1],[seg.x2,seg.y2]].forEach(([x,y])=>{const a=Math.atan2(y-cy,x-cx);angles.push(a-.0008,a,a+.0008);});});
    angles.sort((a,b)=>a-b);
    for(const a of angles){const dx=Math.cos(a),dy=Math.sin(a);let dist=radius;let hitBarrier=null;for(const seg of segments){const hit=raySeg(cx,cy,dx,dy,seg.x1,seg.y1,seg.x2,seg.y2);if(hit&&hit.t<dist){dist=hit.t;hitBarrier=seg.bi;}}if(hitBarrier!=null)touched.add(hitBarrier);points.push([cx+dx*dist,cy+dy*dist]);}
    if(points.length){ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);for(const p of points)ctx.lineTo(p[0],p[1]);ctx.closePath();ctx.fillStyle='#fff';ctx.fill();}
    if(includeBarrierFill){s.barriers.forEach((b,i)=>{if(touched.has(i)||barrierNearVision(b,rect,cx,cy,radius)){ctx.save();ctx.globalAlpha=Math.max(ctx.globalAlpha,.82);fillBarrierInterior(ctx,b,rect);ctx.restore();}});}
  }
  function barrierSegmentsPx(s,rect){const out=[];(s.barriers||[]).forEach((b,bi)=>{barrierToSegments(b,rect).forEach(seg=>out.push({...seg,bi}));});return out;}
  function barrierToSegments(b,rect){
    const out=[];const px=p=>({x:p.x/100*rect.width,y:p.y/100*rect.height});
    if(b.type==='line')out.push({x1:b.x1/100*rect.width,y1:b.y1/100*rect.height,x2:b.x2/100*rect.width,y2:b.y2/100*rect.height});
    if(b.type==='rect'){const x=b.x/100*rect.width,y=b.y/100*rect.height,w=b.w/100*rect.width,h=b.h/100*rect.height;out.push({x1:x,y1:y,x2:x+w,y2:y},{x1:x+w,y1:y,x2:x+w,y2:y+h},{x1:x+w,y1:y+h,x2:x,y2:y+h},{x1:x,y1:y+h,x2:x,y2:y});}
    if(b.type==='circle'){const cx=b.cx/100*rect.width,cy=b.cy/100*rect.height,rr=b.r/100*Math.min(rect.width,rect.height);let last=null;for(let i=0;i<=48;i++){const a=i/48*Math.PI*2;const p={x:cx+Math.cos(a)*rr,y:cy+Math.sin(a)*rr};if(last)out.push({x1:last.x,y1:last.y,x2:p.x,y2:p.y});last=p;}}
    if(b.type==='freehand'){for(let i=1;i<b.points.length;i++){const a=px(b.points[i-1]),c=px(b.points[i]);out.push({x1:a.x,y1:a.y,x2:c.x,y2:c.y});}}
    return out;
  }
  function barrierNearVision(b,rect,cx,cy,radius){return barrierToSegments(b,rect).some(seg=>segPointDist(cx,cy,seg.x1,seg.y1,seg.x2,seg.y2)<=radius+2);}
  function fillBarrierInterior(ctx,b,rect){
    if(b.type==='rect'){ctx.fillRect(b.x/100*rect.width,b.y/100*rect.height,b.w/100*rect.width,b.h/100*rect.height);return;}
    if(b.type==='circle'){ctx.beginPath();ctx.arc(b.cx/100*rect.width,b.cy/100*rect.height,b.r/100*Math.min(rect.width,rect.height),0,Math.PI*2);ctx.fill();return;}
    if(b.type==='freehand'&&b.points.length>2){ctx.beginPath();ctx.moveTo(b.points[0].x/100*rect.width,b.points[0].y/100*rect.height);for(const p of b.points.slice(1))ctx.lineTo(p.x/100*rect.width,p.y/100*rect.height);ctx.closePath();ctx.fill();}
  }
  function segPointDist(px,py,x1,y1,x2,y2){const dx=x2-x1,dy=y2-y1;if(!dx&&!dy)return Math.hypot(px-x1,py-y1);const t=clamp(((px-x1)*dx+(py-y1)*dy)/(dx*dx+dy*dy),0,1);return Math.hypot(px-(x1+t*dx),py-(y1+t*dy));}
  function raySeg(rx,ry,rdx,rdy,x1,y1,x2,y2){const sx=x2-x1,sy=y2-y1;const den=rdx*sy-rdy*sx;if(Math.abs(den)<.00001)return null;const qpx=x1-rx,qpy=y1-ry;const t=(qpx*sy-qpy*sx)/den;const u=(qpx*rdy-qpy*rdx)/den;if(t>=0&&u>=0&&u<=1)return{t,u};return null;}
  if(channel)channel.onmessage=ev=>{
    if(!ev.data)return;
    if(ev.data.type==='display-ready'&&!isDisplay){resendWorkspaceToDisplay();return;}
    if(isDisplay&&ev.data.type==='workspace'){workspace=ev.data.workspace;normalize();const stage=app.querySelector('[data-stage]');const ds=displayScene();if(stage&&stage.dataset.mediaKey===stageMediaKey(ds))softRefreshStage(ds,{fit:true});else renderDisplayOnly();}
  };
  window.addEventListener('resize',()=>requestAnimationFrame(()=>{fitDisplayStage();refreshBarrierOverlay(app.querySelector('[data-stage]'),stageScene());drawFog();}));
  document.addEventListener('fullscreenchange',()=>document.body.classList.toggle('is-fullscreen',!!document.fullscreenElement));
  (async function(){if(!(await guard()))return;load();render();if(isDisplay)requestWorkspaceFromMaster();else broadcast();})();
})();


// v214 — Tracker condizioni robusto: elimina targhetta + hover descrizione
(function(){
  function ensureInitiativeState(){
    window.__thalorInitiative = window.__thalorInitiative || {entries:[],active:0};
    window.__thalorInitiative.entries = Array.isArray(window.__thalorInitiative.entries) ? window.__thalorInitiative.entries : [];
    window.__thalorInitiative.entries.forEach(entry=>{
      entry.conditions = Array.isArray(entry.conditions) ? entry.conditions : [];
    });
  }

  function escapeHtml(value){
    return String(value ?? '').replace(/[&<>"']/g, ch => ({
      '&':'&amp;',
      '<':'&lt;',
      '>':'&gt;',
      '"':'&quot;',
      "'":'&#39;'
    }[ch]));
  }

  function openConditionEditor(entryIndex, conditionIndex){
    ensureInitiativeState();
    const entry = window.__thalorInitiative.entries[entryIndex];
    if(!entry)return;

    const existing = conditionIndex >= 0 ? entry.conditions[conditionIndex] : {name:'', description:''};

    let backdrop = document.querySelector('.initiative-condition-modal-backdrop');
    if(backdrop)backdrop.remove();

    backdrop = document.createElement('div');
    backdrop.className = 'initiative-condition-modal-backdrop';
    backdrop.innerHTML = `
      <div class="initiative-condition-modal" role="dialog" aria-modal="true">
        <h3>${conditionIndex >= 0 ? 'Modifica condizione' : 'Aggiungi condizione'}</h3>
        <label>Nome condizione</label>
        <input class="condition-name-input" type="text" value="${escapeHtml(existing.name || '')}" placeholder="Es. Accecato">
        <label>Descrizione</label>
        <textarea class="condition-description-input" rows="5" placeholder="Descrizione/effetto della condizione">${escapeHtml(existing.description || '')}</textarea>
        <div class="initiative-condition-modal-actions">
          <button type="button" class="initiative-btn condition-cancel">Annulla</button>
          <button type="button" class="initiative-btn condition-save">Salva</button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);

    const close = () => backdrop.remove();

    backdrop.addEventListener('click', ev=>{
      if(ev.target === backdrop)close();
    });

    backdrop.querySelector('.condition-cancel').addEventListener('click', close);

    backdrop.querySelector('.condition-save').addEventListener('click', ()=>{
      const name = backdrop.querySelector('.condition-name-input').value.trim();
      const description = backdrop.querySelector('.condition-description-input').value.trim();

      if(!name){
        backdrop.querySelector('.condition-name-input').focus();
        return;
      }

      const next = {name, description};

      if(conditionIndex >= 0){
        entry.conditions[conditionIndex] = next;
      }else{
        entry.conditions.push(next);
      }

      close();
      if(typeof window.renderInitiativeTracker === 'function'){
        window.renderInitiativeTracker();
      }
    });

    setTimeout(()=>backdrop.querySelector('.condition-name-input')?.focus(), 0);
  }

  function renderConditionChips(entry, entryIndex){
    entry.conditions = Array.isArray(entry.conditions) ? entry.conditions : [];
    const chips = entry.conditions.map((cond, conditionIndex)=>{
      const name = escapeHtml(cond?.name || 'Condizione');
      const description = escapeHtml(cond?.description || '');
      return `
        <span class="initiative-condition-chip" data-entry-index="${entryIndex}" data-condition-index="${conditionIndex}" data-description="${description}" title="${description}">
          <span class="condition-chip-name">${name}</span>
          <button type="button" class="condition-chip-delete" data-entry-index="${entryIndex}" data-condition-index="${conditionIndex}" aria-label="Elimina condizione">×</button>
        </span>
      `;
    }).join('');

    return `
      <div class="initiative-conditions-list">
        ${chips}
        <button type="button" class="initiative-btn initiative-add-condition" data-entry-index="${entryIndex}">+ condizione</button>
      </div>
    `;
  }

  function enhanceRenderedTracker(){
    ensureInitiativeState();
    const rows = document.querySelectorAll('.initiative-item');
    rows.forEach((row, entryIndex)=>{
      const entry = window.__thalorInitiative.entries[entryIndex];
      if(!entry)return;

      let host = row.querySelector('.initiative-conditions-list') || row.querySelector('.initiative-conditions') || row.querySelector('[data-initiative-conditions]');
      if(!host){
        host = document.createElement('div');
        host.className = 'initiative-conditions-list';
        row.appendChild(host);
      }

      host.outerHTML = renderConditionChips(entry, entryIndex);
    });
  }

  function bindConditionDelegates(){
    if(window.__thalorConditionDelegatesBound)return;
    window.__thalorConditionDelegatesBound = true;

    document.addEventListener('click', ev=>{
      const del = ev.target.closest('.condition-chip-delete');
      if(del){
        ev.preventDefault();
        ev.stopPropagation();
        ensureInitiativeState();

        const entryIndex = Number(del.dataset.entryIndex);
        const conditionIndex = Number(del.dataset.conditionIndex);
        const entry = window.__thalorInitiative.entries[entryIndex];

        if(entry && Array.isArray(entry.conditions)){
          entry.conditions.splice(conditionIndex, 1);
          if(typeof window.renderInitiativeTracker === 'function'){
            window.renderInitiativeTracker();
          }
        }
        return;
      }

      const add = ev.target.closest('.initiative-add-condition');
      if(add){
        ev.preventDefault();
        ev.stopPropagation();
        openConditionEditor(Number(add.dataset.entryIndex), -1);
        return;
      }

      const chip = ev.target.closest('.initiative-condition-chip');
      if(chip){
        ev.preventDefault();
        ev.stopPropagation();
        openConditionEditor(Number(chip.dataset.entryIndex), Number(chip.dataset.conditionIndex));
      }
    });
  }

  const previousRender = window.renderInitiativeTracker;
  window.renderInitiativeTracker = function(){
    ensureInitiativeState();
    if(typeof previousRender === 'function'){
      previousRender.apply(this, arguments);
    }
    enhanceRenderedTracker();
  };

  bindConditionDelegates();

  window.addEventListener('load', ()=>{
    setTimeout(()=>{
      ensureInitiativeState();
      if(typeof window.renderInitiativeTracker === 'function'){
        window.renderInitiativeTracker();
      }
    }, 180);
  });
})();

