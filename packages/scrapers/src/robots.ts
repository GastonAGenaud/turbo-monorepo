import { logger, SCRAPER_USER_AGENT } from "@ggseeds/shared";
import robotsParser from "robots-parser";

import { fetchHtml } from "./http";

const cache = new Map<string, ReturnType<typeof robotsParser>>();

function baseOrigin(url: string) {
  const parsed = new URL(url);
  return `${parsed.protocol}//${parsed.host}`;
}

export async function canScrape(url: string): Promise<boolean> {
  const origin = baseOrigin(url);

  if (!cache.has(origin)) {
    const robotsUrl = `${origin}/robots.txt`;
    try {
      const robotsText = await fetchHtml(robotsUrl);
      cache.set(origin, robotsParser(robotsUrl, robotsText));
    } catch (error) {
      logger.warn({ origin, error }, "No robots.txt available; continuing best effort");
      cache.set(origin, robotsParser(`${origin}/robots.txt`, ""));
    }
  }

  const robots = cache.get(origin);
  if (!robots) {
    return true;
  }

  const allowed = robots.isAllowed(url, SCRAPER_USER_AGENT);
  return allowed !== false;
}
