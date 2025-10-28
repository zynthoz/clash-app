import fetch from "node-fetch";
import * as cheerio from "cheerio";

async function scrapePopularDecks() {
  const res = await fetch("https://royaleapi.com/decks/popular");
  const html = await res.text();
  const $ = cheerio.load(html);

  const decks = [];

  $(".deck_item").each((i, el) => {
    const cards = [];
    $(el)
      .find(".card_name")
      .each((_, cardEl) => cards.push($(cardEl).text().trim()));
    decks.push(cards);
  });

  console.log(decks);
}

scrapePopularDecks();
