(() => {
  if (window.__PROJECT_TRIM_INITED__) return;
  window.__PROJECT_TRIM_INITED__ = true;

  const isTouch = matchMedia("(hover: none) and (pointer: coarse)").matches;

  const CHAR_LIMIT_DESKTOP = 110;
  const CHAR_LIMIT_MOBILE  = 140;

  const cards = document.querySelectorAll(".project.card");

  cards.forEach((card) => {
    const p =
      card.querySelector(".project-body p.desc") ||
      card.querySelector(".project-body p");
    if (!p) return;

    const fullText = (p.textContent || "").trim().replace(/\s+/g, " ");
    if (!fullText) return;

    const limit =
      (isTouch || window.innerWidth <= 620)
        ? CHAR_LIMIT_MOBILE
        : CHAR_LIMIT_DESKTOP;

    const shortText = truncateToWord(fullText, limit);

    if (shortText.length === fullText.length) return;

    p.classList.add("js-trim");
    p.dataset.full = fullText;
    p.dataset.short = shortText;

    if (isTouch) {
      setShortMobile(p);
      injectMobileToggle(card, p);
    } else {

      setShortDesktop(p);
      attachHoverDesktop(card, p);
    }
  });


  function truncateToWord(str, limit) {
    if (str.length <= limit) return str;
    let cut = str.slice(0, limit);
    cut = cut.replace(/\s+\S*$/, "");
    return cut;
  }

  function setShortDesktop(p) {
    const short = p.dataset.short + "…";
    p.textContent = short + " ";
    const rm = document.createElement("span");
    rm.className = "readmore-inline";
    rm.textContent = "Read more";
    rm.style.color = "#888";
    rm.style.fontStyle = "italic";
    rm.style.fontSize = "13px";
    rm.style.opacity = "0.8";
    p.appendChild(rm);
  }

  function attachHoverDesktop(card, p) {
    const full = p.dataset.full;
    const short = p.dataset.short;
    card.addEventListener("mouseenter", () => {
      p.textContent = full;
    });
    card.addEventListener("mouseleave", () => {
      setShortDesktop(p);
    });
  }

  function setShortMobile(p) {
    p.textContent = p.dataset.short + "…";
  }

  function injectMobileToggle(card, p) {
    const btn = document.createElement("button");
    btn.className = "desc-toggle";
    btn.type = "button";
    btn.textContent = "Read more";

    const cta = card.querySelector(".project-body .btn");
    (cta ? cta : card.querySelector(".project-body")).before(btn);

    btn.addEventListener("click", () => {
      const open = card.classList.toggle("is-open");
      if (open) {
        p.textContent = p.dataset.full;
        btn.textContent = "Show less";
        card.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        setShortMobile(p);
        btn.textContent = "Read more";
      }
    });
  }
})();
