if (process.env.NODE_ENV !== 'production') {
  require("dotenv").config({ path: "../.env.local" });
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
  res.status(200).json(data);
}
