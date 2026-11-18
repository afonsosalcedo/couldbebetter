// Could Be Better — light/dark switch. Loaded in <head> so the saved choice
// applies before the page paints. With no saved choice the page follows the
// system setting, and so do the screenshots (via <picture> media queries).
(function theme() {
  const KEY = "cbb-theme";
  const root = document.documentElement;
  const system = window.matchMedia("(prefers-color-scheme: dark)");
  let saved = null;
  try { saved = localStorage.getItem(KEY); } catch { /* private mode: follow the system */ }
  if (saved !== "light" && saved !== "dark") saved = null;
  if (saved) root.dataset.theme = saved;

  const current = () => root.dataset.theme || (system.matches ? "dark" : "light");

  function paint() {
    const mode = current();
    const explicit = Boolean(root.dataset.theme);
    // Screenshots: each <picture> carries a dark <source>; an explicit choice
    // forces it on or off, otherwise it keeps following the system.
    document.querySelectorAll("source[data-dark]").forEach((source) => {
      source.media = explicit ? (mode === "dark" ? "all" : "not all") : "(prefers-color-scheme: dark)";
    });
    document.querySelectorAll("[data-theme-set]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.themeSet === mode));
    });
    document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
      if (explicit) { meta.removeAttribute("media"); meta.content = mode === "dark" ? "#14161a" : "#faf8f4"; }
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

  system.addEventListener("change", paint);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", wire);
  else wire();
})();
