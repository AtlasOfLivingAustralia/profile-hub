(() => {
  const stored = localStorage.getItem("theme");
  const preferred =
    stored === "light" || stored === "dark" || stored === "auto"
      ? stored
      : "auto";
  const resolved =
    preferred === "auto"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : preferred;

  document.documentElement.setAttribute("data-bs-theme", resolved);
})();
