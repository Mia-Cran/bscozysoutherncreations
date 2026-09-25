(() => {
  const REPO = "Mia-Cran/bssoutherncreations";
  const BRANCH = "main";
  const FILE = "content.json";
  const PASS_HASH = "3725ab045e5b4e2df7e5f126a977c40a788b043319bb036b16bca0cd7da0a0eb";
  const TOKEN_KEY = "bsc-github-key";
  const SESSION_KEY = "bsc-admin";

  const loginScreen = document.querySelector('[data-screen="login"]');
  const editorScreen = document.querySelector('[data-screen="editor"]');
  const loginForm = document.querySelector("[data-login]");
  const loginError = document.querySelector("[data-login-error]");
  const editorForm = document.querySelector("[data-editor]");
  const productMount = document.querySelector("[data-product-fields]");
  const tokenInput = document.querySelector("[data-token]");
  const status = document.querySelector("[data-status]");
  const saveBtn = document.querySelector("[data-save]");

  let content = null;
  let fileSha = "";

  const hex = (buffer) =>
    [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");

  const hash = async (value) => {
    const data = new TextEncoder().encode(value);
    return hex(await crypto.subtle.digest("SHA-256", data));
  };

  const decodeGitFile = (b64) => {
    const binary = atob(b64.replace(/\n/g, ""));
    return new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)));
  };

  const encodeGitFile = (text) => {
    const bytes = new TextEncoder().encode(text);
    let binary = "";
    bytes.forEach((b) => {
      binary += String.fromCharCode(b);
    });
    return btoa(binary);
  };

  const showStatus = (message, isError = false) => {
    status.hidden = false;
    status.textContent = message;
    status.style.color = isError ? "#a14b5b" : "#4f7d64";
  };

  const setScreen = (name) => {
    loginScreen.hidden = name !== "login";
    editorScreen.hidden = name !== "editor";
  };

  const fillForm = (data) => {
    if (!data.chat) data.chat = { notifyEmail: "" };
    editorForm.querySelectorAll("[name]").forEach((field) => {
      if (field.dataset.token !== undefined) return;
      const parts = field.name.split(".");
      let value = data;
      parts.forEach((part) => {
        value = value?.[part];
      });
      if (typeof value === "string") field.value = value;
    });

    productMount.querySelectorAll(".product-block").forEach((block) => block.remove());
    data.products.forEach((product, index) => {
      const wrap = document.createElement("div");
      wrap.className = "product-block";
      wrap.innerHTML = `
        <h3>${product.title}</h3>
        <label>Name <input name="products.${index}.title" /></label>
        <label>Description <textarea name="products.${index}.text" rows="3"></textarea></label>
        <label>Photo path <input name="products.${index}.image" /></label>
        <label>Buy link <input name="products.${index}.buyUrl" placeholder="https://buy.stripe.com/..." /></label>
      `;
      productMount.append(wrap);
      wrap.querySelector('[name$=".title"]').value = product.title;
      wrap.querySelector('[name$=".text"]').value = product.text;
      wrap.querySelector('[name$=".image"]').value = product.image;
      wrap.querySelector('[name$=".buyUrl"]').value = product.buyUrl || "";
    });

    renderChatLeads();
  };

  const renderChatLeads = () => {
    const mount = document.querySelector("[data-chat-leads]");
    if (!mount) return;
    let leads = [];
    try {
      leads = JSON.parse(localStorage.getItem("bsc-chat-leads") || "[]");
    } catch {
      leads = [];
    }
    if (!leads.length) {
      mount.innerHTML = `<p class="hint">No chat leads saved in this browser yet.</p>`;
      return;
    }
    mount.innerHTML = leads
      .slice(0, 20)
      .map((lead) => {
        const when = lead.createdAt ? new Date(lead.createdAt).toLocaleString() : "";
        const summary = (lead.summary || "").replace(/</g, "&lt;");
        return `<article class="lead-card"><p class="hint">${when}</p><pre>${summary}</pre></article>`;
      })
      .join("");
  };

  const readForm = () => {
    const next = structuredClone(content);
    if (!next.chat) next.chat = { notifyEmail: "" };
    editorForm.querySelectorAll("[name]").forEach((field) => {
      if (field.dataset.token !== undefined) return;
      const parts = field.name.split(".");
      let cursor = next;
      parts.forEach((part, i) => {
        if (i === parts.length - 1) cursor[part] = field.value;
        else {
          if (cursor[part] == null || typeof cursor[part] !== "object") cursor[part] = {};
          cursor = cursor[part];
        }
      });
    });
    return next;
  };

  const githubHeaders = (token) => ({
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
  });

  const loadRemote = async (token) => {
    const response = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${FILE}?ref=${BRANCH}`,
      { headers: githubHeaders(token) }
    );
    if (!response.ok) throw new Error("Could not read the live site file yet.");
    const payload = await response.json();
    fileSha = payload.sha;
    return JSON.parse(decodeGitFile(payload.content));
  };

  const loadLocal = async () => {
    const response = await fetch("../content.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Could not load shop copy.");
    return response.json();
  };

  const startEditor = async () => {
    setScreen("editor");
    const token = localStorage.getItem(TOKEN_KEY) || "";
    tokenInput.value = token;
    try {
      content = token ? await loadRemote(token) : await loadLocal();
      fillForm(content);
      showStatus(token ? "Logged in. You can edit and save." : "Logged in. Add the GitHub key at the bottom before Save will update the live site.");
    } catch (error) {
      content = await loadLocal();
      fillForm(content);
      showStatus(error.message, true);
    }
  };

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    loginError.hidden = true;
    const password = new FormData(loginForm).get("password") || "";
    if ((await hash(String(password))) !== PASS_HASH) {
      loginError.hidden = false;
      return;
    }
    sessionStorage.setItem(SESSION_KEY, "1");
    startEditor();
  });

  document.querySelector("[data-logout]").addEventListener("click", () => {
    sessionStorage.removeItem(SESSION_KEY);
    setScreen("login");
  });

  saveBtn.addEventListener("click", async () => {
    const token = tokenInput.value.trim();
    if (token) localStorage.setItem(TOKEN_KEY, token);
    if (!token) {
      showStatus("Add the GitHub key at the bottom first. Maria can create that once.", true);
      return;
    }

    const next = readForm();
    saveBtn.disabled = true;
    showStatus("Saving…");
    try {
      if (!fileSha) {
        const current = await loadRemote(token);
        content = current;
      }
      const body = {
        message: "Update shop copy from the editor",
        content: encodeGitFile(JSON.stringify(next, null, 2)),
        sha: fileSha,
        branch: BRANCH,
      };
      const response = await fetch(
        `https://api.github.com/repos/${REPO}/contents/${FILE}`,
        {
          method: "PUT",
          headers: {
            ...githubHeaders(token),
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );
      if (!response.ok) {
        const detail = await response.json().catch(() => ({}));
        throw new Error(detail.message || "Save didn’t go through.");
      }
      const saved = await response.json();
      fileSha = saved.content.sha;
      content = next;
      showStatus("Saved. The live site usually updates within a minute.");
    } catch (error) {
      showStatus(error.message, true);
    } finally {
      saveBtn.disabled = false;
    }
  });

  if (sessionStorage.getItem(SESSION_KEY)) startEditor();
})();
