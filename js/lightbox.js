/* Photo zoom (lightbox).
   Tap or click any product photo to open it full screen.
   - Phones: pinch to zoom, drag to move, double-tap to zoom in/out, swipe left/right for the next photo.
   - Computers: scroll wheel or the + / − buttons to zoom, drag to move, arrow keys for next/previous, Esc to close.
   Works on photos added later by main.js too (it listens on the whole page). */
(() => {
  const MIN = 1;
  const MAX = 4;

  const css = `
  .lb-zoomable { cursor: zoom-in; }
  .lb { position: fixed; inset: 0; z-index: 9999; background: rgba(20, 22, 21, 0.94); display: none; touch-action: none; user-select: none; -webkit-user-select: none; }
  .lb.is-open { display: block; }
  .lb-stage { position: absolute; inset: 0; overflow: hidden; display: flex; align-items: center; justify-content: center; }
  .lb-img { max-width: 94vw; max-height: 84vh; object-fit: contain; transform-origin: 0 0; will-change: transform; border-radius: 6px; box-shadow: 0 10px 40px rgba(0,0,0,.4); cursor: grab; -webkit-user-drag: none; }
  .lb-img.is-dragging { cursor: grabbing; }
  .lb-btn { position: absolute; z-index: 2; width: 46px; height: 46px; border-radius: 50%; border: 0; background: rgba(255,255,255,.92); color: #2c3530; font: 500 24px/1 system-ui, sans-serif; display: grid; place-items: center; cursor: pointer; box-shadow: 0 2px 10px rgba(0,0,0,.25); }
  .lb-btn:hover, .lb-btn:focus-visible { background: #fff; outline: 2px solid #4f7d64; }
  .lb-close { top: 14px; right: 14px; font-size: 26px; }
  .lb-prev { left: 14px; top: 50%; transform: translateY(-50%); }
  .lb-next { right: 14px; top: 50%; transform: translateY(-50%); }
  .lb-tools { position: absolute; z-index: 2; bottom: 18px; left: 50%; transform: translateX(-50%); display: flex; gap: 12px; }
  .lb-tools .lb-btn { position: static; }
  .lb-cap { position: absolute; z-index: 2; top: 22px; left: 70px; right: 70px; text-align: center; color: #f3efe8; font: 400 14px/1.35 system-ui, sans-serif; pointer-events: none; text-shadow: 0 1px 4px rgba(0,0,0,.7); }
  .lb-hint { position: absolute; z-index: 2; bottom: 74px; left: 0; right: 0; text-align: center; color: rgba(243,239,232,.75); font: 400 12.5px system-ui, sans-serif; pointer-events: none; text-shadow: 0 1px 4px rgba(0,0,0,.7); }
  @media (max-width: 600px) { .lb-prev, .lb-next { top: auto; bottom: 18px; transform: none; } .lb-img { max-height: 76vh; } }
  body.lb-lock { overflow: hidden; }`;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  const box = document.createElement("div");
  box.className = "lb";
  box.setAttribute("role", "dialog");
  box.setAttribute("aria-modal", "true");
  box.setAttribute("aria-label", "Photo viewer");
  box.innerHTML = `
    <div class="lb-stage"><img class="lb-img" alt="" draggable="false" /></div>
    <p class="lb-cap"></p>
    <button class="lb-btn lb-close" type="button" aria-label="Close photo">&times;</button>
    <button class="lb-btn lb-prev" type="button" aria-label="Previous photo">&#8249;</button>
    <button class="lb-btn lb-next" type="button" aria-label="Next photo">&#8250;</button>
    <p class="lb-hint"></p>
    <div class="lb-tools">
      <button class="lb-btn lb-out" type="button" aria-label="Zoom out">&minus;</button>
      <button class="lb-btn lb-in" type="button" aria-label="Zoom in">+</button>
    </div>`;
  document.body.appendChild(box);

  const stage = box.querySelector(".lb-stage");
  const img = box.querySelector(".lb-img");
  const cap = box.querySelector(".lb-cap");
  const hint = box.querySelector(".lb-hint");
  const prevBtn = box.querySelector(".lb-prev");
  const nextBtn = box.querySelector(".lb-next");
  const touchy = window.matchMedia("(pointer: coarse)").matches;
  hint.textContent = touchy ? "Pinch or double-tap to zoom" : "Scroll or use + / − to zoom · drag to move";

  // Which photos can be zoomed: real photos in the page body, not logos/icons.
  const isZoomable = (el) =>
    el && el.tagName === "IMG" && !el.closest("header, footer, nav, .lb, .chat, [class*='chat'], .brand, .logo") &&
    el.closest("main") && (el.naturalWidth || el.width) >= 200 && el.getBoundingClientRect().width >= 80;
  const allPhotos = () => [...document.querySelectorAll("main img")].filter(isZoomable);

  const markZoomable = () => allPhotos().forEach((el) => el.classList.add("lb-zoomable"));
  document.addEventListener("load", (e) => { if (e.target.tagName === "IMG") markZoomable(); }, true);
  window.addEventListener("load", markZoomable);
  new MutationObserver(() => markZoomable()).observe(document.body, { childList: true, subtree: true });

  let list = [];
  let index = 0;
  let scale = 1, x = 0, y = 0;
  let lastFocus = null;

  const base = () => ({ w: img.offsetWidth, h: img.offsetHeight, left: img.offsetLeft, top: img.offsetTop });
  const clamp = () => {
    const b = base();
    if (scale <= 1) { scale = 1; x = 0; y = 0; return; }
    const sw = stage.clientWidth, sh = stage.clientHeight;
    const w = b.w * scale, h = b.h * scale;
    // Keep the zoomed photo covering the screen (or centered if smaller) so it can't be lost off screen.
    x = w <= sw ? (sw - w) / 2 - b.left : Math.min(Math.max(x, sw - b.left - w), -b.left);
    y = h <= sh ? (sh - h) / 2 - b.top : Math.min(Math.max(y, sh - b.top - h), -b.top);
  };
  const apply = (animate) => {
    img.style.transition = animate ? "transform .2s ease" : "none";
    img.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
  };
  // Zoom so the point (cx, cy) on screen stays under the finger/cursor.
  const zoomAt = (newScale, cx, cy, animate) => {
    newScale = Math.min(MAX, Math.max(MIN, newScale));
    const r = stage.getBoundingClientRect();
    const b = base();
    const px = cx - r.left - b.left, py = cy - r.top - b.top;
    x = px - (px - x) * (newScale / scale);
    y = py - (py - y) * (newScale / scale);
    scale = newScale;
    clamp();
    apply(animate);
  };
  const center = () => { const r = stage.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };
  const reset = () => { scale = 1; x = 0; y = 0; apply(false); };

  const show = (i) => {
    index = (i + list.length) % list.length;
    const src = list[index];
    img.src = src.currentSrc || src.src;
    img.alt = src.alt || "";
    cap.textContent = src.alt || "";
    reset();
    const many = list.length > 1;
    prevBtn.hidden = !many;
    nextBtn.hidden = !many;
  };
  const open = (el) => {
    list = allPhotos();
    if (!list.includes(el)) list = [el];
    lastFocus = document.activeElement;
    box.classList.add("is-open");
    document.body.classList.add("lb-lock");
    show(list.indexOf(el));
    box.querySelector(".lb-close").focus({ preventScroll: true });
  };
  const close = () => {
    box.classList.remove("is-open");
    document.body.classList.remove("lb-lock");
    img.removeAttribute("src");
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  };

  document.addEventListener("click", (e) => {
    const el = e.target;
    if (!isZoomable(el)) return;
    e.preventDefault();
    e.stopPropagation();
    open(el);
  }, true);

  box.querySelector(".lb-close").addEventListener("click", close);
  prevBtn.addEventListener("click", () => show(index - 1));
  nextBtn.addEventListener("click", () => show(index + 1));
  box.querySelector(".lb-in").addEventListener("click", () => zoomAt(scale * 1.5, ...center(), true));
  box.querySelector(".lb-out").addEventListener("click", () => zoomAt(scale / 1.5, ...center(), true));
  // Clicking the dark background (not the photo) closes it.
  stage.addEventListener("click", (e) => { if (e.target === stage && scale === 1) close(); });

  document.addEventListener("keydown", (e) => {
    if (!box.classList.contains("is-open")) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowRight") show(index + 1);
    else if (e.key === "ArrowLeft") show(index - 1);
    else if (e.key === "+" || e.key === "=") zoomAt(scale * 1.5, ...center(), true);
    else if (e.key === "-") zoomAt(scale / 1.5, ...center(), true);
    else if (e.key === "Tab") {
      const btns = [...box.querySelectorAll("button")].filter((b) => !b.hidden);
      const i = btns.indexOf(document.activeElement);
      e.preventDefault();
      btns[(i + (e.shiftKey ? -1 : 1) + btns.length) % btns.length].focus();
    }
  });

  stage.addEventListener("wheel", (e) => {
    e.preventDefault();
    zoomAt(scale * (e.deltaY < 0 ? 1.15 : 1 / 1.15), e.clientX, e.clientY, false);
  }, { passive: false });

  // Pointer handling: drag, pinch, double-tap, swipe.
  const pts = new Map();
  let startDist = 0, startScale = 1, startMid = null;
  let dragStart = null, moved = false, lastTap = 0, swipeStart = null;

  stage.addEventListener("pointerdown", (e) => {
    if (e.target.closest("button")) return;
    stage.setPointerCapture?.(e.pointerId);
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    moved = false;
    if (pts.size === 1) {
      dragStart = { px: e.clientX, py: e.clientY, x, y };
      swipeStart = { x: e.clientX, y: e.clientY, t: Date.now() };
      img.classList.add("is-dragging");
    } else if (pts.size === 2) {
      const [a, b] = [...pts.values()];
      startDist = Math.hypot(a.x - b.x, a.y - b.y);
      startScale = scale;
      startMid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      swipeStart = null;
    }
  });
  stage.addEventListener("pointermove", (e) => {
    if (!pts.has(e.pointerId)) return;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 2) {
      const [a, b] = [...pts.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (startDist > 0) zoomAt(startScale * (d / startDist), startMid.x, startMid.y, false);
      moved = true;
    } else if (pts.size === 1 && dragStart) {
      const dx = e.clientX - dragStart.px, dy = e.clientY - dragStart.py;
      if (Math.abs(dx) + Math.abs(dy) > 6) moved = true;
      if (scale > 1) { x = dragStart.x + dx; y = dragStart.y + dy; clamp(); apply(false); }
    }
  });
  const end = (e) => {
    if (!pts.has(e.pointerId)) return;
    pts.delete(e.pointerId);
    img.classList.remove("is-dragging");
    if (pts.size === 1) {
      // One finger left after a pinch: continue as a drag from here.
      const [p] = [...pts.values()];
      dragStart = { px: p.x, py: p.y, x, y };
      return;
    }
    if (pts.size > 0) return;
    // Swipe left/right to change photo (only when not zoomed in).
    if (swipeStart && scale === 1) {
      const dx = e.clientX - swipeStart.x, dy = e.clientY - swipeStart.y;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5 && Date.now() - swipeStart.t < 600) {
        show(index + (dx < 0 ? 1 : -1));
        swipeStart = null;
        return;
      }
    }
    // Double-tap / double-click on the photo toggles zoom.
    if (!moved && e.target === img) {
      const now = Date.now();
      if (now - lastTap < 320) {
        if (scale > 1) { scale = 1; x = 0; y = 0; apply(true); }
        else zoomAt(2.5, e.clientX, e.clientY, true);
        lastTap = 0;
      } else lastTap = now;
    }
    dragStart = null;
  };
  stage.addEventListener("pointerup", end);
  stage.addEventListener("pointercancel", end);
  window.addEventListener("resize", () => { if (box.classList.contains("is-open")) reset(); });
})();
