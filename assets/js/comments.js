(() => {
  const API = '/api/comments'; 

  const stage = document.getElementById('commentStage');
  const tagFilter = document.getElementById('cmTagFilter');
  const density = document.getElementById('cmDensity');
  const pauseBtn = document.getElementById('cmPause');
  const shuffleBtn = document.getElementById('cmShuffle');

  const form = document.getElementById('commentForm');
  const nameEl = document.getElementById('cmName');
  const tagEl  = document.getElementById('cmTag');
  const textEl = document.getElementById('cmText');
  const hpEl   = document.getElementById('cmHp');
  const sendBtn= document.getElementById('cmSend');
  const noteEl = document.getElementById('cmNote');

  if (!stage) return;

  function userId() {
    let id = localStorage.getItem('comment_uid');
    if (!id) { id = (crypto.randomUUID?.() || Math.random().toString(36).slice(2)); localStorage.setItem('comment_uid', id); }
    return id;
  }

  let CLOUDS = [];
  let DATA = [];
  let paused = false;
  const cfg = { ampY: 14, ampX: 10 };

  const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
  const rand = (a,b)=>a+Math.random()*(b-a);

  async function loadList() {
    const tag = tagFilter?.value || 'All';
    const lim = Number(density?.value || 7);
    const url = `${API}?action=list&limit=${lim}&tag=${encodeURIComponent(tag)}`;
    const r = await fetch(url, { cache:'no-store' });
    const j = await r.json().catch(()=>null);
    if (j?.status === 'success') {
      DATA = j.items || [];
      renderClouds(DATA);
    }
  }

  function renderClouds(items) {
    stage.innerHTML = '';
    CLOUDS = [];
    const rect = stage.getBoundingClientRect();

    items.forEach((c, i) => {
      const el = document.createElement('div');
      el.className = 'cloud';
      el.innerHTML = `
        <div class="text">“${escapeHtml(c.text)}”</div>
        <div class="meta"><span class="dot"></span><span>${escapeHtml(c.name||'Anon')}</span>•<span>${escapeHtml(c.tag||'Other')}</span></div>
      `;
      stage.appendChild(el);

      const w = el.offsetWidth || 260;
      const h = el.offsetHeight || 88;

      let x = rand(8, rect.width - w - 8);
      let y = rand(8, rect.height - h - 8);
      el.style.transform = `translate(${x}px, ${y}px)`;

      const state = { el, w, h, x, y, baseX:x, baseY:y, t: rand(0, Math.PI*2), dragging:false, pause:false };
      enableDrag(state);
      CLOUDS.push(state);
    });
  }

  function enableDrag(s) {
    const el = s.el;
    let startX=0, startY=0, sx=0, sy=0;

    el.addEventListener('pointerdown', (ev)=>{
      s.dragging = true; s.pause = true;
      el.setPointerCapture(ev.pointerId);
      startX = ev.clientX; startY = ev.clientY;
      sx = s.x; sy = s.y;
    });
    window.addEventListener('pointermove', (ev)=>{
      if (!s.dragging) return;
      const rect = stage.getBoundingClientRect();
      s.x = clamp(sx + (ev.clientX - startX), 4, rect.width - s.w - 4);
      s.y = clamp(sy + (ev.clientY - startY), 4, rect.height - s.h - 4);
      s.baseX = s.x; s.baseY = s.y;
      el.style.transform = `translate(${s.x}px, ${s.y}px)`;
    });
    window.addEventListener('pointerup', (ev)=>{
      if (!s.dragging) return;
      s.dragging = false;
      setTimeout(()=> s.pause=false, 350);
      try { el.releasePointerCapture(ev.pointerId); } catch {}
    });
    el.addEventListener('mouseenter', ()=> s.pause = true);
    el.addEventListener('mouseleave', ()=> { if(!s.dragging) s.pause = false; });
  }

  let last = performance.now();
  function tick(now){
    const dt = now - last; last = now;
    if (!paused) {
      const rect = stage.getBoundingClientRect();
      CLOUDS.forEach(s=>{
        if (s.pause || s.dragging) return;
        s.t += 0.0025 * dt;
        const dx = Math.sin(s.t) * cfg.ampX;
        const dy = Math.cos(s.t*0.9) * cfg.ampY;
        s.x = clamp(s.baseX + dx, 4, rect.width - s.w - 4);
        s.y = clamp(s.baseY + dy, 4, rect.height - s.h - 4);
        s.el.style.transform = `translate(${s.x}px, ${s.y}px)`;
      });
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  tagFilter?.addEventListener('change', loadList);
  density?.addEventListener('input', loadList);
  pauseBtn?.addEventListener('click', ()=>{
    paused = !paused;
    pauseBtn.textContent = paused ? 'Resume' : 'Pause';
  });
  shuffleBtn?.addEventListener('click', ()=> loadList());

  window.addEventListener('resize', ()=>{
    const rect = stage.getBoundingClientRect();
    CLOUDS.forEach(s=>{
      s.x = clamp(s.x, 4, rect.width - s.w - 4);
      s.y = clamp(s.y, 4, rect.height - s.h - 4);
      s.baseX = s.x; s.baseY = s.y;
      s.el.style.transform = `translate(${s.x}px, ${s.y}px)`;
    });
  });

  form?.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const body = {
      action: 'submit',
      name: nameEl.value,
      tag: tagEl.value,
      text: textEl.value,
      user_id: userId(),
      hp: hpEl.value || ''
    };
    sendBtn.disabled = true;
    noteEl.textContent = 'Sending…';
    try {
      const r = await fetch(API, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
      const j = await r.json();
      if (j?.status === 'success') {
        noteEl.textContent = 'Thanks! Your comment is pending review.';
        textEl.value = '';
      } else {
        noteEl.textContent = j?.message || 'Failed to submit.';
      }
    } catch(err){
      noteEl.textContent = 'Network error.';
    } finally {
      sendBtn.disabled = false;
      setTimeout(()=> (noteEl.textContent = 'Comments are reviewed before appearing.'), 3000);
    }
  });

  function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

  loadList();
})();
