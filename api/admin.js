export default async function handler(req, res) {
  const GAS_ADMIN_URL = "https://script.google.com/macros/s/AKfycbz97Kvvm3JJuTDNtsMrU39iKwhu0adlbvNS3stTn1y3jgnupBTlhckH6N6c4ChhPbRn/exec";
  const ADMIN_KEY = process.env.ADMIN_KEY;

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-api-key");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const isPost = req.method === "POST";
    const url = new URL(GAS_ADMIN_URL);
    if (!isPost) {
      // forward query for read
      Object.entries(req.query || {}).forEach(([k,v]) => url.searchParams.set(k, v));
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
    res.status(upstream.status).send(text);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
}



