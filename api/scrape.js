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
      waitUntil: "networkidle2",
    });

    const decks = await page.evaluate(() => {
      const decks = [];
      document.querySelectorAll(".deck--cards").forEach(deckEl => {
        const cards = [];
        deckEl.querySelectorAll("img").forEach(img => {
          const name = img.getAttribute("alt");
          if (name) cards.push(name);
        });
        decks.push(cards);
      });
      return decks;
    });

    await browser.close();
    return res.status(200).json({ decks });
  } catch (err) {
    console.error(err);
    if (browser) await browser.close();
    return res.status(500).json({ error: err.message });
  }
}
