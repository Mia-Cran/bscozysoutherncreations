/* Spanish for the shop pages (blankets, scarves, hats, sets, decor),
   Order & Pay and Leave a Review.
   i18n.js already translates the menu, header and footer. This file
   translates everything else on those pages, including text that order.js
   and feedback.js add later (prices, buttons, messages).
   Order emails to B stay in English: only what the visitor SEES changes. */
(() => {
  const ES = {
    // ---- category pages
    "Blankets & throws": "Mantas y cobijas",
    "Couch-ready chenille, 40 x 60.": "Chenilla lista para el sofá, 40 x 60.",
    "Every throw on this page is handmade, 40 x 60, and $45. Pick the one that belongs on your couch.": "Cada manta de esta página está hecha a mano, mide 40 x 60 y cuesta $45. Elige la que va con tu sofá.",
    "See the throws": "Ver las mantas",
    "Request a custom piece": "Pedir una pieza a medida",
    "Blue & white stripe throw": "Manta azul y blanca a rayas",
    "Chunky chenille in royal blue and cream.": "Chenilla gruesa en azul rey y crema.",
    "Buy now": "Comprar ahora",
    "Order now": "Pedir ahora",
    "Blue & white panel throw": "Manta azul con panel blanco",
    "A wide cream panel framed in royal blue.": "Un panel ancho color crema enmarcado en azul rey.",
    "Blue & white banded throw": "Manta azul y blanca a franjas",
    "Wide royal blue and cream bands in squishy chenille.": "Franjas anchas azul rey y crema en chenilla suavecita.",
    "Blue & taupe stripe throw": "Manta azul con franja gris topo",
    "Periwinkle chenille with a taupe center stripe.": "Chenilla azul lavanda con una franja central gris topo.",
    "Pink and periwinkle throw": "Manta rosa y azul lavanda",
    "Soft bobble stitches in pastel pink and lilac.": "Puntos de burbuja suaves en rosa pastel y lila.",
    "Made for you": "Hecho para ti",
    "Want a custom color or size?": "¿Quieres otro color o tamaño?",
    "Tell us who it’s for and what you have in mind. We’ll make it by hand.": "Cuéntanos para quién es y qué tienes en mente. Lo hacemos a mano.",
    "Start a custom order": "Empezar un pedido a medida",
    "Let’s make something": "Hagamos algo juntos",
    "Say hello.": "Salúdanos.",
    "Want one of these throws, or a custom size and color? Send a note.": "¿Quieres una de estas mantas, o un tamaño y color a medida? Envíanos una nota.",
    "Name": "Nombre",
    "Email": "Correo electrónico",
    "What are you looking for?": "¿Qué estás buscando?",
    "Blue stripe throw, custom colors, 40 x 60… timeline…": "Manta azul a rayas, colores a medida, 40 x 60… para cuándo…",
    "Send message": "Enviar mensaje",
    "Thanks! We’ll get back to you soon.": "¡Gracias! Te responderemos pronto.",
    "Scarves": "Bufandas",
    "Soft wraps, ready to wear.": "Bufandas suaves, listas para usar.",
    "Handmade honeycomb chenille scarves. Each one is $15.": "Bufandas de chenilla tejidas a mano. Cada una cuesta $15.",
    "See the scarves": "Ver las bufandas",
    "Terracotta chenille scarf": "Bufanda de chenilla terracota",
    "A soft dusty-rose wrap in chunky handmade chenille.": "Una bufanda suave color rosa viejo en chenilla gruesa hecha a mano.",
    "Mustard chenille scarf": "Bufanda de chenilla mostaza",
    "A warm gold wrap in squishy handmade chenille.": "Una bufanda dorada y calientita en chenilla suave hecha a mano.",
    "Want one of these scarves, or a custom color? Send a note.": "¿Quieres una de estas bufandas, o un color a medida? Envíanos una nota.",
    "Terracotta scarf, mustard scarf, custom color…": "Bufanda terracota, bufanda mostaza, color a medida…",
    "Hats & beanies": "Gorros",
    "Ribbed, roomy, and made for crisp mornings.": "Acanalados, cómodos y hechos para las mañanas frescas.",
    "Hats are custom right now. Tell us the color and we’ll knit one.": "Por ahora los gorros son a medida. Dinos el color y te tejemos uno.",
    "Request a hat": "Pedir un gorro",
    "Ribbed, roomy, and ready for crisp mornings. Custom colors.": "Acanalados, cómodos y listos para las mañanas frescas. Colores a medida.",
    "Want a hat or beanie? Send colors and when you need it.": "¿Quieres un gorro? Envíanos los colores y para cuándo lo necesitas.",
    "Beanie, color, size…": "Gorro, color, talla…",
    "Sets & extras": "Juegos y extras",
    "Matching pieces that feel personal.": "Piezas a juego con un toque personal.",
    "Mitts, matching sets, and little gifts. Custom colors available.": "Guantes, juegos a juego y regalitos. Colores a medida disponibles.",
    "Request a set": "Pedir un juego",
    "Mitts, matching sets, and little gifts that feel personal.": "Guantes, juegos a juego y regalitos con un toque personal.",
    "Want a matching set? Send colors and when you need it.": "¿Quieres un juego a juego? Envíanos los colores y para cuándo lo necesitas.",
    "Hat and scarf set, colors…": "Juego de gorro y bufanda, colores…",
    "Wreaths & seasonal": "Coronas y temporada",
    "Porch pieces and table decor.": "Decoración para el porche y la mesa.",
    "Handmade wreaths, stacked pumpkins, and a harvest bouquet — already made.": "Coronas hechas a mano, calabazas apiladas y un ramo de otoño, ya listos.",
    "See the decor": "Ver la decoración",
    "Monogram fall wreath": "Corona de otoño con inicial",
    "Glitter tulle, maple leaves, and a wooden letter T.": "Tul con brillo, hojas de arce y una letra T de madera.",
    "EEK! Halloween wreath": "Corona de Halloween «EEK!»",
    "Tinsel, a glitter spider, eyeballs, and a sparkly bat.": "Guirnalda brillante, una araña con brillo, ojos y un murciélago brillante.",
    "Gnome Christmas wreath": "Corona navideña de gnomos",
    "Red-and-white pom-poms, candy canes, and two cozy gnomes.": "Pompones rojos y blancos, bastones de caramelo y dos gnomos acogedores.",
    "Stacked pumpkin trio": "Trío de calabazas apiladas",
    "Three white jack-o’-lanterns with gold faces and autumn leaves.": "Tres calabazas blancas con caras doradas y hojas de otoño.",
    "$40 for 3": "$40 por las 3",
    "Fall bouquet": "Ramo de otoño",
    "Harvest stems, eucalyptus, and pinecones in a mason jar.": "Tallos de cosecha, eucalipto y piñas en un frasco de vidrio.",
    "Want a wreath, the pumpkin trio, or the bouquet? Send a note.": "¿Quieres una corona, el trío de calabazas o el ramo? Envíanos una nota.",
    "Fall wreath, pumpkin trio, bouquet…": "Corona de otoño, trío de calabazas, ramo…",

    // ---- Order & Pay
    "Order & Pay": "Pedir y pagar",
    "Pick your items, colors and sizes, and we'll add it all up. Every piece is handmade in Middle Georgia.": "Elige tus artículos, colores y tamaños, y nosotros sumamos todo. Cada pieza está hecha a mano en el centro de Georgia.",
    "1. Your info": "1. Tus datos",
    "First name": "Nombre",
    "Last name": "Apellido",
    "Email address": "Correo electrónico",
    "Phone number": "Número de teléfono",
    "2. What would you like?": "2. ¿Qué te gustaría?",
    "Add each item, then pick its color (and size for blankets).": "Agrega cada artículo y luego elige su color (y el tamaño para las mantas).",
    "Item": "Artículo",
    "Size": "Tamaño",
    "Color": "Color",
    "Qty": "Cant.",
    "Remove": "Quitar",
    "Remove this item": "Quitar este artículo",
    "Choose an item…": "Elige un artículo…",
    "Choose a size…": "Elige un tamaño…",
    "Choose a color…": "Elige un color…",
    "Choose a blanket…": "Elige una manta…",
    "Choose a scarf…": "Elige una bufanda…",
    "Choose a wreath…": "Elige una corona…",
    "+ Add another item": "+ Agregar otro artículo",
    "Notes (names, color ideas, who it's for)": "Notas (nombres, ideas de color, para quién es)",
    "Example: add the name \"Ava\" to the resin keychain": "Ejemplo: agregar el nombre \"Ava\" al llavero de resina",
    "3. How will you get it?": "3. ¿Cómo lo recibirás?",
    "Local pickup": "Recoger en persona",
    "Local delivery (Warner Robins, Macon, Perry, Byron)": "Entrega local (Warner Robins, Macon, Perry, Byron)",
    "Local delivery": "Entrega local",
    "Street address": "Dirección",
    "City": "Ciudad",
    "ZIP": "Código postal",
    "Items": "Artículos",
    "Free": "Gratis",
    "Total": "Total",
    "So far": "Hasta ahora",
    "Price quoted": "Precio a cotizar",
    "Send my order": "Enviar mi pedido",
    "Send my request": "Enviar mi solicitud",
    "Sending…": "Enviando…",
    "Pay with PayPal": "Pagar con PayPal",
    "Pay with Venmo": "Pagar con Venmo",
    "B will email you a price for your order. You'll pay after you get it.": "B te enviará un precio por correo. Pagarás después de recibirlo.",
    "Some items need a price quote. B will email you the final total, then you can pay.": "Algunos artículos necesitan cotización. B te enviará el total final por correo y luego podrás pagar.",
    "Please choose an item, size (if it has one) and color on every line.": "Elige un artículo, tamaño (si lo tiene) y color en cada línea.",
    "Orders can't be sent right now. Please email the shop directly.": "Los pedidos no se pueden enviar ahora. Escríbenos por correo directamente.",
    "Online payment isn't set up yet. Please email the shop to order.": "El pago en línea aún no está listo. Escríbenos por correo para pedir.",
    "That didn't send. Please try again, or email the shop directly.": "No se envió. Inténtalo de nuevo o escríbenos por correo.",
    "Your payment was canceled, so your order was not sent. You can try again below.": "Tu pago fue cancelado, así que tu pedido no se envió. Puedes intentarlo de nuevo abajo.",
    "Thank you! Your order was sent.": "¡Gracias! Tu pedido fue enviado.",
    "B will reach out to confirm your colors and pickup.": "B se comunicará contigo para confirmar los colores y la entrega.",
    "Almost done! Now pay with Venmo.": "¡Casi listo! Ahora paga con Venmo.",
    "Thank you! Your request was sent.": "¡Gracias! Tu solicitud fue enviada.",
    "B will look over your request and send you a PayPal or Venmo request for the price. Your order starts once it is paid in full.": "B revisará tu solicitud y te enviará una solicitud de pago por PayPal o Venmo con el precio. Tu pedido comienza cuando esté pagado por completo.",
    "Thank you for your payment!": "¡Gracias por tu pago!",
    "Thank you! Your order is paid.": "¡Gracias! Tu pedido está pagado.",
    // order item names (the email to B still uses English)
    "Blanket": "Manta",
    "Hat or beanie": "Gorro",
    "Scarf": "Bufanda",
    "Christmas stocking": "Bota navideña",
    "Matching set (hat + scarf)": "Juego a juego (gorro + bufanda)",
    "Coasters": "Posavasos",
    "Games": "Juegos",
    "Chess": "Ajedrez",
    "Checkers": "Damas",
    "Tic-tac-toe": "Tres en raya",
    "Memories (keepsake)": "Recuerdos (pieza conmemorativa)",
    "Ready-made throw (40 x 60)": "Manta ya hecha (40 x 60)",
    "Ready-made chunky scarf": "Bufanda gruesa ya hecha",
    "Wreath": "Corona",
    "Stacked pumpkin trio (3 pumpkins)": "Trío de calabazas apiladas (3 calabazas)",
    "Round initial door sign": "Letrero redondo con inicial",
    "Knits": "Tejidos",
    "Resin": "Resina",
    "Ready to buy": "Listo para comprar",
    "Home décor": "Decoración del hogar",
    "Pink": "Rosa", "Periwinkle": "Azul lavanda", "Lavender": "Lavanda", "Baby blue": "Azul cielo",
    "Mint green": "Verde menta", "Cream": "Crema", "White": "Blanco", "Gray": "Gris", "Red": "Rojo",
    "Hunter green": "Verde bosque", "Black": "Negro", "Orange": "Naranja", "Teal": "Verde azulado",
    "Other (describe in notes)": "Otro (descríbelo en las notas)",
    "Any color": "Cualquier color",

    // ---- Leave a Review
    "Leave a Review": "Deja una reseña",
    "Thank you for supporting our small, handmade business! Tell us how you like your piece. It only takes a minute.": "¡Gracias por apoyar nuestro pequeño negocio hecho a mano! Cuéntanos qué te pareció tu pieza. Solo toma un minuto.",
    "How did we do?": "¿Qué tal lo hicimos?",
    "Star rating": "Calificación con estrellas",
    "5 stars": "5 estrellas", "4 stars": "4 estrellas", "3 stars": "3 estrellas", "2 stars": "2 estrellas", "1 star": "1 estrella",
    "Tap a star": "Toca una estrella",
    "Tell us about it": "Cuéntanos",
    "What did you get?": "¿Qué compraste?",
    "Choose one…": "Elige uno…",
    "Something else": "Otra cosa",
    "Comments (optional)": "Comentarios (opcional)",
    "Example: My granddaughter sleeps with her blanket every night!": "Ejemplo: ¡Mi nieta duerme con su manta todas las noches!",
    "About you": "Sobre ti",
    "City (optional)": "Ciudad (opcional)",
    "Email (optional, never shown)": "Correo (opcional, nunca se muestra)",
    "It's OK to share my review on the website with my first name and city.": "Está bien compartir mi reseña en el sitio web con mi nombre y ciudad.",
    "Send my review": "Enviar mi reseña",
    "Thank you so much!": "¡Muchísimas gracias!",
    "Your review was sent to B.": "Tu reseña fue enviada a B.",
    "Your review was sent to B. It means the world to our little business!": "Tu reseña fue enviada a B. ¡Significa muchísimo para nuestro pequeño negocio!",
    "Your review was sent to B. Thank you for helping us do better.": "Tu reseña fue enviada a B. Gracias por ayudarnos a mejorar.",
    "Would you share it on Google too? It helps other families find us.": "¿La compartirías también en Google? Ayuda a otras familias a encontrarnos.",
    "Post it on Google": "Publicarla en Google",
    "Please add your first name.": "Agrega tu nombre, por favor.",
    "Please tap a star rating.": "Toca una calificación con estrellas, por favor.",
    "Reviews can't be sent right now. Please try again later.": "Las reseñas no se pueden enviar ahora. Inténtalo más tarde.",
    "Sorry, that didn't send. Please try again.": "Lo sentimos, no se envió. Inténtalo de nuevo.",
    "What customers say": "Lo que dicen nuestros clientes",
  };

  // Text that has numbers or names inside it.
  const tr = (s) => ES[s] || s;
  const PATTERNS = [
    [/^Pay with PayPal – (\$[\d.,]+)$/, (m) => `Pagar con PayPal – ${m[1]}`],
    [/^Pay with Venmo – (\$[\d.,]+)$/, (m) => `Pagar con Venmo – ${m[1]}`],
    [/^Pay (\$[\d.,]+) with Venmo$/, (m) => `Pagar ${m[1]} con Venmo`],
    [/^Sales tax \(([\d.]+)%\)$/, (m) => `Impuesto sobre ventas (${m[1]}%)`],
    [/^(.+) – from (\$[\d.,]+)$/, (m) => `${tr(m[1])} – desde ${m[2]}`],
    [/^(.+) – price quoted$/, (m) => `${tr(m[1])} – precio a cotizar`],
    [/^(.+) – (\$[\d.,]+)$/, (m) => (ES[m[1]] ? `${ES[m[1]]} – ${m[2]}` : null)],
    [/^Your order number is (\S+)\. Tap the button to pay (\$[\d.,]+) to @(\S+)\. B will reach out to set up pickup or delivery once the payment comes in\.$/,
      (m) => `Tu número de pedido es ${m[1]}. Toca el botón para pagar ${m[2]} a @${m[3]}. B se comunicará contigo para coordinar la entrega cuando llegue el pago.`],
    [/^Your order number is (\S+)\. B will reach out to set up pickup or delivery\.$/,
      (m) => `Tu número de pedido es ${m[1]}. B se comunicará contigo para coordinar la entrega.`],
    [/^Your order number is (\S+)\. B has your order details from PayPal and will be in touch\.$/,
      (m) => `Tu número de pedido es ${m[1]}. B tiene los detalles de tu pedido por PayPal y se comunicará contigo.`],
  ];
  const toSpanish = (text) => {
    const t = text.replace(/\s+/g, " ").trim();
    if (!t) return null;
    if (ES[t]) return ES[t];
    for (const [re, fn] of PATTERNS) {
      const m = t.match(re);
      if (m) { const out = fn(m); if (out) return out; }
    }
    return null;
  };

  // Remember the English so switching back to EN restores it.
  const origText = new WeakMap();
  const origAttr = new WeakMap();
  const ATTRS = ["placeholder", "aria-label"];
  const skip = (el) => !el || el.closest("[data-i18n], [data-i18n-placeholder], script, style, header, footer, .bsc-chat, [class*='bsc-chat'], .lb");

  const lang = () => (window.BscI18n?.getLang?.() || document.documentElement.lang || "en").slice(0, 2);
  let busy = false;

  const translateTree = (root) => {
    const es = lang() === "es";
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((n) => {
      if (skip(n.parentElement)) return;
      if (es) {
        const current = n.nodeValue;
        const known = origText.get(n);
        // If the page changed the text itself (e.g. a new total), start from the new English.
        const english = known && toSpanish(known.en) === current.replace(/\s+/g, " ").trim() ? known.en : current;
        const out = toSpanish(english);
        if (out) {
          origText.set(n, { en: english });
          const lead = english.match(/^\s*/)[0], tail = english.match(/\s*$/)[0];
          const next = lead + out + tail;
          if (n.nodeValue !== next) n.nodeValue = next;
        }
      } else {
        const known = origText.get(n);
        if (known && toSpanish(known.en) === n.nodeValue.replace(/\s+/g, " ").trim()) n.nodeValue = known.en;
      }
    });
    const els = root.querySelectorAll ? root.querySelectorAll(ATTRS.map((a) => `[${a}]`).join(",")) : [];
    els.forEach((el) => {
      if (skip(el)) return;
      const saved = origAttr.get(el) || {};
      ATTRS.forEach((a) => {
        if (!el.hasAttribute(a)) return;
        if (es) {
          const english = saved[a] && toSpanish(saved[a]) === el.getAttribute(a) ? saved[a] : el.getAttribute(a);
          const out = toSpanish(english);
          if (out) { saved[a] = english; el.setAttribute(a, out); }
        } else if (saved[a] && toSpanish(saved[a]) === el.getAttribute(a)) {
          el.setAttribute(a, saved[a]);
        }
      });
      origAttr.set(el, saved);
    });
  };

  const run = () => {
    if (busy) return;
    busy = true;
    try { translateTree(document.body); } finally { busy = false; }
  };

  // Re-run when the language changes or when the page adds/changes text.
  document.addEventListener("bsc-lang", () => setTimeout(run, 0));
  let queued = false;
  new MutationObserver(() => {
    if (busy || queued || lang() !== "es") return;
    queued = true;
    requestAnimationFrame(() => { queued = false; run(); });
  }).observe(document.body, { childList: true, subtree: true, characterData: true });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
  window.addEventListener("load", run);
})();
