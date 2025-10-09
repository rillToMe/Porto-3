(() => {
  const audio  = document.getElementById('bgm');
  const toggle = document.getElementById('bgmToggle');
  if (!audio || !toggle) return;

  const PREF_KEY = 'bgm_pref';
  const VOL_KEY  = 'bgm_vol';

  const savedVol = parseFloat(localStorage.getItem(VOL_KEY) ?? '0.25');
  const baseVol  = Number.isFinite(savedVol) ? Math.min(Math.max(savedVol,0),1) : 0.25;
  audio.volume   = baseVol;
  audio.loop     = true;

  const setUI = (on) => {
    toggle.classList.toggle('on', on);
    toggle.setAttribute('aria-pressed', on ? 'true' : 'false');
  };

  const fadeTo = (target, dur = 700) => {
    const from = audio.volume;
    const diff = target - from;
    const steps = 30;
    let i = 0;
    const it = setInterval(() => {
      i++;
      audio.volume = from + diff * (i / steps);
      if (i >= steps) {
        clearInterval(it);
        audio.volume = target;
      }
    }, dur / steps);
  };

  toggle.addEventListener('click', async () => {
    if (audio.paused) {
      try {
        audio.currentTime = 0;
        await audio.play();
        fadeTo(baseVol, 800);
        setUI(true);
        localStorage.setItem(PREF_KEY, 'on');
      } catch {
        alert('Gagal memutar audio.\nCek pengaturan suara browser.');
      }
    } else {
      fadeTo(0, 400);
      setTimeout(() => audio.pause(), 420);
      setUI(false);
      localStorage.setItem(PREF_KEY, 'off');
    }
  });

  if (localStorage.getItem(PREF_KEY) === 'on') setUI(true);
  else setUI(false);

  audio.addEventListener('volumechange', () => {
    localStorage.setItem(VOL_KEY, String(audio.volume));
  });
})();

(() => {
  const toggle  = document.getElementById('bgmToggle');    
  const backTop = document.getElementById('backTop');       
  if (!toggle) return;                                      

  const GAP   = 12;                                         
  const BASE  = 18;                                         
  const SAFE  = 'env(safe-area-inset-bottom)';           
  const FLOAT_MS = 420;                                     
  let timer;

  function place() {
    const visible = backTop ? backTop.classList.contains('show') : false;
    const h = backTop ? (backTop.offsetHeight || 46) : 0;
    const extra = visible ? (h + GAP) : 0;

    toggle.classList.add('is-floating');
    clearTimeout(timer);
    timer = setTimeout(() => toggle.classList.remove('is-floating'), FLOAT_MS);

    requestAnimationFrame(() => {
      toggle.style.bottom = `calc(${SAFE} + ${BASE + extra}px)`;
    });
  }

  if (backTop) {
    new MutationObserver(place).observe(backTop, { attributes:true, attributeFilter:['class'] });
  }
  window.addEventListener('resize', place, { passive:true });
  window.addEventListener('scroll', place, { passive:true });
  place();
})();
