export function scraperConfig() {
  return {
    concurrency: Number(process.env.SCRAPER_CONCURRENCY ?? 2),
    delayMs: Number(process.env.SCRAPER_DELAY_MS ?? 800),
    timeoutMs: Number(process.env.SCRAPER_TIMEOUT_MS ?? 15000),
    retries: Number(process.env.SCRAPER_MAX_RETRIES ?? 3),
  };
}
