// Recordo recognition proxy (Vercel serverless function).
// Keeps your Anthropic API key on the server. Set these environment variables in Vercel:
//   ANTHROPIC_API_KEY  (required)  your key from console.anthropic.com
//   APP_PASSCODE       (optional)  if set, the app must send the same passcode (set it in 我的 › 识别服务)

const ALLOWED_MODELS = ["claude-sonnet-5-5", "claude-haiku-5-5"];
const MAX_TOKENS = 8192;

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");

  // The app pings this to find out whether a server is available.
  if (req.method === "GET") {
    return res.status(200).json({ ok: true, passcode: !!process.env.APP_PASSCODE });
  }
  if (req.method !== "POST") return res.status(405).json({ error: { type: "method_not_allowed" } });

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(500).json({ error: { type: "server_not_configured", message: "ANTHROPIC_API_KEY is not set" } });

  const pass = process.env.APP_PASSCODE;
  if (pass && req.headers["x-app-passcode"] !== pass) {
    return res.status(401).json({ error: { type: "bad_passcode" } });
  }

  const body = typeof req.body === "string" ? safeParse(req.body) : req.body;
  if (!body || !Array.isArray(body.messages)) return res.status(400).json({ error: { type: "bad_request" } });

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: ALLOWED_MODELS.includes(body.model) ? body.model : ALLOWED_MODELS[0],
        max_tokens: Math.min(Number(body.max_tokens) || 4096, MAX_TOKENS),
        messages: body.messages
      })
    });
    const text = await r.text();
    res.status(r.status).setHeader("content-type", "application/json");
    return res.send(text);
  } catch (e) {
    return res.status(502).json({ error: { type: "upstream_error" } });
  }
};

function safeParse(s) { try { return JSON.parse(s); } catch { return null; } }
