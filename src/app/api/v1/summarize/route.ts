import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { DOCUMENT_SUMMARIZATION_PROMPT } from "@/utils/prompt";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text || typeof text !== "string" || text.trim().length < 20) {
      return NextResponse.json(
        { error: "No valid text provided for summarization." },
        { status: 400 }
      );
    }
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key not configured." }, { status: 500 });
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    // Split text into chunks if necessary (to avoid token limits)
    const chunkText = (text: string, maxLength: number = 5000) => {
      const chunks = [];
      for (let i = 0; i < text.length; i += maxLength) {
        chunks.push(text.slice(i, i + maxLength));
      }
      return chunks;
    };
    const textChunks = chunkText(text);
    const chunkSummaries: string[] = [];
    for (const chunk of textChunks) {
      const prompt = `${DOCUMENT_SUMMARIZATION_PROMPT}\n\n---\n\nDocument:\n${chunk}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      chunkSummaries.push((await response.text()).trim());
    }
    // Deduplicate summary blocks
    const uniqueSummaries = Array.from(new Set(chunkSummaries.map(s => s.trim())));
    const summary = uniqueSummaries.join("\n\n");
    return NextResponse.json({ summary: summary.trim() });
  } catch (error: unknown) {
    console.error("Summarization error:", error);
    let message = "Failed to summarize document";
    if (typeof error === "object" && error !== null && "message" in error && typeof (error as { message?: unknown }).message === "string") {
      message = (error as { message: string }).message;
    }
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}