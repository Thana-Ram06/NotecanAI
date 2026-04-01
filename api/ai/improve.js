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

  const { content } = req.body ?? {};

  if (!content) {
    res.status(400).json({ error: "content is required" });
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
            content:
              "You are a writing assistant. Improve and rewrite the provided text to be clearer, more concise, and better structured. Return only the improved text, no explanations.",
          },
          { role: "user", content },
        ],
        max_tokens: 600,
      }),
    });

    const data = await response.json();
    const improved = data.choices?.[0]?.message?.content ?? "";
    res.json({ content: improved });
  } catch (err) {
    console.error("AI improve error", err);
    res.status(500).json({ error: "Failed to improve content" });
  }
}
