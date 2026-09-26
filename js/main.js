(() => {
  const get = (object, path) =>
    path.split(".").reduce((value, key) => value?.[key], object);

  const publicImage = (path) => {
    if (!path) return "assets/products/blanket.jpg";
    return path;
  };

  const applyContent = (content) => {
    document.title = content.meta?.title || document.title;
    const description = document.querySelector('meta[name="description"]');
    if (description && content.meta?.description) {
      description.setAttribute("content", content.meta.description);
    }

    document.querySelectorAll("[data-text]").forEach((node) => {
      const value = get(content, node.dataset.text);
      if (typeof value === "string") node.textContent = value;
    });

    document.querySelectorAll("[data-src]").forEach((node) => {
      const value = get(content, node.dataset.src);
      if (typeof value === "string") node.setAttribute("src", publicImage(value));
    });

    document.querySelectorAll("[data-alt]").forEach((node) => {
      const value = get(content, node.dataset.alt);
      if (typeof value === "string") node.setAttribute("alt", value);
    });

    const thanks = document.querySelector("[data-form-note]");
    if (thanks && content.contact?.thanks) thanks.textContent = content.contact.thanks;

    const message = document.querySelector('textarea[name="message"]');
    if (message && content.contact?.placeholder) {
      message.setAttribute("placeholder", content.contact.placeholder);
    }

    const escapeHtml = (value) =>
      String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");

    const applyBuy = (id, buyUrl, label) => {
      const button = document.querySelector(`[data-buy="${id}"]`);
      if (!button) return;
      if (buyUrl) {
        button.href = buyUrl;
        button.target = "_blank";
        button.rel = "noopener noreferrer";
        button.textContent = "Buy";
      } else if (id === "resin") {
        button.href = "resin/";
        button.removeAttribute("target");
        button.textContent = label || "See what we pour";
      } else {
        button.href = "#contact";
        button.removeAttribute("target");
        button.textContent = label || "Request this piece";
      }
    };

    const productCopy = {
      blankets: ["home.blanketsTitle", "home.blanketsText"],
      scarves: ["home.scarvesTitle", "home.scarvesText"],
      hats: ["home.hatsTitle", "home.hatsText"],
      sets: ["home.setsTitle", "home.setsText"],
      resin: ["home.resinTitle", "home.resinText"],
    };

    const applyPrice = (id, price) => {
      const node = document.querySelector(`[data-price="${id}"]`);
      if (!node) return;
      const value = String(price || "").trim();
      node.hidden = !value;
      node.textContent = value;
    };

    const products = Array.isArray(content.products) ? [...content.products] : [];
    if (!products.some((product) => product.id === "resin")) {
      products.push({
        id: "resin",
        title: "Resin",
        text: "Gold flake, charms, and keepsakes sealed in a forever glossy pour.",
        image: "assets/resin/pour-surface.png",
        alt: "Gold flake and pastel resin pour",
      });
    }

    const grid = document.querySelector("[data-product-grid]");
    if (grid) {
      grid.innerHTML = products
        .map((product) => {
          const price = String(product.price || "").trim();
          const image = product.image || "assets/products/blanket.jpg";
          const copyKeys = productCopy[product.id] || [];
          const titleAttr = copyKeys[0] ? ` data-i18n="${copyKeys[0]}"` : "";
          const textAttr = copyKeys[1] ? ` data-i18n="${copyKeys[1]}"` : "";
          const isResin = product.id === "resin";
          const buyHref = isResin ? "resin/" : "#contact";
          const buyLabel = isResin ? "See what we pour" : "Request this piece";
          const buyI18n = isResin ? ` data-i18n="ui.seePour"` : "";
          return `
            <figure class="product is-in" id="product-${escapeHtml(product.id)}">
              <img src="${escapeHtml(image)}" alt="${escapeHtml(product.alt || product.title)}" width="800" height="600" loading="lazy" />
              <figcaption>
                <h3${titleAttr}>${escapeHtml(product.title)}</h3>
                <p${textAttr}>${escapeHtml(product.text)}</p>
                <p class="price"${price ? "" : " hidden"}>${escapeHtml(price)}</p>
                <div class="product-actions">
                  <a class="btn btn-primary" data-buy="${escapeHtml(product.id)}" href="${buyHref}"${buyI18n}>${buyLabel}</a>
                </div>
              </figcaption>
            </figure>
          `;
        })
        .join("");
    }

    applyBuy("featured", content.featured?.buyUrl, content.featured?.cta);
    applyPrice("featured", content.featured?.price);
    products.forEach((product) => {
      applyBuy(product.id, product.buyUrl);
      applyPrice(product.id, product.price);
    });

    window.BscI18n?.apply();
  };

  const loadJson = (url) =>
    fetch(url, { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .catch(() => null);

  let lastContent = null;

  Promise.all([
    loadJson(
      `https://raw.githubusercontent.com/Mia-Cran/bssoutherncreations/main/content.json?t=${Date.now()}`
    ),
    loadJson("content.json"),
  ]).then(([remote, local]) => {
    const content =
      remote?.featured && Array.isArray(remote.products) ? remote : local;
    if (content) {
      lastContent = content;
      applyContent(content);
    }
  });

  window.__bscRefreshCopy = () => {
    if (lastContent) applyContent(lastContent);
    else window.BscI18n?.apply();
  };

  const page = document.body.dataset.page || "home";
  const assetRoot = page === "home" ? "" : page === "resin" ? "../" : "../../";
  let inboxEmail = "";
  loadJson(`${assetRoot}content.json`).then((local) => {
    inboxEmail = String(local?.contact?.email || lastContent?.contact?.email || "").trim();
  });

  const sendRequest = (payload) => {
    const inbox = inboxEmail || String(lastContent?.contact?.email || "").trim();
    if (!inbox) return Promise.resolve(false);
    return fetch(`https://formsubmit.co/ajax/${encodeURIComponent(inbox)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        _template: "box",
        _captcha: "false",
        ...payload,
      }),
    })
      .then((response) => response.ok)
      .catch(() => false);
  };

  const form = document.querySelector(".contact-form");
  const note = document.querySelector("[data-form-note]");

  if (form && note) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const button = form.querySelector('[type="submit"]');
      if (button) button.disabled = true;
      sendRequest({
        _subject: "New request from B's Cozy Southern Creations",
        name: form.elements.name.value.trim(),
        email: form.elements.email.value.trim(),
        message: form.elements.message.value.trim(),
        page: location.href,
      }).then((ok) => {
        note.hidden = false;
        if (!ok) {
          note.textContent =
            document.documentElement.lang === "es"
              ? "No se pudo enviar. Inténtalo de nuevo o escribe directo al correo de la tienda."
              : "That didn’t send. Please try again, or email the shop directly.";
        }
        form.reset();
        if (button) button.disabled = false;
      });
    });
  }

  const dropdowns = [...document.querySelectorAll(".nav-dropdown")];

  const closeDropdown = (dropdown) => {
    const toggle = dropdown.querySelector(".nav-dropdown-toggle");
    const menu = dropdown.querySelector(".nav-dropdown-menu");
    if (!toggle || !menu) return;
    toggle.setAttribute("aria-expanded", "false");
    menu.hidden = true;
  };

  const closeAllDropdowns = () => dropdowns.forEach(closeDropdown);

  dropdowns.forEach((dropdown) => {
    const toggle = dropdown.querySelector(".nav-dropdown-toggle");
    const menu = dropdown.querySelector(".nav-dropdown-menu");
    if (!toggle || !menu) return;

    toggle.addEventListener("click", (event) => {
      event.stopPropagation();
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      closeAllDropdowns();
      if (!isOpen) {
        toggle.setAttribute("aria-expanded", "true");
        menu.hidden = false;
      }
    });

    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => closeAllDropdowns());
    });
  });

  if (dropdowns.length) {
    document.addEventListener("click", (event) => {
      if (!dropdowns.some((dropdown) => dropdown.contains(event.target))) {
        closeAllDropdowns();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeAllDropdowns();
    });
  }

  const items = document.querySelectorAll(".creation-list li, .product");
  if (!items.length || !("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-in"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.15 }
  );

  items.forEach((item, index) => {
    item.style.transitionDelay = `${(index % 4) * 90}ms`;
    observer.observe(item);
  });
})();
