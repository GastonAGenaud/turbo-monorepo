export const BRAND_NAME = "GGseeds";

export const DEFAULT_MARKUP_PERCENT = Number(process.env.MARKUP_PERCENT_DEFAULT ?? 15);

export const SECURITY_HEADERS: Record<string, string> = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

export const SCRAPER_USER_AGENT =
  "GGseedsBot/1.0 (+https://ggseeds.local; contacto: ops@ggseeds.local)";
