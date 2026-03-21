export function scraperConfig() {
  const maxProducts = Number(process.env.SCRAPER_MAX_PRODUCTS ?? "");

  return {
    concurrency: Number(process.env.SCRAPER_CONCURRENCY ?? 2),
    delayMs: Number(process.env.SCRAPER_DELAY_MS ?? 800),
    timeoutMs: Number(process.env.SCRAPER_TIMEOUT_MS ?? 15000),
    retries: Number(process.env.SCRAPER_MAX_RETRIES ?? 3),
    maxProducts: Number.isFinite(maxProducts) && maxProducts > 0 ? maxProducts : null,
  };
}
