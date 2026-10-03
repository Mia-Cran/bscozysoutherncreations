/* Order & Pay page (/order/).
   Reads prices, colors, sizes, shipping and tax from content.json -> orderForm,
   adds everything up, emails the order through FormSubmit (same inbox as the
   contact form), then offers a PayPal button for the total. */
(() => {
  const form = document.getElementById("order-form");
  if (!form) return;

  const $ = (id) => document.getElementById(id);
  const linesBox = $("order-lines");
  const totalsBox = $("order-totals");
  const errorBox = $("order-error");
  const addressBox = $("order-address");
  const done = $("order-done");
  const doneText = $("order-done-text");
  const payBox = $("order-pay");
  const payAmount = $("pay-amount");
  const payAmountBtn = $("pay-amount-btn");
  const paypalMissing = $("paypal-missing");

  let cfg = { inbox: "", paypal: "", taxRate: 0, shippingFlat: 0, localDeliveryFee: 0, colors: [], items: [] };
  const from = (item) => (item?.startingAt ? "from " : "");
  const money = (n) => `$${(Math.round(n * 100) / 100).toFixed(2)}`;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const itemById = (id) => cfg.items.find((i) => i.id === id);
  const basePrice = (i) => i.price || (i.sizes?.length ? Math.min(...i.sizes.map((s) => s.price)) : 0);

  const handoff = () => form.querySelector('input[name="handoff"]:checked')?.value || "pickup";

  /* ---------- item lines ---------- */
  const addLine = () => {
    const line = document.createElement("div");
    line.className = "order-line";
    line.innerHTML = `
      <label class="order-line-item">Item
        <select data-f="item" required>
          <option value="">Choose an item…</option>
          ${cfg.items.map((i) => `<option value="${esc(i.id)}">${esc(i.name)}${i.quote ? " – price quoted" : basePrice(i) ? ` – ${i.sizes?.length ? "from " : from(i)}${money(basePrice(i))}` : ""}</option>`).join("")}
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
        sizeSel.innerHTML = `<option value="">Choose a size…</option>` +
          item.sizes.map((s, i) => `<option value="${i}">${esc(s.name)}${` – ${money(s.price)}`}</option>`).join("");
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
      const unit = size ? size.price : item?.price || 0;
      const qty = Math.max(1, parseInt(line.querySelector('[data-f="qty"]').value, 10) || 1);
      return {
        line,
        item,
        size,
        color: line.querySelector('[data-f="color"]').value,
        qty,
        unit,
        total: unit * qty,
        ready: Boolean(item && (!item.sizes?.length || size)),
      };
    });

  /* ---------- totals ---------- */
  const calc = () => {
    const lines = readLines();
    const subtotal = lines.reduce((s, l) => s + (l.ready ? l.total : 0), 0);
    const mode = handoff();
    const shipping = mode === "ship" ? cfg.shippingFlat : mode === "delivery" ? cfg.localDeliveryFee : 0;
    const tax = mode === "table" ? 0 : Math.round((subtotal + shipping) * cfg.taxRate * 100) / 100;
    const total = subtotal + shipping + tax;
    const estimate = lines.some((l) => l.ready && (l.item.startingAt || l.item.quote));
    return { lines, subtotal, shipping, tax, total, mode, estimate };
  };

  function update() {
    const { lines, subtotal, shipping, tax, total, mode, estimate } = calc();
    lines.forEach((l) => {
      l.line.querySelector('[data-f="price"]').textContent = l.ready ? (l.item.quote ? "Price quoted" : `${from(l.item)}${money(l.total)}`) : "";
    });
    addressBox.hidden = !(mode === "ship" || mode === "delivery");
    addressBox.querySelectorAll("input").forEach((i) => (i.required = mode === "ship" || mode === "delivery"));
    syncRemoveButtons();

    if (!subtotal) {
      totalsBox.innerHTML = estimate ? `<p class="order-hint">B will send you a price quote for your order.</p>` : "";
      return;
    }
    const rows = [[`Items`, money(subtotal)]];
    if (mode === "ship") rows.push(["Shipping", money(shipping)]);
    if (mode === "delivery") rows.push(["Local delivery", shipping ? money(shipping) : "Free"]);
    if (mode !== "table") rows.push([`Sales tax (${(cfg.taxRate * 100).toFixed(2).replace(/\.?0+$/, "")}%)`, money(tax)]);
    totalsBox.innerHTML =
      rows.map(([k, v]) => `<div class="order-row"><span>${k}</span><span>${v}</span></div>`).join("") +
      `<div class="order-row order-row-total"><span>${estimate ? "Estimated total" : "Total"}</span><span>${estimate ? "from " : ""}${money(total)}</span></div>` +
      (estimate ? `<p class="order-hint">Some items have starting prices or need a quote. B will confirm your final price before you pay.</p>` : "") +
      (mode === "table" ? `<p class="order-hint">You'll pay at the vendor table.</p>` : "");
  }

  form.addEventListener("change", (e) => { if (e.target.name === "handoff") update(); });
  $("order-add").addEventListener("click", () => { addLine(); update(); });

  /* ---------- submit ---------- */
  const showError = (msg) => { errorBox.textContent = msg; errorBox.hidden = !msg; };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    showError("");
    const { lines, subtotal, shipping, tax, total, mode, estimate } = calc();
    const missing = lines.find((l) => !l.item || !l.color || (l.item.sizes?.length && !l.size));
    if (missing) return showError("Please choose an item, color (and size for blankets) on every line.");
    if (!form.reportValidity()) return;
    if (!cfg.inbox) return showError("Orders can't be sent right now. Please email the shop directly.");

    const f = form.elements;
    const name = `${f.first_name.value.trim()} ${f.last_name.value.trim()}`;
    const modeLabel = { table: "Buying at the vendor table", pickup: "Local pickup", delivery: "Local delivery", ship: "Ship to customer" }[mode];
    const payload = {
      _subject: `New order from ${name} – ${estimate ? "est. from " : ""}${money(total)}`,
      _template: "table",
      _captcha: "false",
      first_name: f.first_name.value.trim(),
      last_name: f.last_name.value.trim(),
      email: f.email.value.trim(),
      phone: f.phone.value.trim(),
      items: lines
        .map((l) => `${l.qty} x ${l.item.name}${l.size ? ` (${l.size.name})` : ""}, ${l.color} – ${l.item.quote ? "price to quote" : `${from(l.item)}${money(l.total)}`}`)
        .join(" | "),
      notes: f.details.value.trim(),
      how_they_get_it: modeLabel,
      address: mode === "ship" || mode === "delivery" ? `${f.address.value.trim()}, ${f.city.value.trim()} ${f.zip.value.trim()}` : "",
      subtotal: money(subtotal),
      shipping_or_delivery: money(shipping),
      sales_tax: money(tax),
      total: estimate ? `Estimate from ${money(total)} (starting prices, confirm final price with customer)` : money(total),
    };

    const btn = form.querySelector(".order-submit");
    btn.disabled = true;
    btn.textContent = "Sending…";
    let ok = false;
    try {
      const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(cfg.inbox)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      ok = res.ok;
    } catch (e) {
      ok = false;
    }
    btn.disabled = false;
    btn.textContent = "Send my order";
    if (!ok) return showError("That didn't send. Please try again, or email the shop directly.");

    form.hidden = true;
    done.hidden = false;
    payBox.innerHTML = "";
    if (estimate) {
      doneText.textContent = `Your estimate starts at ${money(total)}. B will contact you with your final price. Then you can pay with PayPal below${mode === "table" ? " or at the vendor table" : ""}.`;
    } else if (mode === "table") {
      doneText.textContent = `Your total is ${money(total)}. Please pay at the vendor table.`;
    } else if (cfg.paypal) {
      doneText.textContent = `Your total is ${money(total)}. Pay now with PayPal to lock in your order.`;
      const a = document.createElement("a");
      a.className = "btn btn-primary paypal-btn";
      a.href = paypalUrl(total, `Order for ${name}`);
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = `Pay ${money(total)} with PayPal`;
      payBox.appendChild(a);
    } else {
      doneText.textContent = `Your total is ${money(total)}. B will send you a payment link to finish your order.`;
    }
    done.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  /* ---------- PayPal ---------- */
  function paypalUrl(amount, label) {
    const params = new URLSearchParams({
      cmd: "_xclick",
      business: cfg.paypal,
      item_name: label || "B's Cozy Southern Creations order",
      currency_code: "USD",
      no_shipping: "1",
    });
    if (amount > 0) params.set("amount", amount.toFixed(2));
    return `https://www.paypal.com/cgi-bin/webscr?${params.toString()}`;
  }

  payAmountBtn?.addEventListener("click", () => {
    if (!cfg.paypal) { paypalMissing.hidden = false; return; }
    const amt = parseFloat(payAmount.value);
    window.open(paypalUrl(amt > 0 ? amt : 0), "_blank", "noopener");
  });

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
    });
})();
