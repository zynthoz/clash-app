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
    await page.goto("https://royaleapi.com/decks/popular", { timeout: 60000, waitUntil: "networkidle2" });

    // Log page title to confirm loading
    const title = await page.title();
    console.log("Page title:", title);

    // Log a snippet of the HTML to check structure
    const bodyHTML = await page.evaluate(() => document.body.innerHTML.substring(0, 1000));
    console.log("Page body snippet:", bodyHTML);

    const decks = await page.evaluate(() => {
      const decks = [];
      // Try multiple selectors in case the structure changed
      const selectors = [".deck--cards", ".deck-cards", ".popular-deck", ".deck"];
      let deckElements = [];
      for (const selector of selectors) {
        deckElements = document.querySelectorAll(selector);
        if (deckElements.length > 0) {
          console.log(`Found ${deckElements.length} decks with selector: ${selector}`);
          break;
        }
      }

      deckElements.forEach(deckEl => {
        const cards = [];
        deckEl.querySelectorAll("img").forEach(img => {
          const name = img.getAttribute("alt") || img.getAttribute("title");
          if (name) cards.push(name);
        });
        if (cards.length > 0) decks.push(cards);
      });
      return decks;
    });

    console.log("Scraped decks:", decks);

    await browser.close();
    return res.status(200).json({ decks });
  } catch (err) {
    console.error(err);
    if (browser) await browser.close();
    return res.status(500).json({ error: err.message });
  }
}
