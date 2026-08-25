import { sanitizeHtml } from "#/helpers/utils/sanitizeHtml";

import styles from "./RichText.module.css";

type RichTextProps = {
  html?: string | null;
  className?: string;
  as?: "div" | "span";
};

export function RichText({ html, className, as: Tag = "div" }: RichTextProps) {
  const sanitized = sanitizeHtml(html);
  if (!sanitized) return null;

  const classes = [Tag === "div" ? styles.richText : undefined, className]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag
      className={classes || undefined}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
