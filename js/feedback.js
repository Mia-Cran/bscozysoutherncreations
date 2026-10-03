/* Leave a Review page (/feedback/).
   Star rating (required) + optional comment. Sent to B's inbox with FormSubmit.
   Settings in content.json -> reviews:
     googleReviewUrl: B's Google "write a review" link. When set, 4–5 star
                      reviewers are asked to post on Google too.
     items:          reviews shown on the homepage (B picks them). */
(() => {
  const form = document.getElementById("fb-form");
  if (!form) return;
  const $ = (id) => document.getElementById(id);
  const errorBox = $("fb-error");
  const starsText = $("fb-stars-text");
  const btn = form.querySelector(".order-submit");
  const words = ["", "1 star – sorry we missed!", "2 stars", "3 stars – it was okay", "4 stars – loved it", "5 stars – loved it!"];
  let inbox = "";
  let googleUrl = "";

  fetch("../content.json", { cache: "no-store" })
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => {
      inbox = String(data?.contact?.email || "").trim();
      googleUrl = String(data?.reviews?.googleReviewUrl || "").trim();
      const sel = $("fb-item");
      const names = (data?.orderForm?.items || []).map((i) => i.name);
      [...names, "Something else"].forEach((n) => {
        const o = document.createElement("option");
        o.value = o.textContent = n;
        sel.appendChild(o);
      });
    })
    .catch(() => {});

  form.addEventListener("change", (e) => {
    if (e.target.name !== "rating") return;
    const n = +e.target.value;
    starsText.textContent = words[n];
    form.querySelectorAll('#fb-stars input').forEach((i) => i.parentElement.classList.toggle("is-on", +i.value <= n));
  });

  const showError = (msg) => { errorBox.textContent = msg; errorBox.hidden = false; };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorBox.hidden = true;
    const f = form.elements;
    const rating = +(form.querySelector('input[name="rating"]:checked')?.value || 0);
    const first = f.first_name.value.trim();
    if (!rating) return showError("Please tap a star rating.");
    if (!first) return showError("Please add your first name.");
    if (!inbox) return showError("Reviews can't be sent right now. Please try again later.");
    const share = f.ok_to_share.checked;
    const comment = f.comment.value.trim();
    btn.disabled = true;
    btn.textContent = "Sending…";
    try {
      const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(inbox)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: `${rating}-STAR REVIEW – ${first}${share ? " – OK to share" : ""}`,
          _template: "table",
          _captcha: "false",
          rating: `${"★".repeat(rating)}${"☆".repeat(5 - rating)} (${rating} of 5)`,
          item: f.item.value || "(not picked)",
          comment: comment || "(no comment)",
          first_name: first,
          city: f.city.value.trim(),
          email: f.email.value.trim(),
          ok_to_share_on_website: share ? "YES" : "NO",
        }),
      });
      if (!res.ok) throw new Error();
    } catch {
      btn.disabled = false;
      btn.textContent = "Send my review";
      return showError("Sorry, that didn't send. Please try again.");
    }
    form.hidden = true;
    $("fb-done-text").textContent =
      rating >= 4 ? "Your review was sent to B. It means the world to our little business!" : "Your review was sent to B. Thank you for helping us do better.";
    if (rating >= 4 && googleUrl) {
      $("fb-google-btn").href = googleUrl;
      $("fb-google").hidden = false;
    }
    $("fb-done").hidden = false;
    $("fb-done").scrollIntoView({ behavior: "smooth", block: "start" });
  });
})();

/* Homepage: "What customers say" (content.json -> reviews.items) */
(() => {
  const box = document.getElementById("reviews");
  if (!box) return;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  fetch("content.json", { cache: "no-store" })
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => {
      const items = (data?.reviews?.items || []).filter((r) => r && r.name);
      if (!items.length) return;
      document.getElementById("reviews-list").innerHTML = items
        .map((r) => {
          const n = Math.max(1, Math.min(5, +r.rating || 5));
          return `<figure class="review-card"><div class="review-stars" aria-label="${n} out of 5 stars">${"★".repeat(n)}</div>${
            r.text ? `<blockquote>“${esc(r.text)}”</blockquote>` : ""
          }<figcaption>— ${esc(r.name)}${r.city ? `, ${esc(r.city)}` : ""}${r.item ? ` · ${esc(r.item)}` : ""}</figcaption></figure>`;
        })
        .join("");
      box.hidden = false;
    })
    .catch(() => {});
})();
