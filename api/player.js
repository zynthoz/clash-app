if (process.env.NODE_ENV !== 'production') {
  require("dotenv").config({ path: "../.env.local" });
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
  res.status(200).json(data);
}
console.log("Token present?", !!process.env.CR_API_TOKEN);
