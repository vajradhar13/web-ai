import { NextRequest, NextResponse } from "next/server";

async function getGeminiResponse(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    }
  );

  const data = await response.json();
  let text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  // Remove code block markers and whitespace
  text = text.replace(/```json|```/g, "").trim();
  return text;
}

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }
    const response = await getGeminiResponse(prompt);
    return NextResponse.json({ response });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "AI error" }, { status: 500 });
  }
} 