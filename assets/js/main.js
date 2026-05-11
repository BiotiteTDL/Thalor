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


// v43 mobile navigation
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".nav").forEach((nav) => {
    const btn = nav.querySelector(".nav-toggle");
    const links = nav.querySelector(".links");
    if (!btn || !links) return;

    btn.addEventListener("click", () => {
      const open = nav.classList.toggle("nav-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });

    links.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        nav.classList.remove("nav-open");
        btn.setAttribute("aria-expanded", "false");
      });
    });
  });
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



// v62 mobile nav
document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav .links");

  if (!navToggle || !links) return;

  navToggle.addEventListener("click", () => {
    links.classList.toggle("open");

    const expanded = links.classList.contains("open");
    navToggle.setAttribute("aria-expanded", expanded ? "true" : "false");
  });
});

