export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) {
    return "";
  }

  const withoutScripts = html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ");

  return withoutScripts
    .replace(/<\/?(p|br|li|ul|ol|strong|em)\b[^>]*>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function plainTextFromHtml(html: string | null | undefined): string {
  return sanitizeHtml(html);
}
