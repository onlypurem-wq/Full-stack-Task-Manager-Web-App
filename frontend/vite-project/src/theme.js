const KEY = "theme";

// Saved choice first, otherwise follow the device's setting
export function getTheme() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // storage can be blocked; fall through to the default
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

// Puts data-theme="light" or "dark" on the <html> element
export function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
}

// Apply it and remember it for next time
export function setTheme(theme) {
  applyTheme(theme);
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    // not saved, but it still works for this visit
  }
}