import Groq from "groq-sdk";

// util: ambil {a,b,c,d,e,f} atau [a,b,c,d,e,f]
function extractArray(text) {
  const m = text.match(/\{[^}]+\}|\[[^\]]+\]/);
  if (!m) return null;

  const raw = m[0];
  const inside = raw.slice(1, -1);
  const parts = inside.split(",").map((s) => s.trim());

  // NOTE: di server kamu aslinya cek length === 6
  if (parts.length !== 6) return null;

  const nums = parts.map((n) => Number(n));
  if (nums.some((n) => Number.isNaN(n))) return null;

  return nums;
}

// parsing body yang aman untuk serverless
async function readJsonBody(req) {
  if (req.body && typeof req.body === "object") return req.body;

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export default async function handler(req, res) {
  // CORS minimal (aman walau nanti same-origin)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { prompt } = await readJsonBody(req);
    if (!prompt) return res.status(400).json({ error: "prompt is required" });

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: "GROQ_API_KEY is not set" });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "Kamu adalah mesin keluaran angka. WAJIB output HANYA satu array dengan format {a, b, c, d, e, f} (atau [a, b, c, d, e, f]) tanpa teks tambahan. Jangan beri penjelasan apapun.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0,
      max_tokens: 60,
    });

    const text = completion.choices?.[0]?.message?.content || "";
    const arr = extractArray(text);

    if (!arr) {
      return res.status(200).json({
        raw: text,
        dose: null,
        error: "FORMAT_INVALID",
      });
    }

    return res.status(200).json({
      raw: text,
      dose: arr,
      error: "",
    });
  } catch (e) {
    return res.status(200).json({
      raw: "",
      dose: null,
      error: e?.message || "AI_UNAVAILABLE",
    });
  }
}
