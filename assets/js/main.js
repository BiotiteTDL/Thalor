document.addEventListener('DOMContentLoaded', () => {
  const wrap = document.querySelector('.map-wrap.zoomable');
  if (!wrap) return;
  const img = wrap.querySelector('img');
  const lens = document.createElement('div');
  lens.className = 'lens';
  wrap.appendChild(lens);
  const zoom = 4.2;

  function move(e) {
    const rect = img.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) { lens.style.display = 'none'; return; }
    lens.style.display = 'block';
    const size = lens.offsetWidth;
    lens.style.left = `${x - size/2}px`;
    lens.style.top = `${y - size/2}px`;
    lens.style.backgroundSize = `${rect.width * zoom}px ${rect.height * zoom}px`;
    lens.style.backgroundPosition = `${-(x * zoom - size/2)}px ${-(y * zoom - size/2)}px`;
  }
  wrap.addEventListener('mousemove', move);
  wrap.addEventListener('touchmove', move, {passive:true});
  wrap.addEventListener('mouseleave', () => lens.style.display = 'none');
});


// v55 open archive document details from hash
document.addEventListener("DOMContentLoaded", () => {
  const hash = window.location.hash ? window.location.hash.slice(1) : "";
  if (!hash) return;
  const target = document.getElementById(hash);
  if (!target) return;
  const details = target.tagName && target.tagName.toLowerCase() === "details"
    ? target
    : target.closest("details");
  if (details) details.open = true;
  setTimeout(() => target.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
});





// v64 mobile nav robust
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".nav").forEach(function (nav) {
    const toggle = nav.querySelector(".nav-toggle");
    const links = nav.querySelector(".links");
    if (!toggle || !links) return;

    toggle.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();

      const isOpen = nav.classList.toggle("nav-open");
      links.classList.toggle("open", isOpen);
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    links.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("nav-open");
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  });

  document.addEventListener("click", function (event) {
    document.querySelectorAll(".nav.nav-open").forEach(function (nav) {
      if (nav.contains(event.target)) return;
      const toggle = nav.querySelector(".nav-toggle");
      const links = nav.querySelector(".links");
      nav.classList.remove("nav-open");
      if (links) links.classList.remove("open");
      if (toggle) toggle.setAttribute("aria-expanded", "false");
    });
  });
});


// v68: pulsanti scheda dentro le card personaggi senza rompere il link al profilo
document.addEventListener('DOMContentLoaded', function(){
  document.querySelectorAll('[data-sheet-href]').forEach(function(btn){
    function go(e){ e.preventDefault(); e.stopPropagation(); window.location.href = btn.getAttribute('data-sheet-href'); }
    btn.addEventListener('click', go);
    btn.addEventListener('keydown', function(e){ if(e.key === 'Enter' || e.key === ' '){ go(e); } });
  });
});

// v69: su mobile/back-forward cache ricarica i dati dinamici; le immagini restano cacheabili dal browser.
window.addEventListener('pageshow', function(event){
  try{
    if(!event.persisted || navigator.onLine === false) return;
    var key = 'thalor.bfcache.reload.' + location.pathname + location.search;
    if(sessionStorage.getItem(key) === '1') return;
    sessionStorage.setItem(key, '1');
    location.reload();
  }catch(e){}
});
window.addEventListener('beforeunload', function(){
  try{
    var prefix = 'thalor.bfcache.reload.';
    Object.keys(sessionStorage).forEach(function(k){ if(k.indexOf(prefix)===0) sessionStorage.removeItem(k); });
  }catch(e){}
});


// v190: link Tavolo Master visibile solo con permessi Master già verificati
(function(){
  function isLocalPreview(){
    var h=String(location.hostname||'').toLowerCase();
    var pr=String(location.protocol||'').toLowerCase();
    return pr==='file:'||h===''||h==='localhost'||h==='127.0.0.1'||h==='::1'||/^192\.168\./.test(h)||/^10\./.test(h)||/^172\.(1[6-9]|2\d|3[0-1])\./.test(h);
  }
  function shouldShowMasterLink(){
    try{
      if(window.ThalorAuth && typeof window.ThalorAuth.isMaster==='function') return !!window.ThalorAuth.isMaster();
      if(localStorage.getItem('thalor.masterNav')==='1') return true;
      if(isLocalPreview() && (localStorage.getItem('thalor.offlineMaster')==='1'||sessionStorage.getItem('thalor.offlineMaster')==='1')) return true;
    }catch(e){}
    return false;
  }
  function ensureMasterLinks(){
    document.querySelectorAll('.nav .links').forEach(function(links){
      var href=(location.pathname.indexOf('/archivio/')>-1||location.pathname.indexOf('/diario/')>-1||location.pathname.indexOf('/luoghi/')>-1||location.pathname.indexOf('/personaggi/')>-1)?'../tavolo-master.html':'tavolo-master.html';
      var link=links.querySelector('.master-nav-link');
      if(!link){
        link=document.createElement('a');
        link.className='master-nav-link';
        link.href=href;
        link.textContent='Tavolo Master';
        link.hidden=true;
        var auth=links.querySelector('.auth-nav-link');
        links.insertBefore(link,auth||null);
      }
      link.hidden=!shouldShowMasterLink();
    });
  }
  document.addEventListener('DOMContentLoaded',function(){
    ensureMasterLinks();
    if(window.ThalorAuth && typeof window.ThalorAuth.init==='function'){
      window.ThalorAuth.init().finally(ensureMasterLinks);
    }
  });
  window.addEventListener('thalor-auth-changed',ensureMasterLinks);
  window.addEventListener('thalor-local-master-changed',ensureMasterLinks);
})();

