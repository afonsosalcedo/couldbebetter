// Could Be Better — light/dark switch. Loaded in <head> so the saved choice
// applies before the page paints. Dark is the default (most artists work in
// the dark); Light is one tap away and remembered.
(function theme() {
  const KEY = "cbb-theme";
  const root = document.documentElement;
  let saved = null;
  try { saved = localStorage.getItem(KEY); } catch { /* private mode: follow the system */ }
  root.dataset.theme = saved === "light" ? "light" : "dark";

  const current = () => root.dataset.theme;

  function paint() {
    const mode = current();
    // Screenshots: each <picture> carries a dark <source>, switched on or off.
    document.querySelectorAll("source[data-dark]").forEach((source) => {
      source.media = mode === "dark" ? "all" : "not all";
    });
    document.querySelectorAll("[data-theme-set]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.themeSet === mode));
    });
    document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
      meta.content = mode === "dark" ? "#14161a" : "#faf8f4";
    });
  }

  function choose(mode) {
    root.dataset.theme = mode;
    try { localStorage.setItem(KEY, mode); } catch { /* still applies for this visit */ }
    paint();
  }

  function wire() {
    document.querySelectorAll("[data-theme-set]").forEach((button) => {
      button.addEventListener("click", () => choose(button.dataset.themeSet));
    });
    paint();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", wire);
  else wire();
})();
