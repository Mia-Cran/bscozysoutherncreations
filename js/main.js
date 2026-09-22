(() => {
  const get = (object, path) =>
    path.split(".").reduce((value, key) => value?.[key], object);

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
      if (typeof value === "string") node.setAttribute("src", value);
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

    (content.products || []).forEach((product) => {
      const button = document.querySelector(`[data-buy="${product.id}"]`);
      if (!button) return;
      if (product.buyUrl) {
        button.href = product.buyUrl;
        button.target = "_blank";
        button.rel = "noopener noreferrer";
        button.textContent = "Buy";
      } else {
        button.href = "#contact";
        button.removeAttribute("target");
        button.textContent = "Request this piece";
      }
    });
  };

  fetch("content.json", { cache: "no-store" })
    .then((response) => (response.ok ? response.json() : null))
    .then((content) => {
      if (content) applyContent(content);
    })
    .catch(() => {});

  const form = document.querySelector(".contact-form");
  const note = document.querySelector("[data-form-note]");

  if (form && note) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      note.hidden = false;
      form.reset();
    });
  }

  const dropdown = document.querySelector(".nav-dropdown");
  const toggle = document.querySelector(".nav-dropdown-toggle");
  const menu = document.querySelector(".nav-dropdown-menu");

  if (dropdown && toggle && menu) {
    const closeMenu = () => {
      toggle.setAttribute("aria-expanded", "false");
      menu.hidden = true;
    };

    const openMenu = () => {
      toggle.setAttribute("aria-expanded", "true");
      menu.hidden = false;
    };

    toggle.addEventListener("click", (event) => {
      event.stopPropagation();
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      if (isOpen) closeMenu();
      else openMenu();
    });

    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => closeMenu());
    });

    document.addEventListener("click", (event) => {
      if (!dropdown.contains(event.target)) closeMenu();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
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
