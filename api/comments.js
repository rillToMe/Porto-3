export default async function handler(req, res) {
  const GAS_URL = 'https://script.google.com/macros/s/AKfycbzt8vz_G4lqw_yFZAgYKnpTh9Q4HeM25jAbQXZe75NK4uPm6-AAPtrZic3ny4xxiAeR/exec'; 
  const ADMIN_KEY = process.env.ADMIN_KEY;   

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,x-api-key');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const isPost = req.method === 'POST';
    const url = new URL(GAS_URL);

    if (!isPost && req.query) {
      Object.entries(req.query).forEach(([k,v]) => url.searchParams.set(k, v));
    }

    const body = isPost ? req.body || {} : undefined;

    if (isPost && body && (body.action === 'approve' || body.action === 'delete')) {
      body.key = ADMIN_KEY;
    }

    const upstream = await fetch(url.toString(), {
      method: req.method,
      headers: { 'Content-Type': isPost ? 'application/json' : undefined },
      body: isPost ? JSON.stringify(body) : undefined
    });

    const text = await upstream.text();
    res.status(upstream.status).send(text);
  } catch (err) {
    res.status(500).json({ status:'error', message: err.message });
  }
}
