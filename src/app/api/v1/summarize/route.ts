import { NextResponse } from "next/server";
import { summarizeWithGemini } from "@/lib/gemini";

export const runtime = "edge";

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    if (!text || typeof text !== "string" || text.trim().length < 20) {
      return NextResponse.json(
        { error: "No valid text provided for summarization." },
        { status: 400 }
      );
    }
    const summary = await summarizeWithGemini(text);
    return NextResponse.json({ summary });
  } catch (error: any) {
    console.error("Summarization error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to summarize document" },
      { status: 500 }
    );
  }
}