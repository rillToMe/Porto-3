export default async function handler(req, res) {
  const GAS_ADMIN_URL = process.env.GAS_ADMIN_URL;   // URL /exec GAS
  const ADMIN_KEY     = process.env.ADMIN_KEY;       // sama dengan API_KEY di GAS

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-api-key");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const isPost = req.method === "POST";
    const url = new URL(GAS_ADMIN_URL);

    // Forward query + sisipkan ?key= untuk GET
    if (!isPost) {
      Object.entries(req.query || {}).forEach(([k,v]) => url.searchParams.set(k, v));
      if (ADMIN_KEY) url.searchParams.set('key', ADMIN_KEY);
    }

    // Untuk POST, merge body + key
    let bodyToSend = undefined;
    const headers = { "Content-Type": "application/json" };

    if (isPost) {
      const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      if (ADMIN_KEY) b.key = ADMIN_KEY;
      bodyToSend = JSON.stringify(b);
    }

    const upstream = await fetch(url.toString(), {
      method: req.method,
      headers,
      body: bodyToSend
    });

    const text = await upstream.text();
    res.status(upstream.status).send(text);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
}
