(() => {
  if (document.body.classList.contains("page-admin")) return;

  const copy = {
    en: {
      open: "Chat with B's Cozy Southern Creations",
      launch: "Chat",
      close: "Close chat",
      title: "B's Cozy Southern Creations",
      status: "Here to help with orders and custom pieces",
      placeholder: "Ask about a blanket, resin, or a custom order…",
      send: "Send",
      chips: ["Custom order", "What’s in the shop?", "Resin", "Leave a message"],
      hello:
        "Hi — this is B's Cozy Southern Creations. I can help with blankets, scarves, hats, resin, seasonal pieces, and custom orders. What are you hoping to make or buy?",
      custom:
        "We love custom. Tell us who it’s for, the colors you want, the size, and the date you need it. I can pass that straight to the shop.",
      shop:
        "In the shop now: blankets and throws, scarves, hats and beanies, matching sets, and resin keepsakes. Featured right now is a pink and periwinkle chenille throw. Want a link, or should I take a custom request?",
      resin:
        "Resin is a glossy forever pour around decorations and memories — charms, gold leaf, beads, florals, little keepsakes. Bring what you want sealed and we’ll pour around it. Want to start a custom pour?",
      seasons:
        "We make seasonal knits and resin for Valentine’s, spring, Easter, summer, fall, Halloween, Thanksgiving, and Christmas. Which season or holiday are you shopping for?",
      buy:
        "If a piece has a Buy link, you can purchase it from the shop. If it says Request this piece, send colors, size, and timeline and the shop will follow up. I can take that message for you.",
      price:
        "Prices show on each piece when they’re listed. Custom work depends on size, yarn, and the pour. Share what you want and we’ll send a number.",
      ship:
        "Handmade pieces are made to order, so timing depends on the piece and the date you need it. Share your timeline and the shop will confirm.",
      care:
        "Knits are handmade-soft — we’ll include care notes with your piece. Resin is a glossy sealed pour; wipe it gently and keep it out of harsh heat.",
      human:
        "I can pass a note to the shop. What’s your name, email, and what you’d like made? Include colors, size, and the date you need it.",
      thanks:
        "Got it — I sent this to the shop so they can follow up. Add anything else here if you want.",
      sentFail:
        "I saved your note on this page. Please also use Say hello below if you can, so the shop doesn’t miss it.",
      fallback:
        "I can help with knits, resin, seasonal pieces, custom colors, or sending a note to the shop. Tell me what you’re looking for — or share your name, email, and the piece you want.",
      needContact:
        "I’ll get this to the shop. Please send your name and email (and the piece, colors, size, and date if you have them).",
    },
    es: {
      open: "Chatear con B's Cozy Southern Creations",
      launch: "Chat",
      close: "Cerrar chat",
      title: "B's Cozy Southern Creations",
      status: "Ayuda con pedidos y piezas a medida",
      placeholder: "Pregunta por una cobija, resina o un pedido a medida…",
      send: "Enviar",
      chips: ["Pedido a medida", "¿Qué hay en la tienda?", "Resina", "Dejar un mensaje"],
      hello:
        "Hola — aquí B's Cozy Southern Creations. Te ayudo con cobijas, bufandas, gorros, resina, piezas de temporada y pedidos a medida. ¿Qué quieres hacer o comprar?",
      custom:
        "Nos encanta lo a medida. Dinos para quién es, los colores, la talla y la fecha. Se lo paso a la tienda.",
      shop:
        "En la tienda ahora: cobijas y mantas, bufandas, gorros, juegos a juego y recuerdos de resina. Destacada: una manta de chenilla rosa y periwinkle. ¿Quieres verla, o armamos un pedido a medida?",
      resin:
        "La resina es un brillo para siempre alrededor de adornos y recuerdos: dijes, hoja de oro, cuentas, flores. Trae lo que quieres sellar y vertemos alrededor. ¿Empezamos un vaciado a medida?",
      seasons:
        "Hacemos tejidos y resina de temporada para San Valentín, primavera, Pascua, verano, otoño, Halloween, Acción de Gracias y Navidad. ¿Cuál buscas?",
      buy:
        "Si una pieza tiene Comprar, la puedes pedir en la tienda. Si dice Pedir esta pieza, envía colores, talla y fecha y la tienda te escribe. Puedo tomar ese mensaje.",
      price:
        "El precio aparece en cada pieza cuando está listado. Lo a medida depende del tamaño, la lana y el vaciado. Cuéntanos qué quieres y te mandamos un número.",
      ship:
        "Las piezas se hacen por encargo, así que el tiempo depende de lo que pidas y la fecha que necesitas. Comparte tu fecha y la tienda confirma.",
      care:
        "Los tejidos son suaves hechos a mano — incluimos notas de cuidado. La resina es un vaciado brillante; límpiala con suavidad y lejos del calor fuerte.",
      human:
        "Le paso una nota a la tienda. ¿Nombre, correo y qué quieres que hagamos? Incluye colores, talla y fecha si los tienes.",
      thanks:
        "Listo — se lo mandé a la tienda para que te escriba. Si quieres, añade más aquí.",
      sentFail:
        "Guardé tu nota en esta página. Si puedes, usa también Hola abajo para que la tienda no se la pierda.",
      fallback:
        "Te ayudo con tejidos, resina, temporadas, colores a medida, o una nota para la tienda. Dime qué buscas — o tu nombre, correo y la pieza que quieres.",
      needContact:
        "Se lo mando a la tienda. Envíame tu nombre y correo (y la pieza, colores, talla y fecha si los tienes).",
    },
  };

  const page = document.body.dataset.page || "home";
  const assetRoot = page === "home" ? "" : page === "resin" ? "../" : "../../";
  const lang = () => (window.BscI18n?.getLang?.() === "es" ? "es" : "en");
  const t = () => copy[lang()];

  const fold = (value) =>
    String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const emailOf = (text) =>
    String(text).match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || "";

  const has = (text, words) => words.some((word) => fold(text).includes(fold(word)));

  const replyFor = (text) => {
    const pack = t();
    if (has(text, ["custom", "a medida", "medida", "colors", "colores", "size", "talla"]))
      return pack.custom;
    if (has(text, ["resin", "resina", "pour", "vaciado", "gold", "oro"])) return pack.resin;
    if (
      has(text, [
        "season",
        "holiday",
        "temporada",
        "navidad",
        "christmas",
        "easter",
        "pascua",
        "halloween",
        "valentine",
        "valentín",
        "valentin",
        "fall",
        "otoño",
        "otono",
      ])
    )
      return pack.seasons;
    if (has(text, ["price", "cost", "precio", "cuesta", "how much", "cuanto", "cuánto"]))
      return pack.price;
    if (has(text, ["buy", "comprar", "purchase", "order", "pedido"])) return pack.buy;
    if (has(text, ["ship", "envío", "envio", "deliver", "timeline", "fecha", "when"]))
      return pack.ship;
    if (has(text, ["wash", "care", "cuidado", "lavar"])) return pack.care;
    if (has(text, ["shop", "tienda", "blanket", "cobija", "scarf", "bufanda", "hat", "gorro"]))
      return pack.shop;
    if (
      has(text, [
        "message",
        "mensaje",
        "human",
        "person",
        "someone",
        "alguien",
        "contact",
        "email",
        "correo",
        "call",
        "hablar",
      ])
    )
      return pack.human;
    if (has(text, ["hi", "hello", "hola", "hey"])) return pack.hello;
    return pack.fallback;
  };

  const wantsHuman = (text) =>
    Boolean(emailOf(text)) ||
    has(text, [
      "leave a message",
      "dejar un mensaje",
      "talk to",
      "hablar",
      "contact",
      "email me",
      "my email",
      "mi correo",
      "pass this",
      "pásalo",
      "pasalo",
    ]);

  const root = document.createElement("div");
  root.className = "bsc-chat";
  root.innerHTML = `
    <div class="bsc-chat-panel" hidden>
      <div class="bsc-chat-head">
        <img src="${assetRoot}assets/mark.png" alt="" width="34" height="34" />
        <p>
          <strong></strong>
          <span></span>
        </p>
        <button type="button" class="bsc-chat-close" aria-label="Close">×</button>
      </div>
      <div class="bsc-chat-log" role="log" aria-live="polite"></div>
      <div class="bsc-chat-chips"></div>
      <form class="bsc-chat-form">
        <input type="text" name="chat" autocomplete="off" />
        <button type="submit"></button>
      </form>
    </div>
    <button type="button" class="bsc-chat-toggle" aria-expanded="false">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v7A2.5 2.5 0 0 1 16.5 16H12l-4.2 3.2c-.7.5-1.8 0-1.8-.9V16H7.5A2.5 2.5 0 0 1 5 13.5z" />
      </svg>
      <span data-chat-launch>Chat</span>
    </button>
  `;
  document.body.append(root);

  const panel = root.querySelector(".bsc-chat-panel");
  const toggle = root.querySelector(".bsc-chat-toggle");
  const closeBtn = root.querySelector(".bsc-chat-close");
  const log = root.querySelector(".bsc-chat-log");
  const chips = root.querySelector(".bsc-chat-chips");
  const form = root.querySelector(".bsc-chat-form");
  const input = form.querySelector("input");
  const sendBtn = form.querySelector("button");
  const title = root.querySelector(".bsc-chat-head strong");
  const status = root.querySelector(".bsc-chat-head span");
  const launch = root.querySelector("[data-chat-launch]");

  let greeted = false;
  let inbox = "";
  const notes = [];

  const loadJson = (url) =>
    fetch(url, { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .catch(() => null);

  Promise.all([
    loadJson(`${assetRoot}content.json`),
    loadJson(
      `https://raw.githubusercontent.com/Mia-Cran/bssoutherncreations/main/content.json?t=${Date.now()}`
    ),
  ]).then(([local, remote]) => {
    inbox = String(local?.contact?.email || remote?.contact?.email || "").trim();
  });

  const syncChrome = () => {
    const pack = t();
    toggle.setAttribute("aria-label", pack.open);
    closeBtn.setAttribute("aria-label", pack.close);
    launch.textContent = pack.launch;
    title.textContent = pack.title;
    status.textContent = pack.status;
    input.setAttribute("placeholder", pack.placeholder);
    sendBtn.textContent = pack.send;
    chips.innerHTML = pack.chips
      .map((label) => `<button type="button" class="bsc-chat-chip">${label}</button>`)
      .join("");
  };

  const addBubble = (text, who) => {
    const bubble = document.createElement("div");
    bubble.className = `bsc-chat-bubble is-${who}`;
    bubble.textContent = text;
    log.append(bubble);
    log.scrollTop = log.scrollHeight;
    return bubble;
  };

  const showTyping = () => {
    const row = document.createElement("div");
    row.className = "bsc-chat-typing";
    row.innerHTML = "<i></i><i></i><i></i>";
    log.append(row);
    log.scrollTop = log.scrollHeight;
    return row;
  };

  const passToShop = (text) => {
    const shopForm = document.querySelector(".contact-form");
    const note = document.querySelector("[data-form-note]");
    if (!shopForm) return;
    const emailField = shopForm.querySelector('input[name="email"]');
    const messageField = shopForm.querySelector('textarea[name="message"]');
    const foundEmail = emailOf(text);
    if (emailField && foundEmail) emailField.value = foundEmail;
    if (messageField) {
      const previous = messageField.value.trim();
      messageField.value = previous ? `${previous}\n\n${text}` : text;
    }
    if (foundEmail && note) note.hidden = false;
  };

  const sendToInbox = (text) => {
    if (!inbox) return Promise.resolve(false);
    const visitor = emailOf(text);
    return fetch(`https://formsubmit.co/ajax/${encodeURIComponent(inbox)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        _subject: "New chat request from B's Cozy Southern Creations",
        _template: "box",
        _captcha: "false",
        name: "Website chat",
        email: visitor || inbox,
        message: notes.join("\n"),
        page: location.href,
      }),
    })
      .then((response) => response.ok)
      .catch(() => false);
  };

  const botReply = (text) => {
    const pack = t();
    const typing = showTyping();
    const foundEmail = emailOf(text);
    const askHuman = wantsHuman(text);
    const shouldSend = Boolean(foundEmail) || (askHuman && text.length > 24);
    if (shouldSend) passToShop(text);
    const afterSend = (ok) => {
      typing.remove();
      if (foundEmail) addBubble(ok ? pack.thanks : pack.sentFail, "bot");
      else if (askHuman) addBubble(pack.needContact, "bot");
      else addBubble(replyFor(text), "bot");
    };
    if (foundEmail) {
      sendToInbox(text).then(afterSend);
      return;
    }
    window.setTimeout(() => afterSend(false), 450);
  };

  const send = (text) => {
    const value = String(text || "").trim();
    if (!value) return;
    notes.push(`${lang() === "es" ? "Visitante" : "Visitor"}: ${value}`);
    addBubble(value, "user");
    input.value = "";
    botReply(value);
  };

  const open = () => {
    panel.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
    if (!greeted) {
      greeted = true;
      addBubble(t().hello, "bot");
    }
    input.focus();
  };

  const close = () => {
    panel.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", () => {
    if (panel.hidden) open();
    else close();
  });
  closeBtn.addEventListener("click", close);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    send(input.value);
  });
  chips.addEventListener("click", (event) => {
    const chip = event.target.closest(".bsc-chat-chip");
    if (!chip) return;
    send(chip.textContent);
  });

  document.addEventListener("bsc-lang", syncChrome);
  syncChrome();
})();
