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
