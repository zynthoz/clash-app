import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

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

    // Pretend to be a real user
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    );

    // Go to RoyaleAPI and wait for it to fully render
    await page.goto("https://royaleapi.com/decks/popular", {
      waitUntil: "networkidle2",
      timeout: 90000,
    });

    // Scroll to load lazy decks
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      await new Promise((r) => setTimeout(r, 1500));
    }

    // Wait for deck images
    await page.waitForSelector(".deck--cards img", { timeout: 30000 });

    // Extract the cards
    const decks = await page.evaluate(() => {
      const decks = [];
      document.querySelectorAll(".deck--cards").forEach(deckEl => {
        const cards = [];
        deckEl.querySelectorAll("img").forEach(img => {
          const name = img.getAttribute("alt") || img.getAttribute("title");
          if (name) cards.push(name);
        });
        if (cards.length) decks.push(cards);
      });
      return decks;
    });

    await browser.close();

    if (!decks.length) {
      return res.status(500).json({ error: "No decks found (after stealth)" });
    }

    return res.status(200).json({ decks });
  } catch (err) {
    console.error("❌ Scrape failed:", err);
    if (browser) await browser.close();
    return res.status(500).json({ error: err.message });
  }
}
