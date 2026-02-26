import { scraperConfig } from "./config";

export async function getRenderedHtml(url: string): Promise<string> {
  const dynamicImport = new Function("modulePath", "return import(modulePath)") as (
    modulePath: string,
  ) => Promise<{ chromium: { launch: (args: { headless: boolean }) => Promise<any> } }>;

  const { chromium } = await dynamicImport("playwright");
  const cfg = scraperConfig();
  const browser = await chromium.launch({ headless: true });

  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: cfg.timeoutMs });
    await page.waitForTimeout(1000);
    return await page.content();
  } finally {
    await browser.close();
  }
}
