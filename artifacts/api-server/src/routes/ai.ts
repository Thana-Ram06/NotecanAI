import { Router, type IRouter } from "express";
import OpenAI from "openai";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body as { prompt: string };

    if (!prompt) {
      res.status(400).json({ error: "prompt is required" });
      return;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that generates structured notes. Return a clear, well-organized note based on the user's prompt. Keep it concise and useful.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 500,
    });

    const content = completion.choices[0]?.message?.content ?? "";
    res.json({ content });
  } catch (err) {
    logger.error({ err }, "AI generate error");
    res.status(500).json({ error: "Failed to generate content" });
  }
});

router.post("/improve", async (req, res) => {
  try {
    const { content } = req.body as { content: string };

    if (!content) {
      res.status(400).json({ error: "content is required" });
      return;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a writing assistant. Improve and rewrite the provided text to be clearer, more concise, and better structured. Return only the improved text, no explanations.",
        },
        { role: "user", content },
      ],
      max_tokens: 600,
    });

    const improved = completion.choices[0]?.message?.content ?? "";
    res.json({ content: improved });
  } catch (err) {
    logger.error({ err }, "AI improve error");
    res.status(500).json({ error: "Failed to improve content" });
  }
});

router.post("/diagram", async (req, res) => {
  try {
    const { prompt } = req.body as { prompt: string };

    if (!prompt) {
      res.status(400).json({ error: "prompt is required" });
      return;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
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
    });

    const rawText = completion.choices[0]?.message?.content ?? "[]";

    let blocks: unknown;
    try {
      blocks = JSON.parse(rawText.trim());
    } catch {
      res.status(500).json({ error: "Failed to parse diagram response" });
      return;
    }

    res.json({ blocks });
  } catch (err) {
    logger.error({ err }, "AI diagram error");
    res.status(500).json({ error: "Failed to generate diagram" });
  }
});

export default router;
