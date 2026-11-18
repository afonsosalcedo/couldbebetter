// Could Be Better — site behaviour. No dependencies, no tracking.

// The things to fill in before launch.
const FORM_ENDPOINT = "";           // e.g. "https://formspree.io/f/xxxxxxxx" (accepts a JSON POST)
const CONTACT_EMAIL = "hello@couldbebetter.app";

// --- Invite request form ----------------------------------------------------
// With FORM_ENDPOINT set (a form service that accepts a JSON POST, such as
// Formspree), requests are sent there. Without one, the form opens an email
// draft with the answers filled in, so it works with no backend at all.
(function invite() {
  const dialog = document.getElementById("invite");
  const form = document.getElementById("invite-form");
  const done = document.getElementById("invite-done");
  const doneText = document.getElementById("invite-done-text");
  const error = document.getElementById("invite-error");
  if (!dialog || !form) return;

  document.querySelectorAll("[data-open-invite]").forEach((el) => el.addEventListener("click", () => {
    form.hidden = false; done.hidden = true; error.hidden = true;
    if (typeof dialog.showModal === "function") dialog.showModal();
    else location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Could Be Better beta")}`;
  }));
  document.querySelectorAll("[data-close-invite]").forEach((el) => el.addEventListener("click", () => dialog.close()));
  dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const answers = {
      name: (data.get("name") || "").trim(),
      email: (data.get("email") || "").trim(),
      role: data.get("role") || "",
      workplace: data.get("workplace") || "",
      union: data.get("union") || "",
      devices: data.getAll("devices").join(", "),
      note: (data.get("note") || "").trim(),
      acceptedBetaTerms: data.get("consent") ? "yes" : "no",
    };
    const fail = (message, field) => { error.textContent = message; error.hidden = false; form.elements[field]?.focus(); };
    if (!answers.name) return fail("Please add your name.", "name");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answers.email)) return fail("That email doesn't look right.", "email");
    if (!answers.role) return fail("Please choose what you do.", "role");
    if (answers.acceptedBetaTerms !== "yes") return fail("Please tick the box about beta software to continue.", "consent");
    error.hidden = true;

    if (FORM_ENDPOINT) {
      const button = form.querySelector('[type="submit"]');
      button.disabled = true;
      try {
        const response = await fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(answers),
        });
        if (!response.ok) throw new Error(String(response.status));
        doneText.textContent = "Thank you. If there's a spot, a TestFlight invite will arrive at the email you gave.";
      } catch {
        button.disabled = false;
        return fail(`That didn't send. Please try again, or email ${CONTACT_EMAIL}.`, "email");
      }
      button.disabled = false;
    } else {
      const lines = [
        `Name: ${answers.name}`, `Email: ${answers.email}`, `Role: ${answers.role}`,
        `Works in: ${answers.workplace || "-"}`, `Union timecard: ${answers.union || "not sure"}`,
        `Devices: ${answers.devices || "-"}`, `Accepted beta terms: yes`, "", answers.note,
      ];
      location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Could Be Better beta request")}&body=${encodeURIComponent(lines.join("\n"))}`;
      doneText.textContent = `Your mail app should have opened with the request ready to send. If it didn't, email ${CONTACT_EMAIL} with the same details.`;
    }
    form.reset(); form.hidden = true; done.hidden = false;
  });

  const mail = document.getElementById("mail");
  if (mail) { mail.href = `mailto:${CONTACT_EMAIL}`; mail.textContent = CONTACT_EMAIL; }
})();

