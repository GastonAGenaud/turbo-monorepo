import { createRequire } from "node:module";

import { logger, SCRAPER_USER_AGENT } from "@ggseeds/shared";

import { scraperConfig } from "./config";

export async function getRenderedHtml(url: string): Promise<string> {
  const cfg = scraperConfig();
  const require = createRequire(import.meta.url);
  const moduleName = ["play", "wright"].join("");

  try {
    const playwright = require(moduleName) as {
      chromium: {
        launch: (options: { headless: boolean }) => Promise<{
          newContext: () => Promise<{
            newPage: () => Promise<{
              goto: (
                pageUrl: string,
                options: { waitUntil: "domcontentloaded"; timeout: number },
              ) => Promise<void>;
              waitForTimeout: (ms: number) => Promise<void>;
              content: () => Promise<string>;
            }>;
          }>;
          close: () => Promise<void>;
        }>;
      };
    };

    const browser = await playwright.chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: cfg.timeoutMs });
    await page.waitForTimeout(1000);
    const html = await page.content();
    await browser.close();
    return html;
  } catch (error) {
    logger.warn({ url, error }, "Playwright no disponible, fallback a fetch HTML");
    const response = await fetch(url, {
      headers: {
        "User-Agent": SCRAPER_USER_AGENT,
        Accept: "text/html,application/xhtml+xml",
      },
    });
    if (!response.ok) {
      throw new Error(`Fallback fetch failed: ${response.status}`);
    }
    return response.text();
  }
}
