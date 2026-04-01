module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { prompt } = req.body ?? {};

  if (!prompt) {
    res.status(400).json({ error: "prompt is required" });
    return;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a diagram generator. Given a description, return a JSON array of block objects representing a diagram.
Each block has: type ("rectangle" or "text"), content (string label), x (number), y (number).
Lay them out logically with good spacing (at least 180px between x positions, 120px between y positions).
Start coordinates around x:100, y:150. Return ONLY valid JSON array, no markdown, no explanation.
Example: [{"type":"rectangle","content":"Start","x":100,"y":150},{"type":"rectangle","content":"Process","x":300,"y":150}]`,
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 800,
      }),
    });

    const data = await response.json();
    const rawText = data.choices?.[0]?.message?.content ?? "[]";

    let blocks;
    try {
      blocks = JSON.parse(rawText.trim());
    } catch {
      res.status(500).json({ error: "Failed to parse diagram response" });
      return;
    }

    res.json({ blocks });
  } catch (err) {
    console.error("AI diagram error", err);
    res.status(500).json({ error: "Failed to generate diagram" });
  }
}