// --- The note generator -----------------------------------------------------
(function noteMachine() {
  const text = document.getElementById("note-text");
  const line = document.getElementById("note-line");
  const check = document.getElementById("note-check");
  const next = document.getElementById("note-next");
  const from = document.getElementById("note-from");
  const shot = document.getElementById("note-shot");
  const tally = document.getElementById("note-tally");
  if (!text || !line || !check || !next) return;

  const notes = [
    ["Supervisor notes", "Push the key a little hotter on the face"],
    ["Supervisor notes", "Less fill, let the shadow side fall off"],
    ["DP rounds", "The rim is reading too blue, warm it up"],
    ["Dailies", "Love the shape, just calm the background"],
    ["Dailies", "Eyes need a ping in the wide"],
    ["Supervisor notes", "Try the lantern a stop brighter"],
    ["DP rounds", "Background is competing, knock it down"],
    ["Director", "Can it feel more… magical?"],
    ["Dailies", "Hold the mood from the previous shot"],
    ["Supervisor notes", "Soften the shadow on the wall"],
    ["Tech check", "Fireflies on the glass at frame 48"],
    ["Director", "Go back to version 3, but keep the changes"],
    ["DP rounds", "A touch more atmosphere in the doorway"],
    ["Supervisor notes", "It's close. CBB."],
    ["Dailies", "Could be better"],
  ];
  const shots = ["310.0 / 086.00", "310.0 / 092.00", "245.0 / 057.00", "120.0 / 011.00", "310.0 / 097.00"];
  const lines = [
    "Tick it off. There's always another.",
    "One down.",
    "Two. You're on a roll.",
    "Three. Lunch can wait.",
    "Four. Somebody get this artist a coffee.",
    "Five fixed. Ready for rounds?",
    "Six. The app would have timed all of that, by the way.",
  ];
  let index = 0;
  let done = 0;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function show(i) {
    const [who, what] = notes[i % notes.length];
    const apply = () => {
      from.textContent = who;
      shot.textContent = shots[i % shots.length];
      text.textContent = what;
      line.classList.remove("done", "swap");
      check.setAttribute("aria-pressed", "false");
    };
    if (reduce) { apply(); return; }
    line.classList.add("swap");
    setTimeout(apply, 180);
  }

  next.addEventListener("click", () => { index += 1; show(index); });
  check.addEventListener("click", () => {
    const nowDone = !line.classList.contains("done");
    line.classList.toggle("done", nowDone);
    check.setAttribute("aria-pressed", String(nowDone));
    if (nowDone) {
      done += 1;
      tally.textContent = lines[Math.min(done, lines.length - 1)];
      setTimeout(() => { index += 1; show(index); }, reduce ? 500 : 900);
    }
  });
})();

// --- One clock for the hero pill and the Watch ------------------------------
(function clocks() {
  const short = document.querySelectorAll("[data-clock]");
  const long = document.querySelectorAll("[data-clock-long]");
  if (!short.length && !long.length) return;
  const started = Date.now() - 42 * 1000;
  const pad = (n) => String(n).padStart(2, "0");
  function tick() {
    const s = Math.floor((Date.now() - started) / 1000);
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    short.forEach((el) => { el.textContent = h ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`; });
    long.forEach((el) => { el.textContent = `${h}:${pad(m)}:${pad(sec)}`; });
  }
  tick();
  setInterval(tick, 1000);
})();

// --- Draw the circle around "Better" ----------------------------------------
requestAnimationFrame(() => document.querySelector(".hero")?.classList.add("drawn"));

// --- Device tabs --------------------------------------------------------------
(function tabs() {
  const list = document.querySelector('[role="tablist"]');
  if (!list) return;
  const tabs = [...list.querySelectorAll('[role="tab"]')];
  function select(tab, focus) {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    });
    if (focus) tab.focus();
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => select(tab, false));
    tab.addEventListener("keydown", (e) => {
      const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!step) return;
      e.preventDefault();
      select(tabs[(i + step + tabs.length) % tabs.length], true);
    });
  });
})();

// --- A little depth on the hero devices (pointer devices only) ---------------
(function tilt() {
  const stage = document.querySelector("[data-tilt]");
  if (!stage || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const layers = [...stage.querySelectorAll(".layer")];
  stage.addEventListener("pointermove", (e) => {
    const r = stage.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    layers.forEach((el) => {
      const d = Number(el.dataset.depth || 8);
      el.style.transform = `translate3d(${(-x * d).toFixed(1)}px, ${(-y * d).toFixed(1)}px, 0)`;
    });
  });
  stage.addEventListener("pointerleave", () => layers.forEach((el) => { el.style.transform = ""; }));
})();

// --- Reveal on scroll -------------------------------------------------------
(function reveal() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    items.forEach((el) => el.classList.add("in"));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add("in"); observer.unobserve(entry.target); }
    });
  }, { rootMargin: "0px 0px -8% 0px" });
  items.forEach((el) => observer.observe(el));
})();
