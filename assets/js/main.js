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
