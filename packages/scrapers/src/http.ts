import { logger, SCRAPER_USER_AGENT } from "@ggseeds/shared";
import pRetry from "p-retry";

import { scraperConfig } from "./config";
import { sleep } from "./utils";

export async function fetchHtml(url: string): Promise<string> {
  const cfg = scraperConfig();

  return pRetry(
    async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), cfg.timeoutMs);

      try {
        await sleep(cfg.delayMs);
        const response = await fetch(url, {
          headers: {
            "User-Agent": SCRAPER_USER_AGENT,
            Accept: "text/html,application/xhtml+xml",
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status} for ${url}`);
        }

        return await response.text();
      } finally {
        clearTimeout(timeout);
      }
    },
    {
      retries: cfg.retries,
      factor: 2,
      minTimeout: 500,
      maxTimeout: 4000,
      onFailedAttempt: (error) => {
        logger.warn(
          {
            attempt: error.attemptNumber,
            retriesLeft: error.retriesLeft,
            message: error.message,
            url,
          },
          "Fetch failed, retrying",
        );
      },
    },
  );
}
