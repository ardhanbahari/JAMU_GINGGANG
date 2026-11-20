(function () {
  "use strict";
  const body = document.body;

  // Header berubah saat scroll
  const onScroll = () => body.classList.toggle("scrolled", window.scrollY > 60);
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Menu mobile
  const toggle = document.getElementById("navToggle");
  const setMenu = (open) => {
    body.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", open);
    toggle.firstElementChild.className = open ? "bi bi-x" : "bi bi-list";
  };
  toggle.addEventListener("click", () => setMenu(!body.classList.contains("menu-open")));
  document.querySelectorAll("#nav a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

  // Scrollspy
  const links = [...document.querySelectorAll("#nav a")];
  const map = new Map(links.map((a) => [a.getAttribute("href").slice(1), a]));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting && map.has(e.target.id)) {
        links.forEach((l) => l.classList.remove("active"));
        map.get(e.target.id).classList.add("active");
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  map.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });

  // Filter produk
  const chips = document.querySelectorAll(".chip");
  const items = document.querySelectorAll(".p-item");
  chips.forEach((chip) => chip.addEventListener("click", () => {
    chips.forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    const f = chip.dataset.filter;
    items.forEach((it) => it.classList.toggle("hide", f !== "all" && it.dataset.cat !== f));
    if (window.AOS) setTimeout(() => AOS.refresh(), 50);
  }));


  // Slider galeri otomatis
  (function () {
    const track = document.getElementById("sTrack");
    if (!track) return;
    const slides = [...track.children];
    const dots = document.getElementById("sDots");
    const root = document.getElementById("slider");
    const DUR = 4500;
    let idx = 0, timer, userHold = false;
    root.style.setProperty("--dur", DUR + "ms");
    slides.forEach((_, i) => {
      const b = document.createElement("button");
      b.setAttribute("aria-label", "Foto " + (i + 1));
      b.addEventListener("click", () => { go(i); restart(); });
      dots.appendChild(b);
    });
    const mark = (i) => {
      idx = i;
      slides.forEach((s, k) => s.classList.toggle("on", k === i));
      [...dots.children].forEach((d, k) => {
        d.classList.remove("on");
        if (k === i) { void d.offsetWidth; d.classList.add("on"); }
      });
    };
    const go = (i) => {
      i = (i + slides.length) % slides.length;
      const s = slides[i];
      track.scrollTo({ left: s.offsetLeft - (track.clientWidth - s.clientWidth) / 2, behavior: "smooth" });
      mark(i);
    };
    const restart = () => { clearInterval(timer); timer = setInterval(() => { if (!userHold) go(idx + 1); }, DUR); };
    document.getElementById("sPrev").addEventListener("click", () => { go(idx - 1); restart(); });
    document.getElementById("sNext").addEventListener("click", () => { go(idx + 1); restart(); });
    root.addEventListener("mouseenter", () => { userHold = true; root.classList.add("paused"); });
    root.addEventListener("mouseleave", () => { userHold = false; root.classList.remove("paused"); });
    // geser manual (swipe) -> sinkronkan indikator
    let t;
    track.addEventListener("scroll", () => {
      clearTimeout(t);
      t = setTimeout(() => {
        const c = track.scrollLeft + track.clientWidth / 2;
        let best = 0, d = 1e9;
        slides.forEach((s, k) => { const m = Math.abs(s.offsetLeft + s.clientWidth / 2 - c); if (m < d) { d = m; best = k; } });
        if (best !== idx) mark(best);
      }, 120);
    }, { passive: true });
    window.addEventListener("load", () => go(0));
    mark(0); restart();
  })();

  // Lightbox foto
  const lb = document.createElement("div");
  lb.className = "lightbox"; lb.innerHTML = "<img alt=''>";
  document.body.appendChild(lb);
  document.querySelectorAll(".gal-item img").forEach((img) => img.addEventListener("click", () => {
    lb.firstChild.src = img.src; lb.firstChild.alt = img.alt; lb.classList.add("open");
  }));
  lb.addEventListener("click", () => lb.classList.remove("open"));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") lb.classList.remove("open"); });

  document.getElementById("year").textContent = new Date().getFullYear();

  if (window.AOS) AOS.init({ duration: 800, easing: "ease-out-cubic", once: true, offset: 60 });
})();
