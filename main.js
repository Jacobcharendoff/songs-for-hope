(function(){
  // Async image loader — fetches base64-encoded image data and inflates to data: URIs
  // MIME types: 'png' is correct, JPGs MUST use 'jpeg' (not 'jpg') for strict browsers
  const types = {logo:'png', cover:'jpeg', opener:'jpeg', headline:'jpeg', venue:'jpeg', bob:'jpeg'};
  async function loadOne(name){
    try {
      const r = await fetch('./images/' + name + '.b64', {cache:'force-cache'});
      if(!r.ok) return null;
      const b64 = (await r.text()).trim();
      if(b64.length < 200) return null;
      return 'data:image/' + types[name] + ';base64,' + b64;
    } catch(e) { return null; }
  }
  const cache = {};
  async function applyImages(){
    const need = new Set();
    document.querySelectorAll('[data-img]').forEach(el => need.add(el.dataset.img));
    document.querySelectorAll('[data-bg]').forEach(el => need.add(el.dataset.bg));
    const results = await Promise.all([...need].map(async n => [n, await loadOne(n)]));
    results.forEach(([n,v]) => { if(v) cache[n] = v; });
    document.querySelectorAll('[data-img]').forEach(el => {
      if(cache[el.dataset.img]) el.src = cache[el.dataset.img];
    });
    document.querySelectorAll('[data-bg]').forEach(el => {
      if(cache[el.dataset.bg]) el.style.backgroundImage = "url('" + cache[el.dataset.bg] + "')";
    });
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', applyImages);
  } else { applyImages(); }
})();

(function(){
  // Scroll reveal
  const els = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, {threshold: 0.12, rootMargin: '0px 0px -8% 0px'});
  els.forEach(el => io.observe(el));

  // Number count-ups
  function countUp(el){
    const target = parseFloat(el.getAttribute('data-count'));
    const suffix = el.getAttribute('data-suffix') || '';
    const isFloat = target % 1 !== 0;
    const dur = 1500;
    const start = performance.now();
    const fmt = n => isFloat ? n.toFixed(1) : Math.round(n).toLocaleString('en-US');
    function frame(now){
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = fmt(target * eased) + suffix;
      const inner = el.querySelector('.unit, .pct');
      if(inner){
        el.firstChild.nodeValue = val.replace(suffix, '');
      } else {
        el.textContent = val;
      }
      if(t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  const nums = document.querySelectorAll('[data-count]');
  const nio = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ countUp(e.target); nio.unobserve(e.target); }
    });
  }, {threshold: 0.5});
  nums.forEach(el => nio.observe(el));

  // Bar fills
  const bars = document.querySelectorAll('.bar-fill[data-width]');
  const bio = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        const w = e.target.getAttribute('data-width');
        e.target.style.width = w + '%';
        bio.unobserve(e.target);
      }
    });
  }, {threshold: 0.4});
  bars.forEach(el => bio.observe(el));

  // Dot viz fill — 200 dots; lit dots represent the share in emergency shelter
  document.querySelectorAll('.dot-viz').forEach(grid => {
    if(grid.children.length) return;
    const total = 200;
    const lit = 117;
    const indices = new Set();
    while(indices.size < lit){ indices.add(Math.floor(Math.random()*total)); }
    for(let i=0;i<total;i++){
      const d = document.createElement('span');
      d.className = 'd' + (indices.has(i) ? ' lit' : '');
      d.style.transitionDelay = (i * 3) + 'ms';
      grid.appendChild(d);
    }
  });

  // Top-bar light/dark mode based on current section background
  const topbar = document.querySelector('.topbar');
  const lightIds = ['night','problem','work','partner'];
  const allSections = Array.from(document.querySelectorAll('section[id]'));
  function onScroll(){
    if(!topbar) return;
    let active = allSections[0];
    const y = window.scrollY + window.innerHeight * 0.4;
    for(const t of allSections){
      if(t.offsetTop <= y) active = t;
    }
    const id = active.id;
    const onLight = lightIds.includes(id) ||
      (id === 'problem' && y > active.offsetTop) ||
      (active.classList.contains('stats-chart'));
    topbar.classList.toggle('on-light', onLight);
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();
})();
