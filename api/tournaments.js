if (process.env.NODE_ENV !== 'production') {
  require("dotenv").config({ path: "../.env.local" });
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
  res.status(200).json(data);
}