// v210: Lore linking automatico globale (sicuro, sola lettura)
(function(){
  if (window.__thalorLoreLinkerInstalled) return;
  window.__thalorLoreLinkerInstalled = true;

  var LINKER_VERSION = '210';
  var MAX_LINKS_PER_ENTITY = 4;
  var processedAttr = 'data-thalor-linked-v' + LINKER_VERSION;
  var scheduled = false;
  var observer = null;

  function getRootPrefix(){
    var path = String(location.pathname || '');
    var idx = path.toLowerCase().indexOf('/thalor/');
    if (idx >= 0) path = path.slice(idx + '/Thalor/'.length);
    else path = path.replace(/^\/+/, '');
    var parts = path.split('/').filter(Boolean);
    if (!parts.length) return '';
    parts.pop();
    return parts.map(function(){ return '../'; }).join('');
  }

  function normalizeApostrophes(s){
    return String(s || '').replace(/[’‘`´]/g, "'");
  }

  function escRegExp(s){
    return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function wordPattern(label){
    var safe = escRegExp(normalizeApostrophes(label).trim());
    safe = safe.replace(/\s+/g, '\\s+');
    return safe.replace(/'/g, "['’‘`´]");
  }

  function currentKey(){
    var path = String(location.pathname || '').toLowerCase();
    var search = String(location.search || '').toLowerCase();
    var idMatch = search.match(/[?&](?:id|character)=([^&]+)/);
    if (idMatch) return decodeURIComponent(idMatch[1]);
    var file = path.split('/').pop() || '';
    return file.replace(/\.html$/, '').replace(/index$/, path.indexOf('/valkren/') > -1 ? 'valkren' : '');
  }

  function buildEntities(){
    var root = getRootPrefix();
    var chars = [
      ['Abraxas','abraxas'],
      ['Igor','igor'],
      ['Ralph Mengele','ralph'], ['Ralph','ralph'],
      ['Arolf Thelir','arolf'], ['Arolf','arolf'],
      ['Irven Till, Blightborn','irven'], ['Irven Till Blightborn','irven'], ['Irven Till','irven'], ['Irven','irven'],
      ['Varek Thorm','varek'], ['Varek','varek'],
      ['Lyria Thorm','lyria'], ['Lyria','lyria'],
      ['Otmar Van Verschuer','otmar'], ['Otmar','otmar'],
      ['Abdul Alhazred','abdul'], ['Abdul','abdul']
    ].map(function(x){
      return { label:x[0], key:x[1], category:'character', href:root + 'personaggi/dettaglio.html?id=' + encodeURIComponent(x[1]) };
    });

    var places = [
      ['L’Insenno di Valkren','valkren','luoghi/valkren/index.html'],
      ["L'Insenno di Valkren",'valkren','luoghi/valkren/index.html'],
      ['Insenno di Valkren','valkren','luoghi/valkren/index.html'],
      ['Valkren','valkren','luoghi/valkren/index.html'],
      ['Villa Thorm','valkren','luoghi/valkren/index.html'],
      ['Mausoleo dei Thorm','valkren','luoghi/valkren/index.html'],
      ['Cappella Abbandonata','valkren','luoghi/valkren/index.html'],
      ['Portogrigio','portogrigio','luoghi/portogrigio.html'],
      ['Accademia di Medicina di Portogrigio','accademia-medicina','luoghi/portogrigio/accademia-medicina.html'],
      ['Accademia di Medicina','accademia-medicina','luoghi/portogrigio/accademia-medicina.html'],
      ['Accademia','accademia-medicina','luoghi/portogrigio/accademia-medicina.html']
    ].map(function(x){
      return { label:x[0], key:x[1], category:'place', href:root + x[2] };
    });

    var seen = Object.create(null);
    return chars.concat(places)
      .filter(function(e){
        var k = normalizeApostrophes(e.label).toLowerCase() + '|' + e.href;
        if (seen[k]) return false;
        seen[k] = true;
        return true;
      })
      .sort(function(a,b){ return b.label.length - a.label.length; });
  }

  function isInsideBlockedElement(node){
    var el = node && node.parentElement;
    while (el) {
      var tag = (el.tagName || '').toUpperCase();
      if (tag === 'A' || tag === 'SCRIPT' || tag === 'STYLE' || tag === 'TEXTAREA' || tag === 'INPUT' || tag === 'SELECT' || tag === 'OPTION' || tag === 'BUTTON' || tag === 'CODE' || tag === 'PRE' || tag === 'NOSCRIPT') return true;
      if (el.isContentEditable) return true;
      if (el.classList && (
        el.classList.contains('no-lore-link') ||
        el.classList.contains('master-edit-bar') ||
        el.classList.contains('edit-modal') ||
        el.classList.contains('modal') ||
        el.classList.contains('floating-actions') ||
        el.classList.contains('character-editor') ||
        el.classList.contains('sheet-editor')
      )) return true;
      if (el.getAttribute && el.getAttribute('data-no-lore-link') === 'true') return true;
      el = el.parentElement;
    }
    return false;
  }

  function sameDestination(href){
    var a = document.createElement('a');
    a.href = href;
    return a.pathname === location.pathname && a.search === location.search;
  }

  function linkTextNode(textNode, entities, counts){
    if (!textNode || !textNode.nodeValue || textNode.nodeValue.trim().length < 3) return false;
    if (isInsideBlockedElement(textNode)) return false;

    var original = textNode.nodeValue;
    var normalized = normalizeApostrophes(original);
    var matches = [];

    entities.forEach(function(ent){
      if (sameDestination(ent.href)) return;
      var countKey = ent.category + ':' + ent.key;
      if ((counts[countKey] || 0) >= MAX_LINKS_PER_ENTITY) return;
      var re = new RegExp('(^|[^\\p{L}\\p{N}_])(' + wordPattern(ent.label) + ')(?=$|[^\\p{L}\\p{N}_])', 'giu');
      var m;
      while ((m = re.exec(normalized)) !== null) {
        var start = m.index + (m[1] ? m[1].length : 0);
        var end = start + m[2].length;
        if (!matches.some(function(x){ return start < x.end && end > x.start; })) {
          matches.push({ start:start, end:end, ent:ent });
          counts[countKey] = (counts[countKey] || 0) + 1;
          break;
        }
      }
    });

    if (!matches.length) return false;
    matches.sort(function(a,b){ return a.start - b.start; });

    var frag = document.createDocumentFragment();
    var pos = 0;
    matches.forEach(function(match){
      if (match.start > pos) frag.appendChild(document.createTextNode(original.slice(pos, match.start)));
      var a = document.createElement('a');
      a.className = 'lore-link lore-link-auto';
      a.href = match.ent.href;
      a.setAttribute('data-lore-auto', 'true');
      a.setAttribute('data-lore-key', match.ent.key);
      a.setAttribute('data-lore-category', match.ent.category);
      a.title = match.ent.category === 'place' ? 'Apri luogo: ' + match.ent.label : 'Apri personaggio: ' + match.ent.label;
      a.textContent = original.slice(match.start, match.end);
      frag.appendChild(a);
      pos = match.end;
    });
    if (pos < original.length) frag.appendChild(document.createTextNode(original.slice(pos)));
    textNode.parentNode.replaceChild(frag, textNode);
    return true;
  }

  function runLinker(){
    scheduled = false;
    var root = document.querySelector('main.page') || document.querySelector('main') || document.body;
    if (!root || root.getAttribute(processedAttr) === 'running') return;
    root.setAttribute(processedAttr, 'running');
    var entities = buildEntities();
    var counts = Object.create(null);
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function(node){
        if (!node.nodeValue || node.nodeValue.trim().length < 3) return NodeFilter.FILTER_REJECT;
        if (isInsideBlockedElement(node)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = [];
    var node;
    while ((node = walker.nextNode())) nodes.push(node);
    nodes.forEach(function(n){ linkTextNode(n, entities, counts); });
    root.setAttribute(processedAttr, 'done');
  }

  function scheduleLinker(delay){
    if (scheduled) return;
    scheduled = true;
    window.setTimeout(runLinker, delay || 80);
  }

  function installObserver(){
    var root = document.querySelector('main.page') || document.querySelector('main') || document.body;
    if (!root || observer) return;
    observer = new MutationObserver(function(mutations){
      var useful = mutations.some(function(m){
        return Array.prototype.some.call(m.addedNodes || [], function(n){
          return n.nodeType === 1 || n.nodeType === 3;
        });
      });
      if (useful) {
        if (root.removeAttribute) root.removeAttribute(processedAttr);
        scheduleLinker(160);
      }
    });
    observer.observe(root, { childList:true, subtree:true });
  }

  document.addEventListener('DOMContentLoaded', function(){
    scheduleLinker(120);
    window.setTimeout(scheduleLinker, 700);
    installObserver();
  });
  window.ThalorLoreLinker = {
    refresh: function(){
      var root = document.querySelector('main.page') || document.querySelector('main') || document.body;
      if (root && root.removeAttribute) root.removeAttribute(processedAttr);
      scheduleLinker(20);
    }
  };
})();
