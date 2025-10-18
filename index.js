require("dotenv").config({ path: "./.env.local" });
const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.static('pages'));

app.get('/api/player', async (req, res) => {
  const token = process.env.CR_API_TOKEN;
  const playerTag = req.query.tag; // get from query string
  console.log("Token loaded:", token ? "yes ✅" : "no ❌");
  if (!playerTag) {
    return res.status(400).json({ error: "Player tag is required" });
  }

  const url = `https://proxy.royaleapi.dev/v1/players/${encodeURIComponent(playerTag)}`;
  console.log("Fetching URL:", url);

  const response = await fetch(url, {
    headers: { "Authorization": `Bearer ${token}` }
  });

  if (!response.ok) {
    console.error(`API Error: ${response.status} ${response.statusText}`);
    return res.status(response.status).json({ error: `API Error: ${response.status} ${response.statusText}` });
  }

  const data = await response.json();
  res.json(data);
});

app.get('/api/player/battlelog', async (req, res) => {
  const token = process.env.CR_API_TOKEN;
  const playerTag = req.query.tag; // get from query string
  console.log("Token loaded:", token ? "yes ✅" : "no ❌");
  if (!playerTag) {
    return res.status(400).json({ error: "Player tag is required" });
  }

  const url = `https://proxy.royaleapi.dev/v1/players/${encodeURIComponent(playerTag)}/battlelog`;
  console.log("Fetching battle log URL:", url);

  const response = await fetch(url, {
    headers: { "Authorization": `Bearer ${token}` }
  });

  if (!response.ok) {
    console.error(`API Error: ${response.status} ${response.statusText}`);
    return res.status(response.status).json({ error: `API Error: ${response.status} ${response.statusText}` });
  }

  const data = await response.json();
  res.json(data);
});

app.get('/api/cards', async (req, res) => {
  const token = process.env.CR_API_TOKEN;
  console.log("Token loaded:", token ? "yes ✅" : "no ❌");

  const url = `https://proxy.royaleapi.dev/v1/cards`;
  console.log("Fetching cards URL:", url);

  const response = await fetch(url, {
    headers: { "Authorization": `Bearer ${token}` }
  });

  if (!response.ok) {
    console.error(`API Error: ${response.status} ${response.statusText}`);
    return res.status(response.status).json({ error: `API Error: ${response.status} ${response.statusText}` });
  }

  const data = await response.json();
  res.json(data);
});

app.get('/api/tournaments', async (req, res) => {
  const token = process.env.CR_API_TOKEN;
  console.log("Token loaded:", token ? "yes ✅" : "no ❌");

  const url = `https://proxy.royaleapi.dev/v1/globaltournaments`;
  console.log("Fetching tournaments URL:", url);

  const response = await fetch(url, {
    headers: { "Authorization": `Bearer ${token}` }
  });

  if (!response.ok) {
    console.error(`API Error: ${response.status} ${response.statusText}`);
    return res.status(response.status).json({ error: `API Error: ${response.status} ${response.statusText}` });
  }

  const data = await response.json();
  res.json(data);
});


app.get('/api/clan', async (req, res) => {
  const token = process.env.CR_API_TOKEN;
  console.log("Token loaded:", token ? "yes ✅" : "no ❌");

  const location = req.query.location || 'global'; // Default to global
  const cursor = req.query.after || req.query.before;
  const param = req.query.after ? 'after' : req.query.before ? 'before' : '';

  const url = `https://proxy.royaleapi.dev/v1/locations/${location}/rankings/clans?limit=50${param ? `&${param}=${encodeURIComponent(cursor)}` : ''}`;
  console.log("Fetching clan leaderboard URL:", url);

  const response = await fetch(url, {
    headers: { "Authorization": `Bearer ${token}` }
  });

  if (!response.ok) {
    console.error(`API Error: ${response.status} ${response.statusText}`);
    return res.status(response.status).json({ error: `API Error: ${response.status} ${response.statusText}` });
  }

  const data = await response.json();
  res.json(data);
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
