/* Order & Pay page (/order/).
   Settings (items, sizes, prices, colors, shipping, tax) come from
   content.json -> orderForm.

   Two flows:
   1. Every item has a price  -> customer taps "Continue to PayPal", pays, and
      PayPal sends them back here (?paid=<order id>). ONLY THEN is the order
      emailed to B (marked PAID). The order summary is also put into the PayPal
      payment itself, so B's PayPal email shows what was ordered either way.
   2. Something needs a quote (e.g. resin without a price yet) -> the request
      is emailed to B right away, marked "QUOTE REQUEST – NOT PAID". B replies
      with a price and the customer pays with "Already have your price?". */
(() => {
  const form = document.getElementById("order-form");
  if (!form) return;

  const $ = (id) => document.getElementById(id);
  const linesBox = $("order-lines");
  const totalsBox = $("order-totals");
  const errorBox = $("order-error");
  const addressBox = $("order-address");
  const submitBtn = form.querySelector(".order-submit");
  const done = $("order-done");
  const doneTitle = done.querySelector("h2");
  const doneText = $("order-done-text");
  const payBox = $("order-pay");
  const payAmount = $("pay-amount");
  const payAmountBtn = $("pay-amount-btn");
  const paypalMissing = $("paypal-missing");

  let cfg = { inbox: "", paypal: "", taxRate: 0, shippingFlat: 0, localDeliveryFee: 0, colors: [], items: [] };
  const money = (n) => `$${(Math.round(n * 100) / 100).toFixed(2)}`;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const itemById = (id) => cfg.items.find((i) => i.id === id);
  const hasPrice = (p) => typeof p === "number" && p > 0;
  const pricedSizes = (i) => (i.sizes || []).filter((s) => hasPrice(s.price));
  const itemLabel = (i) => {
    if (i.quote || (i.sizes?.length && !pricedSizes(i).length)) return " – price quoted";
    if (i.sizes?.length) return ` – from ${money(Math.min(...pricedSizes(i).map((s) => s.price)))}`;
    return hasPrice(i.price) ? ` – ${money(i.price)}` : "";
  };
  const handoff = () => form.querySelector('input[name="handoff"]:checked')?.value || "pickup";
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ } },
  };

  /* ---------- item lines ---------- */
  const itemOptions = () => {
    const groups = {};
    cfg.items.forEach((i) => { (groups[i.category || "Items"] ||= []).push(i); });
    return Object.entries(groups)
      .map(([cat, items]) =>
        `<optgroup label="${esc(cat)}">${items
          .map((i) => `<option value="${esc(i.id)}">${esc(i.name)}${itemLabel(i)}</option>`)
          .join("")}</optgroup>`)
      .join("");
  };

  const addLine = () => {
    const line = document.createElement("div");
    line.className = "order-line";
    line.innerHTML = `
      <label class="order-line-item">Item
        <select data-f="item" required>
          <option value="">Choose an item…</option>
          ${itemOptions()}
        </select>
      </label>
      <label class="order-line-size" hidden>Size
        <select data-f="size"></select>
      </label>
      <label class="order-line-color">Color
        <select data-f="color" required>
          <option value="">Choose a color…</option>
          ${cfg.colors.map((c) => `<option>${esc(c)}</option>`).join("")}
        </select>
      </label>
      <label class="order-line-qty">Qty
        <input type="number" data-f="qty" min="1" max="50" value="1" inputmode="numeric" />
      </label>
      <div class="order-line-foot">
        <span class="order-line-price" data-f="price"></span>
        <button type="button" class="order-line-remove" aria-label="Remove this item">Remove</button>
      </div>`;
    linesBox.appendChild(line);

    const itemSel = line.querySelector('[data-f="item"]');
    const sizeWrap = line.querySelector(".order-line-size");
    const sizeSel = line.querySelector('[data-f="size"]');
    itemSel.addEventListener("change", () => {
      const item = itemById(itemSel.value);
      if (item?.sizes?.length) {
        sizeSel.innerHTML = `<option value="">${esc(item.choosePrompt || "Choose a size…")}</option>` +
          item.sizes
            .map((s, i) => `<option value="${i}">${esc(s.name)} – ${hasPrice(s.price) ? money(s.price) : "price quoted"}</option>`)
            .join("");
        sizeWrap.hidden = false;
        sizeSel.required = true;
      } else {
        sizeSel.innerHTML = "";
        sizeWrap.hidden = true;
        sizeSel.required = false;
      }
      update();
    });
    line.querySelectorAll("select, input").forEach((el) => el.addEventListener("input", update));
    line.querySelector(".order-line-remove").addEventListener("click", () => {
      line.remove();
      if (!linesBox.children.length) addLine();
      update();
    });
    syncRemoveButtons();
  };

  const syncRemoveButtons = () => {
    const lines = linesBox.querySelectorAll(".order-line");
    lines.forEach((l) => (l.querySelector(".order-line-remove").hidden = lines.length < 2));
  };

  const readLines = () =>
    [...linesBox.querySelectorAll(".order-line")].map((line) => {
      const item = itemById(line.querySelector('[data-f="item"]').value);
      const sizeIdx = line.querySelector('[data-f="size"]').value;
      const size = item?.sizes && sizeIdx !== "" ? item.sizes[Number(sizeIdx)] : null;
      const unit = size ? size.price : item?.price;
      const qty = Math.max(1, parseInt(line.querySelector('[data-f="qty"]').value, 10) || 1);
      const ready = Boolean(item && (!item.sizes?.length || size));
      const quote = ready && (item.quote || !hasPrice(unit));
      return {
        line, item, size, qty, quote, ready,
        color: line.querySelector('[data-f="color"]').value,
        total: ready && !quote ? unit * qty : 0,
      };
    });

  /* ---------- totals ---------- */
  const calc = () => {
    const lines = readLines();
    const subtotal = lines.reduce((s, l) => s + l.total, 0);
    const mode = handoff();
    const shipping = mode === "ship" ? cfg.shippingFlat : mode === "delivery" ? cfg.localDeliveryFee : 0;
    const tax = Math.round((subtotal + shipping) * cfg.taxRate * 100) / 100;
    const total = subtotal + shipping + tax;
    const needsQuote = lines.some((l) => l.quote);
    return { lines, subtotal, shipping, tax, total, mode, needsQuote };
  };

  function update() {
    const { lines, subtotal, shipping, tax, total, mode, needsQuote } = calc();
    lines.forEach((l) => {
      l.line.querySelector('[data-f="price"]').textContent = !l.ready ? "" : l.quote ? "Price quoted" : money(l.total);
    });
    const needsAddress = mode === "ship" || mode === "delivery";
    addressBox.hidden = !needsAddress;
    addressBox.querySelectorAll("input").forEach((i) => (i.required = needsAddress));
    syncRemoveButtons();

    submitBtn.textContent = needsQuote
      ? "Send my request"
      : subtotal ? `Continue to PayPal – ${money(total)}` : "Continue to PayPal";

    if (!subtotal) {
      totalsBox.innerHTML = needsQuote ? `<p class="order-hint">B will email you a price for your order. You'll pay after you get it.</p>` : "";
      return;
    }
    const rows = [["Items", money(subtotal)]];
    if (mode === "ship") rows.push(["Shipping", money(shipping)]);
    if (mode === "delivery") rows.push(["Local delivery", shipping ? money(shipping) : "Free"]);
    rows.push([`Sales tax (${(cfg.taxRate * 100).toFixed(2).replace(/\.?0+$/, "")}%)`, money(tax)]);
    totalsBox.innerHTML =
      rows.map(([k, v]) => `<div class="order-row"><span>${k}</span><span>${v}</span></div>`).join("") +
      `<div class="order-row order-row-total"><span>${needsQuote ? "So far" : "Total"}</span><span>${money(total)}</span></div>` +
      (needsQuote ? `<p class="order-hint">Some items need a price quote. B will email you the final total, then you can pay.</p>` : "");
  }

  form.addEventListener("change", (e) => { if (e.target.name === "handoff") update(); });
  $("order-add").addEventListener("click", () => { addLine(); update(); });

  /* ---------- building the order ---------- */
  const showError = (msg) => { errorBox.textContent = msg; errorBox.hidden = !msg; };
  const newOrderId = () => {
    const d = new Date();
    const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
    return `BCSC-${ymd}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  };
  const lineText = (l) => `${l.qty} x ${l.item.name}${l.size ? ` (${l.size.name})` : ""}, ${l.color} – ${l.quote ? "price to quote" : money(l.total)}`;
  const shortSummary = (lines) => {
    const s = lines.map((l) => `${l.qty}x ${l.item.name}${l.size ? ` ${l.size.name}` : ""} ${l.color}`).join("; ");
    return s.length > 120 ? `${s.slice(0, 117)}...` : s;
  };

  const buildOrder = () => {
    const { lines, subtotal, shipping, tax, total, mode, needsQuote } = calc();
    const f = form.elements;
    const modeLabel = { pickup: "Local pickup", delivery: "Local delivery", ship: "Ship to customer" }[mode];
    return {
      id: newOrderId(),
      needsQuote,
      total,
      summary: shortSummary(lines),
      fields: {
        first_name: f.first_name.value.trim(),
        last_name: f.last_name.value.trim(),
        email: f.email.value.trim(),
        phone: f.phone.value.trim(),
        items: lines.map(lineText).join(" | "),
        notes: f.details.value.trim(),
        how_they_get_it: modeLabel,
        address: mode === "ship" || mode === "delivery" ? `${f.address.value.trim()}, ${f.city.value.trim()} ${f.zip.value.trim()}` : "",
        subtotal: money(subtotal),
        shipping_or_delivery: money(shipping),
        sales_tax: money(tax),
        total: needsQuote ? `${money(total)} so far + items to quote` : money(total),
      },
    };
  };

  const emailOrder = async (order, subject, extra = {}) => {
    try {
      const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(cfg.inbox)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ _subject: subject, _template: "table", _captcha: "false", order_number: order.id, ...extra, ...order.fields }),
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  };

  const showDone = (title, text) => {
    form.hidden = true;
    done.hidden = false;
    doneTitle.textContent = title;
    doneText.textContent = text;
    payBox.innerHTML = "";
    done.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /* ---------- submit ---------- */
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    showError("");
    const { lines } = calc();
    if (lines.some((l) => !l.item || !l.color || (l.item.sizes?.length && !l.size))) {
      return showError("Please choose an item, size (if it has one) and color on every line.");
    }
    if (!form.reportValidity()) return;
    if (!cfg.inbox) return showError("Orders can't be sent right now. Please email the shop directly.");

    const order = buildOrder();
    const name = `${order.fields.first_name} ${order.fields.last_name}`;

    // Quote requests go to B right away, clearly marked as not paid.
    if (order.needsQuote) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
      const ok = await emailOrder(order, `QUOTE REQUEST – NOT PAID – ${name}`, { payment_status: "NOT PAID – needs a price quote" });
      submitBtn.disabled = false;
      update();
      if (!ok) return showError("That didn't send. Please try again, or email the shop directly.");
      return showDone("Thank you! Your request was sent.", "B will email you a price. When you get it, you can pay with PayPal below.");
    }

    // Priced orders: pay first. The order is emailed to B after PayPal sends the customer back.
    if (!cfg.paypal) return showError("Online payment isn't set up yet. Please email the shop to order.");
    store.set(`bcsc-order-${order.id}`, { order, sent: false });
    const back = `${location.origin}${location.pathname}`;
    location.href = paypalUrl(order.total, `Order ${order.id}: ${order.summary}`, {
      invoice: order.id,
      custom: order.id,
      return: `${back}?paid=${encodeURIComponent(order.id)}`,
      cancel_return: `${back}?canceled=${encodeURIComponent(order.id)}`,
      rm: "1",
    });
  });

  /* ---------- PayPal ---------- */
  function paypalUrl(amount, label, extra = {}) {
    const params = new URLSearchParams({
      cmd: "_xclick",
      business: cfg.paypal,
      item_name: (label || "B's Cozy Southern Creations order").slice(0, 127),
      currency_code: "USD",
      no_shipping: "1",
      charset: "utf-8",
      ...extra,
    });
    if (amount > 0) params.set("amount", amount.toFixed(2));
    return `https://www.paypal.com/cgi-bin/webscr?${params.toString()}`;
  }

  payAmountBtn?.addEventListener("click", () => {
    if (!cfg.paypal) { paypalMissing.hidden = false; return; }
    const amt = parseFloat(payAmount.value);
    window.open(paypalUrl(amt > 0 ? amt : 0, "B's Cozy Southern Creations – quoted order"), "_blank", "noopener");
  });

  /* ---------- coming back from PayPal ---------- */
  const handleReturn = async () => {
    const params = new URLSearchParams(location.search);
    const paidId = params.get("paid");
    const canceledId = params.get("canceled");
    if (canceledId) {
      showError("Your payment was canceled, so your order was not sent. You can try again below.");
      return;
    }
    if (!paidId) return;
    const saved = store.get(`bcsc-order-${paidId}`);
    if (!saved) {
      showDone("Thank you for your payment!", `Your order number is ${paidId}. B has your order details from PayPal and will be in touch.`);
      return;
    }
    if (!saved.sent) {
      const name = `${saved.order.fields.first_name} ${saved.order.fields.last_name}`;
      const ok = await emailOrder(saved.order, `PAID ORDER – ${name} – ${money(saved.order.total)}`, {
        payment_status: "PAID with PayPal (confirm the payment in PayPal)",
      });
      if (ok) store.set(`bcsc-order-${paidId}`, { ...saved, sent: true });
    }
    showDone("Thank you! Your order is paid.", `Your order number is ${paidId}. B will reach out about pickup, delivery or shipping.`);
  };

  /* ---------- load settings ---------- */
  fetch("../content.json", { cache: "no-store" })
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null)
    .then((data) => {
      const o = data?.orderForm || {};
      cfg = {
        inbox: String(data?.contact?.email || "").trim(),
        paypal: String(data?.paypal?.email || "").trim(),
        taxRate: Number(o.taxRate) || 0,
        shippingFlat: Number(o.shippingFlat) || 0,
        localDeliveryFee: Number(o.localDeliveryFee) || 0,
        colors: Array.isArray(o.colors) && o.colors.length ? o.colors : ["Any color"],
        items: Array.isArray(o.items) ? o.items : [],
      };
      addLine();
      update();
      if (!cfg.paypal) paypalMissing.hidden = false;
      handleReturn();
    });
})();
