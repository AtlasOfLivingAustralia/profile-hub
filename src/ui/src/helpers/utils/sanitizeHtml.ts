import DOMPurify from "dompurify";

const SANITIZE_CONFIG = {
  USE_PROFILES: { html: true },
  ADD_TAGS: ["font"],
  ADD_ATTR: ["target", "rel", "face", "color", "size"],
  FORBID_TAGS: [
    "style",
    "script",
    "iframe",
    "object",
    "embed",
    "form",
    "input",
    "textarea",
    "link",
    "meta",
    "base",
  ],
  ALLOW_DATA_ATTR: false,
};

DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (!(node instanceof Element) || node.tagName !== "A") return;
  if (node.getAttribute("target") === "_blank") {
    node.setAttribute("rel", "noopener noreferrer");
  }
});

export function sanitizeHtml(html?: string | null): string {
  if (!html) return "";
  return DOMPurify.sanitize(html, SANITIZE_CONFIG);
}
