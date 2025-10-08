export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const googleScriptUrl = "https://script.google.com/macros/s/AKfycbyk-6lKOXwaOU3ef0OGVJ8GkkYbXAPCiwZFlM-Yy7OAGkm5DO_b9r_-FSG6RVkI8ns_KA/exec";

  try {
    if (req.method === "POST") {
      const response = await fetch(googleScriptUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      });
      const text = await response.text();
      return res.status(200).send(text);
    }
    if (req.method === "GET") {
      const response = await fetch(googleScriptUrl);
      const text = await response.text();
      return res.status(200).send(text);
    }
    res.status(405).json({ message: "Method not allowed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Proxy error" });
  }
}
