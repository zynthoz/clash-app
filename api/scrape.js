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

    let decksData = [];

    // Intercept network responses
    page.on("response", async (response) => {
      const url = response.url();
      if (url.includes("/api/decks/popular")) {
        try {
          const json = await response.json();
          decksData = json.items || json || [];
        } catch (e) {
          console.error("Error parsing deck data:", e);
        }
      }
    });

    await page.goto("https://royaleapi.com/decks/popular", {
      waitUntil: "networkidle2",
      timeout: 90000,
    });

    // Wait until we have data or timeout
    const start = Date.now();
    while (decksData.length === 0 && Date.now() - start < 10000) {
      await new Promise((r) => setTimeout(r, 500));
    }

    await browser.close();

    if (!decksData.length)
      return res.status(500).json({ error: "No deck data found" });

    // Extract only card names
    const decks = decksData.map((deck) =>
      (deck.cards || []).map((c) => c.name)
    );

    return res.status(200).json({ decks });
  } catch (err) {
    console.error("❌ Scrape failed:", err);
    if (browser) await browser.close();
    return res.status(500).json({ error: err.message });
  }
}
