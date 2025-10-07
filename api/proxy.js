const GAS_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbxCSIf8dpVvYXYoLgtFbHY7_M-3ngfDgPx3CQeq7KzxRqvYO81YJKXT2XX6RKiwknUF-w/exec";

async function sendContact(payload) {
  if (!payload?.nama || !payload?.email || !payload?.pesan) {
    return { status: "error", message: "Data tidak lengkap." };
  }

  try {
    const res = await fetch(GAS_WEBAPP_URL, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const text = await res.text();      
    let json;
    try { json = JSON.parse(text); }   
    catch { json = { status: res.ok ? "success" : "error", message: text || "Unknown response" }; }

    return json;
  } catch (err) {
    return { status: "error", message: err.message || "Network error" };
  }
}

async function pingGAS() {
  try {
    const r = await fetch(GAS_WEBAPP_URL, { method: "GET", cache: "no-store" });
    return await r.text();
  } catch (e) {
    return "ERR: " + e.message;
  }
}

window.sendContact = sendContact;
window.pingGAS = pingGAS;
