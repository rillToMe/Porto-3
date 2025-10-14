export default async function handler(req, res) {
  const allowedOrigins = ["https://ditdev.vercel.app"];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.status(403).json({ message: "Access denied" });
    return;
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const googleScriptUrl = process.env.GOOGLE_SCRIPT_URL;

  try {
    const method = req.method;
    const response = await fetch(googleScriptUrl, {
      method,
      headers: { "Content-Type": "application/json" },
      body: method === "POST" ? JSON.stringify(req.body) : undefined,
    });
    const text = await response.text();
    res.status(200).send(text);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Proxy error" });
  }
}
