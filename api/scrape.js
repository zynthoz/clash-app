import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export default async function handler(req, res) {
  let browser = null;

  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.goto("https://royaleapi.com/decks/popular", {
      waitUntil: ["domcontentloaded", "networkidle2"],
      timeout: 90000,
    });

    // Wait for deck elements to load
    await page.waitForSelector(".deck--cards img", { timeout: 20000 });

    const decks = await page.evaluate(() => {
      const decks = [];
      document.querySelectorAll(".deck--cards").forEach(deckEl => {
        const cards = [];
        deckEl.querySelectorAll("img").forEach(img => {
          const name = img.getAttribute("alt") || img.getAttribute("title");
          if (name) cards.push(name);
        });
        if (cards.length > 0) decks.push(cards);
      });
      return decks;
    });

    console.log(`✅ Scraped ${decks.length} decks`);
    await browser.close();

    return res.status(200).json({ decks });
  } catch (err) {
    console.error("❌ Scrape failed:", err);
    if (browser) await browser.close();
    return res.status(500).json({ error: err.message });
  }
}
