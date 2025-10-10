export default async function handler(req, res) {
  const GAS_URL = process.env.GAS_COMMENTS_URL; 
  const ADMIN_KEY = process.env.ADMIN_KEY || '';

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-api-key");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const isPost = req.method === "POST";
    const url = new URL(GAS_URL);

    if (!isPost) {
      Object.entries(req.query || {}).forEach(([k, v]) => url.searchParams.set(k, v));
    }

    const upstream = await fetch(url.toString(), {
      method: req.method,
      headers: {
        "Content-Type": isPost ? "application/json" : undefined,
        "x-api-key": ADMIN_KEY
      },
      body: isPost ? JSON.stringify(req.body) : undefined,
    });

    const text = await upstream.text();

    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=120, stale-while-revalidate=300");
    res.status(upstream.status).send(text);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
}
