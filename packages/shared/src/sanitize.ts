import DOMPurify from "isomorphic-dompurify";

export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) {
    return "";
  }
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["p", "strong", "em", "ul", "ol", "li", "br"],
    ALLOWED_ATTR: [],
  });
}

export function plainTextFromHtml(html: string | null | undefined): string {
  const safe = sanitizeHtml(html);
  return safe.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
