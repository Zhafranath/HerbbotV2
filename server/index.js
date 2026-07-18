import "dotenv/config";
import express from "express";
import cors from "cors";
import Groq from "groq-sdk";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// util: ambil {a,b,c,d,e} atau [a,b,c,d,e]
function extractArray(text) {
  const m = text.match(/\{[^}]+\}|\[[^\]]+\]/); // ✅ support {} atau []
  if (!m) return null;

  const raw = m[0];
  const inside = raw.slice(1, -1);
  const parts = inside.split(",").map((s) => s.trim());
  if (parts.length !== 6) return null;

  const nums = parts.map((n) => Number(n));
  if (nums.some((n) => Number.isNaN(n))) return null;

  return nums;
}

app.post("/api/jamu-dose", async (req, res) => {
  try {
    const { prompt } = req.body || {};
    if (!prompt) {
      return res.status(400).json({ error: "prompt is required" });
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "Kamu adalah mesin keluaran angka. WAJIB output HANYA satu array dengan format {a, b, c, d, e} (atau [a, b, c, d, e]) tanpa teks tambahan. Jangan beri penjelasan apapun.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0, // ✅ lebih patuh format
      max_tokens: 60,
    });

    const text = completion.choices?.[0]?.message?.content || "";

    // ✅ DEBUG LOG: lihat output mentah dari Groq di terminal
    console.log("\n=== GROQ RAW OUTPUT ===");
    console.log(text);
    console.log("=======================\n");

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
    console.error("=== GROQ ERROR ===");
    console.error(e?.message || e);
    console.error("==================");

    return res.status(200).json({
      raw: "",
      dose: null,
      error: e?.message || "AI_UNAVAILABLE",
    });
  }
});

app.listen(process.env.PORT || 5175, () => {
  console.log("Groq server running on port", process.env.PORT || 5175);
});
