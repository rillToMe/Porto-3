document.getElementById("year").textContent = new Date().getFullYear();

const toggle = document.querySelector(".nav-toggle");
const menu = document.querySelector(".menu");
toggle?.addEventListener("click", () => menu.classList.toggle("open"));

const links = document.querySelectorAll(".menu a");
const sections = [...links].map(a => document.querySelector(a.getAttribute("href")));

function setActiveLink() {
  const scrollPos = window.scrollY + 90; 
  sections.forEach((sec, i) => {
    if (!sec) return;
    const top = sec.offsetTop;
    const bottom = top + sec.offsetHeight;
    const link = links[i];
    if (scrollPos >= top && scrollPos < bottom) {
      links.forEach(l => l.classList.remove("active"));
      link.classList.add("active");
    }
  });
}
window.addEventListener("scroll", setActiveLink);
setActiveLink();

links.forEach(a => {
  a.addEventListener("click", e => {
    e.preventDefault();
    const id = a.getAttribute("href");
    const target = document.querySelector(id);
    const y = target.getBoundingClientRect().top + window.scrollY - 70;
    window.scrollTo({ top: y, behavior: "smooth" });
    menu.classList.remove("open");
  });
});

const typingEl = document.getElementById("typing");
const words = ["Designer", "Developer", "GameDev", "WIBUU"];
let wi = 0, ci = 0, deleting = false;

function type() {
  const word = words[wi];
  typingEl.textContent = word.slice(0, ci);

  if (!deleting && ci < word.length) {
    ci++;
    setTimeout(type, 120);
  } else if (deleting && ci > 0) {
    ci--;
    setTimeout(type, 60);
  } else {
    deleting = !deleting;
    if (!deleting) wi = (wi + 1) % words.length;
    setTimeout(type, 900);
  }
}
type();

const QUOTES = [
  { text: "“Dunia tidak akan melemah hanya karena kamu menangis”", author: "me" },
  { text: "“Kode yang baik adalah kode yang mudah dihapus”", author: "Ruthless Refactorer" },
  { text: "“Desain bukan sekadar terlihat indah; ia harus bekerja”", author: "Dieter Rams-ish" },
  { text: "“Kecilkan skop, besarkan kualitas”", author: "Focus Mode" },
  { text: "“Pelan itu halus, halus itu cepat”", author: "Craftsmanship" },
  { text: "“Gw GK KARBIT”", author: "me" }
];

(function aboutTyping(){
  const elText   = document.getElementById("about-quote-text");
  const elAuthor = document.getElementById("about-quote-author");
  if (!elText || !elAuthor) return;

  const TYPE_MS   = 36;     
  const ERASE_MS  = 24;     
  const HOLD_MS   = 2600;   
  const GAP_MS    = 350;   

  let qi = 0, ci = 0, deleting = false;

  function tick(){
    const { text, author } = QUOTES[qi];

    if (!deleting && ci === 0) {
      elAuthor.textContent = author;
    }

    elText.textContent = text.slice(0, ci);

    if (!deleting && ci < text.length) {
      ci++;
      setTimeout(tick, TYPE_MS);
    } else if (!deleting && ci === text.length) {
      setTimeout(() => { deleting = true; tick(); }, HOLD_MS);
    } else if (deleting && ci > 0) {
      ci--;
      setTimeout(tick, ERASE_MS);
    } else {
      deleting = false;
      qi = (qi + 1) % QUOTES.length;
      setTimeout(tick, GAP_MS);
    }
  }
  tick();
})();

window.addEventListener("scroll", () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrolled = (scrollTop / docHeight) * 100;
  document.getElementById("scroll-progress").style.width = `${scrolled}%`;
  document.getElementById("scroll-progress").style.boxShadow =
  `0 0 ${6 + scrolled / 5}px rgba(0,255,240,${0.3 + scrolled / 200})`;
});

window.sendContact = async function (data) {
  const PROXY_URL = "/api/proxy";

  try {
    const res = await fetch(PROXY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Server Error");

    const text = await res.text();
    console.log("Response:", text);
    return { status: "success" };
  } catch (err) {
    console.error("SendContact failed:", err);
    return { status: "error", message: err.message };
  }
};


(function(){
  const els = document.querySelectorAll("[data-reveal]");
  if (!els.length) return;
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if (e.isIntersecting){
        e.target.classList.add("reveal-in");
        io.unobserve(e.target);
      }
    });
  }, {threshold: .12});
  els.forEach(el=> io.observe(el));
})();

function showToast(msg, ms=2500){
  const wrap = document.getElementById("toast");
  if (!wrap) return alert(msg);
  const item = document.createElement("div");
  item.className = "toast";
  item.textContent = msg;
  wrap.appendChild(item);
  setTimeout(()=> {
    item.style.transition = "opacity .3s, transform .3s";
    item.style.opacity = 0; item.style.transform = "translateY(6px)";
    setTimeout(()=> wrap.removeChild(item), 320);
  }, ms);
}

(function () {
  const form = document.querySelector("#contact-form");
  if (!form) return;

  const btn = form.querySelector('button[type="submit"]');
  const COOLDOWN_MS = 10000;
  const LS_KEY = "contact_cd_until";
  let cdTimer = null;

  function startCooldown(ms) {
    const until = Date.now() + ms;
    localStorage.setItem(LS_KEY, String(until));
    btn.disabled = true;
    btn.setAttribute("aria-disabled", "true");

    function tick() {
      const sisa = Math.max(0, Math.ceil((until - Date.now()) / 1000));
      if (sisa > 0) {
        btn.dataset.originalText ??= btn.textContent;
        btn.textContent = `${btn.dataset.originalText} (${sisa}s)`;
        cdTimer = setTimeout(tick, 1000);
      } else clearCooldown();
    }
    tick();
  }

  function clearCooldown() {
    localStorage.removeItem(LS_KEY);
    if (cdTimer) clearTimeout(cdTimer);
    btn.disabled = false;
    btn.removeAttribute("aria-disabled");
    if (btn.dataset.originalText) {
      btn.textContent = btn.dataset.originalText;
      delete btn.dataset.originalText;
    }
  }

  (function hydrateCooldown() {
    const until = Number(localStorage.getItem(LS_KEY) || 0);
    const left = until - Date.now();
    if (left > 0) startCooldown(left);
  })();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const until = Number(localStorage.getItem(LS_KEY) || 0);
    const left = until - Date.now();
    if (left > 0) {
      showToast?.(`⏳ Tunggu ${Math.ceil(left / 1000)}s sebelum kirim lagi`);
      return;
    }

    const nama = form.querySelector("#nama")?.value.trim();
    const email = form.querySelector("#email")?.value.trim();
    const pesan = form.querySelector("#pesan")?.value.trim();
    if (!nama || !email || !pesan) {
      showToast?.("Lengkapi semua field dulu ya 🙏");
      return;
    }

    startCooldown(COOLDOWN_MS);

    btn.classList.add("is-loading");

    try {
      const res = await window.sendContact({ nama, email, pesan });
      if (res.status === "success") {
        showToast?.("✨ Pesan terkirim! Terima kasih.");
        form.reset();
      } else {
        showToast?.("❌ " + (res.message || "Gagal mengirim"));
        clearCooldown();
      }
    } catch (err) {
      showToast?.("❌ Network error: " + (err.message || "Unknown"));
      clearCooldown();
    } finally {
      btn.classList.remove("is-loading");
    }
  });
})();


