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
  const freshScene=(name='Scena')=>({id:uid(),name,map:'',grid:true,gridSize:64,gridCols:21,gridRows:12,gridOpacity:.35,gridColor:'#ead59a',mapZoom:1,mapOffsetX:0,mapOffsetY:0,fog:.68,fogOn:false,visionRadius:260,showBarriers:true,tokens:[],effects:[],barriers:[],revealed:[],selectedToken:null});
  let workspace={currentSceneId:null,displaySceneId:null,scenes:[]};
  let tool='move';
  let drawing=null;
  let resizeObserver=null;
  let pendingToken=null;
  let tokenCursor=null;
  const TOKEN_SYMBOLS={player:['◎','✦','◆','✚','⚔','☽','☼','⬟'],enemy:['☠','✦','◆','✘','⚔','☾','⬟','✹']};
  const TOKEN_SIZES=[1,2,3,4,5,6,8,10];
  const accordionState=JSON.parse(sessionStorage.getItem('thalor.tabletop.accordions')||'{}');
  function accOpen(id,def=true){return Object.prototype.hasOwnProperty.call(accordionState,id)?!!accordionState[id]:def;}
  function accAttr(id,def=true){return `data-accordion="${id}" ${accOpen(id,def)?'open':''}`;}
  function rememberAccordions(){app.querySelectorAll('[data-accordion]').forEach(d=>{accordionState[d.dataset.accordion]=d.open;});try{sessionStorage.setItem('thalor.tabletop.accordions',JSON.stringify(accordionState));}catch(e){}}

  function normalize(){
    if(!workspace||typeof workspace!=='object')workspace={currentSceneId:null,displaySceneId:null,scenes:[]};
    if(!Array.isArray(workspace.scenes))workspace.scenes=[];
    if(!workspace.scenes.length)workspace.scenes=[freshScene('Scena 1')];
    workspace.scenes.forEach((s,i)=>{
      s.id=s.id||uid();
      s.name=s.name||`Scena ${i+1}`;
      s.map=s.map||'';
      s.grid=s.grid!==false;
      s.gridSize=Number(s.gridSize)||64;
      s.gridCols=Number.isFinite(Number(s.gridCols))?clamp(Math.round(Number(s.gridCols)),8,60):21;
      s.gridRows=Number.isFinite(Number(s.gridRows))?clamp(Math.round(Number(s.gridRows)),6,40):12;
      s.gridOpacity=Number.isFinite(Number(s.gridOpacity))?Number(s.gridOpacity):.35;
      s.gridColor=/^#[0-9a-f]{6}$/i.test(String(s.gridColor||''))?s.gridColor:'#ead59a';
      s.mapZoom=Number.isFinite(Number(s.mapZoom))?clamp(Number(s.mapZoom),.25,4):1;
      s.mapOffsetX=Number.isFinite(Number(s.mapOffsetX))?clamp(Number(s.mapOffsetX),-100,100):0;
      s.mapOffsetY=Number.isFinite(Number(s.mapOffsetY))?clamp(Number(s.mapOffsetY),-100,100):0;
      s.fog=Number.isFinite(Number(s.fog))?Number(s.fog):.68;
      s.fogOn=!!s.fogOn;
      s.visionRadius=Number(s.visionRadius)||260;
      s.showBarriers=s.showBarriers!==false;
      s.tokens=Array.isArray(s.tokens)?s.tokens:[];
      s.effects=Array.isArray(s.effects)?s.effects:[];
      s.barriers=Array.isArray(s.barriers)?s.barriers:[];
      s.revealed=Array.isArray(s.revealed)?s.revealed:[];
      s.tokens.forEach((t,ti)=>{t.label=t.label||`T${ti+1}`;t.kind=t.kind==='enemy'?'enemy':'player';t.x=Number.isFinite(Number(t.x))?Number(t.x):50;t.y=Number.isFinite(Number(t.y))?Number(t.y):50;t.size=TOKEN_SIZES.includes(Number(t.size))?Number(t.size):1;});
      s.effects.forEach(e=>{e.type=e.type||'mist';e.x=Number.isFinite(Number(e.x))?Number(e.x):50;e.y=Number.isFinite(Number(e.y))?Number(e.y):50;e.size=Number(e.size)||180;e.opacity=Number.isFinite(Number(e.opacity))?Number(e.opacity):.62;});
      s.barriers=s.barriers.map(normalizeBarrier).filter(Boolean);
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
  function currentScene(){normalize();return workspace.scenes.find(s=>s.id===workspace.currentSceneId)||workspace.scenes[0];}
  function displayScene(){normalize();return workspace.scenes.find(s=>s.id===workspace.displaySceneId)||currentScene();}
  function save(){normalize();try{localStorage.setItem(STORAGE,JSON.stringify(workspace));}catch(e){} broadcast();}
  function load(){
    try{const raw=localStorage.getItem(STORAGE)||localStorage.getItem(OLD_STORAGE);if(raw)workspace=Object.assign(workspace,JSON.parse(raw));}catch(e){}
    try{if(!workspace.scenes.length){const raw=localStorage.getItem(LEGACY);if(raw){const old=JSON.parse(raw);const s=freshScene('Scena 1');Object.assign(s,old);s.id=uid();s.name='Scena 1';workspace={currentSceneId:s.id,displaySceneId:s.id,scenes:[s]};}}}catch(e){}
    normalize();
  }
  function broadcast(){if(channel)channel.postMessage({type:'workspace',workspace});}
  function isMaster(){try{return !!(window.ThalorAuth&&window.ThalorAuth.isMaster&&window.ThalorAuth.isMaster());}catch(e){return false;}}
  async function guard(){
    try{if(window.ThalorAuth&&window.ThalorAuth.init)await window.ThalorAuth.init();}catch(e){}
    if(isMaster()||isDisplay)return true;
    app.innerHTML=`<section class="tabletop-denied sheet-theme-panel"><div class="dynamic-crest">☽</div><h1 class="section-title">Tavolo Master</h1><p class="section-note">Questa sezione è riservata ai Master. Effettua l'accesso con un profilo Master per visualizzarla.</p><div class="actions"><a class="button" href="auth.html">Vai ad Accesso</a><a class="button ghost-button" href="index.html">Torna alla Home</a></div></section>`;
    document.body.classList.remove('tabletop-display-mode');
    return false;
  }

  function sceneOptions(selectedId){return workspace.scenes.map((s,i)=>`<option value="${esc(s.id)}" ${s.id===selectedId?'selected':''}>${esc(s.name||`Scena ${i+1}`)}</option>`).join('');}
  function render(){
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
          <details class="tabletop-accordion" ${accAttr('map',true)}><summary>Mappa e griglia</summary>
            <label class="tabletop-file"><span>Mappa</span><input type="file" accept="image/*" data-map-file></label>
            <label class="tabletop-inline"><span>Griglia</span><input type="checkbox" data-grid ${s.grid?'checked':''}></label>
            <label><span>Colore griglia</span><input type="color" value="${esc(s.gridColor)}" data-grid-color></label>
            <label><span>Dimensione griglia <output data-grid-size-out>${s.gridSize}px</output></span><input type="range" min="24" max="180" value="${s.gridSize}" data-grid-size></label>
            <label><span>Quadretti orizzontali <output data-grid-cols-out>${s.gridCols}</output></span><input type="range" min="8" max="60" value="${s.gridCols}" data-grid-cols></label>
            <label><span>Quadretti verticali <output data-grid-rows-out>${s.gridRows}</output></span><input type="range" min="6" max="40" value="${s.gridRows}" data-grid-rows></label>
            <label><span>Opacità griglia <output data-grid-opacity-out>${Math.round(s.gridOpacity*100)}%</output></span><input type="range" min="0" max="100" value="${Math.round(s.gridOpacity*100)}" data-grid-opacity></label>
            <label><span>Zoom mappa <output data-map-zoom-out>${Math.round(s.mapZoom*100)}%</output></span><input type="range" min="25" max="400" value="${Math.round(s.mapZoom*100)}" data-map-zoom></label>
            <label><span>Aggiustamento orizzontale <output data-map-x-out>${s.mapOffsetX}%</output></span><input type="range" min="-100" max="100" value="${s.mapOffsetX}" data-map-x></label>
            <label><span>Aggiustamento verticale <output data-map-y-out>${s.mapOffsetY}%</output></span><input type="range" min="-100" max="100" value="${s.mapOffsetY}" data-map-y></label>
          </details>
          <details class="tabletop-accordion" ${accAttr('fog',true)}><summary>Fog of War</summary>
            <label class="tabletop-inline"><span>Nebbia di guerra</span><input type="checkbox" data-fog ${s.fogOn?'checked':''}></label>
            <label><span>Opacità nebbia <output data-fog-out>${Math.round(s.fog*100)}%</output></span><input type="range" min="0" max="95" value="${Math.round(s.fog*100)}" data-fog-value></label>
            <label><span>Campo visivo token <output data-vision-out>${s.visionRadius}px</output></span><input type="range" min="80" max="900" value="${s.visionRadius}" data-vision-radius></label>
            <label class="tabletop-inline"><span>Mostra barriere master</span><input type="checkbox" data-show-barriers ${s.showBarriers?'checked':''}></label>
            <div class="tabletop-tools tabletop-tools-wide"><button class="button ${tool==='move'?'is-active':''}" data-tool="move">Muovi</button><button class="button ${tool==='barrier-line'?'is-active':''}" data-tool="barrier-line">Barriera linea</button><button class="button ${tool==='barrier-rect'?'is-active':''}" data-tool="barrier-rect">Barriera forma</button><button class="button ${tool==='barrier-circle'?'is-active':''}" data-tool="barrier-circle">Barriera cerchio</button><button class="button ${tool==='barrier-freehand'?'is-active':''}" data-tool="barrier-freehand">Mano libera</button><button class="button danger-button" data-clear-barriers>Cancella barriere</button><button class="button ghost-button" data-clear-reveal>Reset nebbia</button></div>
            <div class="tabletop-list"><h3>Barriere</h3>${barrierListHTML(s)}</div>
          </details>
          <details class="tabletop-accordion" ${accAttr('tokens',true)}><summary>Miniature</summary>
            <div class="tabletop-tools"><button class="button" data-add-token-kind="player">+ Alleato</button><button class="button danger-button" data-add-token-kind="enemy">+ Nemico</button></div><div class="tabletop-token-symbols" data-token-symbols hidden></div>
            <div class="tabletop-list"><h3>Miniature</h3>${tokenListHTML(s)}</div>
          </details>
          <details class="tabletop-accordion" ${accAttr('effects',false)}><summary>Effetti</summary>
            <div class="tabletop-tools"><button class="button" data-add-effect="fire">Fuoco</button><button class="button" data-add-effect="mist">Nebbia</button><button class="button" data-add-effect="ritual">Rituale</button></div>
            <div class="tabletop-list"><h3>Effetti</h3>${effectListHTML(s)}</div>
          </details>
          <p class="tabletop-help">Le miniature nemiche non generano campo visivo. Barriere linea/forma/cerchio/mano libera bloccano il campo visivo; ciò che è già stato visto resta più scuro.</p>
        </aside>
        <section class="tabletop-stage-card sheet-theme-panel">${stageHTML(s)}</section>
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
    requestAnimationFrame(()=>{const controls=app.querySelector('.tabletop-controls');if(controls)controls.scrollTop=previousControlsScroll;window.scrollTo({top:previousWindowScroll,left:0,behavior:'instant'});refreshBarrierOverlay(app.querySelector('[data-stage]'),isDisplay?displayScene():currentScene());drawFog();});
  }
  function renderDisplayOnly(){
    normalize();
    document.body.classList.add('tabletop-display-mode');
    document.documentElement.classList.add('tabletop-display-mode');
    let stageCard=app.querySelector('.tabletop-stage-card');
    if(!stageCard){render();return;}
    stageCard.classList.remove('sheet-theme-panel');
    stageCard.innerHTML=stageHTML(displayScene())+'<button class="tabletop-display-fullscreen" data-display-fullscreen title="Fullscreen">⛶</button>';
    bind();
    observeStage();
    requestAnimationFrame(()=>{refreshBarrierOverlay(app.querySelector('[data-stage]'),displayScene());drawFog();});
  }
  function tokenListHTML(s){return s.tokens.length?s.tokens.map((t,i)=>`<button class="tabletop-list-row ${s.selectedToken===i?'is-selected':''}" data-select-token="${i}"><span>${t.kind==='enemy'?'Nemico':'Miniatura'} — ${esc(t.label)} (${t.size||1}×${t.size||1})</span><b data-delete-token="${i}" title="Elimina">✕</b></button>`).join(''):'<p>Nessuna miniatura.</p>';}
  function effectListHTML(s){return s.effects.length?s.effects.map((e,i)=>`<button class="tabletop-list-row" data-select-effect="${i}"><span>${esc(e.type)}</span><b data-delete-effect="${i}" title="Elimina">✕</b></button>`).join(''):'<p>Nessun effetto.</p>';}
  function barrierListHTML(s){return s.barriers.length?s.barriers.map((b,i)=>`<button class="tabletop-list-row"><span>${esc(barrierName(b,i))}</span><b data-delete-barrier="${i}" title="Elimina">✕</b></button>`).join(''):'<p>Nessuna barriera.</p>';}
  function barrierName(b,i){return `${i+1}. ${b.type==='line'?'Linea':b.type==='rect'?'Forma':b.type==='circle'?'Cerchio':'Mano libera'}`;}
  function stageHTML(s){
    return `<div class="tabletop-stage" data-stage style="--grid-size:${s.gridSize}px;--grid-cols:${s.gridCols};--grid-rows:${s.gridRows};--grid-opacity:${s.gridOpacity};--grid-line:${esc(s.gridColor)};--map-zoom:${s.mapZoom};--map-x:${s.mapOffsetX}%;--map-y:${s.mapOffsetY}%;--fog:${s.fog};">
      ${s.map?`<img class="tabletop-map" src="${esc(s.map)}" alt="Mappa del tavolo">`:`<div class="tabletop-empty"><strong>Nessuna mappa caricata</strong><span>Carica un'immagine dai controlli Master.</span></div>`}
      <div class="tabletop-grid ${s.grid?'is-visible':''}"></div>
      <canvas class="tabletop-fog-canvas ${s.fogOn?'is-visible':''}" data-fog-canvas></canvas>
      <svg class="tabletop-barriers ${s.showBarriers&&!isDisplay?'is-visible':''}" data-barriers preserveAspectRatio="none"></svg>
      <div class="tabletop-layer" data-layer>
        ${s.effects.map((e,i)=>`<div class="tabletop-effect effect-${esc(e.type)}" data-kind="effect" data-i="${i}" style="left:${e.x}%;top:${e.y}%;width:${e.size}px;height:${e.size}px;opacity:${e.opacity}"><button class="tabletop-delete" data-delete-effect="${i}" title="Elimina effetto">✕</button></div>`).join('')}
        ${s.tokens.map((t,i)=>`<div class="tabletop-token ${t.kind==='enemy'?'is-enemy':''} ${s.selectedToken===i?'is-selected':''}" data-kind="token" data-i="${i}" style="left:${t.x}%;top:${t.y}%;--token-cells:${t.size||1}"><span>${esc(t.label)}</span><button class="tabletop-delete" data-delete-token="${i}" title="Elimina token">✕</button></div>`).join('')}
      </div>
    </div>`;
  }
  function barriersSVG(s){return barriersSVGPx(s,app.querySelector('[data-stage]')?.getBoundingClientRect()||{width:100,height:100});}
  function barriersSVGPx(s,rect){const w=Math.max(1,rect.width||100),h=Math.max(1,rect.height||100);return (s.barriers||[]).map((b,i)=>barrierShapePx(b,i,w,h)).join('');}
  function barrierShapePx(b,i,w,h,extraClass=''){
    const cls=extraClass?` class="${extraClass}"`:'';
    if(b.type==='rect')return `<rect${cls} data-i="${i}" x="${b.x/100*w}" y="${b.y/100*h}" width="${b.w/100*w}" height="${b.h/100*h}"/>`;
    if(b.type==='circle'){const r=b.r/100*Math.min(w,h);return `<circle${cls} data-i="${i}" cx="${b.cx/100*w}" cy="${b.cy/100*h}" r="${r}"/>`;}
    if(b.type==='freehand')return `<polyline${cls} data-i="${i}" points="${b.points.map(p=>`${p.x/100*w},${p.y/100*h}`).join(' ')}"/>`;
    return `<line${cls} data-i="${i}" x1="${b.x1/100*w}" y1="${b.y1/100*h}" x2="${b.x2/100*w}" y2="${b.y2/100*h}"/>`;
  }
  function refreshBarrierOverlay(stage,s){const svg=stage?.querySelector('[data-barriers]');if(!svg)return;const r=stage.getBoundingClientRect();svg.setAttribute('viewBox',`0 0 ${Math.max(1,r.width)} ${Math.max(1,r.height)}`);svg.innerHTML=barriersSVGPx(s,r);}

  function bind(){
    const s=currentScene();const stage=app.querySelector('[data-stage]');
    app.querySelectorAll('[data-accordion]').forEach(d=>d.addEventListener('toggle',()=>{accordionState[d.dataset.accordion]=d.open;try{sessionStorage.setItem('thalor.tabletop.accordions',JSON.stringify(accordionState));}catch(e){}}));
    app.querySelector('.tabletop-controls')?.addEventListener('scroll',ev=>{ev.currentTarget.dataset.scrollTop=String(ev.currentTarget.scrollTop);},{passive:true});
    app.querySelector('[data-open-display]')?.addEventListener('click',()=>window.open(location.pathname+'?display=1','thalor-display','popup=yes,width=1280,height=720'));
    app.querySelector('[data-display-fullscreen]')?.addEventListener('click',()=>requestFullscreenSafe());
    app.querySelector('[data-save]')?.addEventListener('click',()=>{save();alert('Tavolo salvato in locale.');});
    app.querySelector('[data-reset]')?.addEventListener('click',()=>{if(confirm('Resettare tutto il Tavolo Master?')){workspace={currentSceneId:null,displaySceneId:null,scenes:[freshScene('Scena 1')]};normalize();save();render();}});
    app.querySelector('[data-save-group]')?.addEventListener('click',()=>saveScenesFile(false));
    app.querySelector('[data-save-group-as]')?.addEventListener('click',()=>saveScenesFile(true));
    app.querySelector('[data-import-scenes]')?.addEventListener('change',importScenesFile);
    app.querySelector('[data-current-scene]')?.addEventListener('change',ev=>{workspace.currentSceneId=ev.target.value;save();render();});
    app.querySelector('[data-display-scene]')?.addEventListener('change',ev=>{workspace.displaySceneId=ev.target.value;save();render();});
    app.querySelector('[data-add-scene]')?.addEventListener('click',()=>{rememberAccordions();const ns=freshScene(`Scena ${workspace.scenes.length+1}`);workspace.scenes.push(ns);workspace.currentSceneId=ns.id;workspace.displaySceneId=ns.id;save();render();});
    app.querySelector('[data-clone-scene]')?.addEventListener('click',()=>{const base=currentScene();const copy=JSON.parse(JSON.stringify(base));copy.id=uid();copy.name=(base.name||'Scena')+' copia';workspace.scenes.push(copy);workspace.currentSceneId=copy.id;save();render();});
    app.querySelector('[data-rename-scene]')?.addEventListener('click',()=>{const scene=currentScene();const name=prompt('Nuovo nome scena:',scene.name);if(name!==null){scene.name=name.trim()||scene.name;save();render();}});
    app.querySelector('[data-delete-scene]')?.addEventListener('click',()=>{if(workspace.scenes.length<=1){alert('Deve rimanere almeno una scena.');return;}if(confirm('Eliminare questa scena?')){workspace.scenes=workspace.scenes.filter(x=>x.id!==workspace.currentSceneId);workspace.currentSceneId=workspace.scenes[0].id;if(workspace.displaySceneId===s.id)workspace.displaySceneId=workspace.currentSceneId;save();render();}});
    app.querySelector('[data-map-file]')?.addEventListener('change',ev=>{const file=ev.target.files&&ev.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{s.map=reader.result;save();render();};reader.readAsDataURL(file);});
    app.querySelector('[data-grid]')?.addEventListener('change',ev=>{s.grid=ev.target.checked;save();render();});
    app.querySelector('[data-grid-color]')?.addEventListener('input',ev=>{s.gridColor=ev.target.value;const stage=app.querySelector('[data-stage]');if(stage)stage.style.setProperty('--grid-line',s.gridColor);broadcast();});
    app.querySelector('[data-grid-color]')?.addEventListener('change',ev=>{s.gridColor=ev.target.value;save();render();});
    app.querySelector('[data-fog]')?.addEventListener('change',ev=>{s.fogOn=ev.target.checked;revealFromSelected(s);save();render();});
    app.querySelector('[data-show-barriers]')?.addEventListener('change',ev=>{s.showBarriers=ev.target.checked;save();render();});
    app.querySelectorAll('[data-tool]').forEach(btn=>btn.addEventListener('click',()=>{tool=btn.dataset.tool;render();}));
    app.querySelector('[data-clear-reveal]')?.addEventListener('click',()=>{if(confirm('Cancellare le zone già esplorate della nebbia?')){s.revealed=[];save();drawFog();}});
    app.querySelector('[data-clear-barriers]')?.addEventListener('click',()=>{if(confirm('Cancellare tutte le barriere della scena?')){s.barriers=[];save();render();}});
    bindSlider('[data-grid-size]','gridSize','[data-grid-size-out]',v=>`${v}px`,null,'--grid-size');
    bindSlider('[data-grid-cols]','gridCols','[data-grid-cols-out]',v=>`${v}`,v=>Math.round(v),'--grid-cols');
    bindSlider('[data-grid-rows]','gridRows','[data-grid-rows-out]',v=>`${v}`,v=>Math.round(v),'--grid-rows');
    bindSlider('[data-grid-opacity]','gridOpacity','[data-grid-opacity-out]',v=>`${v}%`,v=>v/100,'--grid-opacity');
    bindSlider('[data-map-zoom]','mapZoom','[data-map-zoom-out]',v=>`${v}%`,v=>v/100,'--map-zoom');
    bindSlider('[data-map-x]','mapOffsetX','[data-map-x-out]',v=>`${v}%`,null,'--map-x');
    bindSlider('[data-map-y]','mapOffsetY','[data-map-y-out]',v=>`${v}%`,null,'--map-y');
    bindSlider('[data-fog-value]','fog','[data-fog-out]',v=>`${v}%`,v=>v/100,'--fog',true);
    bindSlider('[data-vision-radius]','visionRadius','[data-vision-out]',v=>`${v}px`,null,null,true);
    app.querySelectorAll('[data-add-token-kind]').forEach(btn=>btn.addEventListener('click',()=>showTokenSymbolPicker(btn.dataset.addTokenKind==='enemy'?'enemy':'player')));
    app.querySelectorAll('[data-add-effect]').forEach(btn=>btn.addEventListener('click',()=>{s.effects.push({type:btn.dataset.addEffect,x:50,y:50,size:180,opacity:.62});save();render();}));
    app.querySelectorAll('[data-delete-token]').forEach(btn=>btn.addEventListener('click',ev=>{ev.preventDefault();ev.stopPropagation();const i=Number(btn.dataset.deleteToken);s.tokens.splice(i,1);if(s.selectedToken===i)s.selectedToken=null;else if(s.selectedToken>i)s.selectedToken--;save();render();}));
    app.querySelectorAll('[data-delete-effect]').forEach(btn=>btn.addEventListener('click',ev=>{ev.preventDefault();ev.stopPropagation();s.effects.splice(Number(btn.dataset.deleteEffect),1);save();render();}));
    app.querySelectorAll('[data-delete-barrier]').forEach(btn=>btn.addEventListener('click',ev=>{ev.preventDefault();ev.stopPropagation();s.barriers.splice(Number(btn.dataset.deleteBarrier),1);save();render();}));
    app.querySelectorAll('[data-select-token]').forEach(btn=>btn.addEventListener('click',ev=>{if(ev.target.closest('[data-delete-token]'))return;s.selectedToken=Number(btn.dataset.selectToken);if(s.tokens[s.selectedToken]?.kind!=='enemy')revealFromSelected(s);save();render();}));
    if(stage&&!isDisplay)bindStage(stage,s);
  }
  function bindSlider(sel,key,outSel,format=x=>x,mapper=null,cssVar=null,redrawFog=false){
    const input=app.querySelector(sel);if(!input)return;const s=currentScene();const stage=app.querySelector('[data-stage]');
    app.querySelector('.tabletop-controls')?.addEventListener('scroll',ev=>{ev.currentTarget.dataset.scrollTop=String(ev.currentTarget.scrollTop);},{passive:true});const out=app.querySelector(outSel);
    let saveTimer=null;
    const apply=()=>{const raw=Number(input.value)||0;const val=mapper?mapper(raw):raw;s[key]=val;if(out)out.textContent=format(raw);if(cssVar&&stage)stage.style.setProperty(cssVar,cssVar==='--grid-size'?`${val}px`:(cssVar==='--map-x'||cssVar==='--map-y'?`${val}%`:val));if(redrawFog){revealFromSelected(s);drawFog();}broadcast();clearTimeout(saveTimer);saveTimer=setTimeout(save,220);};
    input.addEventListener('input',apply,{passive:true});
    input.addEventListener('change',()=>{apply();save();});
    input.addEventListener('pointerdown',ev=>ev.stopPropagation());
  }
  function requestFullscreenSafe(){const el=document.documentElement;if(!document.fullscreenElement){(el.requestFullscreen||el.webkitRequestFullscreen||el.msRequestFullscreen)?.call(el);}else{(document.exitFullscreen||document.webkitExitFullscreen||document.msExitFullscreen)?.call(document);}}
  async function saveScenesFile(saveAs=true){normalize();const data=JSON.stringify(workspace,null,2);const name=`thalor-scene-${new Date().toISOString().slice(0,10)}.json`;if(window.showSaveFilePicker){try{const handle=await window.showSaveFilePicker({suggestedName:name,types:[{description:'Gruppo scene Thalor',accept:{'application/json':['.json']}}]});const writable=await handle.createWritable();await writable.write(data);await writable.close();return;}catch(e){if(e&&e.name==='AbortError')return;}}const blob=new Blob([data],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},0);}
  function importScenesFile(ev){const file=ev.target.files&&ev.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{try{const data=JSON.parse(reader.result);if(data&&Array.isArray(data.scenes)){workspace=data;}else if(data&&typeof data==='object'){workspace={currentSceneId:null,displaySceneId:null,scenes:[Object.assign(freshScene('Scena importata'),data)]};}normalize();save();render();}catch(e){alert('File scene non valido.');}};reader.readAsText(file);}


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

  function bindStage(stage,s){
    let drag=null;
    stage.querySelectorAll('[data-kind]').forEach(el=>{
      el.addEventListener('pointerdown',ev=>{if(ev.target.closest('.tabletop-delete'))return;ev.preventDefault();ev.stopPropagation();el.setPointerCapture?.(ev.pointerId);const kind=el.dataset.kind;const i=Number(el.dataset.i);if(kind==='token'){s.selectedToken=i;revealFromSelected(s);drawFog();}drag={el,kind,i};});
    });
    stage.addEventListener('pointerdown',ev=>{
      if(ev.target.closest('[data-kind]')||ev.target.closest('.tabletop-delete'))return;
      if(pendingToken){
        const p=pointPercent(stage,ev);
        s.tokens.push({label:pendingToken.symbol,kind:pendingToken.kind,x:p.x,y:p.y,size:pendingToken.size||1});
        s.selectedToken=s.tokens.length-1;
        if(pendingToken.kind!=='enemy')revealFromSelected(s);
        clearPendingToken();
        save();render();
        ev.preventDefault();ev.stopPropagation();
        return;
      }
      if(tool!=='move'){
        const p=pointPercent(stage,ev);
        drawing={type:tool.replace('barrier-',''),start:p,points:[p]};
        ev.preventDefault();ev.stopPropagation();
      }
    });
    stage.addEventListener('pointermove',ev=>{
      if(drag){const p=pointPercent(stage,ev);const arr=drag.kind==='token'?s.tokens:s.effects;if(arr[drag.i]){arr[drag.i].x=p.x;arr[drag.i].y=p.y;drag.el.style.left=p.x+'%';drag.el.style.top=p.y+'%';if(drag.kind==='token')revealFromSelected(s);drawFog();broadcast();}}
      if(drawing){const p=pointPercent(stage,ev);if(drawing.type==='freehand'){const last=drawing.points[drawing.points.length-1];if(!last||Math.hypot(p.x-last.x,p.y-last.y)>.55)drawing.points.push(p);}drawBarrierPreview(stage,s,drawing,p);}
    });
    const finish=ev=>{
      if(drag){save();drag=null;render();return;}
      if(drawing){const end=pointPercent(stage,ev);const st=drawing.start;let b=null;
        if(drawing.type==='line'&&distPct(st,end)>.4)b={type:'line',x1:st.x,y1:st.y,x2:end.x,y2:end.y};
        if(drawing.type==='rect'&&distPct(st,end)>.4)b={type:'rect',x:Math.min(st.x,end.x),y:Math.min(st.y,end.y),w:Math.abs(end.x-st.x),h:Math.abs(end.y-st.y)};
        if(drawing.type==='circle'&&distPct(st,end)>.4){const rect=stage.getBoundingClientRect();b={type:'circle',cx:st.x,cy:st.y,r:circleRadiusPct(st,end,rect)};}
        if(drawing.type==='freehand'&&drawing.points.length>2)b={type:'freehand',points:drawing.points};
        if(b)s.barriers.push(b);drawing=null;save();render();}
    };
    stage.addEventListener('pointerup',finish);
    stage.addEventListener('pointercancel',()=>{drag=null;drawing=null;render();});
    stage.querySelector('[data-barriers]')?.addEventListener('dblclick',ev=>{const target=ev.target.closest('[data-i]');if(!target)return;s.barriers.splice(Number(target.dataset.i),1);save();render();});
  }
  function pointPercent(stage,ev){const r=stage.getBoundingClientRect();return{x:clamp(((ev.clientX-r.left)/r.width)*100,0,100),y:clamp(((ev.clientY-r.top)/r.height)*100,0,100)};}
  function distPct(a,b){return Math.hypot((a.x-b.x),(a.y-b.y));}
  function drawBarrierPreview(stage,s,d,p){const svg=stage.querySelector('[data-barriers]');if(!svg)return;svg.classList.add('is-visible');const r=stage.getBoundingClientRect();svg.setAttribute('viewBox',`0 0 ${Math.max(1,r.width)} ${Math.max(1,r.height)}`);const w=Math.max(1,r.width),h=Math.max(1,r.height);let prev='';if(d.type==='line')prev=`<line class="is-preview" x1="${d.start.x/100*w}" y1="${d.start.y/100*h}" x2="${p.x/100*w}" y2="${p.y/100*h}"/>`;if(d.type==='rect')prev=`<rect class="is-preview" x="${Math.min(d.start.x,p.x)/100*w}" y="${Math.min(d.start.y,p.y)/100*h}" width="${Math.abs(p.x-d.start.x)/100*w}" height="${Math.abs(p.y-d.start.y)/100*h}"/>`;if(d.type==='circle'){const b={type:'circle',cx:d.start.x,cy:d.start.y,r:circleRadiusPct(d.start,p,r)};prev=barrierShapePx(b,'preview',w,h,'is-preview');}if(d.type==='freehand')prev=`<polyline class="is-preview" points="${d.points.map(q=>`${q.x/100*w},${q.y/100*h}`).join(' ')}"/>`;svg.innerHTML=barriersSVGPx(s,r)+prev;}
  function circleRadiusPct(a,b,rect){const px=(a.x-b.x)/100*(rect.width||100),py=(a.y-b.y)/100*(rect.height||100);return Math.hypot(px,py)/Math.max(1,Math.min(rect.width||100,rect.height||100))*100;}
  function revealFromSelected(s){if(s.selectedToken==null||!s.tokens[s.selectedToken]||s.tokens[s.selectedToken].kind==='enemy')return;const t=s.tokens[s.selectedToken];const key=`${Math.round(t.x*10)/10},${Math.round(t.y*10)/10},${Math.round(s.visionRadius)}`;if(!s.revealed.some(r=>r.k===key))s.revealed.push({k:key,x:t.x,y:t.y,r:s.visionRadius});if(s.revealed.length>500)s.revealed=s.revealed.slice(-500);}

  function observeStage(){const stage=app.querySelector('[data-stage]');if(!stage)return;if(resizeObserver)resizeObserver.disconnect();if('ResizeObserver'in window){resizeObserver=new ResizeObserver(()=>requestAnimationFrame(()=>{refreshBarrierOverlay(stage,isDisplay?displayScene():currentScene());drawFog();}));resizeObserver.observe(stage);}const img=stage.querySelector('.tabletop-map');if(img)img.addEventListener('load',()=>requestAnimationFrame(()=>{refreshBarrierOverlay(stage,isDisplay?displayScene():currentScene());drawFog();}),{once:true});}
  function drawFog(){
    const stage=app.querySelector('[data-stage]');const canvas=app.querySelector('[data-fog-canvas]');if(!stage||!canvas)return;
    const s=isDisplay?displayScene():currentScene();
    const rect=stage.getBoundingClientRect();if(rect.width<2||rect.height<2)return;
    const dpr=window.devicePixelRatio||1;const w=Math.max(1,Math.round(rect.width*dpr));const h=Math.max(1,Math.round(rect.height*dpr));
    if(canvas.width!==w)canvas.width=w;if(canvas.height!==h)canvas.height=h;canvas.style.width=rect.width+'px';canvas.style.height=rect.height+'px';
    const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,rect.width,rect.height);if(!s.fogOn)return;
    ctx.fillStyle='rgba(0,0,0,1)';ctx.fillRect(0,0,rect.width,rect.height);

    // Memoria esplorata a luminosità fissa: le aree rivelate non si schiariscono più
    // cumulando passaggi sovrapposti del campo visivo.
    const memoryMask=document.createElement('canvas');
    memoryMask.width=w;memoryMask.height=h;
    const mctx=memoryMask.getContext('2d');
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
  if(channel)channel.onmessage=ev=>{if(!isDisplay)return;if(ev.data&&ev.data.type==='workspace'){workspace=ev.data.workspace;normalize();renderDisplayOnly();}};
  window.addEventListener('resize',()=>requestAnimationFrame(drawFog));
  document.addEventListener('fullscreenchange',()=>document.body.classList.toggle('is-fullscreen',!!document.fullscreenElement));
  (async function(){if(!(await guard()))return;load();render();broadcast();})();
})();
