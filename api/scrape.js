import puppeteer from "puppeteer";

async function scrapePopularDecks() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto("https://royaleapi.com/decks/popular", {
    waitUntil: "networkidle2"
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

  console.log(decks);
  await browser.close();
}

scrapePopularDecks();
