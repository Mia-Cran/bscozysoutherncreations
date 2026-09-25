(() => {
  const STORAGE_KEY = "bsc-chat-leads";
  const MAX_LEADS = 50;

  const loadLeads = () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  };

  const saveLead = (lead) => {
    const leads = loadLeads();
    leads.unshift(lead);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads.slice(0, MAX_LEADS)));
  };

  const answers = {};
  let notifyEmail = "";
  let stepIndex = 0;
  let waitingForText = false;

  const steps = [
    {
      id: "intent",
      bot: "Hi! Welcome to B’s Southern Creations. What can I help with today?",
      choices: [
        { label: "Custom order", value: "custom", next: "craft" },
        { label: "Gift idea", value: "gift", next: "craft" },
        { label: "Just browsing", value: "browse", next: "browseHelp" },
        { label: "Resin (coming soon)", value: "resin", next: "resinInterest" },
      ],
    },
    {
      id: "browseHelp",
      bot: "Browse the shop above anytime. If something catches your eye, I can help start a custom request.",
      choices: [
        { label: "Start a custom request", value: "custom", next: "craft" },
        { label: "That’s all for now", value: "done", next: "softClose" },
      ],
    },
    {
      id: "resinInterest",
      bot: "Resin is joining the studio soon — same southern pastel heart. Want a note when the first pieces are ready, or a custom resin gift when we launch?",
      choices: [
        { label: "Notify me at launch", value: "notify", next: "name" },
        { label: "Custom resin when ready", value: "custom-resin", next: "colors" },
        { label: "Something else handmade", value: "other", next: "craft" },
      ],
    },
    {
      id: "craft",
      bot: "What kind of piece are you thinking about?",
      choices: [
        { label: "Blanket / throw", value: "blanket", next: "colors" },
        { label: "Scarf", value: "scarf", next: "colors" },
        { label: "Hat / beanie", value: "hat", next: "colors" },
        { label: "Set / mitts", value: "set", next: "colors" },
        { label: "Other craft", value: "other-craft", next: "colors" },
        { label: "Not sure yet", value: "unsure", next: "colors" },
      ],
    },
    {
      id: "colors",
      bot: "What colors feel right? Soft pastels, garden greens, neutrals — or a full southern rainbow?",
      input: {
        placeholder: "e.g. sage + cream, soft pink, blues…",
        field: "colors",
        next: "whoFor",
      },
    },
    {
      id: "whoFor",
      bot: "Who is it for? (You, a baby, a friend, a teacher…)",
      input: {
        placeholder: "Who it’s for",
        field: "whoFor",
        next: "size",
      },
    },
    {
      id: "size",
      bot: "Any size notes? Lap throw, baby blanket, adult scarf, beanie fit — whatever you know is helpful.",
      input: {
        placeholder: "Size or fit notes (or “not sure”)",
        field: "size",
        next: "timeline",
      },
    },
    {
      id: "timeline",
      bot: "When do you need it?",
      choices: [
        { label: "No rush", value: "no-rush", next: "name" },
        { label: "In a few weeks", value: "few-weeks", next: "name" },
        { label: "For a date / event", value: "event", next: "eventDate" },
      ],
    },
    {
      id: "eventDate",
      bot: "What date are you aiming for?",
      input: {
        placeholder: "e.g. Oct 20 baby shower",
        field: "eventDate",
        next: "name",
      },
    },
    {
      id: "name",
      bot: "Lovely — almost done. What’s your name?",
      input: {
        placeholder: "Your name",
        field: "name",
        next: "contact",
      },
    },
    {
      id: "contact",
      bot: "Best email so we can follow up? (Phone optional in the same box.)",
      input: {
        placeholder: "you@email.com · optional phone",
        field: "contact",
        next: "summary",
      },
    },
    {
      id: "summary",
      bot: null,
      summary: true,
    },
    {
      id: "softClose",
      bot: "Thanks for stopping by. Whenever you’re ready for a custom piece, tap the chat again — I’ll ask the right questions.",
      choices: [{ label: "Start over", value: "restart", next: "intent" }],
    },
  ];

  const byId = Object.fromEntries(steps.map((step) => [step.id, step]));

  const el = {
    root: null,
    panel: null,
    log: null,
    actions: null,
  };

  const buildShell = () => {
    const root = document.createElement("div");
    root.className = "studio-chat";
    root.innerHTML = `
      <button type="button" class="studio-chat-launch" aria-expanded="false" aria-controls="studio-chat-panel">
        <span class="studio-chat-launch-label">Chat with us</span>
      </button>
      <section id="studio-chat-panel" class="studio-chat-panel" hidden role="dialog" aria-label="Studio chat">
        <header class="studio-chat-header">
          <div>
            <p class="studio-chat-kicker">B’s Southern Creations</p>
            <h2>Studio chat</h2>
          </div>
          <button type="button" class="studio-chat-close" aria-label="Close chat">×</button>
        </header>
        <div class="studio-chat-log" data-chat-log></div>
        <div class="studio-chat-actions" data-chat-actions></div>
      </section>
    `;
    document.body.append(root);
    el.root = root;
    el.panel = root.querySelector(".studio-chat-panel");
    el.log = root.querySelector("[data-chat-log]");
    el.actions = root.querySelector("[data-chat-actions]");

    const launch = root.querySelector(".studio-chat-launch");
    const close = root.querySelector(".studio-chat-close");

    const setOpen = (open) => {
      el.panel.hidden = !open;
      launch.setAttribute("aria-expanded", open ? "true" : "false");
      if (open && !el.log.childElementCount) startChat();
    };

    launch.addEventListener("click", () => setOpen(el.panel.hidden));
    close.addEventListener("click", () => setOpen(false));
  };

  const addBubble = (text, who) => {
    const bubble = document.createElement("div");
    bubble.className = `studio-chat-bubble studio-chat-bubble-${who}`;
    bubble.textContent = text;
    el.log.append(bubble);
    el.log.scrollTop = el.log.scrollHeight;
  };

  const clearActions = () => {
    el.actions.innerHTML = "";
    waitingForText = false;
  };

  const goTo = (id) => {
    const step = byId[id];
    if (!step) return;
    stepIndex = steps.findIndex((item) => item.id === id);
    renderStep(step);
  };

  const buildSummaryText = () => {
    const lines = [
      "New studio chat lead — B's Southern Creations",
      `Intent: ${answers.intent || "—"}`,
      `Piece: ${answers.craft || answers.resinInterest || "—"}`,
      `Colors: ${answers.colors || "—"}`,
      `Who for: ${answers.whoFor || "—"}`,
      `Size: ${answers.size || "—"}`,
      `Timeline: ${answers.timeline || "—"}`,
      `Event: ${answers.eventDate || "—"}`,
      `Name: ${answers.name || "—"}`,
      `Contact: ${answers.contact || "—"}`,
      `When: ${new Date().toLocaleString()}`,
    ];
    return lines.join("\n");
  };

  const finishLead = () => {
    const lead = {
      id: `lead-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...answers,
      summary: buildSummaryText(),
    };
    saveLead(lead);

    addBubble(
      "Thank you! Your notes are saved. We’ll follow up soon — handmade takes a little love and time.",
      "bot"
    );

    clearActions();
    const row = document.createElement("div");
    row.className = "studio-chat-choice-row";

    const copyBtn = document.createElement("button");
    copyBtn.type = "button";
    copyBtn.className = "studio-chat-choice";
    copyBtn.textContent = "Copy my request";
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(lead.summary);
        copyBtn.textContent = "Copied!";
      } catch {
        copyBtn.textContent = "Select & copy from summary";
      }
    });
    row.append(copyBtn);

    if (notifyEmail) {
      const mail = document.createElement("a");
      mail.className = "studio-chat-choice studio-chat-choice-primary";
      mail.href = `mailto:${encodeURIComponent(notifyEmail)}?subject=${encodeURIComponent(
        "BSC custom chat lead"
      )}&body=${encodeURIComponent(lead.summary)}`;
      mail.textContent = "Email this to the studio";
      row.append(mail);
    }

    const again = document.createElement("button");
    again.type = "button";
    again.className = "studio-chat-choice";
    again.textContent = "Start over";
    again.addEventListener("click", () => {
      Object.keys(answers).forEach((key) => delete answers[key]);
      el.log.innerHTML = "";
      goTo("intent");
    });
    row.append(again);

    el.actions.append(row);
  };

  const renderStep = (step) => {
    clearActions();

    if (step.summary) {
      addBubble("Here’s what I heard — sound right?", "bot");
      addBubble(buildSummaryText(), "bot");
      const row = document.createElement("div");
      row.className = "studio-chat-choice-row";
      const yes = document.createElement("button");
      yes.type = "button";
      yes.className = "studio-chat-choice studio-chat-choice-primary";
      yes.textContent = "Yes, send it";
      yes.addEventListener("click", finishLead);
      const edit = document.createElement("button");
      edit.type = "button";
      edit.className = "studio-chat-choice";
      edit.textContent = "Start over";
      edit.addEventListener("click", () => {
        Object.keys(answers).forEach((key) => delete answers[key]);
        el.log.innerHTML = "";
        goTo("intent");
      });
      row.append(yes, edit);
      el.actions.append(row);
      return;
    }

    if (step.bot) addBubble(step.bot, "bot");

    if (step.choices) {
      const row = document.createElement("div");
      row.className = "studio-chat-choice-row";
      step.choices.forEach((choice) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "studio-chat-choice";
        btn.textContent = choice.label;
        btn.addEventListener("click", () => {
          addBubble(choice.label, "user");
          if (step.id === "intent") answers.intent = choice.value;
          else if (step.id === "craft") answers.craft = choice.value;
          else if (step.id === "timeline") answers.timeline = choice.value;
          else if (step.id === "resinInterest") answers.resinInterest = choice.value;
          else if (step.id === "browseHelp" && choice.value === "custom") answers.intent = "custom";

          if (choice.value === "restart") {
            Object.keys(answers).forEach((key) => delete answers[key]);
            el.log.innerHTML = "";
          }
          goTo(choice.next);
        });
        row.append(btn);
      });
      el.actions.append(row);
      return;
    }

    if (step.input) {
      waitingForText = true;
      const form = document.createElement("form");
      form.className = "studio-chat-input-row";
      form.innerHTML = `
        <label class="visually-hidden" for="studio-chat-field">${step.input.placeholder}</label>
        <input id="studio-chat-field" type="text" required maxlength="200" placeholder="${step.input.placeholder}" autocomplete="on" />
        <button type="submit" class="studio-chat-send">Send</button>
      `;
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!waitingForText) return;
        const input = form.querySelector("input");
        const value = input.value.trim();
        if (!value) return;
        addBubble(value, "user");
        answers[step.input.field] = value;
        goTo(step.input.next);
      });
      el.actions.append(form);
      form.querySelector("input").focus();
    }
  };

  const startChat = () => {
    Object.keys(answers).forEach((key) => delete answers[key]);
    el.log.innerHTML = "";
    goTo("intent");
  };

  buildShell();

  fetch("content.json", { cache: "no-store" })
    .then((response) => (response.ok ? response.json() : null))
    .then((content) => {
      if (content?.chat?.notifyEmail) notifyEmail = content.chat.notifyEmail;
    })
    .catch(() => {});
})();
